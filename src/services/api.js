export async function evaluateSharpTrap(game, options = {}) {
  const params = new URLSearchParams({
    gameId: String(game.gameId),
    sport: String(game.sport),
    secondsToKickoff: String(game.secondsToKickoff),
  });

  if (Number.isFinite(Number(game.fairSpread))) {
    params.set('fairSpread', String(game.fairSpread));
  }

  const response = await fetch('/api/evaluate-sharp-trap?' + params.toString(), options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Sharp Trap evaluation request failed.');
  }
  return payload;
}
