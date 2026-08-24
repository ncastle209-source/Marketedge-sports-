import React from 'react';
import { MarketEdgeEngine } from './analytics';

export default function OfficialPlaysFeed({ games, bankroll, onSelectGame }) {
    // Filter all games where the matrix score is 70 or higher
    const officialPlays = games.map(game => {
        const engine = new MarketEdgeEngine(game);
        const score = engine.computeRankingMatrixScore();
        const rlm = engine.detectRLM();
        const moneySplit = engine.analyzeMoneySplit();
        const bankrollData = engine.calculateBankrollAllocation(bankroll);

        // Compile algorithm trigger points for the write-up
        const triggers = [];
        if (moneySplit.diff >= 20) triggers.push(`High Sharp Cash Divergence (+${moneySplit.diff}% Handle vs Tickets)`);
        if (rlm.active) triggers.push(`Active Reverse Line Movement (${rlm.message})`);
        if (game.estimatedWinProb >= 60) triggers.push(`Strong Matrix Win Probability Model (${game.estimatedWinProb}%)`);
        if (score >= 85) triggers.push(`Elite Tier Synergy (Score: ${score}/100)`);
        if (triggers.length === 0) triggers.push(`Solid Market Inefficiency Detected (Score: ${score}/100)`);

        return {
            ...game,
            matrixScore: score,
            rlm,
            moneySplit,
            bankrollData,
            triggers,
            sharpSide: game.handlePercentage > game.ticketPercentage ? (game.matchup.split(' vs. ')[0] || "Home") : (game.matchup.split(' vs. ')[1] || "Away")
        };
    }).filter(game => game.matrixScore >= 70);

    return (
        <div style={{ background: '#1c2541', border: '1px solid #48cae4', borderRadius: '8px', padding: '20px', marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #3a506b', paddingBottom: '12px', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h2 style={{ color: '#6fffe9', margin: '0 0 4px 0', fontSize: '1.3rem' }}>🔥 Vegas Leverage Official System Plays (70+ Confidence)</h2>
                    <span style={{ fontSize: '0.85rem', color: '#8d99ae' }}>Automated syndicate feed detailing exact algorithmic triggers.</span>
                </div>
                <span style={{ background: '#0b132b', border: '1px solid #48cae4', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', color: '#6fffe9', fontWeight: 'bold' }}>
                    Active Plays: {officialPlays.length}
                </span>
            </div>

            {officialPlays.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '25px', color: '#8d99ae', fontSize: '0.9rem' }}>
                    No games currently meeting the strict 70+ matrix confidence threshold on this slate.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '15px' }}>
                    {officialPlays.map(play => (
                        <div
                            key={play.id}
                            onClick={() => onSelectGame(play)}
                            style={{
                                background: '#0b132b', border: '1px solid #3a506b', borderRadius: '6px', padding: '15px',
                                cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.75rem', background: '#1c2541', color: '#48cae4', padding: '2px 8px', borderRadius: '4px', border: '1px solid #3a506b' }}>
                                        {play.sport}
                                    </span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#6fffe9' }}>
                                        {play.matrixScore} / 100
                                    </span>
                                </div>

                                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', marginBottom: '6px' }}>
                                    {play.matchup}
                                </div>

                                <div style={{ fontSize: '0.85rem', color: '#48cae4', marginBottom: '10px' }}>
                                    Official Pick: <strong>{play.sharpSide} ({play.currentLine > 0 ? `+${play.currentLine}` : play.currentLine})</strong>
                                </div>

                                <div style={{ fontSize: '0.8rem', color: '#e0fbfc', background: '#1c2541', padding: '10px', borderRadius: '4px', marginBottom: '12px' }}>
                                    <strong style={{ display: 'block', color: '#6fffe9', marginBottom: '4px' }}>Algorithmic Triggers & Why We Picked It:</strong>
                                    <ul style={{ margin: 0, paddingLeft: '16px', color: '#8d99ae' }}>
                                        {play.triggers.map((trigger, idx) => (
                                            <li key={idx} style={{ marginBottom: '3px', color: '#e0fbfc' }}>{trigger}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#8d99ae', borderTop: '1px solid #1c2541', paddingTop: '8px' }}>
                                <span>Kelly Risk: <strong style={{ color: '#e0fbfc' }}>${play.bankrollData.recommendedRisk.toFixed(0)}</strong></span>
                                <span>Divergence: <strong style={{ color: '#6fffe9' }}>+{play.moneySplit.diff}%</strong></span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}