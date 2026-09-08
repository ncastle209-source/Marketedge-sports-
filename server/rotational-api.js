function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error('Missing required environment variable: ' + name);
  return value;
}

function parseApiKeys() {
  const keys = requireEnv('ODDS_API_KEYS')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
  if (keys.length === 0) throw new Error('ODDS_API_KEYS must contain at least one API key.');
  return keys;
}

function parseProviderPayload(payload) {
  const odds = payload.data || payload.odds || payload;
  const spread = Number(odds.spread);
  let publicBetPct = Number(odds.publicBetPct ?? odds.public_bet_pct);
  if (publicBetPct > 1) publicBetPct /= 100;

  if (!Number.isFinite(spread) || !Number.isFinite(publicBetPct) || publicBetPct < 0 || publicBetPct > 1) {
    throw new Error('Odds API returned an invalid spread or publicBetPct.');
  }

  const parseBoolean = (value, fieldName) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    throw new Error('Odds API returned an invalid ' + fieldName + ' value.');
  };

  return {
    spread,
    publicBetPct,
    lineMovedOppositePublic: parseBoolean(odds.lineMovedOppositePublic ?? odds.line_moved_opposite_public, 'lineMovedOppositePublic'),
    volumeSurgeConfirmed: parseBoolean(odds.volumeSurgeConfirmed ?? odds.volume_surge_confirmed, 'volumeSurgeConfirmed')
  };
}

export class RotatingApiClient {
  constructor({ apiKeys = parseApiKeys(), oddsApiUrl = requireEnv('ODDS_API_URL'), apiKeyHeader = process.env.ODDS_API_KEY_HEADER || 'X-API-Key', timeoutMs = Number(process.env.ODDS_API_TIMEOUT_MS || 10000) } = {}) {
    this.keys = apiKeys;
    this.keyCount = apiKeys.length;
    this.currentIndex = 0;
    this.oddsApiUrl = oddsApiUrl;
    this.apiKeyHeader = apiKeyHeader;
    this.timeoutMs = timeoutMs;
  }

  getNextKey() {
    const key = this.keys[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    return key;
  }

  buildUrl(gameId, sport) {
    const encodedGameId = encodeURIComponent(gameId);
    const encodedSport = encodeURIComponent(sport);
    if (this.oddsApiUrl.includes('{gameId}') || this.oddsApiUrl.includes('{sport}')) {
      return this.oddsApiUrl.replaceAll('{gameId}', encodedGameId).replaceAll('{sport}', encodedSport);
    }
    const url = new URL(this.oddsApiUrl);
    url.searchParams.set('game_id', gameId);
    url.searchParams.set('sport', sport);
    return url.toString();
  }

  async getLiveOdds(gameId, sport) {
    let lastError;
    for (let attempt = 0; attempt < this.keys.length; attempt += 1) {
      const apiKey = this.getNextKey();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const response = await fetch(this.buildUrl(gameId, sport), {
          headers: { Accept: 'application/json', [this.apiKeyHeader]: apiKey },
          signal: controller.signal
        });
        const text = await response.text();
        const payload = text ? JSON.parse(text) : {};

        if (response.ok) return parseProviderPayload(payload);

        lastError = new Error('Odds API returned HTTP ' + response.status + '.');
        if (![401, 403, 429].includes(response.status)) throw lastError;
        console.warn('Odds API key request failed with HTTP ' + response.status + '; rotating key.');
      } catch (error) {
        if (error.name === 'AbortError') lastError = new Error('Odds API request timed out.');
        else if (!lastError || error.message !== lastError.message) lastError = error;
        if (attempt === this.keys.length - 1) break;
        console.warn('Odds API request failed; rotating key: ' + lastError.message);
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new Error('All configured odds API keys failed or were rate-limited. Last error: ' + (lastError?.message || 'unknown error'));
  }
}
