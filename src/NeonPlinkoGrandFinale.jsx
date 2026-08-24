import React, { useState } from 'react';
import './NeonArcade.css';

export default function PlinkoFinale({ finalists = [], bankroll, onUpdateBankroll }) {
    const finalTeams = finalists.length > 0 ? finalists : ['Celtics', 'Dodgers', 'Lakers', 'Chiefs', 'Storm'];

    const [dropping, setDropping] = useState(false);
    const [parlayLocked, setParlayLocked] = useState(false);
    const [droppedSlots, setDroppedSlots] = useState([]);
    const [statusMessage, setStatusMessage] = useState('PLINKO PARLAY FINALE READY - DROP THE BALLS');

    const dropPlinkoBalls = () => {
        if (dropping || parlayLocked) return;

        setDropping(true);
        setStatusMessage('DROPPING PLINKO PARLAY BALLS THROUGH THE PEGS...');

        setTimeout(() => {
            // Simulate drop results mapping to the final teams
            let results = [...finalTeams];
            // Randomize order for the parlay slip
            results.sort(() => Math.random() - 0.5);

            setDroppedSlots(results);
            setDropping(false);
            setParlayLocked(true);
            setStatusMessage('FINALE PARLAY LOCKED! OFFICIAL VEGAS LEVERAGE PARLAY SLIP CREATED.');
        }, 1500);
    };

    return (
        <div className="degenerate-arcade-container">
            <div className="arcade-header">
                <h2>Phase 4: Plinko Parlay Finale</h2>
                <span className="arcade-sub">Final Peg Drop ➔ Championship Parlay Slip</span>
            </div>

            <div className="plinko-arena">
                <div className={`plinko-board-box ${dropping ? 'shake' : ''}`}>
                    <div className="plinko-peg-grid">
                        {['.', '.', '.', '.', '.', '.', '.', '.', '.', '.'].map((peg, idx) => (
                            <span key={idx} className="plinko-peg">o</span>
                        ))}
                    </div>
                    <div className="plinko-status-text">
                        {dropping ? 'BALLS BOUNCING THROUGH PEGS...' : parlayLocked ? 'PARLAY SECURED' : 'READY TO DROP'}
                    </div>
                </div>

                <div className="wheel-slots-preview">
                    <span className="slots-label">Finalist Pool:</span>
                    <div className="mini-chips">
                        {finalTeams.map((team, idx) => (
                            <span key={idx} className="mini-chip slot">{team}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="arcade-controls">
                <button
                    className="roll-action-btn"
                    onClick={dropPlinkoBalls}
                    disabled={dropping || parlayLocked}
                >
                    {dropping ? 'DROPPING...' : parlayLocked ? 'PARLAY LOCKED' : 'DROP PLINKO BALLS'}
                </button>

                <div className="outcome-banner win">
                    {statusMessage}
                </div>
            </div>

            {parlayLocked && (
                <div className="parlay-slip-card">
                    <div className="slip-header">
                        <span>OFFICIAL VEGAS LEVERAGE PARLAY SLIP</span>
                        <span className="slip-odds">+2500</span>
                    </div>
                    <div className="slip-legs">
                        {droppedSlots.map((team, index) => (
                            <div key={index} className="slip-leg-item">
                                <span>Leg 0{index + 1}:</span>
                                <span className="leg-team">{team}</span>
                                <span className="leg-status">LOCKED</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}