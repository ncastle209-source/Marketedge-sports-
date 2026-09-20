import React, { useMemo } from 'react';
import { evaluateNamedAlgos } from './namedAlgos';

export default function BettingMetricsBoard({ game }) {
  const result = useMemo(() => (game ? evaluateNamedAlgos(game) : null), [game]);
  if (!game || !result) return null;
  const tickets = result.guardrail.metrics.tickets;
  const handle = result.guardrail.metrics.handle;
  return (
    <section style={{ marginTop: 16, background: '#0b132b', border: '1px solid #3a506b', borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: '#6fffe9' }}>Betting Metrics</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {result.guardrail.bearTrap && (
            <span style={{ background: '#9b2226', color: '#fff', padding: '4px 10px', borderRadius: 99, fontWeight: 700, fontSize: 12 }}>
              BEAR TRAP
            </span>
          )}
          {result.guardrail.suppressed && (
            <span style={{ background: '#6c757d', color: '#fff', padding: '4px 10px', borderRadius: 99, fontWeight: 700, fontSize: 12 }}>
              TELEGRAM BLOCK
            </span>
          )}
          <span style={{ background: result.vipOk ? '#2d6a4f' : '#1c2541', color: result.vipOk ? '#d8f3dc' : '#8d99ae', padding: '4px 10px', borderRadius: 99, fontWeight: 700, fontSize: 12 }}>
            {result.vipOk ? 'VIP CARD' : 'VIP HELD'}
          </span>
        </div>
      </div>
      <p style={{ color: '#8d99ae', fontSize: 13 }}>
        Tickets {tickets == null ? 'n/a' : Math.round(tickets) + '%'} · Handle {handle == null ? 'n/a' : Math.round(handle) + '%'}
      </p>
      <p style={{ color: '#e0fbfc', fontSize: 14 }}>
        {result.guardrail.suppressed
          ? 'Public ≥ 70% with no RLM/handle confirm. Do not push this pick to Telegram or the VIP card.'
          : result.guardrail.bearTrap
            ? 'Public ≥ 80%. Fade candidate only if Doggies or Market Deficiency also fire.'
            : result.vipOk
              ? 'Passes guardrail and a named engine. Eligible for VIP card.'
              : 'No VIP release. Waiting on splits or a named-engine fire.'}
      </p>
    </section>
  );
}
