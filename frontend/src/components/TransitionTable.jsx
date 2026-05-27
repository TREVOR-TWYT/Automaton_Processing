import React from 'react';

/**
 * Table de transition δ pour un automate.
 */
export default function TransitionTable({ automate }) {
  if (!automate) return null;
  const { states, alphabet, transitions, initial_state, final_states } = automate;

  // Construire la table : delta[state][symbol] = destinations
  const delta = {};
  states.forEach(s => {
    delta[s] = {};
    alphabet.forEach(a => { delta[s][a] = []; });
  });
  transitions.forEach(t => {
    const sym = t.symbol === '' ? 'ε' : t.symbol;
    if (!delta[t.from]) delta[t.from] = {};
    if (!delta[t.from][sym]) delta[t.from][sym] = [];
    const dest = Array.isArray(t.to) ? t.to : [t.to];
    delta[t.from][sym].push(...dest);
  });

  const displayAlpha = alphabet.map(a => a === '' ? 'ε' : a);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: 'Space Mono, monospace',
        fontSize: '12px',
      }}>
        <thead>
          <tr>
            <th style={thStyle}>État</th>
            {displayAlpha.map(sym => (
              <th key={sym} style={thStyle}>{sym}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {states.map(state => (
            <tr key={state} style={{
              background: state === initial_state ? 'rgba(124,58,237,0.06)' : 'transparent'
            }}>
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {state === initial_state && (
                    <span style={{ color: '#7c3aed', fontSize: 10 }}>→</span>
                  )}
                  <span style={{
                    color: final_states.includes(state) ? '#00e5ff' : '#e2e8f0',
                    fontWeight: final_states.includes(state) ? 700 : 400,
                  }}>
                    {final_states.includes(state) ? `(${state})` : state}
                  </span>
                </div>
              </td>
              {displayAlpha.map(sym => {
                const rawSym = sym === 'ε' ? '' : sym;
                const dests = delta[state]?.[rawSym] || delta[state]?.[sym] || [];
                const label = dests.length === 0 ? '—'
                  : dests.length === 1 ? dests[0]
                  : `{${dests.join(',')}}`; 
                return (
                  <td key={sym} style={tdStyle}>
                    <span style={{
                      color: dests.length === 0 ? '#475569' : '#94a3b8'
                    }}>
                      {label}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: 11, color: '#475569' }}>
        <span><span style={{ color: '#7c3aed' }}>→</span> État initial</span>
        <span><span style={{ color: '#00e5ff' }}>(q)</span> État final</span>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '8px 12px',
  textAlign: 'left',
  background: '#13161e',
  borderBottom: '1px solid #252a38',
  color: '#475569',
  fontWeight: 600,
  fontSize: 11,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const tdStyle = {
  padding: '8px 12px',
  borderBottom: '1px solid #1a1e28',
  color: '#94a3b8',
};
