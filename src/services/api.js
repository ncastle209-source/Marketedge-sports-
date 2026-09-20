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
    const response = await fetch('/data/gamecards.json', { cache: 'no-store' });
    if (!response.ok) return fallback;
    const payload = await response.json();
    const games = Array.isArray(payload?.games) ? payload.games : [];
    return games.slice(0, 80).map((game, index) => {
      const tickets = game.ticketPercentage ?? (game.ticketPct != null ? game.ticketPct * 100 : null);
      const handle = game.handlePercentage ?? (game.handlePct != null ? game.handlePct * 100 : null);
      const line = game.currentLine ?? game.currentSpread;
      const open = game.openSpread;
      const fade = tickets != null && tickets >= 80;
      return {
        id: index + 1,
        gameId: game.gameId,
        matchup: game.matchup,
        sport: game.sport,
        officialPick: fade ? `Fade public ${game.home || game.matchup}` : (game.matchup || 'Pending'),
        ticketPct: tickets == null ? 'n/a' : `${Math.round(tickets)}%`,
        handlePct: handle == null ? 'n/a' : `${Math.round(handle)}%`,
        handlePercentage: handle,
        ticketPercentage: tickets,
        currentLine: line,
        lineMove: open != null && line != null ? `${open} -> ${line}` : 'n/a',
        matrixScore: game.divergence != null ? String(game.divergence) : 'n/a',
        tier: fade ? 'ELITE VALUE' : (game.lineMovedOppositePublic ? 'ELITE VALUE' : 'WATCH'),
        writeup: game.lineMovedOppositePublic
          ? 'Cascade flag: reverse line movement vs public tickets.'
          : 'Cascade snapshot. Splits fill in when Action Network returns percentages.',
        secondsToKickoff: game.secondsToKickoff || 6 * 3600,
        fairSpread: Number(game.fairSpread) || 0,
        estimatedWinProb: 55,
      };
    });
  } catch {
    return fallback;
  }
}
