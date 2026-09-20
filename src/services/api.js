export async function evaluateSharpTrap(game, options = {}) {
  const response = await fetch('/api/evaluate-game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gameId: game.gameId,
      sport: game.sport,
      secondsToKickoff: Number(game.secondsToKickoff),
      fairSpread: Number.isFinite(Number(game.fairSpread)) ? Number(game.fairSpread) : undefined
    }),
    ...options
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Sharp Trap evaluation request failed.');
  return payload;
}

export async function fetchMatrixSlates(fallback = []) {
  try {
    const files = await Promise.all([
      fetch('/data/gamecards.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch('/data/gamecards_2h.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]);
    const games = files.flatMap((payload) => (Array.isArray(payload?.games) ? payload.games : []));
    if (!games.length) return fallback;
    return games.slice(0, 120).map((game, index) => {
      const tickets = Number(game.ticketPercentage ?? (game.ticketPct != null ? game.ticketPct * 100 : 50));
      const handle = Number(game.handlePercentage ?? (game.handlePct != null ? game.handlePct * 100 : tickets));
      const line = Number(game.currentLine ?? game.currentSpread ?? game.fairSpread ?? 0);
      const open = Number(game.openSpread ?? game.fairSpread ?? line);
      const div = handle - tickets;
      const fade = tickets >= 80;
      const rlm = Boolean(game.lineMovedOppositePublic);
      const pickSide = rlm || fade ? (game.away || 'away') : (game.home || game.matchup);
      const period = game.period === '2h' || game.period === '2H' ? '2H' : 'FG';
      const score = Math.max(40, Math.min(99, 55 + Math.abs(div) + (rlm ? 12 : 0) + (fade ? 8 : 0)));
      return {
        id: index + 1,
        gameId: game.gameId,
        matchup: `${game.matchup} (${period})`,
        sport: game.sport,
        officialPick: `${pickSide} ${Number.isFinite(line) ? line : ''}`,
        ticketPct: `${Math.round(tickets)}%`,
        handlePct: `${Math.round(handle)}%`,
        handlePercentage: handle,
        ticketPercentage: tickets,
        currentLine: line,
        currentSpread: line,
        openSpread: open,
        fairSpread: Number(game.fairSpread ?? open),
        lineMove: `${open} -> ${line}`,
        matrixScore: score.toFixed(1),
        tier: fade || rlm || Math.abs(div) >= 12 ? 'ELITE VALUE' : 'WATCH',
        writeup: rlm
          ? `${period} RLM vs public tickets. Tickets ${Math.round(tickets)}% / handle ${Math.round(handle)}%.`
          : `${period} cascade row. Tickets ${Math.round(tickets)}% / handle ${Math.round(handle)}%. Line ${open} to ${line}.`,
        secondsToKickoff: Number(game.secondsToKickoff) || 6 * 3600,
        estimatedWinProb: Math.max(48, Math.min(72, 50 + Math.abs(div) / 4)),
        lineMovedOppositePublic: rlm,
        volumeSurgeConfirmed: Boolean(game.volumeSurgeConfirmed),
        period,
      };
    });
  } catch {
    return fallback;
  }
}
