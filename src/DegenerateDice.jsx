import React, { useState } from 'react';

export default function DegenerateDice() {
  const [bankroll, setBankroll] = useState(10000);
  const [betAmount, setBetAmount] = useState(100);
  const [diceResult, setDiceResult] = useState(null);
  const [gameStatus, setGameStatus] = useState('Place your bet and roll the dice.');
  const [history, setHistory] = useState([]);

  const rollDice = () => {
    if (bankroll < betAmount) {
      setGameStatus('Insufficient bankroll for this wager!');
      return;
    }

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    setDiceResult({ d1, d2, total });

    let outcomeText = '';
    let payout = 0;

    if (total === 7 || total === 11) {
      payout = betAmount * 2;
      setBankroll(prev => prev + payout);
      outcomeText = `Rolled ${total}! Natural Win! +$${payout}`;
    } else if (total === 2 || total === 3 || total === 12) {
      setBankroll(prev => prev - betAmount);
      outcomeText = `Rolled ${total}! Craps! Lost $${betAmount}`;
    } else {
      payout = Math.round(betAmount * 0.5);
      setBankroll(prev => prev + payout);
      outcomeText = `Rolled ${total}! Point established / Minor Win +$${payout}`;
    }

    setGameStatus(outcomeText);
    setHistory(prev => [{ roll: total, text: outcomeText, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 4)]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-purple-500/30 rounded-lg p-6 shadow-xl shadow-purple-950/20">
        <h2 className="text-xl font-bold text-purple-400 mb-2">Degenerate Gauntlet: Dice Survival</h2>
        <p className="text-sm text-slate-400 mb-4">High-variance dice simulation and point tracking.</p>

        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-md border border-slate-800 mb-6">
          <div>
            <span className="text-xs text-slate-400 block">Current Bankroll</span>
            <span className="text-2xl font-mono text-cyan-400">${bankroll.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">Wager ($):</label>
            <input 
              type="number" 
              value={betAmount} 
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-white px-3 py-1 rounded w-28 font-mono"
            />
          </div>
        </div>

        <div className="text-center py-8 bg-slate-950/50 rounded-lg border border-slate-800 mb-6">
          {diceResult ? (
            <div className="flex justify-center gap-6 mb-4">
              <div className="w-16 h-16 bg-slate-900 border-2 border-purple-400 rounded-xl flex items-center justify-center text-3xl font-bold font-mono text-white shadow-lg">
                {diceResult.d1}
              </div>
              <div className="w-16 h-16 bg-slate-900 border-2 border-purple-400 rounded-xl flex items-center justify-center text-3xl font-bold font-mono text-white shadow-lg">
                {diceResult.d2}
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-lg mb-4">Ready to Roll</div>
          )}
          <div className="text-lg font-semibold text-purple-300">{gameStatus}</div>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={rollDice}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-lg shadow-purple-900/40 transition-all text-lg"
          >
            Roll Dice
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Recent Rolls</h3>
          <div className="space-y-2">
            {history.map((h, idx) => (
              <div key={idx} className="flex justify-between text-xs font-mono text-slate-400 bg-slate-950 p-2 rounded">
                <span>{h.text}</span>
                <span className="text-slate-500">{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
