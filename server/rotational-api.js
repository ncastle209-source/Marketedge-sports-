function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error('Missing required environment variable: ' + name);
  return value;
}

function parseBoolean(value, fieldName) {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  throw new Error('Invalid boolean field from rotational API: ' + fieldName);
}

export class RotationalOddsApiClient {
  constructor({ baseUrl = requireEnv('ROTATIONAL_API_URL'), apiKey = requireEnv('ROTATIONAL_API_KEY'), path = process.env.ROTATIONAL_API_PATH || '/live-odds', timeoutMs = Number(process.env.ROTATIONAL_API_TIMEOUT_MS || 10000) } = {}) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.path = path;
    this.timeoutMs = timeoutMs;
  }

  async getLiveOdds(gameId, sport) {
    const endpoint = new URL(this.path, this.baseUrl.endsWith('/') ? this.baseUrl : this.baseUrl + '/');
    endpoint.searchParams.set('game_id', gameId);
    endpoint.searchParams.set('sport', sport);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    let response;
    let payload;
    try {
      response = await fetch(endpoint, { headers: { Accept: 'application/json', Authorization: 'Bearer ' + this.apiKey }, signal: controller.signal });
      const text = await response.text();
      payload = text ? JSON.parse(text) : {};
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Rotational odds API timed out.');
      throw new Error('Rotational odds API request failed: ' + error.message);
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) throw new Error('Rotational odds API returned HTTP ' + response.status + '.');

    const odds = payload.data || payload.odds || payload;
    const spread = Number(odds.spread);
    let publicBetPct = Number(odds.publicBetPct ?? odds.public_bet_pct);
    if (publicBetPct > 1) publicBetPct /= 100;
    if (!Number.isFinite(spread) || !Number.isFinite(publicBetPct) || publicBetPct < 0 || publicBetPct > 1) {
      throw new Error('Rotational odds API returned an invalid spread or publicBetPct.');
    }

    return {
      spread,
      publicBetPct,
      lineMovedOppositePublic: parseBoolean(odds.lineMovedOppositePublic ?? odds.line_moved_opposite_public, 'lineMovedOppositePublic'),
      volumeSurgeConfirmed: parseBoolean(odds.volumeSurgeConfirmed ?? odds.volume_surge_confirmed, 'volumeSurgeConfirmed')
    };
  }
}
