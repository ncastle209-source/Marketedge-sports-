import React from 'react';

export default function AlphaPlayReport({ game, matrixScore, rlm, moneySplit, bankrollData }) {
    if (matrixScore < 95) return null;

    const sharpSide = game.handlePercentage > game.ticketPercentage
        ? (game.matchup.split(' vs. ')[0] || "Home")
        : (game.matchup.split(' vs. ')[1] || "Away");

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1c2541 0%, #0b132b 100%)',
            border: '2px solid #6fffe9',
            borderRadius: '10px',
            padding: '25px',
            marginBottom: '25px',
            boxShadow: '0 0 20px rgba(111, 255, 233, 0.15)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #3a506b', paddingBottom: '15px', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <span style={{ background: '#6fffe9', color: '#0b132b', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        🔥 Heavy Hitter — 95+ Max Conviction Play
                    </span>
                    <h2 style={{ color: '#fff', margin: '8px 0 0 0', fontSize: '1.5rem' }}>{game.matchup}</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#8d99ae', display: 'block' }}>RANKING MATRIX</span>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6fffe9' }}>{matrixScore} / 100</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div style={{ background: '#0b132b', padding: '12px', borderRadius: '6px', border: '1px solid #3a506b' }}>
                    <span style={{ fontSize: '0.75rem', color: '#8d99ae', display: 'block' }}>OFFICIAL SELECTION</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#6fffe9' }}>{sharpSide} ({game.currentLine > 0 ? `+${game.currentLine}` : game.currentLine})</span>
                </div>
                <div style={{ background: '#0b132b', padding: '12px', borderRadius: '6px', border: '1px solid #3a506b' }}>
                    <span style={{ fontSize: '0.75rem', color: '#8d99ae', display: 'block' }}>MAX KELLY ALLOCATION</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>${bankrollData.recommendedRisk.toFixed(2)} ({bankrollData.unitSizeEquivalent})</span>
                </div>
                <div style={{ background: '#0b132b', padding: '12px', borderRadius: '6px', border: '1px solid #3a506b' }}>
                    <span style={{ fontSize: '0.75rem', color: '#8d99ae', display: 'block' }}>CASH VS. TICKET DIVERGENCE</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#48cae4' }}>+{moneySplit.diff}% Handle Weight</span>
                </div>
            </div>

            <div style={{ background: '#0b132b', borderLeft: '4px solid #6fffe9', padding: '16px', borderRadius: '0 6px 6px 0' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#6fffe9', fontSize: '1rem' }}>📋 Heavy Hitter Dossier & Algorithmic Breakdown</h3>
                <p style={{ fontSize: '0.9rem', color: '#e0fbfc', lineHeight: '1.6', margin: 0 }}>
                    This matchup has cleared the elite 95+ confidence threshold, officially designating it as a <strong>Heavy Hitter</strong> max play.
                    Market efficiency indicators show massive professional capital backing <strong style={{ color: '#6fffe9' }}>{sharpSide}</strong>.
                    {rlm.message}
                    With a handle-to-ticket divergence of +{moneySplit.diff}%, public square volume is heavily inversely correlated with sharp capital, creating the exact institutional pricing inefficiency required to fire maximum allowable bankroll units.
                </p>
            </div>
        </div>
    );
}