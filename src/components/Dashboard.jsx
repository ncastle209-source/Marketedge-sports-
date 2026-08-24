import React, { useState } from 'react';
import NeonPlinko from './NeonPlinko';
import NeonRoulette from './NeonRoulette';
import AnalyticsView from './AnalyticsView';
import LiveTracker from './LiveTracker';
import './Dashboard.css';

export default function Dashboard() {
    const [bankroll, setBankroll] = useState(12450);
    const [activeTab, setActiveTab] = useState('matrix');

    return (
        <div className="vl-dashboard-shell">
            {/* High-End Command HUD Header */}
            <header className="vl-dashboard-header">
                <div className="vl-brand-group">
                    <h1>Vegas Leverage</h1>
                    <span className="vl-subtitle">Market Inefficiency Matrix & Analytics Engine</span>
                </div>

                <div className="vl-hud-stats">
                    <div className="hud-metric">
                        <span className="hud-label">Global Bankroll</span>
                        <span className="hud-value bankroll">${bankroll.toLocaleString()}</span>
                    </div>
                    <div className="hud-metric">
                        <span className="hud-label">System Status</span>
                        <span className="hud-value status">ONLINE [SECURE]</span>
                    </div>
                </div>
            </header>

            {/* Navigation Command Bar */}
            <nav className="vl-dashboard-nav">
                <button
                    className={`vl-nav-tab ${activeTab === 'matrix' ? 'active' : ''}`}
                    onClick={() => setActiveTab('matrix')}
                >
                    Market Matrix & Plays
                </button>
                <button
                    className={`vl-nav-tab ${activeTab === 'tracker' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tracker')}
                >
                    Live Tracker
                </button>
                <button
                    className={`vl-nav-tab arcade-tab ${activeTab === 'plinko' ? 'active' : ''}`}
                    onClick={() => setActiveTab('plinko')}
                >
                    Neon Plinko
                </button>
                <button
                    className={`vl-nav-tab arcade-tab ${activeTab === 'roulette' ? 'active' : ''}`}
                    onClick={() => setActiveTab('roulette')}
                >
                    Neon Roulette
                </button>
            </nav>

            {/* Main Active Module Frame */}
            <main className="vl-dashboard-content">
                {activeTab === 'matrix' && <AnalyticsView />}
                {activeTab === 'tracker' && <LiveTracker />}
                {activeTab === 'plinko' && (
                    <NeonPlinko bankroll={bankroll} onUpdateBankroll={setBankroll} />
                )}
                {activeTab === 'roulette' && (
                    <NeonRoulette bankroll={bankroll} onUpdateBankroll={setBankroll} />
                )}
            </main>
        </div>
    );
}