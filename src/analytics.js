import crypto from 'crypto';

export class SharpTrapEngine {
  constructor(gameData, redisClient, apiClient) {
    this.game = gameData;
    this.redis = redisClient;
    this.api = apiClient;
  }

  // Determines active polling frequency based on time-to-kickoff countdown
  getPollingInterval(secondsToKickoff) {
    if (secondsToKickoff > 24 * 3600) {
      return { active: false, interval: null, message: "Outside 24-hour entry gate." };
    } else if (secondsToKickoff >= 8 * 3600) {
      return { active: true, interval: 4 * 3600, tier: "24h_to_8h", frequency: "Every 4 hours" };
    } else if (secondsToKickoff >= 2 * 3600) {
      return { active: true, interval: 3600, tier: "8h_to_2h", frequency: "Every 1 hour" };
    } else if (secondsToKickoff >= 30 * 60) {
      return { active: true, interval: 30 * 60, tier: "2h_to_30m", frequency: "Every 30 minutes" };
    } else {
      return { active: true, interval: 5 * 60, tier: "30m_to_start", frequency: "Every 5 minutes" };
    }
  }

  // Main 5-Stage Sharp Trap Evaluation Pipeline
  async evaluateSharpTrap() {
    const gameId = this.game.gameId;
    const secondsToKickoff = this.game.secondsToKickoff;

    // 1. Strict 24-Hour Entry Gate
    const scheduleCheck = this.getPollingInterval(secondsToKickoff);
    if (!scheduleCheck.active) {
      return { status: "SKIPPED_OUTSIDE_WINDOW" };
    }

    // 2. Redis Odds Cache Check (Bypass API burn if cached)
    const cacheKey = `game:${gameId}:live_odds`;
    let liveData;
    const cachedOdds = await this.redis.get(cacheKey);

    if (cachedOdds) {
      liveData = JSON.parse(cachedOdds);
    } else {
      // Rotational API Fetch
      liveData = await this.api.getLiveOdds(gameId, this.game.sport);
      // Cache with TTL relative to tier window (or default 30s-1m cache)
      await this.redis.set(cacheKey, JSON.stringify(liveData), 'EX', 30);
    }

    // 3. Intrinsic Baseline Lookup from Redis
    const fairSpreadKey = `game:${gameId}:fair_spread`;
    const fairSpreadVal = await this.redis.get(fairSpreadKey);
    if (!fairSpreadVal) {
      return { status: "SKIPPED_MISSING_BASELINE" };
    }
    const fairSpread = parseFloat(fairSpreadVal);
    const actualSpread = liveData.spread;

    // ==========================================
    // THE 5-STAGE TRIGGER SEQUENCE
    // ==========================================

    // Trigger 1: The Phony Line (Artificial/shaded line >= 2.0 pts away from model baseline)
    const t1_active = Math.abs(actualSpread - fairSpread) >= 2.0;

    // Trigger 2: The Public Hammer (Public ticket volume >= 65%)
    const t2_active = liveData.publicBetPct >= 0.65;

    // Trigger 3: The Snapback (Reverse Line Movement - line moves opposite to public action)
    const t3_active = liveData.lineMovedOppositePublic === true;

    // Trigger 4: Dynamic Volume Surge (Handle velocity spike above baseline)
    const t4_active = liveData.volumeSurgeConfirmed === true;

    // Trigger 5: Time Proximity & Escalation (Active in tight windows while priors hold)
    const t5_active = secondsToKickoff <= 1800 && (t1_active && t2_active && t3_active && t4_active);

    const activeTriggersCount = [t1_active, t2_active, t3_active, t4_active, t5_active].filter(Boolean).length;

    if (activeTriggersCount === 0) {
      return { status: "NO_TRIGGERS_MET" };
    }

    // 4. Idempotency Lock Enforcement (SHA-256 hash with 4-min TTL)
    const statePayload = `${gameId}:${actualSpread}:${t1_active}:${t2_active}:${t3_active}:${t4_active}:${t5_active}`;
    const stateHash = crypto.createHash('sha256').update(statePayload).digest('hex');
    const lockKey = `lock:trigger_state:${stateHash}`;

    // Attempt atomic lock (SET NX EX 240)
    const lockAcquired = await this.redis.set(lockKey, 'locked', 'EX', 240, 'NX');
    if (!lockAcquired) {
      return { status: "SKIPPED_DUPLICATE_EXECUTION", stateHash };
    }

    return {
      status: "EVALUATED_SUCCESSFULLY",
      gameId,
      tier: scheduleCheck.tier,
      fairSpread,
      actualSpread,
      activeTriggersCount,
      triggers: { t1_active, t2_active, t3_active, t4_active, t5_active },
      stateHash
    };
  }
}