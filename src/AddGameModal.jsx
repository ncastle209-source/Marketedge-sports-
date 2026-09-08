import { useState } from 'react';

export default function AddGameModal({ isOpen, onClose, onAddGame }) {
  const [matchup, setMatchup] = useState('');
  const [gameId, setGameId] = useState('');
  const [sport, setSport] = useState('MLB');
  const [secondsToKickoff, setSecondsToKickoff] = useState(7200);
  const [fairSpread, setFairSpread] = useState(-1.5);
  const [actualSpread, setActualSpread] = useState(-3.5);
  const [publicBetPct, setPublicBetPct] = useState(65);
  const [lineMovedOppositePublic, setLineMovedOppositePublic] = useState(false);
  const [volumeSurgeConfirmed, setVolumeSurgeConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalizedGameId = gameId.trim() || sport.toLowerCase() + '-' + Date.now();

    onAddGame({
      id: Date.now(),
      gameId: normalizedGameId,
      matchup,
      sport,
      secondsToKickoff: Number(secondsToKickoff),
      fairSpread: Number(fairSpread),
      liveOdds: {
        spread: Number(actualSpread),
        publicBetPct: Number(publicBetPct) / 100,
        lineMovedOppositePublic,
        volumeSurgeConfirmed
      }
    });

    setMatchup('');
    setGameId('');
    setSecondsToKickoff(7200);
    setFairSpread(-1.5);
    setActualSpread(-3.5);
    setPublicBetPct(65);
    setLineMovedOppositePublic(false);
    setVolumeSurgeConfirmed(false);
    onClose();
  };

  const inputStyle = { width: '100%', boxSizing: 'border-box', background: '#0b132b', border: '1px solid #3a506b', color: '#fff', padding: '8px', borderRadius: '4px' };
  const labelStyle = { fontSize: '0.8rem', color: '#8d99ae', display: 'block', marginBottom: '4px' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 10 }}>
      <div style={{ background: '#1c2541', border: '1px solid #48cae4', borderRadius: '8px', padding: '25px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#6fffe9' }}>Add Sharp Trap Matchup</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8d99ae', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
          <label style={labelStyle}>Matchup<input required value={matchup} onChange={(event) => setMatchup(event.target.value)} style={inputStyle} placeholder="Team A vs. Team B" /></label>
          <label style={labelStyle}>Game ID<input value={gameId} onChange={(event) => setGameId(event.target.value)} style={inputStyle} placeholder="Optional stable provider ID" /></label>
          <label style={labelStyle}>Sport / League<select value={sport} onChange={(event) => setSport(event.target.value)} style={inputStyle}><option value="MLB">MLB</option><option value="NPB">NPB</option><option value="WNBA">WNBA</option><option value="EFL/Soccer">EFL/Soccer</option><option value="NFL">NFL</option><option value="NBA">NBA</option></select></label>
          <label style={labelStyle}>Seconds to kickoff<input required type="number" min="0" value={secondsToKickoff} onChange={(event) => setSecondsToKickoff(event.target.value)} style={inputStyle} /></label>
          <label style={labelStyle}>Fair spread baseline<input required type="number" step="0.5" value={fairSpread} onChange={(event) => setFairSpread(event.target.value)} style={inputStyle} /></label>
          <label style={labelStyle}>Current live spread<input required type="number" step="0.5" value={actualSpread} onChange={(event) => setActualSpread(event.target.value)} style={inputStyle} /></label>
          <label style={labelStyle}>Public bet percentage<input required type="number" min="0" max="100" step="1" value={publicBetPct} onChange={(event) => setPublicBetPct(event.target.value)} style={inputStyle} /></label>
          <label style={{ color: '#e0fbfc', fontSize: '0.85rem' }}><input type="checkbox" checked={lineMovedOppositePublic} onChange={(event) => setLineMovedOppositePublic(event.target.checked)} /> Line moved opposite public action</label>
          <label style={{ color: '#e0fbfc', fontSize: '0.85rem' }}><input type="checkbox" checked={volumeSurgeConfirmed} onChange={(event) => setVolumeSurgeConfirmed(event.target.checked)} /> Volume surge confirmed</label>
          <button type="submit" style={{ background: '#48cae4', color: '#0b132b', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>Add Matchup</button>
        </form>
      </div>
    </div>
  );
}
