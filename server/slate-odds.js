import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SLATE_CANDIDATES = [
  path.join(here, '../public/data/gamecards.json'),
  path.join(process.cwd(), 'public/data/gamecards.json'),
  path.join(process.cwd(), 'data/gamecards.json'),
];

function norm(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function toUnit(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return n > 1 ? n / 100 : n;
}

export async function loadSlate() {
  let lastError;
  for (const file of SLATE_CANDIDATES) {
    try {
      const raw = await readFile(file, 'utf8');
      return JSON.parse(raw);
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error('gamecards.json not found. Last error: ' + (lastError && lastError.message));
}

export function findGame(slate, gameId, sport) {
  const games = Array.isArray(slate?.games) ? slate.games : [];
  const wanted = norm(gameId);
  const sportKey = norm(sport);
  return games.find((game) => {
    if (norm(game.gameId) === wanted) return true;
    if (sportKey && norm(game.sport) !== sportKey && norm(game.gameId).split('-')[0] !== sportKey) {
      return false;
    }
    return wanted && (norm(game.matchup).includes(wanted) || norm(game.home + game.away) === wanted);
  });
}

export function toProviderPayload(game) {
  const spread = Number(game.currentSpread ?? game.currentLine ?? game.fairSpread);
  const publicBetPct = toUnit(game.publicBetPct ?? game.ticketPct ?? game.ticketPercentage);
  if (!Number.isFinite(spread) || publicBetPct === undefined) {
    throw new Error('Cascade slate is missing spread or publicBetPct for ' + (game.gameId || 'unknown game'));
  }
  return {
    spread,
    publicBetPct,
    lineMovedOppositePublic: Boolean(game.lineMovedOppositePublic),
    volumeSurgeConfirmed: Boolean(game.volumeSurgeConfirmed),
    handlePct: toUnit(game.handlePct ?? game.handlePercentage),
    source: 'odds-cascade',
  };
}

export async function getLiveOddsFromSlate(gameId, sport) {
  const slate = await loadSlate();
  const game = findGame(slate, gameId, sport);
  if (!game) throw new Error('No cascade card for ' + gameId);
  return toProviderPayload(game);
}
