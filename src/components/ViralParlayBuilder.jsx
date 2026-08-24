import React, { useState } from 'react';

export default function ViralParlayBuilder({ availableGames = [] }) {
    const [selectedLegs, setSelectedLegs] = useState([]);
    const [copied, setCopied] = useState(false);

    // Toggle a leg into/out of the viral parlay slip
    const toggleLeg = (game) => {
        if (selectedLegs.some(leg => leg.id === game.id)) {
            setSelectedLegs(selectedLegs.filter(leg => leg.id !== game.id));
        } else {
            if (selectedLegs.length >= 6) {
                alert("Maximum 6 legs allowed for the viral syndicate ticket!");
                return;
            }
            setSelectedLegs([...selectedLegs, game]);
        }
    };

    // Calculate simulated cumulative parlay odds (rough estimate for demo)
    const calculateTotalOdds = () => {
        if (selectedLegs.length === 0) return "+000";
        // Base multiplier calculation for hype
        const simulatedOdds = +150 * Math.pow(2.1, selectedLegs.length - 1);
        return `+${Math.round(simulatedOdds)}`;
    };

    // Generate shareable text for social media (Twitter/X, Telegram, Discord)
    const generateShareText = () => {
        const legsList = selectedLegs.map(l => `• ${l.matchup} (${l.sport})`).join('\n');
        return `🔥 VEGAS LEVERAGE FREE VIRAL PARLAY (${selectedLegs.length}-Leg)\n\n${legsList}\n\nEstimated Odds: ${calculateTotalOdds()}\nLocked in via Vegas Leverage Matrix. Tail for free! 💸🚀`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateShareText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div style={{ background: 'linear-gradient(135deg, #1c2541 0%, #0b132b 100%)', border: '2px solid #ffb703', borderRadius: '10px', padding: '25px', marginBottom: '25px', boxShadow: '0 0 25px rgba(255, 183, 3, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #3a506b', paddingBottom: '15px', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <span style={{ background: '#ffb703', color: '#0b132b', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        🚀 Viral Growth Engine
                    </span>
                    <h2 style={{ color: '#fff', margin: '8px 0 0 0', fontSize: '1.4rem' }}>Free Syndicate Parlay Builder</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#8d99ae', display: 'block' }}>SLIP LEGS</span>
                    <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ffb703' }}>{selectedLegs.length} / 6</span>
                </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#e0fbfc', marginBottom: '20px' }}>
                Select your top sharp edges below to compile a <strong>100% Free Viral Parlay Slip</strong>. Copy your slip instantly to drop into social feeds, Discord, or group chats and let the public tail your matrix.
            </p>

            {/* Available Game Selection Grid */}
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '0.95rem', color: '#6fffe9', marginBottom: '10px' }}>1. Tap Games to Add Legs:</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                    {availableGames.map(game => {
                        const isSelected = selectedLegs.some(l => l.id === game.id);
                        return (
                            <div
                                key={game.id}
                                onClick={() => toggleLeg(game)}
                                style={{
                                    background: isSelected ? '#1d3557' : '#0b132b',
                                    border: `2px solid ${isSelected ? '#ffb703' : '#3a506b'}`,
                                    borderRadius: '6px',
                                    padding: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#8d99ae', marginBottom: '4px' }}>
                                    <span>{game.sport}</span>
                                    <span style={{ color: isSelected ? '#ffb703' : '#8d99ae', fontWeight: isSelected ? 'bold' : 'normal' }}>
                                        {isSelected ? '✓ SELECTED' : '+ ADD'}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>{game.matchup}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Compiled Slip & Viral Share Box */}
            <div style={{ background: '#0b132b', border: '1px solid #3a506b', borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#ffb703', fontSize: '1.1rem' }}>🎟️ Your Free Viral Slip Preview</h3>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#6fffe9' }}>Est. Odds: {calculateTotalOdds()}</span>
                </div>

                {selectedLegs.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#8d99ae', padding: '15px', fontSize: '0.85rem' }}>
                        Your slip is empty. Click any game above to add your first leg!
                    </div>
                ) : (
                    <div style={{ marginBottom: '15px' }}>
                        {selectedLegs.map((leg, index) => (
                            <div key={leg.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1c2541', fontSize: '0.85rem', color: '#e0fbfc' }}>
                                <span>{index + 1}. {leg.matchup}</span>
                                <span style={{ color: '#8d99ae' }}>{leg.sport}</span>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={copyToClipboard}
                    disabled={selectedLegs.length === 0}
                    style={{
                        background: selectedLegs.length > 0 ? '#ffb703' : '#3a506b',
                        color: '#0b132b',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: selectedLegs.length > 0 ? 'pointer' : 'not-allowed',
                        width: '100%',
                        fontSize: '1rem',
                        transition: 'background 0.2s'
                    }}
                >
                    {copied ? '✅ Copied Viral Slip to Clipboard!' : '📋 Copy Free Parlay to Share (Go Viral)'}
                </button>
            </div>
        </div>
    );
}