import React, { useEffect, useState } from 'react';

export default function AuditBoard() {
  const [audit, setAudit] = useState({ plays: [], pending: 0, wins: 0, losses: 0 });
  useEffect(() => {
    fetch('/data/audit.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((payload) => {
        if (payload) setAudit(payload);
      })
      .catch(() => {});
  }, []);
  const plays = audit.plays || [];
  return (
    <section style={{ marginTop: 24, background: '#1c2541', border: '1px solid #3a506b', borderRadius: 8, padding: 16 }}>
      <h3 style={{ marginTop: 0, color: '#6fffe9' }}>Pick audit</h3>
      <div style={{ color: '#8d99ae', fontSize: 13, marginBottom: 12 }}>
        {audit.wins || 0}W - {audit.losses || 0}L · {audit.pending || plays.filter((p) => p.result === 'pending').length} pending
      </div>
      {plays.length === 0 ? (
        <div style={{ color: '#8d99ae' }}>No fires logged yet. Next cascade cycle writes VIP / Doggies / Sharp rows here.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ color: '#8d99ae', textAlign: 'left' }}>
                <th>Matchup</th>
                <th>Engine</th>
                <th>Line</th>
                <th>Close</th>
                <th>CLV</th>
                <th>Ump</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {plays.slice(-40).reverse().map((play) => (
                <tr key={play.gameId + play.at} style={{ color: '#e0fbfc', borderTop: '1px solid #3a506b' }}>
                  <td>{play.matchup}</td>
                  <td>{play.engine}</td>
                  <td>{play.lineTaken ?? '—'}</td>
                  <td>{play.closeLine ?? '—'}</td>
                  <td>{play.clv ?? '—'}</td>
                  <td>{play.plateUmpire || '—'}</td>
                  <td>{play.result || 'pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
