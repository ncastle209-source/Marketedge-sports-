import React, { useMemo } from 'react';
import { evaluateNamedAlgos } from './namedAlgos';

export default function NamedAlgoBoard({ game }) {
  const result = useMemo(() => (game ? evaluateNamedAlgos(game) : null), [game]);
  if (!game || !result) return null;
  const rows = [result.doggies, result.deficiency, result.guardrail];
  return (
    <section style={{ marginTop: 20, background: '#1c2541', border: '1px solid #3a506b', borderRadius: 8, padding: 16 }}>
      <h3 style={{ marginTop: 0, color: '#6fffe9' }}>Named engines (cascade)</h3>
      <div style={{ color: result.vipOk ? '#6fffe9' : '#ffb703', marginBottom: 12 }}>
        {result.vipOk ? 'VIP card eligible' : 'Not eligible — guardrail or no dog/deficiency fire'}
      </div>
      {rows.map((row) => (
        <div key={row.name} style={{ marginBottom: 10, color: '#e0fbfc' }}>
          <strong>{row.name}</strong>{' '}
          <span style={{ color: row.fire || row.bearTrap ? '#6fffe9' : row.suppressed ? '#ff6b6b' : '#8d99ae' }}>
            {row.fire ? 'FIRE' : row.suppressed ? 'SUPPRESSED' : row.bearTrap ? 'BEAR TRAP' : 'FLAT'}
          </span>
          <div style={{ color: '#8d99ae', fontSize: 13 }}>{row.reason}</div>
        </div>
      ))}
    </section>
  );
}
