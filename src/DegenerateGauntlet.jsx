import React, { useState } from 'react';

export default function DegenerateGauntlet() {
  const [bankroll, setBankroll] = useState(1000);
  const [wager, setWager] = useState(50);
  const [result, setResult] = useState(null);

  const rollDice = () => {
    if (bankroll < wager) return;
    const playerRoll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    const houseRoll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;

    if (playerRoll >= houseRoll) {
      setBankroll(prev => prev + wager);
      setResult({ win: true, playerRoll, houseRoll, amount: wager });
    } else {
      setBankroll(prev => prev - wager);
      setResult({ win: false, playerRoll, houseRoll, amount: wager });
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">
        Degenerate Gauntlet: Dice Duel
      </h2>
      
      <div className="flex justify-between items-center bg-slate-950 p-4 rounded-lg mb-6 border border-slate-800">
        <div>
          <p className="text-sm text-slate-400">Current Bankroll</p>
          <p className="text-2xl font-mono text-cyan-400">${bankroll}</p>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Wager Amount</label>
          <input
            type="number"
            value={wager}
            onChange={(e) => setWager(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 text-white px-3 py-1.5 rounded w-28 font-mono"
          />
        </div>
      </div>

      <button
        onClick={rollDice}
        disabled={bankroll <= 0 || bankroll < wager}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg shadow-lg hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        Roll the Dice
      </button>

      {result && (
        <div className={`p-4 rounded-lg border text-center ${result.win ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'}`}>
          <p className="font-bold text-lg mb-1">{result.win ? '🎉 You Won the Duel!' : '💥 House Takes the Pot!'}</p>
          <p className="text-sm">Your Roll: <span className="font-mono font-bold">{result.playerRoll}</span> | House Roll: <span className="font-mono font-bold">{result.houseRoll}</span></p>
        </div>
      )}
    </div>
  );
}
