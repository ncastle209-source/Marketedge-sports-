cat << 'EOF' > src / App.jsx
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import DegenerateGauntlet from './components/DegenerateTournament';
import NeonRoulette from './NeonRoulette';
import MatchupSimulator from './MatchupSimulator';
import SteamTracker from './SteamTracker';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Vegas Leverage Analytics
        </h1>
        <nav className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('gauntlet')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'gauntlet' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
          >
            Gauntlet
          </button>
          <button
            onClick={() => setActiveTab('roulette')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'roulette' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
          >
            Roulette
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'simulator' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
          >
            Simulator
          </button>
          <button
            onClick={() => setActiveTab('steam')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'steam' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
          >
            Steam
          </button>
        </nav>
      </header>

      <main className="flex-1 p-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'gauntlet' && <DegenerateGauntlet />}
        {activeTab === 'roulette' && <NeonRoulette />}
        {activeTab === 'simulator' && <MatchupSimulator />}
        {activeTab === 'steam' && <SteamTracker />}
      </main>
    </div>
  );
}
EOF