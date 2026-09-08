import { createServer } from 'node:http';
import { URL } from 'node:url';
import Redis from 'ioredis';
import { SharpTrapEngine } from '../src/analytics.js';
import { RotationalOddsApiClient } from './rotational-api.js';

const port = Number(process.env.PORT || 5000);
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error('Missing required environment variable: REDIS_URL');

const redis = new Redis(redisUrl, { maxRetriesPerRequest: 3, enableReadyCheck: true });
redis.on('error', (error) => console.error('Redis error:', error));
const oddsApi = new RotationalOddsApiClient();

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  response.end(JSON.stringify(payload));
}

async function evaluateSharpTrap(url) {
  const gameId = url.searchParams.get('gameId');
  const sport = url.searchParams.get('sport');
  const secondsToKickoff = Number(url.searchParams.get('secondsToKickoff'));
  const fairSpread = Number(url.searchParams.get('fairSpread'));

  if (!gameId || !sport || !Number.isFinite(secondsToKickoff)) {
    return { statusCode: 400, body: { error: 'gameId, sport, and secondsToKickoff are required.' } };
  }

  if (Number.isFinite(fairSpread)) {
    await redis.set('game:' + gameId + ':fair_spread', String(fairSpread), 'NX');
  }

  const engine = new SharpTrapEngine({ gameId, sport, secondsToKickoff }, redis, oddsApi);
  return { statusCode: 200, body: await engine.evaluateSharpTrap() };
}

async function start() {
  await redis.ping();
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, 'http://' + (request.headers.host || 'localhost'));
    try {
      if (url.pathname === '/api/health') {
        return sendJson(response, 200, { status: 'ok', redis: 'ready', rotationalApi: 'configured' });
      }
      if (request.method === 'GET' && url.pathname === '/api/evaluate-sharp-trap') {
        const result = await evaluateSharpTrap(url);
        return sendJson(response, result.statusCode, result.body);
      }
      return sendJson(response, 404, { error: 'Not found' });
    } catch (error) {
      console.error('Sharp Trap request failed:', error);
      return sendJson(response, 502, { error: error.message });
    }
  });

  server.listen(port, () => console.log('Sharp Trap production server listening on port ' + port));
}

start().catch((error) => {
  console.error('Production server failed to start:', error);
  redis.disconnect();
  process.exitCode = 1;
});
