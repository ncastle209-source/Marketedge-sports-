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
  const model = Number(game.modelSpread);
  const divergence = handle != null && tickets != null ? handle - tickets : null;
  return {
    tickets,
    handle,
    spread: Number.isFinite(spread) ? spread : null,
    open: Number.isFinite(open) ? open : null,
    model: Number.isFinite(model) ? model : null,
    edge: game.modelEdge ?? null,
    source: game.modelSource || null,
    divergence,
    rlm: Boolean(game.lineMovedOppositePublic),
    surge: Boolean(game.volumeSurgeConfirmed),
  };
}

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
        ? 'Bear Trap: public >= 80%.'
        : 'Guardrail clear.',
    metrics: m,
  };
}

export function evaluateSharpTrapCard(game = {}) {
  const actual = Number(game.currentSpread ?? game.currentLine ?? game.actualSpread);
  const fair = Number(game.modelSpread ?? game.fairSpread);
  const tickets = pct(game.ticketPercentage ?? game.ticketPct ?? game.publicBetPct);
  const publicPct = tickets == null ? null : tickets / 100;
  const t1 = Number.isFinite(actual) && Number.isFinite(fair) && Math.abs(actual - fair) >= 2;
  const t2 = publicPct != null && publicPct >= 0.65;
  const t3 = Boolean(game.lineMovedOppositePublic);
  const t4 = Boolean(game.volumeSurgeConfirmed);
  const t5 = Number(game.secondsToKickoff) <= 1800 && t1 && t2 && t3 && t4;
  const count = [t1, t2, t3, t4, t5].filter(Boolean).length;
  const period = String(game.period || 'fulltime');
  return {
    name: period === '2h' || period === '2H' ? 'SharpTrap2H' : 'SharpTrapFG',
    fire: count > 0,
    count,
    triggers: { t1, t2, t3, t4, t5 },
    period,
    modelSource: game.modelSource || null,
    modelEdge: game.modelEdge ?? null,
  };
}

export function evaluateNamedAlgos(game) {
  const doggies = evaluateDoggies(game);
  const deficiency = evaluateMarketDeficiency(game);
  const guardrail = evaluatePublicTrapGuardrail(game);
  const sharp = evaluateSharpTrapCard(game);
  const vipOk = guardrail.allowed && (doggies.fire || deficiency.fire || sharp.fire);
  return { doggies, deficiency, guardrail, sharp, vipOk };
}
