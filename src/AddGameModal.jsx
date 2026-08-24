import React, { useState } from 'react';

export default function AddGameModal({ isOpen, onClose, onAddGame }) {
    const [matchup, setMatchup] = useState('');
    const [sport, setSport] = useState('MLB');
    const [initialLine, setInitialLine] = useState(-110);
    const [currentLine, setCurrentLine] = useState(-115);
    const [handlePercentage, setHandlePercentage] = useState(75);
    const [ticketPercentage, setTicketPercentage] = useState(35);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!matchup) return;

        const newGame = {
            id: Date.now(),
            matchup,
            sport,
            initialLine: Number(initialLine),
            currentLine: Number(currentLine),
            handlePercentage: Number(handlePercentage),
            ticketPercentage: Number(ticketPercentage),
            estimatedWinProb: 60 // Default matrix estimate
        };

        onAddGame(newGame);
        onClose();
        // Reset form
        setMatchup('');
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(11, 19, 43, 0.85)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px'
        }}>
            <div style={{
                background: '#1c2541', border: '1px solid #48cae4', borderRadius: '8px',
                padding: '25px', width: '100%', maxWidth: '450px', color: '#e0fbfc'
            }}>
                <h2 style={{ color: '#6fffe9', marginTop: 0, marginBottom: '15px', fontSize: '1.3rem' }}>➕ Add Custom Slate Matchup</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#8d99ae', display: 'block', marginBottom: '4px' }}>Matchup (e.g., Dodgers vs. Giants)</label>
                        <input
                            type="text"
                            value={matchup}
                            onChange={(e) => setMatchup(e.target.value)}
                            placeholder="Team A vs. Team B"
                            required
                            style={{ width: '100%', background: '#0b132b', border: '1px solid #3a506b', color: '#fff', padding: '8px', borderRadius: '4px' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#8d99ae', display: 'block', marginBottom: '4px' }}>Sport / League</label>
                            <select
                                value={sport}
                                onChange={(e) => setSport(e.target.value)}
                                style={{ width: '100%', background: '#0b132b', border: '1px solid #3a506b', color: '#fff', padding: '8px', borderRadius: '4px' }}
                            >
                                <option value="MLB">MLB</option>
                                <option value="NPB">NPB</option>
                                <option value="WNBA">WNBA</option>
                                <option value="EFL/Soccer">EFL/Soccer</option>
                                <option value="NFL">NFL</option>
                                <option value="NBA">NBA</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#8d99ae', display: 'block', marginBottom: '4px' }}>Initial Line</label>
                            <input
                                type="number"
                                value={initialLine}
                                onChange={(e) => setInitialLine(e.target.value)}
                                style={{ width: '100%', background: '#0b132b', border: '1px solid #3a506b', color: '#fff', padding: '8px', borderRadius: '4px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#8d99ae', display: 'block', marginBottom: '4px' }}>Current Line</label>
                            <input
                                type="number"
                                value={currentLine}
                                onChange={(e) => setCurrentLine(e.target.value)}
                                style={{ width: '100%', background: '#0b132b', border: '1px solid #3a506b', color: '#fff', padding: '8px', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#8d99ae', display: 'block', marginBottom: '4px' }}>Sharp Handle %</label>
                            <input
                                type="number"
                                min="0" max="100"
                                value={handlePercentage}
                                onChange={(e) => setHandlePercentage(e.target.value)}
                                style={{ width: '100%', background: '#0b132b', border: '1px solid #3a506b', color: '#fff', padding: '8px', borderRadius: '4px' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#8d99ae', display: 'block', marginBottom: '4px' }}>Public Ticket %</label>
                        <input
                            type="number"
                            min="0" max="100"
                            value={ticketPercentage}
                            onChange={(e) => setTicketPercentage(e.target.value)}
                            style={{ width: '100%', background: '#0b132b', border: '1px solid #3a506b', color: '#fff', padding: '8px', borderRadius: '4px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ flex: 1, background: '#3a506b', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{ flex: 1, background: '#48cae4', color: '#0b132b', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Add Matchup
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}