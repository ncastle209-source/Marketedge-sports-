import React, { useState } from "react";
import { MarketEdgeEngine } from './analytics.js';
// Mock games dataset for your dashboard slates
const MOCK_GAMES = [
  {
    id: 1,
    teams: "Chiba Lotte Marines vs. Fukuoka Hawks",
    sport: "NPB (Late Night)",
    initialLine: -130,
    currentLine: -145,
    publicTickets: 72,
    handlePercentage: 84,
    ticketPercentage: 42,
    odds: -145,
    estimatedWinProb: 62
  },
  {
    id: 2,
    teams: "Sample MLB Slate Game",
    sport: "MLB",
    initialLine: 110,
    currentLine: -105,
    publicTickets: 80,
    handlePercentage: 25,
    ticketPercentage: 75,
    odds: 105,
    estimatedWinProb: 52
  }
];

export default function Dashboard() {
  const [selectedGame, setSelectedGame] = useState(MOCK_GAMES[0]);
  const [bankroll, setBankroll] = useState(10000); // Default $10,000 bankroll
  const [diceResult, setDiceResult] = useState(null);

  // Initialize your analytics engine for the selected game
  const engine = new MarketEdgeEngine(selectedGame);
  const rlmResult = engine.detectRLM();
  const splitResult = engine.analyzeMoneySplit();
  const matrixResult = engine.computeRankingMatrixScore();
  const bankrollResult = engine.calculateBankrollAllocation(bankroll);

  const rollDegenDice = () => {
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    setDiceResult(die1 + die2);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", backgroundColor: "#0f172a", color: "#f8fafc", minHeight: "100vh" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155", paddingBottom: "15px", marginBottom: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "24px", color: "#38bdf8" }}>Vegas Leverage <span style={{ fontSize: "14px", color: "#94a3b8" }}>| Ranking Matrix & Market Efficiency</span></h1>
        <div>
          <label style={{ marginRight: "10px", fontSize: "14px" }}>Bankroll ($): </label>
          <input
            type="number"
            value={bankroll}
            onChange={(e) => setBankroll(Number(e.target.value))}
            style={{ padding: "6px", borderRadius: "4px", border: "1px solid #475569", background: "#1e293b", color: "#fff" }}
          />
        </div>
      </header>

      {/* Game Selector Bar */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "16px", color: "#cbd5e1" }}>Active Slate Matchups:</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          {MOCK_GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game)}
              style={{
                padding: "10px 15px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                background: selectedGame.id === game.id ? "#0284c7" : "#1e293b",
                color: "#fff",
                fontWeight: "bold"
              }}
            >
              {game.teams}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Display */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Left Column: Market Analytics & Matrix Score */}
        <div style={{ background: "#1e293b", padding: "20px", borderRadius: "8px", border: "1px solid #334155" }}>
          <h2 style={{ marginTop: 0, fontSize: "18px", color: "#38bdf8" }}>Matrix Evaluation: {selectedGame.teams}</h2>
          <p><strong>Sport:</strong> {selectedGame.sport}</p>
          <hr style={{ borderColor: "#334155" }} />

          <div style={{ margin: "15px 0" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: matrixResult.score >= 75 ? "#4ade80" : "#facc15" }}>
              Score: {matrixResult.score} / 100
            </span>
            <p style={{ margin: "5px 0", color: "#94a3b8" }}>{matrixResult.confidence}</p>
          </div>

          <div style={{ background: "#0f172a", padding: "12px", borderRadius: "6px", marginBottom: "10px" }}>
            <h4 style={{ margin: "0 0 5px 0", color: "#38bdf8" }}>Reverse Line Movement (RLM)</h4>
            <p style={{ margin: 0, fontSize: "14px" }}>{rlmResult.signal}: {rlmResult.description}</p>
          </div>

          <div style={{ background: "#0f172a", padding: "12px", borderRadius: "6px" }}>
            <h4 style={{ margin: "0 0 5px 0", color: "#38bdf8" }}>Money Split Analysis</h4>
            <p style={{ margin: 0, fontSize: "14px" }}>{splitResult.summary} ({splitResult.tier})</p>
          </div>
        </div>

        {/* Right Column: Bankroll & Action Plan */}
        <div style={{ background: "#1e293b", padding: "20px", borderRadius: "8px", border: "1px solid #334155" }}>
          <h2 style={{ marginTop: 0, fontSize: "18px", color: "#38bdf8" }}>Bankroll & Sizing (Kelly Engine)</h2>
          <hr style={{ borderColor: "#334155" }} />

          <div style={{ margin: "20px 0" }}>
            <p style={{ fontSize: "16px" }}><strong>Recommended Risk:</strong> ${bankrollResult.recommendedRisk}</p>
            <p style={{ fontSize: "16px" }}><strong>Unit Size Equivalent:</strong> {bankrollResult.units} Units</p>
            <p style={{ fontSize: "14px", color: "#94a3b8", fontStyle: "italic" }}>{bankrollResult.advice}</p>
          </div>

          <div style={{ marginTop: "30px", borderTop: "1px solid #334155", paddingTop: "15px" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#38bdf8" }}>Degen Dice Check</h4>
            <button
              onClick={rollDegenDice}
              style={{ padding: "8px 14px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Roll Dice
            </button>
            {diceResult !== null && (
              <span style={{ marginLeft: "15px", fontSize: "16px", fontWeight: "bold" }}>Result: {diceResult}</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}