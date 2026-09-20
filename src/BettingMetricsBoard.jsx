import React, { useMemo } from 'react';
import { evaluateNamedAlgos } from './namedAlgos';

function sharpTriggers(game) {
  const actual = Number(game.currentSpread ?? game.currentLine ?? game.actualSpread);
  const fair = Number(game.fairSpread);
  const tickets = Number(game.ticketPercentage ?? ((game.ticketPct ?? game.publicBetPct) > 1 ? game.ticketPercentage : (game.ticketPct ?? game.publicBetPct) * 100));
  const publicPct = Number.isFinite(tickets) ? tickets / 100 : Number(game.publicBetPct);
  const t1 = Number.isFinite(actual) && Number.isFinite(fair) && Math.abs(actual - fair) >= 2;
  const t2 = Number.isFinite(publicPct) && publicPct >= 0.65;
  const t3 = Boolean(game.lineMovedOppositePublic);
  const t4 = Boolean(game.volumeSurgeConfirmed);
  const t5 = Number(game.secondsToKickoff) <= 1800 && t1 && t2 && t3 && t4;
  return {
    t1_active: t1,
    t2_active: t2,
    t3_active: t3,
    t4_active: t4,
    t5_active: t5,
    count: [t1, t2, t3, t4, t5].filter(Boolean).length,
  };
}

const LABELS = {
  t1_active: 'T1 Phony line',
  t2_active: 'T2 Public hammer',
  t3_active: 'T3 RLM snapback',
  t4_active: 'T4 Volume surge',
  t5_active: 'T5 Late escalate',
};

export default function BettingMetricsBoard({ game }) {
  const result = useMemo(() => (game ? evaluateNamedAlgos(game) : null), [game]);
  const traps = useMemo(() => (game ? sharpTriggers(game) : null), [game]);
  if (!game || !result || !traps) return null;
  const tickets = result.guardrail.metrics.tickets;
  const handle = result.guardrail.metrics.handle;
  return (
    <section style={{ marginTop: 16, background: '#0b132b', border: '1px solid #3a506b', borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: '#6fffe9' }}>Betting Metrics</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {result.guardrail.bearTrap && (
            <span style={{ background: '#9b2226', color: '#fff', padding: '4px 10px', borderRadius: 99, fontWeight: 700, fontSize: 12 }}>BEAR TRAP</span>
          )}
          {result.guardrail.suppressed && (
            <span style={{ background: '#6c757d', color: '#fff', padding: '4px 10px', borderRadius: 99, fontWeight: 700, fontSize: 12 }}>TELEGRAM BLOCK</span>
          )}
          <span style={{ background: result.vipOk ? '#2d6a4f' : '#1c2541', color: result.vipOk ? '#d8f3dc' : '#8d99ae', padding: '4px 10px', borderRadius: 99, fontWeight: 700, fontSize: 12 }}>
            {result.vipOk ? 'VIP CARD' : 'VIP HELD'}
          </span>
          <span style={{ background: traps.count ? '#3a506b' : '#1c2541', color: '#e0fbfc', padding: '4px 10px', borderRadius: 99, fontWeight: 700, fontSize: 12 }}>
            SHARP {traps.count}/5
          </span>
        </div>
      </div>
      <p style={{ color: '#8d99ae', fontSize: 13 }}>
        Tickets {tickets == null ? 'n/a' : Math.round(tickets) + '%'} · Handle {handle == null ? 'n/a' : Math.round(handle) + '%'}
      </p>
      <div style={{ display: 'grid', gap: 6, margin: '12px 0' }}>
        {Object.entries(LABELS).map(([key, label]) => (
          <div key={key} style={{ color: traps[key] ? '#6fffe9' : '#8d99ae' }}>
            {traps[key] ? '✓' : '○'} {label}
          </div>
        ))}
      </div>
      <p style={{ color: '#e0fbfc', fontSize: 14 }}>
        {result.guardrail.suppressed
          ? 'Public ≥ 70% with no RLM/handle confirm. Do not push this pick to Telegram or the VIP card.'
          : result.vipOk
            ? 'Passes guardrail and a named engine. Eligible for VIP card.'
            : 'No VIP release. Sharp Trap lights are independent of VIP.'}
      </p>
    </section>
  );
}
