import express from 'express';
import Redis from 'ioredis';
import { SharpTrapEngine } from '../src/analytics.js';
import { RotatingApiClient } from './rotational-api.js';

const app = express();
app.use(express.json({ limit: '32kb' }));

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error('Missing required environment variable: REDIS_URL');

const redis = new Redis(redisUrl, { maxRetriesPerRequest: 3, enableReadyCheck: true });
redis.on('error', (error) => console.error('Redis error:', error));
const apiClient = new RotatingApiClient();

app.get('/api/health', async (_req, res) => {
  try {
    await redis.ping();
    res.json({ status: 'ok', redis: 'ready', oddsApi: 'configured', apiKeys: apiClient.keyCount });
  } catch (error) {
    res.status(503).json({ status: 'error', error: error.message });
  }
});

app.post('/api/evaluate-game', async (req, res) => {
  try {
    const { gameId, sport, secondsToKickoff, fairSpread } = req.body || {};
    if (!gameId || !sport || !Number.isFinite(Number(secondsToKickoff))) {
      return res.status(400).json({ error: 'gameId, sport, and numeric secondsToKickoff are required.' });
    }

    if (Number.isFinite(Number(fairSpread))) {
      await redis.set('game:' + gameId + ':fair_spread', String(Number(fairSpread)), 'NX');
    }

    const gameData = {
      gameId: String(gameId),
      sport: String(sport),
      secondsToKickoff: Number(secondsToKickoff)
    };
    const engine = new SharpTrapEngine(gameData, redis, apiClient);
    const result = await engine.evaluateSharpTrap();
    return res.json(result);
  } catch (error) {
    console.error('Evaluation error:', error);
    return res.status(502).json({ error: error.message });
  }
});

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

const port = Number(process.env.PORT || 3000);
const server = app.listen(port, () => {
  console.log('Sharp Trap production server running on port ' + port);
});

async function shutdown(signal) {
  console.log(signal + ' received; shutting down.');
  server.close(() => {
    redis.quit().finally(() => process.exit(0));
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
