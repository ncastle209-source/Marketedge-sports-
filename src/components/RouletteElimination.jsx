import React, { useState } from 'react';
import './NeonArcade.css';

export default function RouletteElimination({ survivors = [], onAdvanceToPlinko }) {
    // Wheel slots populated from survivors or default fallback teams
    const wheelTeams = survivors.length > 0 ? survivors : ['Celtics', 'Dodgers', 'Lakers', 'Chiefs', 'Storm', 'Warriors', 'Yankees', 'Heat'];

    const [spinning, setSpinning] = useState(false);
    const [landedBalls, setLandedBalls] = useState([]);
    const [statusMessage, setStatusMessage] = useState('ROULETTE WHEEL LOADED - READY TO SPIN 5 BALLS');

    const spinRoulette = () => {
        if (spinning) return;

        setSpinning(true);
        setStatusMessage('SPINNING 5 BALLS SIMULTANEOUSLY ACROSS THE WHEEL...');

        setTimeout(() => {
            // Simulate 5 balls landing on random wheel slots with duplicate check
            let selected = [];
            while (selected.length < 5 && selected.length < wheelTeams.length) {
                const randomTeam = wheelTeams[Math.floor(Math.random() * wheelTeams.length)];
                if (!selected.includes(randomTeam)) {
                    selected.push(randomTeam);
                }
            }

            setLandedBalls(selected);
            setSpinning(false);
            setStatusMessage(`5 BALLS LOCKED! DISTINCT SURVIVORS SECURED FOR FINALE.`);
        }, 1200);
    };

    return (
        <div className="degenerate-arcade-container">
            <div className="arcade-header">
                <h2>Phase 3: Roulette Elimination Wheel</h2>
                <span className="arcade-sub">5 Simultaneous Balls ➔ Distinct Survivors</span>
            </div>

            <div className="roulette-arena">
                <div className={`roulette-wheel-box ${spinning ? 'spin-anim' : ''}`}>
                    <div className="wheel-center-hub">
                        <span>{spinning ? 'WHEEL SPINNING...' : '5 BALLS'}</span>
                    </div>
                </div>

                <div className="wheel-slots-preview">
                    <span className="slots-label">Active Wheel Slots:</span>
                    <div className="mini-chips">
                        {wheelTeams.map((team, idx) => (
                            <span key={idx} className="mini-chip slot">{team}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="arcade-controls">
                <button
                    className="roll-action-btn"
                    onClick={spinRoulette}
                    disabled={spinning}
                >
                    {spinning ? 'BALLS IN MOTION...' : 'SPIN 5 BALLS'}
                </button>

                <div className="outcome-banner win">
                    {statusMessage}
                </div>
            </div>

            {landedBalls.length > 0 && (
                <div className="survivors-preview-bar">
                    <span>Finalist Balls Landed ({landedBalls.length}):</span>
                    <div className="mini-chips">
                        {landedBalls.map((team, i) => (
                            <span key={i} className="mini-chip winner-chip">{team}</span>
                        ))}
                    </div>
                </div>
            )}

            {landedBalls.length === 5 && (
                <div className="fiasco-footer-action">
                    <button
                        className="roll-action-btn"
                        onClick={() => onAdvanceToPlinko(landedBalls)}
                    >
                        ENTER PHASE 4: PLINKO PARLAY FINALE ➔
                    </button>
                </div>
            )}
        </div>
    );
}