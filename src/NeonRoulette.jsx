import React, { useState } from 'react';

export default function NeonRoulette() {
    const [spinning, setSpinning] = useState(false);
    const [pocket, setPocket] = useState(null);

    const spinWheel = () => {
        setSpinning(true);
        setTimeout(() => {
            const p = Math.floor(Math.random() * 37);
            setPocket(p);
            setSpinning(false);
        }, 800);
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #070a14 100%)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 20px rgba(0, 240, 255, 0.05)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            padding: '24px',
            marginTop: '20px',
            color: '#ffffff',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ color: '#00f0ff', fontSize: '1.3rem', margin: 0, textShadow: '0 0 10px rgba(0, 240, 255, 0.6)' }}>
                    🎡 Compact Roulette Wheel
                </h3>
                <span style={{ background: 'rgba(255, 0, 127, 0.15)', color: '#ff007f', border: '1px solid rgba(255, 0, 127, 0.4)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    Step 3
                </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>
                Spin the micro-wheel for direct market multiplier boosts.
            </p>

            <div style={{ background: 'rgba(5, 8, 20, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px', filter: 'drop-shadow(0 0 10px rgba(0,240,255,0.4))' }}>
                    {spinning ? '🎡 💫' : '🎯'}
                </div>
                <p style={{ fontSize: '0.9rem', color: '#00f0ff', fontWeight: 'bold', marginBottom: '14px', textShadow: '0 0 8px rgba(0,240,255,0.4)' }}>
                    {spinning ? 'Wheel spinning...' : pocket !== null ? `Landed on Pocket #${pocket}` : 'Ready to spin'}
                </p>

                <button
                    onClick={spinWheel}
                    disabled={spinning}
                    style={{
                        background: 'linear-gradient(135deg, #00f0ff 0%, #7928ca 100%)',
                        color: '#070a14',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)'
                    }}
                >
                    {spinning ? 'Spinning...' : 'Spin Micro-Wheel'}
                </button>
            </div>
        </div>
    );
}