function pct(value) {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n > 1 ? n : n * 100;
}

function cardMetrics(game = {}) {
  const tickets = pct(game.ticketPercentage ?? game.ticketPct ?? game.publicBetPct);
  const handle = pct(game.handlePercentage ?? game.handlePct);
  const spread = Number(game.currentSpread ?? game.currentLine);
  const open = Number(game.openSpread);
  const divergence = handle != null && tickets != null ? handle - tickets : null;
  return {
    tickets,
    handle,
    spread: Number.isFinite(spread) ? spread : null,
    open: Number.isFinite(open) ? open : null,
    divergence,
    rlm: Boolean(game.lineMovedOppositePublic),
    surge: Boolean(game.volumeSurgeConfirmed),
  };
}

/** Underdog value: public on the favorite, money or RLM on the dog. */
export function evaluateDoggies(game) {
  const m = cardMetrics(game);
  const publicOnFavorite = m.tickets != null && m.tickets >= 65;
  const moneyOnDog = m.divergence != null && m.divergence <= -8;
  const fire = publicOnFavorite && (moneyOnDog || m.rlm);
  return {
    name: 'Doggies',
    fire,
    side: fire ? 'underdog' : null,
    reason: fire
      ? 'Public is on the favorite while handle or RLM supports the dog.'
      : 'No underdog split / RLM on this cascade card.',
    metrics: m,
  };
}

/** Ticket vs handle + RLM on the posted number. */
export function evaluateMarketDeficiency(game) {
  const m = cardMetrics(game);
  const split = m.divergence != null && Math.abs(m.divergence) >= 12;
  const fire = Boolean(m.rlm || split);
  return {
    name: 'MarketDeficiency',
    fire,
    reason: fire
      ? m.rlm
        ? 'RLM vs public tickets on the cascade snapshot.'
        : `Handle/ticket divergence ${m.divergence.toFixed(1)} pts.`
      : 'No RLM or 12+ handle/ticket gap yet.',
    metrics: m,
  };
}

/** Block 70%+ public plays unless sharp confirmation exists. */
export function evaluatePublicTrapGuardrail(game) {
  const m = cardMetrics(game);
  const crowded = m.tickets != null && m.tickets >= 70;
  const sharpOk = m.rlm || (m.divergence != null && Math.abs(m.divergence) >= 15);
  const suppressed = crowded && !sharpOk;
  const bearTrap = m.tickets != null && m.tickets >= 80;
  return {
    name: 'PublicTrapGuardrail',
    suppressed,
    bearTrap,
    allowed: !suppressed,
    reason: suppressed
      ? 'Public tickets >= 70% with no RLM or handle confirmation.'
      : bearTrap
        ? 'Bear Trap: public >= 80%. Fade only if deficiency/Doggies also fire.'
        : 'Guardrail clear.',
    metrics: m,
  };
}

export function evaluateNamedAlgos(game) {
  const doggies = evaluateDoggies(game);
  const deficiency = evaluateMarketDeficiency(game);
  const guardrail = evaluatePublicTrapGuardrail(game);
  const vipOk = guardrail.allowed && (doggies.fire || deficiency.fire);
  return { doggies, deficiency, guardrail, vipOk };
}
