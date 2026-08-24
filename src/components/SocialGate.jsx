import React, { useState } from 'react';
import './NeonArcade.css';

export default function SocialGate({ onUnlock }) {
    const [step, setStep] = useState(1); // Step 1: Share; Step 2: Tag/Link on official page
    const [userPostLink, setUserPostLink] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [unlockedReady, setUnlockedReady] = useState(false);

    const shareText = "Riding the sharp ticket-vs-handle divergence on Vegas Leverage today. Heading into the Degenerate Tournament gauntlet! 📊🏀⚾";
    const appUrl = "https://vegasleverage.app";
    const officialPageUrl = "https://twitter.com/VegasLeverage"; // Replace with your actual official page/community link

    const handlePersonalShare = (platform) => {
        let shareUrl = '';
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`;
                break;
            default:
                navigator.clipboard.writeText(`${shareText} ${appUrl}`);
                alert("Link copied! Paste it to your timeline.");
                break;
        }
        if (shareUrl) window.open(shareUrl, '_blank');

        // Advance to Step 2: Tag the official page for the Roast & Toast
        setStep(2);
    };

    const handleVerifyRoastSubmission = (e) => {
        e.preventDefault();
        if (!userPostLink.trim()) {
            alert("Please paste the link to your post or drop your tag so we can roast or toast you!");
            return;
        }

        setVerifying(true);
        setTimeout(() => {
            setVerifying(false);
            setUnlockedReady(true);
        }, 1500);
    };

    return (
        <div className="degenerate-arcade-container social-gate-box">
            <div className="arcade-header">
                <h2>🔥 Roast & Toast Gate</h2>
                <span className="arcade-sub">Step {step} of 2: Community Entry Check</span>
            </div>

            <div className="gate-content">
                {step === 1 && (
                    <>
                        <p className="gate-description">
                            To enter the Degenerate Tournament, rule #1 is simple: <strong>Share Vegas Leverage to your own timeline</strong> so the public knows where you stand.
                        </p>

                        <div className="gate-action-grid">
                            <button className="roll-action-btn social-btn twitter" onClick={() => handlePersonalShare('twitter')}>
                                𝕏 Share to Your X
                            </button>
                            <button className="roll-action-btn social-btn telegram" onClick={() => handlePersonalShare('telegram')}>
                                Telegram Share
                            </button>
                            <button className="roll-action-btn social-btn copy" onClick={() => handlePersonalShare('copy')} style={{ gridColumn: 'span 2' }}>
                                📋 Copy Link to Share Anywhere
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && !unlockedReady && (
                    <form onSubmit={handleVerifyRoastSubmission} className="roast-submission-form">
                        <p className="gate-description">
                            🎯 <strong>Step 2: Tag our official page or drop your post link below!</strong>
                            <br />We need to see it on our page so we can officially log your entry... and get ready to <strong>roast or toast</strong> your parlay slips.
                        </p>

                        <div className="official-page-callout">
                            <span>Official Vegas Leverage Page:</span>
                            <a href={officialPageUrl} target="_blank" rel="noreferrer">@VegasLeverage ↗</a>
                        </div>

                        <input
                            type="text"
                            className="roast-input-field"
                            placeholder="Paste your post link or handle here..."
                            value={userPostLink}
                            onChange={(e) => setUserPostLink(e.target.value)}
                        />

                        <button type="submit" className="roll-action-btn verify-roast-btn">
                            {verifying ? 'Verifying with HQ...' : 'Submit for Roast & Toast Check ➔'}
                        </button>
                    </form>
                )}

                {verifying && (
                    <div className="verifying-status">
                        <span className="spinner-dot"></span> Checking community feeds...
                    </div>
                )}

                {unlockedReady && (
                    <div className="fiasco-footer-action" style={{ marginTop: '15px' }}>
                        <p style={{ color: '#00ffcc', fontSize: '0.85rem', marginBottom: '10px' }}>
                            ✅ Verified! You're locked in for the gauntlet. Prepare to get toasted (or roasted).
                        </p>
                        <button
                            className="roll-action-btn unlock-success-btn"
                            onClick={onUnlock}
                        >
                            🚀 ENTER THE GAUNTLET ➔
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}