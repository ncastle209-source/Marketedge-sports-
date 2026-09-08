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
