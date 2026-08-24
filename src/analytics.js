export class MarketEdgeEngine {
  constructor(gameData) {
    this.game = gameData;
  }

  // Detects Reverse Line Movement (RLM) & Market Velocity
  detectRLM() {
    const lineMovedTowardTeam = this.game.currentLine < this.game.initialLine;
    const publicHeavyOnTickets = this.game.ticketPercentage < 40;
    const sharpCashHeavy = this.game.handlePercentage > 70;
    
    // Line Velocity: magnitude of line shift from initial to current
    const lineDelta = Math.abs(this.game.currentLine - this.game.initialLine);

    if (lineMovedTowardTeam && publicHeavyOnTickets && sharpCashHeavy) {
      return {
        active: true,
        message: `💎 HIGH-VELOCITY RLM: Line shifted ${lineDelta} pts toward side against low public tickets (Syndicate Steam).`
      };
    } else if (this.game.handlePercentage - this.game.ticketPercentage >= 25) {
      return {
        active: true,
        message: "⚡ CASH DIVERGENCE: Heavy money weight outperforming ticket count."
      };
    } else {
      return {
        active: false,
        message: "📊 Standard market movement aligned with public flow."
      };
    }
  }

  // Analyzes the cash vs. ticket cash split disparity
  analyzeMoneySplit() {
    const diff = this.game.handlePercentage - this.game.ticketPercentage;
    let description = "Neutral Public Action";

    if (diff >= 30) {
      description = "🔥 Elite Sharp Steam (Massive Cash/Ticket Divergence)";
    } else if (diff >= 15) {
      description = "⚡ Moderate Sharp Lean";
    } else if (diff <= -15) {
      description = "⚠️ Public Trap Territory (Fade Public Volume)";
    }

    return { diff, description };
  }

  // Computes a master-tier 0-100 Ranking Matrix Score with Price EV & Sport Variance
  computeRankingMatrixScore() {
    let score = 50; // Baseline

    const handle = this.game.handlePercentage || 50;
    const tickets = this.game.ticketPercentage || 50;
    const winProb = this.game.estimatedWinProb || 50;
    const currentLine = this.game.currentLine || -110;
    const sport = this.game.sport || "MLB";

    // 1. Handle weight factor (Max +20 points)
    score += (handle - 50) * 0.4;

    // 2. Cash/Ticket Divergence factor (Max +20 points)
    const divergence = handle - tickets;
    if (divergence > 0) {
      score += divergence * 0.5;
    } else {
      score -= Math.abs(divergence) * 0.3;
    }

    // 3. Juice & Price EV Weighting
    // Plus-money underdogs with sharp backing get an EV bonus; heavy chalk (-150 or worse) gets penalized
    if (currentLine > 100) {
      // Plus money bonus (higher multiplier return)
      score += Math.min((currentLine - 100) / 10, 12);
    } else if (currentLine < -140) {
      // Heavy juice penalty
      score -= Math.min(Math.abs(currentLine + 140) / 10, 10);
    }

    // 4. Sport-Specific Variance Scaling (e.g., NFL/Soccer volatility vs MLB/NPB runlines)
    if (sport === "NFL" || sport === "EFL/Soccer") {
      score *= 1.05; // Slightly higher weight for high-variance sharp markets
    } else if (sport === "WNBA" || sport === "NBA") {
      score *= 1.02;
    }

    // 5. Estimated Win Probability baseline factor
    if (winProb > 55) {
      score += (winProb - 55) * 0.5;
    } else if (winProb < 48) {
      score -= (48 - winProb) * 0.4;
    }

    // Clamp score between 5 and 99
    return Math.min(Math.max(Math.round(score), 5), 99);
  }

  // Calculates optimal Kelly Criterion bankroll allocation & unit size
  calculateBankrollAllocation(bankroll) {
    const score = this.computeRankingMatrixScore();
    const estimatedEdge = (score - 50) / 100; 
    
    let kellyMultiplier = 0.25; // Quarter Kelly baseline
    if (score >= 85) kellyMultiplier = 0.5; // Half-Kelly for Diamond Edge locks
    else if (score < 65) kellyMultiplier = 0.1; // Micro-sprinkle for low edge

    let recommendedRisk = bankroll * estimatedEdge * kellyMultiplier;
    if (recommendedRisk < 0) recommendedRisk = 0;

    const unitSizeValue = bankroll * 0.01;
    const unitsEquivalent = unitSizeValue > 0 ? (recommendedRisk / unitSizeValue).toFixed(2) : "0.00";

    return {
      recommendedRisk,
      unitSizeEquivalent: `${unitsEquivalent} Units ($${unitSizeValue.toFixed(0)}/unit)`
    };
  }
}
