export class MarketEdgeEngine {
  constructor(game) {
    this.game = game || {};
  }

  analyzeMoneySplit() {
    const handle = Number(this.game.handlePercentage ?? ((this.game.handlePct || 0) * 100));
    const tickets = Number(this.game.ticketPercentage ?? ((this.game.ticketPct || 0) * 100));
    const diff = Math.round((handle - tickets) * 10) / 10;
    return { handle, tickets, diff: Number.isFinite(diff) ? diff : 0 };
  }

  detectRLM() {
    const active = Boolean(this.game.lineMovedOppositePublic);
    return {
      active,
      message: active
        ? 'Reverse line movement vs public tickets on the cascade snapshot.'
        : 'No RLM flag on this cascade snapshot.',
    };
  }

  computeRankingMatrixScore() {
    const split = this.analyzeMoneySplit();
    const rlm = this.detectRLM();
    let score = 50;
    if (Number.isFinite(split.diff)) score += Math.min(25, Math.abs(split.diff));
    if ((split.tickets || 0) >= 65) score += 8;
    if (rlm.active) score += 12;
    if (this.game.volumeSurgeConfirmed) score += 8;
    if (this.game.held_line) score -= 5;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  calculateBankrollAllocation(bankroll = 10000) {
    const score = this.computeRankingMatrixScore();
    const fraction = score >= 95 ? 0.03 : score >= 85 ? 0.02 : score >= 70 ? 0.01 : 0.005;
    const recommendedRisk = Number(bankroll) * fraction;
    return {
      recommendedRisk,
      unitSizeEquivalent: `${Math.max(0.25, recommendedRisk / 100).toFixed(2)}u`,
    };
  }
}
