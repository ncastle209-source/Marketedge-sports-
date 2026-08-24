import React, { useState, useRef } from 'react';
import './NeonPlinko.css';

export default function NeonPlinko({ bankroll, onUpdateBankroll }) {
    const [activeDrops, setActiveDrops] = useState([]);
    const [multiplierHistory, setMultiplierHistory] = useState([]);
    const [dropAmount, setDropAmount] = useState(50);
    const [isDropping, setIsDropping] = useState(false);

    // Multiplier slots across the bottom of the Plinko board
    const slots = [0.2, 0.5, 1.2, 2.0, 5.0, 10.0, 5.0, 2.0, 1.2, 0.5, 0.2];

    const handleDrop = () => {
        if (bankroll < dropAmount || isDropping) return;

        // Deduct bet immediately
        onUpdateBankroll(bankroll - dropAmount);
        setIsDropping(true);

        // Randomly select target slot (weighted toward the middle slightly)
        const slotIndex = Math.floor(Math.random() * slots.length);
        const multiplier = slots[slotIndex];
        const payout = Math.round(dropAmount * multiplier);

        // Create a unique drop instance for animation tracking
        const newDrop = {
            id: Date.now(),
            targetSlot: slotIndex,
            multiplier,
            payout
        };

        setActiveDrops(prev => [...prev, newDrop]);

        // Animate pinball drop completion
        setTimeout(() => {
            onUpdateBankroll(prev => prev + payout);
            setMultiplierHistory(prev => [multiplier, ...prev.slice(0, 4)]);
            setActiveDrops(prev => prev.filter(d => d.id !== newDrop.id));
            setIsDropping(false);
        }, 1500);
    };

    return (
        <div className="vl-neon-plinko-container">
            <div className="vl-plinko-header">
                <h2>Neon Plinko Grand Finale</h2>
                <span className="vl-bankroll-tag">Bankroll: <strong>${bankroll}</strong></span>
            </div>

            {/* Plinko Board Graphic Area */}
            <div className="vl-plinko-board">
                <div className="vl-pegs-grid">
                    {[...Array(5)].map((_, rowIndex) => (
                        <div key={rowIndex} className={`peg-row row-${rowIndex}`}>
                            {[...Array(rowIndex + 3)].map((_, colIndex) => (
                                <div key={colIndex} className="neon-peg" />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Active dropping tokens */}
                {activeDrops.map(drop => (
                    <div key={drop.id} className="plinko-token dropping" style={{ left: `${(drop.targetSlot / slots.length) * 100}%` }}>
                        ${dropAmount}
                    </div>
                ))}

                {/* Bottom Multiplier Slots */}
                <div className="vl-plinko-slots">
                    {slots.map((mult, idx) => (
                        <div key={idx} className={`slot-box ${mult >= 5 ? 'high-tier' : ''}`}>
                            {mult}x
                        </div>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="vl-plinko-controls">
                <div className="vl-drop-selector">
                    {[10, 25, 50, 100].map(val => (
                        <button
                            key={val}
                            className={`vl-amt-btn ${dropAmount === val ? 'active' : ''}`}
                            onClick={() => setDropAmount(val)}
                        >
                            ${val}
                        </button>
                    ))}
                </div>

                <button className="vl-btn-drop" onClick={handleDrop} disabled={bankroll < dropAmount}>
                    {isDropping ? 'DROPPING...' : 'DROP CHIP'}
                </button>
            </div>

            {/* Recent History Display */}
            <div className="vl-plinko-history">
                <span>Recent Multipliers:</span>
                <div className="history-tags">
                    {multiplierHistory.length === 0 ? <span className="no-history">None yet</span> :
                        multiplierHistory.map((m, i) => (
                            <span key={i} className={`history-tag ${m >= 5 ? 'win-big' : ''}`}>{m}x</span>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}