import React, { useState } from 'react';
import './NeonArcade.css';

export default function DegenerateDice({ initialSurvivors = [], onAdvanceToRoulette }) {
    // Combine survivors with extra teams to make 10 active teams on the grid
    const [activeTeams, setActiveTeams] = useState([
        initialSurvivors[0] || 'Celtics',
        initialSurvivors[1] || 'Dodgers',
        initialSurvivors[2] || 'Lakers',
        initialSurvivors[3] || 'Chiefs',
        initialSurvivors[4] || 'Storm',
        'Yankees', 'Warriors', 'Eagles', 'Heat', 'Aces'
    ]);

    const [rollsLeft, setRollsLeft] = useState(5);
    const [diceResult, setDiceResult] = useState({ die1: 3, die2: 4, total: 7 });
    const [rolling, setRolling] = useState(false);
    const [laserChaos, setLaserChaos] = useState(false);
    const [manualPickMode, setManualPickMode] = useState(false);
    const [survivorPool, setSurvivorPool] = useState([]);
    const [statusMessage, setStatusMessage] = useState('DEGENERATE GRID ACTIVE - ROLL THE BONES (5 ROLLS REMAINING)');

    const rollBones = () => {
        if (rollsLeft <= 0 || rolling) return;

        setRolling(true);
        setStatusMessage('ROLLING THE BONES ACROSS THE GRID...');

        setTimeout(() => {
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            const total = d1 + d2;
            setDiceResult({ die1: d1, die2: d2, total });
            setRolling(false);
            setRollsLeft(prev => prev - 1);

            // Check for 7 or 11 (NEON LASER LIGHT CHAOS)
            if (total === 7 || total === 11) {
                setLaserChaos(true);
                setManualPickMode(true);
                setStatusMessage(`JACKPOT! ROLLED A ${total}! NEON LASERS FIRING! CHOOSE ANY TEAM TO ADVANCE.`);
                setTimeout(() => setLaserChaos(false), 2500); // laser effect duration
            } else {
                // Standard number hit: eliminate/advance logic based on active pool
                if (activeTeams.length > 0) {
                    const selectedTeam = activeTeams[0]; // Take first team for this roll slot
                    setSurvivorPool(prev => [...prev, selectedTeam]);
                    setActiveTeams(prev => prev.slice(1)); // Remove from active pool, bring next team up

                    if (rollsLeft - 1 === 0) {
                        setStatusMessage('5 ROLLS COMPLETE! TRANSITIONING TO ROULETTE ELIMINATION.');
                    } else {
                        setStatusMessage(`ROLLED A ${total}! ${selectedTeam} LOCKED IN. ${rollsLeft - 1} ROLLS LEFT.`);
                    }
                }
            }
        }, 800);
    };

    const handleManualPick = (team) => {
        setSurvivorPool(prev => [...prev, team]);
        setActiveTeams(prev => prev.filter(t => t !== team));
        setManualPickMode(false);
        setStatusMessage(`MANUAL PICK SECURED: ${team}! READY FOR NEXT ROLL.`);
    };

    return (
        <div className={`degenerate-arcade-container ${laserChaos ? 'laser-chaos-active' : ''}`}>
            <div className="arcade-header">
                <h2>Phase 2: Degenerate Dice Survival</h2>
                <span className="arcade-sub">Rolls Remaining: {rollsLeft} / 5</span>
            </div>

            <div className={`dice-arena ${laserChaos ? 'laser-shake' : ''}`}>
                <div className={`dice-box ${rolling ? 'shake' : ''}`}>
                    <div className="die">{diceResult.die1}</div>
                    <div className="die">{diceResult.die2}</div>
                </div>
                <div className="dice-total-display">
                    DICE TOTAL: <span>{diceResult.total}</span> {(diceResult.total === 7 || diceResult.total === 11) && <strong className="jackpot-alert">⚡ CRITICAL SEVEN / ELEVEN ⚡</strong>}
                </div>
            </div>

            {manualPickMode && (
                <div className="manual-pick-box">
                    <p className="pick-prompt">🚨 LASER CHAOS ACTIVE! SELECT ONE TEAM TO ADVANCE 🚨</p>
                    <div className="manual-team-grid">
                        {activeTeams.map(team => (
                            <button key={team} className="deg-btn active" onClick={() => handleManualPick(team)}>
                                {team}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="arcade-controls">
                <button
                    className="roll-action-btn"
                    onClick={rollBones}
                    disabled={rolling || manualPickMode || rollsLeft <= 0}
                >
                    {rolling ? 'ROLLING...' : rollsLeft <= 0 ? 'GRID LOCKED' : 'ROLL THE BONES'}
                </button>

                <div className="outcome-banner win">
                    {statusMessage}
                </div>
            </div>

            <div className="survivors-preview-bar">
                <span>Locked Survivors ({survivorPool.length}):</span>
                <div className="mini-chips">
                    {survivorPool.map((team, i) => (
                        <span key={i} className="mini-chip">{team}</span>
                    ))}
                </div>
            </div>

            {rollsLeft === 0 && (
                <div className="fiasco-footer-action">
                    <button
                        className="roll-action-btn"
                        onClick={() => onAdvanceToRoulette(survivorPool)}
                    >
                        ENTER PHASE 3: ROULETTE ELIMINATION WHEEL ➔
                    </button>
                </div>
            )}
        </div>
    );
}