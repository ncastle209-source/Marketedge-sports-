import React, { useState } from 'react';
import './CoinFlipFiasco.css';

export default function CoinFlipFiasco({ onAdvanceToDice }) {
    // 5 initial matchups (10 teams total: Team A vs Team B)
    const [matchups, setMatchups] = useState([
        { id: 1, teamA: 'Celtics', teamB: 'Heat', winner: null, flipping: false },
        { id: 2, teamA: 'Dodgers', teamB: 'Giants', winner: null, flipping: false },
        { id: 3, teamA: 'Lakers', teamB: 'Warriors', winner: null, flipping: false },
        { id: 4, teamA: 'Chiefs', teamB: 'Raiders', winner: null, flipping: false },
        { id: 5, teamA: 'Storm', teamB: 'Aces', winner: null, flipping: false }
    ]);

    const [currentMatchupIndex, setCurrentMatchupIndex] = useState(0);
    const [fiascoComplete, setFiascoComplete] = useState(false);
    const [statusText, setStatusText] = useState('READY TO FLIP - CALL IT IN THE AIR');

    const flipForMatchup = (index) => {
        if (matchups[index].winner !== null) return;

        // Update flipping state for this specific matchup
        const updated = [...matchups];
        updated[index].flipping = true;
        setMatchups(updated);
        setStatusText(`FLIPPING FOR MATCHUP ${index + 1}...`);

        setTimeout(() => {
            // Randomly pick Team A or Team B
            const winningTeam = Math.random() < 0.5 ? updated[index].teamA : updated[index].teamB;

            updated[index].winner = winningTeam;
            updated[index].flipping = false;
            setMatchups(updated);

            // Check if all 5 are completed
            const allDone = updated.every(m => m.winner !== null);
            if (allDone) {
                setFiascoComplete(true);
                setStatusText('FIASCO COMPLETE! 5 SURVIVING TEAMS LOCKED IN.');
            } else {
                setStatusText(`SURVIVOR: ${winningTeam} ADVANCES! NEXT FLIP READY.`);
            }
        }, 800);
    };

    const handleTeamChange = (index, field, value) => {
        const updated = [...matchups];
        updated[index][field] = value;
        setMatchups(updated);
    };

    const getSurvivors = () => {
        return matchups.filter(m => m.winner !== null).map(m => m.winner);
    };

    return (
        <div className="degenerate-arcade-container">
            <div className="arcade-header">
                <h2>Phase 1: Coin Flip Fiasco</h2>
                <span className="arcade-sub">5 Matchups ➔ 5 Survivors</span>
            </div>

            <div className="fiasco-arena">
                {matchups.map((matchup, idx) => (
                    <div key={matchup.id} className={`matchup-row ${matchup.winner ? 'decided' : ''}`}>
                        <span className="matchup-num">#0{matchup.id}</span>

                        <div className="teams-input-group">
                            <input
                                type="text"
                                value={matchup.teamA}
                                disabled={matchup.winner !== null}
                                onChange={(e) => handleTeamChange(idx, 'teamA', e.target.value)}
                                className={matchup.winner === matchup.teamA ? 'survivor-text' : ''}
                            />
                            <span className="vs-tag">VS</span>
                            <input
                                type="text"
                                value={matchup.teamB}
                                disabled={matchup.winner !== null}
                                onChange={(e) => handleTeamChange(idx, 'teamB', e.target.value)}
                                className={matchup.winner === matchup.teamB ? 'survivor-text' : ''}
                            />
                        </div>

                        <div className="flip-action-slot">
                            {matchup.winner ? (
                                <div className="winner-badge">
                                    ADVANCED: <span>{matchup.winner}</span>
                                </div>
                            ) : (
                                <button
                                    className={`flip-single-btn ${matchup.flipping ? 'flipping' : ''}`}
                                    onClick={() => flipForMatchup(idx)}
                                    disabled={matchup.flipping}
                                >
                                    {matchup.flipping ? '🪙 FLIPPING...' : 'FLIP COIN'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="outcome-banner win">
                {statusText}
            </div>

            {fiascoComplete && (
                <div className="fiasco-footer-action">
                    <button
                        className="roll-action-btn"
                        onClick={() => onAdvanceToDice(getSurvivors())}
                    >
                        ENTER PHASE 2: DEGENERATE DICE ➔
                    </button>
                </div>
            )}
        </div>
    );
}