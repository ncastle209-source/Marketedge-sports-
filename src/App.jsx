cat << 'EOF' > src / App.jsx
import React, { useState, useEffect } from 'react';
import { MarketEdgeEngine } from './analytics';
import SteamTracker from './SteamTracker';
import AddGameModal from './AddGameModal';
import MatchupSimulator from './MatchupSimulator';

const initialSampleGames = [
  {
    id: 1,
    matchup: "Chiba Lotte Marines vs. Fukuoka Hawks",
    sport: "NPB",
    initialLine: -110,
    currentLine: -125,
    handlePercentage: 78,
    ticketPercentage: 42,
    estimatedWinProb: 68
  },
  {
    id: 2,
    matchup: "New York Yankees vs. Boston Red Sox",
    sport: "MLB",
    initialLine: +140,
    currentLine: +125,
    handlePercentage: 81,
    ticketPercentage: 35,
    estimatedWinProb: 59
  },
  {
    id: 3,
    matchup: "Las Vegas Aces vs. New York Liberty",
    sport: "WNBA",
    initialLine: -130,
    currentLine: -145,
    handlePercentage: 72,
    ticketPercentage: 51,
    estimatedWinProb: 63
  },
  {
    id: 4,
    matchup: "Manchester United vs. Arsenal",
    sport: "EFL/Soccer",
    initialLine: +105,
    currentLine: +115,
    handlePercentage: 85,
    ticketPercentage: 40,
    estimatedWinProb: 55
  }
];

export default function App() {
  const [bankroll, setBankroll] = useState(() => {
    const saved = localStorage.getItem('vegas_bankroll');
    return saved ? Number(saved) : 10000;
  });

  const [games, setGames] = useState(() => {
    const saved = localStorage.getItem('vegas_games');
    return saved ? JSON.parse(saved) : initialSampleGames;
  });

  const [selectedSport, setSelectedSport] = useState("ALL");
  const [selectedGame, setSelectedGame] = useState(() => games[0] || initialSampleGames[0]);
  const [diceResult, setDiceResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('vegas_bankroll', bankroll);
  }, [bankroll]);

  useEffect(() => {
    localStorage.setItem('vegas_games', JSON.stringify(games));
  }, [games]);

  const filteredGames = selectedSport === "ALL"
    ? games
    : games.filter(g => g.sport === selectedSport);

  const engine = new MarketEdgeEngine(selectedGame);
  const rlm = engine.detectRLM();
  const moneySplit = engine.analyzeMoneySplit();
  const score = engine.computeRankingMatrixScore();
  const bankrollData = engine.calculateBankrollAllocation(bankroll);

  const rollDegenDice = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    const outcomes = [
      "🔥 LOCK IT IN! Sharp money alignment confirmed.",
      "⚠️ Caution: Public trap territory. Fade the public handle.",
      "💎 Diamond Edge: Heavy RLM detected, fire away.",
      "🧊 Ice Cold: Stay disciplined, pass on this spot.",
      "⚡ Sharp Action: Line movement strongly favors the side.",
      "🎲 Degen Special: Small sprinkle only, high variance!"
    ];
    setDiceResult({ roll, message: outcomes[roll - 1] });
  };

  const handleAddGame = (newGame) => {
    setGames(prev => [newGame, ...prev]);
    setSelectedGame(newGame);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b132b', color: '#e0fbfc', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1c2541', paddingBottom: '15px', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#6fffe9' }}>Vegas Leverage</h1>
          <span style={{ fontSize: '0.85rem', color: '#8d99ae' }}>Ranking Matrix & Market Efficiency Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{ background: '#48cae4', color: '#0b132b', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            + Add Matchup
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.9rem', color: '#8d99ae' }}>Bankroll ($):</label>
            <input
              type="number"
              value={bankroll}
              onChange={(e) => setBankroll(Number(e.target.value))}
              style={{ background: '#1c2541', border: '1px solid #3a506b', color: '#fff', padding: '6px 10px', borderRadius: '4px', width: '110px' }}
            />
          </div>
        </div>
      </header>

      {/* Sport Filter & Matchup Selectors */}
      <section style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1rem', color: '#8d99ae', margin: 0 }}>Active Slate Matchups:</h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {["ALL", "MLB", "NPB", "WNBA", "EFL/Soccer", "NFL", "NBA"].map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                style={{
                  background: selectedSport === sport ? '#48cae4' : '#1c2541',
                  color: selectedSport === sport ? '#0b132b' : '#8d99ae',
                  border: '1px solid #3a506b',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {filteredGames.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game)}
              style={{
                background: selectedGame?.id === game.id ? '#3a506b' : '#1c2541',
                color: '#fff',
                border: '1px solid #48cae4',
                padding: '10px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: selectedGame?.id === game.id ? 'bold' : 'normal',
                flex: '1 1 200px',
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#48cae4', marginBottom: '2px' }}>{game.sport}</div>
              <div style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{game.matchup}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Main Analytics Grid */}
      {selectedGame && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>

            {/* Left Column: Matrix Scoring & Market Divergence */}
            <div style={{ background: '#1c2541', border: '1px solid #3a506b', borderRadius: '8px', padding: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', color: '#48cae4', marginTop: 0, textAlign: 'center' }}>
                Matrix Evaluation
              </h2>
              <p style={{ textAlign: 'center', color: '#8d99ae', fontSize: '0.9rem', margin: '0 0 15px 0' }}>{selectedGame.matchup}</p>

              <div style={{ background: '#0b132b', padding: '15px', borderRadius: '6px', textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.85rem', color: '#8d99ae', display: 'block' }}>RANKING MATRIX SCORE</span>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#6fffe9' }}>{score} / 100</span>
              </div>

              <div style={{ marginBottom: '15px', background: '#0b132b', padding: '12px', borderRadius: '6px' }}>
                <strong style={{ display: 'block', color: '#48cae4', marginBottom: '4px', fontSize: '0.9rem' }}>Reverse Line Movement (RLM)</strong>
                <span style={{ fontSize: '0.85rem', color: rlm.active ? '#6fffe9' : '#8d99ae' }}>
                  {rlm.message}
                </span>
              </div>

              <div style={{ background: '#0b132b', padding: '12px', borderRadius: '6px' }}>
                <strong style={{ display: 'block', color: '#48cae4', marginBottom: '4px', fontSize: '0.9rem' }}>Money Split Analysis</strong>
                <span style={{ fontSize: '0.85rem', color: '#fff' }}>
                  {moneySplit.description} (Divergence: {moneySplit.diff > 0 ? `+${moneySplit.diff}%` : `${moneySplit.diff}%`})
                </span>
              </div>
            </div>

            {/* Middle Column: Sharp vs Public Dual-Dial Steam Tracker */}
            <SteamTracker
              handle={selectedGame.handlePercentage}
              tickets={selectedGame.ticketPercentage}
              team={selectedGame.matchup.split(' vs. ')[0]}
              timeFrame="Late Steam Action"
            />

            {/* Right Column: Kelly Sizing & Interactive Degen Tools */}
            <div style={{ background: '#1c2541', border: '1px solid #3a506b', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', color: '#48cae4', marginTop: 0, textAlign: 'center', borderBottom: '1px solid #3a506b', paddingBottom: '10px' }}>
                  Bankroll & Sizing (Kelly Engine)
                </h2>
                <div style={{ margin: '20px 0', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
                    Recommended Risk: <strong style={{ color: '#6fffe9' }}>${bankrollData.recommendedRisk.toFixed(2)}</strong>
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#8d99ae' }}>
                    Unit Size Equivalent: <span style={{ color: '#fff' }}>{bankrollData.unitSizeEquivalent}</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#0b132b', border: '1px dashed #48cae4', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#6fffe9', fontSize: '1.1rem' }}>🎲 Degen Dice Check</h3>
                <p style={{ fontSize: '0.85rem', color: '#8d99ae', margin: '0 0 15px 0' }}>Roll the matrix dice when you're on the fence about a lean.</p>
                <button
                  onClick={rollDegenDice}
                  style={{ background: '#48cae4', color: '#0b132b', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
                >
                  Roll Dice
                </button>
                {diceResult && (
                  <div style={{ marginTop: '15px', background: '#1c2541', padding: '10px', borderRadius: '6px', border: '1px solid #3a506b' }}>
                    <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '5px' }}>🎲 [{diceResult.roll}]</span>
                    <span style={{ fontSize: '0.9rem', color: '#6fffe9' }}>{diceResult.message}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Deep-Dive Matchup Simulator & Layman's Write-up */}
          <MatchupSimulator
            game={selectedGame}
            matrixScore={score}
            rlm={rlm}
            moneySplit={moneySplit}
          />
        </>
      )}

      {/* Custom Game Modal */}
      <AddGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddGame={handleAddGame}
      />
    </div>
  );
}
EOF