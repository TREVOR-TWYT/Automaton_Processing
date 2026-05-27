import React, { useState } from 'react';
import AutomateEditor from '../components/AutomateEditor';
import AutomateGraph from '../components/AutomateGraph';
import TransitionTable from '../components/TransitionTable';
import {
  completeAutomate, trimAutomate, determinize,
  removeEpsilon, minimizeAutomate
} from '../services/api';

const OPERATIONS = [
  {
    key: 'complete',
    label: 'Complétion',
    badge: 'badge-yellow',
    section: '§3.2.2',
    desc: 'Ajoute un état puits qp pour toutes les transitions manquantes.',
    fn: completeAutomate,
  },
  {
    key: 'trim',
    label: 'Émondage',
    badge: 'badge-green',
    section: '§3.2.3',
    desc: 'Supprime les états non accessibles et non co-accessibles.',
    fn: trimAutomate,
  },
  {
    key: 'remove-epsilon',
    label: 'Suppr. ε-transitions',
    badge: 'badge-purple',
    section: '§3.2.5',
    desc: 'Transforme un ε-AFND en AFND équivalent sans ε-transitions.',
    fn: removeEpsilon,
  },
  {
    key: 'determinize',
    label: 'Déterminisation',
    badge: 'badge-accent',
    section: '§3.2.4',
    desc: 'Construction des sous-ensembles : NFA → DFA (Algorithme 2).',
    fn: determinize,
  },
  {
    key: 'minimize',
    label: 'Minimisation',
    badge: 'badge-red',
    section: '§3.5.3',
    desc: 'Algorithme de Moore : DFA → DFA minimal / automate canonique.',
    fn: minimizeAutomate,
  },
];

export default function TransformPage() {
  const [automate, setAutomate] = useState(null);
  const [result, setResult]     = useState(null);
  const [activeOp, setActiveOp] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [viewMode, setViewMode] = useState('graph'); // 'graph' | 'table'

  const handleSave = (a) => { setAutomate(a); setResult(null); setActiveOp(null); };

  const handleRun = async (op) => {
    if (!automate) return setError('Définissez d\'abord un automate.');
    setLoading(true); setError(''); setResult(null); setActiveOp(op.key);
    try {
      const r = await op.fn(automate);
      setResult(r);
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const currentOp = OPERATIONS.find(o => o.key === activeOp);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>

      {/* Panneau gauche */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Éditeur */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 14 }}>Automate source</h3>
            {automate && (
              <span className={`badge badge-purple`} style={{ marginLeft: 'auto' }}>
                {automate.type}
              </span>
            )}
          </div>
          <AutomateEditor initialAutomate={automate} onSave={handleSave} />
        </div>

        {/* Opérations */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 14 }}>Transformations</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {OPERATIONS.map(op => (
              <button
                key={op.key}
                onClick={() => handleRun(op)}
                disabled={loading || !automate}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  background: activeOp === op.key ? '#1a1e28' : '#13161e',
                  border: `1px solid ${activeOp === op.key ? '#2e3547' : '#1a1e28'}`,
                  borderRadius: 6, cursor: 'pointer', textAlign: 'left',
                  opacity: !automate ? 0.5 : 1,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2e3547'}
                onMouseLeave={e => {
                  if (activeOp !== op.key)
                    e.currentTarget.style.borderColor = '#1a1e28';
                }}
              >
                <span className={`badge ${op.badge}`}>{op.section}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'Space Mono', fontSize: 12,
                    color: activeOp === op.key ? '#e2e8f0' : '#94a3b8',
                  }}>
                    {op.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                    {op.desc}
                  </div>
                </div>
                {loading && activeOp === op.key && (
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: '2px solid #252a38',
                    borderTopColor: '#00e5ff',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit — Résultat */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div style={{
            padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, color: '#ef4444', fontSize: 12,
          }}>{error}</div>
        )}

        {/* Source */}
        {automate && !result && (
          <div className="card fade-in">
            <div className="card-header">
              <h3 style={{ fontSize: 14 }}>Automate source</h3>
              <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>
                {automate.type} — {automate.states.length} états
              </span>
            </div>
            <AutomateGraph automate={automate} />
            <div style={{ marginTop: 12 }}>
              <TransitionTable automate={automate} />
            </div>
          </div>
        )}

        {/* Résultat */}
        {result && (
          <div className="card fade-in">
            <div className="card-header">
              <h3 style={{ fontSize: 14 }}>
                Résultat — {currentOp?.label}
              </h3>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <span className={`badge ${currentOp?.badge}`}>{currentOp?.section}</span>
                <span className="badge badge-green">
                  {result.states?.length ?? '?'} états
                </span>
              </div>
            </div>

            {/* Onglets vue */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
              {['graph', 'table'].map(v => (
                <button
                  key={v}
                  className={`btn ${viewMode === v ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: 11, padding: '4px 12px' }}
                  onClick={() => setViewMode(v)}
                >
                  {v === 'graph' ? 'Graphe' : 'Table δ'}
                </button>
              ))}
              <button
                className="btn btn-ghost"
                style={{ fontSize: 11, padding: '4px 12px', marginLeft: 'auto' }}
                onClick={() => { setAutomate(result); setResult(null); setActiveOp(null); }}
              >
                ↩ Utiliser comme source
              </button>
            </div>

            {viewMode === 'graph'
              ? <AutomateGraph automate={result} />
              : <TransitionTable automate={result} />
            }

            {/* Comparaison */}
            {automate && (
              <div style={{
                marginTop: 14, padding: '10px 14px',
                background: '#13161e', borderRadius: 6,
                display: 'flex', gap: 20,
                fontFamily: 'Space Mono', fontSize: 12,
              }}>
                <CompareRow label="États"
                  before={automate.states.length} after={result.states?.length} />
                <CompareRow label="Transitions"
                  before={automate.transitions.length} after={result.transitions?.length} />
                <CompareRow label="États finaux"
                  before={automate.final_states.length} after={result.final_states?.length} />
              </div>
            )}
          </div>
        )}

        {!automate && !result && (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#252a38', fontFamily: 'Space Mono', fontSize: 13,
            flexDirection: 'column', gap: 12,
          }}>
            <div style={{ fontSize: 40 }}>∅</div>
            <div>Définissez un automate puis choisissez une transformation</div>
          </div>
        )}
      </div>
    </div>
  );
}

function CompareRow({ label, before, after }) {
  const diff = after - before;
  return (
    <div>
      <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#94a3b8' }}>{before}</span>
        <span style={{ color: '#475569' }}>→</span>
        <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{after}</span>
        {diff !== 0 && (
          <span style={{
            fontSize: 10,
            color: diff < 0 ? '#10b981' : '#f59e0b',
          }}>
            ({diff > 0 ? '+' : ''}{diff})
          </span>
        )}
      </div>
    </div>
  );
}
