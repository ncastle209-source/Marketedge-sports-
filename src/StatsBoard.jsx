import React, { useEffect, useState } from 'react';

export default function StatsBoard() {
  const [payload, setPayload] = useState(null);
  useEffect(() => {
    fetch('/data/team_stats.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then(setPayload)
      .catch(() => setPayload(null));
  }, []);
  const leagues = payload?.leagues || {};
  return (
    <section style={{ marginTop: 24, background: '#1c2541', border: '1px solid #3a506b', borderRadius: 8, padding: 16 }}>
      <h3 style={{ marginTop: 0, color: '#6fffe9' }}>Team / player stats</h3>
      <div style={{ color: '#8d99ae', fontSize: 12, marginBottom: 10 }}>{payload?.pulled_at || 'waiting for first ESPN pull'}</div>
      {Object.entries(leagues).map(([league, block]) => (
        <div key={league} style={{ marginBottom: 16 }}>
          <strong style={{ color: '#48cae4' }}>{league.toUpperCase()}</strong>
          {(block.games || []).slice(0, 8).map((game) => (
            <div key={game.eventId} style={{ margin: '8px 0', color: '#e0fbfc', fontSize: 14 }}>
              <div>{game.shortName || game.name} · {game.status}</div>
              <div style={{ color: '#8d99ae' }}>
                {(game.teams || []).map((t) => `${t.abbr || t.name} ${t.score ?? ''} (${t.record || '—'})`).join('  ')}
              </div>
              {game.box?.players?.length ? (
                <div style={{ color: '#8d99ae', fontSize: 12 }}>
                  {game.box.players.slice(0, 6).map((p) => p.player).filter(Boolean).join(', ')}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
