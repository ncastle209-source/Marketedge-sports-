cat << 'EOF' > src / components / DegenerateTournament.jsx
import React, { useState } from 'react';

export default function DegenerateTournament() {
    const [score, setScore] = useState(1000);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                        Degenerate Gauntlet Tournament
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">High-stakes quantitative risk simulation and bankroll management.</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-right">
                    <div className="text-xs text-slate-400">Gauntlet Bankroll</div>
                    <div className="text-xl font-bold text-emerald-400">${score.toLocaleString()}</div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-4">Active Challenge Arena</h3>
                <p className="text-slate-300 mb-6">Select a risk parameter to simulate distribution variance and test market-fading strategies.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => setScore(s => s + 250)}
                        className="p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-left transition-all"
                    >
                        <div className="font-semibold text-purple-300">Contrarian Fade</div>
                        <div className="text-xs text-slate-400 mt-1">+250 EV Simulation</div>
                    </button>

                    <button
                        onClick={() => setScore(s => s + 500)}
                        className="p-4 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded-lg text-left transition-all"
                    >
                        <div className="font-semibold text-cyan-300">Line Movement Spike</div>
                        <div className="text-xs text-slate-400 mt-1">+500 EV Simulation</div>
                    </button>

                    <button
                        onClick={() => setScore(s => Math.max(100, s - 100))}
                        className="p-4 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 rounded-lg text-left transition-all"
                    >
                        <div className="font-semibold text-rose-300">High-Vig Variance</div>
                        <div className="text-xs text-slate-400 mt-1">-100 Risk Test</div>
                    </button>
                </div>
            </div>
        </div>
    );
}
EOF