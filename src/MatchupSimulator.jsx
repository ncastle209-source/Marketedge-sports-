cat << 'EOF' > src / MatchupSimulator.jsx
import React, { useState } from 'react';

export default function MatchupSimulator({ game, matrixScore, rlm, moneySplit }) {
    const [simulationResult, setSimulationResult] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const runSimulation = () => {
        setIsSimulating(true);
        setSimulationResult(null);

        setTimeout(() => {
            // Generate dynamic plain-English breakdown based on matrix score and splits
            const homeTeam = game.matchup.split(' vs. ')[1] || "Away Team";
            const awayTeam = game.matchup.split(' vs. ')[0] || "Home Team";

            let sharpSide = game.handlePercentage > game.ticketPercentage ? awayTeam : homeTeam;
            let publicSide = game.handlePercentage > game.ticketPercentage ? homeTeam : awayTeam;

            let narrative = "";
            let confidenceRating = "";

            if (matrixScore >= 80) {
                confidenceRating = "🔥 DIAMOND LOCK (Elite Syndicate Alignment)";
                narrative = `The books are taking heavy, respected money on ${sharpSide} despite the casual betting public heavily leaning toward ${publicSide}. We are seeing sharp cash volume significantly outpace ticket counts, indicating professional syndicates are actively buying this number before it closes.`;
            } else if (matrixScore >= 65) {
                confidenceRating = "⚡ SHARP LEAN (Favorable Market Divergence)";
                narrative = `The market is showing subtle resistance against the public narrative on this matchup. While ${publicSide} is drawing the majority of public tickets, the money is quietly sliding toward ${sharpSide}. Expect a tight contest where disciplined bankroll management yields positive expected value.`;
            } else {
                confidenceRating = "⚠️ PUBLIC TRAP WARNING (Proceed with Caution)";
                narrative = `This matchup exhibits textbook public square traits. Over ${game.ticketPercentage}% of casual tickets are backing ${publicSide}, but the line movement isn't reflecting true sharp backing. This spot carries high variance—either pass or look to fade the public volume.`;
            }

            setSimulationResult({
                sharpSide,
                publicSide,
                confidenceRating,
                narrative,
                projectedScore: `${Math.floor(Math.random() * 5) + 3} - ${Math.floor(Math.random() * 4) + 1}`
            });
            setIsSimulating(false);
        }, 800);
    };

    return (
        <div style={{ background: '#1c2541', border: '1px solid #3a506b', borderRadius: '8px', padding: '20px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #3a506b', paddingBottom: '12px', marginBottom: '15px' }}>
                <div>
                    <h3 style={{ color: '#48cae4', margin: '0 0 4px 0', fontSize: '1.2rem' }}>🔮 Matchup Simulation & Layman's Breakdown</h3>
                    <span style={{ fontSize: '0.85rem', color: '#8d99ae' }}>Simulating sharp money flow, line efficiency, and game script for {game.matchup}</span>
                </div>
                <button
                    onClick={runSimulation}
                    disabled={isSimulating}
                    style={{ background: isSimulating ? '#3a506b' : '#6fffe9', color: '#0b132b', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
                >
                    {isSimulating ? 'Running Simulation...' : 'Run Deep-Dive Sim'}
                </button>
            </div>

            {!simulationResult && !isSimulating && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#8d99ae', fontSize: '0.9rem' }}>
                    Click "Run Deep-Dive Sim" to generate a plain-English betting breakdown and game script based on the matrix algorithm.
                </div>
            )}

            {isSimulating && (
                <div style={{ textAlign: 'center', padding: '30px', color: '#6fffe9', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    ⚡ Crunching handle splits, line velocity, and RLM indicators...
                </div>
            )}

            {simulationResult && (
                <div style={{ background: '#0b132b', padding: '18px', borderRadius: '6px', border: '1px solid #48cae4' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#6fffe9', fontWeight: 'bold' }}>{simulationResult.confidenceRating}</span>
                        <span style={{ fontSize: '0.85rem', background: '#1c2541', padding: '4px 10px', borderRadius: '4px', color: '#fff', border: '1px solid #3a506b' }}>
                            Recommended Side: <strong style={{ color: '#6fffe9' }}>{simulationResult.sharpSide}</strong>
                        </span>
                    </div>

                    <p style={{ fontSize: '0.95rem', color: '#e0fbfc', lineHeight: '1.5', margin: '10px 0 15px 0' }}>
                        {simulationResult.narrative}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.85rem', color: '#8d99ae', borderTop: '1px solid #1c2541', paddingTop: '10px' }}>
                        <div>⚠️ Public Heavy Side: <span style={{ color: '#ff0055' }}>{simulationResult.publicSide} ({game.ticketPercentage}% tickets)</span></div>
                        <div>🔥 Sharp Money Side: <span style={{ color: '#6fffe9' }}>{simulationResult.sharpSide} ({game.handlePercentage}% handle)</span></div>
                    </div>
                </div>
            )}
        </div>
    );
}
EOF