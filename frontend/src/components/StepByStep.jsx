import React from 'react';

/**
 * Affiche un état ou un ensemble d'états.
 * DFA  → string  → "q0"
 * NFA  → tableau → "{q0, q1}"
 */
function StateDisplay({ value, color, bg, emptyColor = '#ef4444', emptyBg = 'rgba(239,68,68,0.1)' }) {
  const isEmpty =
    value === null || value === undefined ||
    (Array.isArray(value) && value.length === 0);

  if (isEmpty) {
    return (
      <span style={{
        color: emptyColor, background: emptyBg,
        padding: '1px 8px', borderRadius: 3,
        fontFamily: 'Space Mono', fontSize: 12,
      }}>∅</span>
    );
  }

  const label = Array.isArray(value)
    ? '{' + value.join(', ') + '}'
    : value;

  return (
    <span style={{
      color, background: bg,
      padding: '1px 8px', borderRadius: 3,
      fontFamily: 'Space Mono', fontSize: 12,
    }}>
      {label}
    </span>
  );
}

/**
 * Affiche les étapes d'un calcul pas à pas.
 *
 * Props :
 *   steps      — liste d'étapes { current_state, symbol, next_state }
 *                DFA : current_state/next_state sont des strings
 *                NFA : current_state/next_state sont des tableaux
 *   accepted   — bool
 *   message    — string
 *   finalState — état final atteint (string)
 *   allPaths   — chemin acceptant trouvé par DFS (liste d'états, NFA only)
 */
export default function StepByStep({ steps = [], accepted, message, finalState, allPaths }) {
  if (!steps.length && accepted === undefined) return null;

  return (
    <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12 }}>

      {/* ── Résultat global ─────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderRadius: 6, marginBottom: 14,
        background: accepted ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        border: `1px solid ${accepted ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
      }}>
        <span style={{ fontSize: 18 }}>{accepted ? '✓' : '✗'}</span>
        <div>
          <div style={{ fontWeight: 700, color: accepted ? '#10b981' : '#ef4444', fontSize: 13 }}>
            {message}
          </div>
          {finalState && (
            <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
              État final atteint :&nbsp;
              <span style={{ color: '#94a3b8' }}>
                {Array.isArray(finalState) ? '{' + finalState.join(', ') + '}' : finalState}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Trace d'exécution ───────────────────────────── */}
      {steps.length > 0 && (
        <div style={{ marginBottom: allPaths ? 14 : 0 }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: '#475569', marginBottom: 8,
          }}>
            Trace d'exécution ({steps.length} étape{steps.length > 1 ? 's' : ''})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px',
                background: '#13161e',
                borderRadius: 4,
                border: '1px solid #1a1e28',
                animation: `fadeIn 0.2s ease ${i * 0.04}s both`,
                flexWrap: 'wrap',
              }}>
                <span style={{ color: '#475569', minWidth: 20, textAlign: 'right' }}>
                  {i + 1}.
                </span>

                {/* État(s) courant(s) */}
                <StateDisplay
                  value={step.current_state}
                  color="#7c3aed"
                  bg="rgba(124,58,237,0.1)"
                />

                <span style={{ color: '#475569' }}>──</span>

                {/* Symbole lu */}
                <span style={{
                  color: '#f59e0b',
                  background: 'rgba(245,158,11,0.1)',
                  padding: '1px 8px', borderRadius: 3,
                  minWidth: 24, textAlign: 'center',
                }}>
                  {step.symbol === '' ? 'ε' : step.symbol}
                </span>

                <span style={{ color: '#475569' }}>──▶</span>

                {/* État(s) suivant(s) */}
                <StateDisplay
                  value={step.next_state}
                  color="#00e5ff"
                  bg="rgba(0,229,255,0.1)"
                  emptyColor="#ef4444"
                  emptyBg="rgba(239,68,68,0.1)"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Chemin acceptant (NFA) ───────────────────────── */}
      {allPaths && allPaths.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: '#475569', marginBottom: 8,
          }}>
            Chemin acceptant trouvé
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            flexWrap: 'wrap',
            padding: '8px 12px',
            background: '#13161e',
            borderRadius: 4,
            border: '1px solid rgba(16,185,129,0.2)',
          }}>
            {allPaths.map((state, i) => (
              <React.Fragment key={i}>
                <span style={{
                  color: i === 0 ? '#7c3aed'
                    : i === allPaths.length - 1 ? '#10b981'
                    : '#94a3b8',
                  background: i === 0 ? 'rgba(124,58,237,0.1)'
                    : i === allPaths.length - 1 ? 'rgba(16,185,129,0.1)'
                    : '#1a1e28',
                  padding: '1px 8px', borderRadius: 3,
                  fontFamily: 'Space Mono', fontSize: 12,
                }}>
                  {state}
                </span>
                {i < allPaths.length - 1 && (
                  <span style={{ color: '#475569', fontSize: 10 }}>→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
