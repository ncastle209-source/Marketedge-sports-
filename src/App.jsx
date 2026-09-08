import React, { useEffect, useMemo, useState } from 'react';
import { SharpTrapEngine } from './analytics';
import AddGameModal from './AddGameModal';

const initialSampleGames = [
  {
    id: 1,
    gameId: 'npb-chiba-fukuoka',
    matchup: 'Chiba Lotte Marines vs. Fukuoka Hawks',
    sport: 'NPB',
    secondsToKickoff: 6 * 3600,
    fairSpread: -1.5,
    liveOdds: {
      spread: -3.5,
      publicBetPct: 0.72,
      lineMovedOppositePublic: true,
      volumeSurgeConfirmed: true
    }
  },
  {
    id: 2,
    gameId: 'mlb-yankees-red-sox',
    matchup: 'New York Yankees vs. Boston Red Sox',
    sport: 'MLB',
    secondsToKickoff: 90 * 60,
    fairSpread: 1.5,
    liveOdds: {
      spread: 1.5,
      publicBetPct: 0.54,
      lineMovedOppositePublic: false,
      volumeSurgeConfirmed: false
    }
  },
  {
    id: 3,
    gameId: 'wnba-aces-liberty',
    matchup: 'Las Vegas Aces vs. New York Liberty',
    sport: 'WNBA',
    secondsToKickoff: 20 * 60,
    fairSpread: -2.5,
    liveOdds: {
      spread: -2.5,
      publicBetPct: 0.67,
      lineMovedOppositePublic: true,
      volumeSurgeConfirmed: true
    }
  },
  {
    id: 4,
    gameId: 'soccer-united-arsenal',
    matchup: 'Manchester United vs. Arsenal',
    sport: 'EFL/Soccer',
    secondsToKickoff: 30 * 3600,
    fairSpread: 0.5,
    liveOdds: {
      spread: 0.5,
      publicBetPct: 0.68,
      lineMovedOppositePublic: false,
      volumeSurgeConfirmed: false
    }
  }
];

function createBrowserRedisClient() {
  const readRecord = (key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
      const record = JSON.parse(raw);
      if (record.expiresAt && record.expiresAt <= Date.now()) {
        localStorage.removeItem(key);
        return null;
      }
      return record;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  };

  return {
    async get(key) {
      return readRecord(key)?.value ?? null;
    },

    async set(key, value, ...options) {
      if (options.includes('NX') && readRecord(key)) return null;

      const expiresIndex = options.indexOf('EX');
      const expiresInSeconds = expiresIndex >= 0
        ? Number(options[expiresIndex + 1])
        : null;

      localStorage.setItem(key, JSON.stringify({
        value: String(value),
        expiresAt: expiresInSeconds ? Date.now() + expiresInSeconds * 1000 : null
      }));

      return 'OK';
    },

    seed(key, value) {
      localStorage.setItem(key, JSON.stringify({ value: String(value), expiresAt: null }));
    }
  };
}

export default function App({ redisClient: injectedRedisClient, apiClient: injectedApiClient } = {}) {
  const runtimeDependencies = globalThis.__SHARP_TRAP_DEPENDENCIES__ || {};
  const [games, setGames] = useState(() => {
    const saved = localStorage.getItem('vegas_games');
    return saved ? JSON.parse(saved) : initialSampleGames;
  });
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [selectedGame, setSelectedGame] = useState(() => games[0] || initialSampleGames[0]);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluationError, setEvaluationError] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fallbackRedisClient = useMemo(() => createBrowserRedisClient(), []);
  const redisClient = injectedRedisClient || runtimeDependencies.redisClient || fallbackRedisClient;
  const fallbackApiClient = useMemo(() => ({
    async getLiveOdds(gameId) {
      const game = games.find((candidate) => String(candidate.gameId) === String(gameId));
      if (!game?.liveOdds) {
        throw new Error('No rotational odds response is available for this matchup.');
      }
      return game.liveOdds;
    }
  }), [games]);
  const apiClient = injectedApiClient || runtimeDependencies.apiClient || fallbackApiClient;

  useEffect(() => {
    localStorage.setItem('vegas_games', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    if (!selectedGame || redisClient !== fallbackRedisClient || selectedGame.fairSpread == null) return;
    fallbackRedisClient.seed(
      'game:' + selectedGame.gameId + ':fair_spread',
      selectedGame.fairSpread
    );
  }, [fallbackRedisClient, redisClient, selectedGame]);

  const engine = useMemo(() => {
    if (!selectedGame) return null;
    return new SharpTrapEngine(selectedGame, redisClient, apiClient);
  }, [apiClient, redisClient, selectedGame]);

  const pollingWindow = useMemo(() => {
    if (!engine || selectedGame?.secondsToKickoff == null) return null;
    return engine.getPollingInterval(selectedGame.secondsToKickoff);
  }, [engine, selectedGame]);

  useEffect(() => {
    if (!engine) return undefined;

    let cancelled = false;
    setIsEvaluating(true);
    setEvaluation(null);
    setEvaluationError(null);

    const runEvaluation = async () => {
      try {
        const result = await engine.evaluateSharpTrap();
        if (!cancelled) setEvaluation(result);
      } catch (error) {
        if (!cancelled) {
          setEvaluationError(error instanceof Error ? error.message : 'Sharp Trap evaluation failed.');
        }
      } finally {
        if (!cancelled) setIsEvaluating(false);
      }
    };

    runEvaluation();
    return () => {
      cancelled = true;
    };
  }, [engine]);

  const filteredGames = selectedSport === 'ALL'
    ? games
    : games.filter((game) => game.sport === selectedSport);

  const handleAddGame = (newGame) => {
    const normalizedGame = {
      ...newGame,
      gameId: newGame.gameId || String(newGame.id),
      secondsToKickoff: Number(newGame.secondsToKickoff),
      fairSpread: Number(newGame.fairSpread),
      liveOdds: {
        spread: Number(newGame.liveOdds?.spread),
        publicBetPct: Number(newGame.liveOdds?.publicBetPct),
        lineMovedOppositePublic: Boolean(newGame.liveOdds?.lineMovedOppositePublic),
        volumeSurgeConfirmed: Boolean(newGame.liveOdds?.volumeSurgeConfirmed)
      }
    };

    setGames((previousGames) => [normalizedGame, ...previousGames]);
    setSelectedGame(normalizedGame);
  };

  const statusMessage = evaluationError
    || evaluation?.status
    || (isEvaluating ? 'EVALUATING_SHARP_TRAP' : 'READY');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b132b', color: '#e0fbfc', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1c2541', paddingBottom: '15px', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#6fffe9' }}>Vegas Leverage</h1>
          <span style={{ fontSize: '0.85rem', color: '#8d99ae' }}>Sharp Trap Evaluation Dashboard</span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{ background: '#48cae4', color: '#0b132b', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          + Add Matchup
        </button>
      </header>

      <section style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1rem', color: '#8d99ae', margin: 0 }}>Active Slate Matchups:</h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['ALL', 'MLB', 'NPB', 'WNBA', 'EFL/Soccer', 'NFL', 'NBA'].map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                style={{ background: selectedSport === sport ? '#48cae4' : '#1c2541', color: selectedSport === sport ? '#0b132b' : '#8d99ae', border: '1px solid #3a506b', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {filteredGames.map((game) => (
            <button
              key={game.gameId}
              onClick={() => setSelectedGame(game)}
              style={{ background: selectedGame?.gameId === game.gameId ? '#3a506b' : '#1c2541', color: '#fff', border: '1px solid #48cae4', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: selectedGame?.gameId === game.gameId ? 'bold' : 'normal', flex: '1 1 200px', textAlign: 'left' }}
            >
              <div style={{ fontSize: '0.75rem', color: '#48cae4', marginBottom: '2px' }}>{game.sport}</div>
              <div style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{game.matchup}</div>
            </button>
          ))}
        </div>
      </section>

      {selectedGame && (
        <section style={{ background: '#1c2541', border: '1px solid #3a506b', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: '#48cae4', margin: 0 }}>{selectedGame.matchup}</h2>
              <p style={{ color: '#8d99ae', fontSize: '0.9rem', margin: '8px 0 0' }}>{selectedGame.sport} · {selectedGame.gameId}</p>
            </div>
            {pollingWindow && (
              <div style={{ color: pollingWindow.active ? '#6fffe9' : '#ffb703', fontSize: '0.85rem', textAlign: 'right' }}>
                {pollingWindow.active ? pollingWindow.frequency : pollingWindow.message}
              </div>
            )}
          </div>

          <div style={{ marginTop: '20px', background: '#0b132b', borderRadius: '6px', padding: '15px' }}>
            <div style={{ color: evaluationError ? '#ff6b6b' : '#6fffe9', fontWeight: 'bold', marginBottom: '8px' }}>
              {statusMessage}
            </div>

            {evaluation?.status === 'EVALUATED_SUCCESSFULLY' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                  <div><span style={{ color: '#8d99ae', display: 'block', fontSize: '0.8rem' }}>Active Triggers</span><strong>{evaluation.activeTriggersCount} / 5</strong></div>
                  <div><span style={{ color: '#8d99ae', display: 'block', fontSize: '0.8rem' }}>Fair Spread</span><strong>{evaluation.fairSpread}</strong></div>
                  <div><span style={{ color: '#8d99ae', display: 'block', fontSize: '0.8rem' }}>Actual Spread</span><strong>{evaluation.actualSpread}</strong></div>
                  <div><span style={{ color: '#8d99ae', display: 'block', fontSize: '0.8rem' }}>Tier</span><strong>{evaluation.tier}</strong></div>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {Object.entries(evaluation.triggers).map(([trigger, active]) => (
                    <div key={trigger} style={{ color: active ? '#6fffe9' : '#8d99ae' }}>
                      {active ? '✓' : '○'} {trigger.replace('_active', '').toUpperCase()}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <AddGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddGame={handleAddGame}
      />
    </div>
  );
}
