import assert from 'node:assert/strict';
import { SharpTrapEngine } from './src/analytics.js';

class MockRedisClient {
  constructor() {
    this.values = new Map();
    this.expirations = new Map();
  }

  async get(key) {
    const expiresAt = this.expirations.get(key);
    if (expiresAt && expiresAt <= Date.now()) {
      this.values.delete(key);
      this.expirations.delete(key);
    }
    return this.values.has(key) ? this.values.get(key) : null;
  }

  async set(key, value, ...options) {
    if (options.includes('NX') && (await this.get(key)) !== null) {
      return null;
    }

    this.values.set(key, String(value));
    const expiresIndex = options.indexOf('EX');
    if (expiresIndex >= 0) {
      const seconds = Number(options[expiresIndex + 1]);
      this.expirations.set(key, Date.now() + seconds * 1000);
    }
    return 'OK';
  }
}

class MockRotationalApiClient {
  constructor(liveOdds) {
    this.liveOdds = liveOdds;
    this.calls = 0;
  }

  async getLiveOdds() {
    this.calls += 1;
    return this.liveOdds;
  }
}

function createSuccessGame() {
  return {
    gameId: 'test-sharp-trap-game',
    sport: 'NFL',
    secondsToKickoff: 20 * 60,
  };
}

async function run() {
  const outsideRedis = new MockRedisClient();
  const outsideApi = new MockRotationalApiClient({});
  const outsideEngine = new SharpTrapEngine(
    { gameId: 'outside-window-game', sport: 'NFL', secondsToKickoff: 26 * 3600 },
    outsideRedis,
    outsideApi
  );
  const outsideResult = await outsideEngine.evaluateSharpTrap();
  assert.equal(outsideResult.status, 'SKIPPED_OUTSIDE_WINDOW');
  assert.equal(outsideApi.calls, 0);
  console.log('PASS Outside Window:', outsideResult.status);

  const redis = new MockRedisClient();
  const api = new MockRotationalApiClient({
    spread: -4.0,
    publicBetPct: 0.70,
    lineMovedOppositePublic: true,
    volumeSurgeConfirmed: true,
  });
  const game = createSuccessGame();
  await redis.set('game:' + game.gameId + ':fair_spread', '-1.5');

  const firstEngine = new SharpTrapEngine(game, redis, api);
  const firstResult = await firstEngine.evaluateSharpTrap();
  assert.equal(firstResult.status, 'EVALUATED_SUCCESSFULLY');
  assert.equal(firstResult.activeTriggersCount, 5);
  assert.deepEqual(firstResult.triggers, {
    t1_active: true,
    t2_active: true,
    t3_active: true,
    t4_active: true,
    t5_active: true,
  });
  assert.match(firstResult.stateHash, /^[a-f0-9]{64}$/);
  assert.equal(api.calls, 1);
  console.log('PASS Successful Trigger Evaluation:', JSON.stringify({
    status: firstResult.status,
    activeTriggersCount: firstResult.activeTriggersCount,
    triggers: firstResult.triggers,
    stateHash: firstResult.stateHash,
  }));

  const secondEngine = new SharpTrapEngine(game, redis, api);
  const secondResult = await secondEngine.evaluateSharpTrap();
  assert.equal(secondResult.status, 'SKIPPED_DUPLICATE_EXECUTION');
  assert.equal(secondResult.stateHash, firstResult.stateHash);
  assert.equal(api.calls, 1);
  console.log('PASS Idempotency Lock:', JSON.stringify({
    status: secondResult.status,
    stateHash: secondResult.stateHash,
  }));

  console.log('\\nAll Sharp Trap tests passed.');
}

run().catch((error) => {
  console.error('Sharp Trap tests failed.');
  console.error(error);
  process.exitCode = 1;
});
