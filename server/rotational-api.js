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

function loadApiKeys() {
  const configuredPool = process.env.ROTATIONAL_API_KEYS;
  if (configuredPool) {
    let keys;
    try {
      keys = configuredPool.trim().startsWith('[')
        ? JSON.parse(configuredPool)
        : configuredPool.split(',');
    } catch (error) {
      throw new Error('ROTATIONAL_API_KEYS must be a comma-separated list or JSON array.');
    }

    const normalizedKeys = keys
      .map((key) => String(key).trim())
      .filter(Boolean);
    if (normalizedKeys.length > 0) return normalizedKeys;
  }

  return [requireEnv('ROTATIONAL_API_KEY')];
}

function retryAfterMs(response) {
  const retryAfter = response.headers.get('retry-after');
  if (!retryAfter) return 0;
  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const retryAt = Date.parse(retryAfter);
  return Number.isFinite(retryAt) ? Math.max(0, retryAt - Date.now()) : 0;
}

function wait(milliseconds) {
  return milliseconds > 0 ? new Promise((resolve) => setTimeout(resolve, milliseconds)) : Promise.resolve();
}

export class RotationalOddsApiClient {
  constructor({ baseUrl = requireEnv('ROTATIONAL_API_URL'), apiKeys = loadApiKeys(), path = process.env.ROTATIONAL_API_PATH || '/live-odds', timeoutMs = Number(process.env.ROTATIONAL_API_TIMEOUT_MS || 10000), maxAttempts = Number(process.env.ROTATIONAL_API_MAX_ATTEMPTS || apiKeys.length) } = {}) {
    if (!Array.isArray(apiKeys) || apiKeys.length === 0) throw new Error('At least one rotational odds API key is required.');
    this.baseUrl = baseUrl;
    this.apiKeys = apiKeys;
    this.path = path;
    this.timeoutMs = timeoutMs;
    this.maxAttempts = Math.max(1, Math.min(maxAttempts, apiKeys.length));
    this.nextKeyIndex = 0;
  }

  getNextApiKey() {
    const apiKey = this.apiKeys[this.nextKeyIndex];
    this.nextKeyIndex = (this.nextKeyIndex + 1) % this.apiKeys.length;
    return apiKey;
  }

  async requestLiveOdds(gameId, sport, apiKey) {
    const endpoint = new URL(this.path, this.baseUrl.endsWith('/') ? this.baseUrl : this.baseUrl + '/');
    endpoint.searchParams.set('game_id', gameId);
    endpoint.searchParams.set('sport', sport);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    let response;
    let payload;
    try {
      response = await fetch(endpoint, { headers: { Accept: 'application/json', Authorization: 'Bearer ' + apiKey }, signal: controller.signal });
      const text = await response.text();
      payload = text ? JSON.parse(text) : {};
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Rotational odds API timed out.');
      throw new Error('Rotational odds API request failed: ' + error.message);
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 401 || response.status === 403 || response.status === 429) {
      const error = new Error('Rotational odds API returned HTTP ' + response.status + '.');
      error.retryableKeyFailure = true;
      error.status = response.status;
      error.retryAfterMs = retryAfterMs(response);
      return { response, payload, error };
    }

    if (!response.ok) throw new Error('Rotational odds API returned HTTP ' + response.status + '.');
    return { response, payload };
  }

  normalizeOdds(payload) {
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

  async getLiveOdds(gameId, sport) {
    let lastKeyError;
    for (let attempt = 0; attempt < this.maxAttempts; attempt += 1) {
      const apiKey = this.getNextApiKey();
      const result = await this.requestLiveOdds(gameId, sport, apiKey);
      if (!result.error) return this.normalizeOdds(result.payload);

      lastKeyError = result.error;
      await wait(result.error.retryAfterMs);
    }

    const exhausted = new Error('All rotational odds API keys were unavailable or rate-limited.');
    exhausted.status = lastKeyError?.status;
    exhausted.retryAfterMs = lastKeyError?.retryAfterMs;
    throw exhausted;
  }
}
