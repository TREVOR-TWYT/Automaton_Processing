import React, { useState } from 'react';
import AutomateEditor from '../components/AutomateEditor';
import AutomateGraph from '../components/AutomateGraph';
import TransitionTable from '../components/TransitionTable';
import {
  statesInfo, canonicalize,
  toNfa, toEnfa,
} from '../services/api';

const CONVERSIONS = [
  { key: 'to-nfa',  label: 'Vers NFA',   badge: 'badge-yellow', desc: 'AFD/e-AFN → AFN (trivial)', fn: toNfa },
  { key: 'to-enfa', label: 'Vers ε-AFN', badge: 'badge-purple', desc: 'AFD/AFN → ε-AFN (trivial)', fn: toEnfa },
  { key: 'canon',   label: 'Canonique',  badge: 'badge-accent',  desc: 'Déterminiser + émondar + minimiser + renuméroter', fn: canonicalize },
];

export default function StatesPage() {
  const [automate, setAutomate] = useState(null);
  const [info, setInfo]         = useState(null);
  const [result, setResult]     = useState(null);
  const [activeOp, setActiveOp] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState('graph');
  const [highlight, setHighlight] = useState(null);

  const handleSave = (a) => {
    setAutomate(a); setInfo(null); setResult(null); setActiveOp(null);
  };

  const handleStatesInfo = async () => {
    if (!automate) return setError("Définissez d'abord un automate.");
    setLoading(true); setError('');
    try {
      const r = await statesInfo(automate);
      setInfo(r);
    } catch (e) { setError('Erreur serveur'); }
    finally { setLoading(false); }
  };

  const handleConvert = async (op) => {
    if (!automate) return setError("Définissez d'abord un automate.");
    setLoading(true); setError(''); setResult(null); setActiveOp(op.key);
    try {
      const r = await op.fn(automate);
      setResult(r);
    } catch (e) { setError('Erreur serveur'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>

      {/* ── Gauche ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 14 }}>Automate source</h3>
            {automate && <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>{automate.type}</span>}
          </div>
          <AutomateEditor initialAutomate={automate} onSave={handleSave} />
        </div>

        {/* Identification des états */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 14 }}>Identification des états</h3>
            <span className="badge badge-accent" style={{ marginLeft: 'auto' }}>§3.2.3</span>
          </div>
          <p style={{ fontSize: 12, color: '#475569', marginBottom: 12, lineHeight: 1.6 }}>
            Calcule les ensembles d'états accessibles, co-accessibles et utiles
            de l'automate selon les définitions du cours.
          </p>
          <button className="btn btn-primary" onClick={handleStatesInfo}
            disabled={loading || !automate}>
            {loading ? '...' : '▶ Analyser les états'}
          </button>
        </div>

        {/* Conversions */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 14 }}>Conversions & Canonisation</h3>
          </div>
          {CONVERSIONS.map(op => (
            <button key={op.key} onClick={() => handleConvert(op)}
              disabled={loading || !automate}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', width: '100%', textAlign: 'left',
                background: activeOp === op.key ? '#1a1e28' : '#13161e',
                border: `1px solid ${activeOp === op.key ? '#2e3547' : '#1a1e28'}`,
                borderRadius: 6, cursor: 'pointer', marginBottom: 6,
                opacity: !automate ? 0.5 : 1, transition: 'all 0.15s',
              }}>
              <span className={`badge ${op.badge}`} style={{ fontSize: 10 }}>
                {op.label}
              </span>
              <div>
                <div style={{ fontFamily: 'Space Mono', fontSize: 11, color: '#94a3b8' }}>
                  {op.label}
                </div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
                  {op.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Droite ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div style={{
            padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, color: '#ef4444', fontSize: 12,
          }}>{error}</div>
        )}

        {/* Panneau info états */}
        {info && (
          <div className="card fade-in">
            <div className="card-header">
              <h3 style={{ fontSize: 14 }}>Identification des états</h3>
              <span className="badge badge-accent" style={{ marginLeft: 'auto' }}>§3.2.3</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
              <StateGroup
                label="Accessibles"
                states={info.accessible}
                color="#7c3aed"
                desc="Atteignables depuis q0"
                onHover={setHighlight}
              />
              <StateGroup
                label="Co-accessibles"
                states={info.co_accessible}
                color="#00e5ff"
                desc="Peuvent atteindre F"
                onHover={setHighlight}
              />
              <StateGroup
                label="Utiles"
                states={info.useful}
                color="#10b981"
                desc="Accessibles ET co-accessibles"
                onHover={setHighlight}
              />
            </div>

            {(info.useless.length > 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <StateGroup
                  label="Inaccessibles"
                  states={info.inaccessible}
                  color="#ef4444"
                  desc="Non atteignables depuis q0"
                  onHover={setHighlight}
                />
                <StateGroup
                  label="Inutiles"
                  states={info.useless}
                  color="#f59e0b"
                  desc="Non accessibles ou non co-accessibles"
                  onHover={setHighlight}
                />
              </div>
            )}

            {/* Graphe avec surlignage */}
            <div style={{
              fontSize: 11, color: '#475569', marginBottom: 8, fontFamily: 'Space Mono',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              Survolez un groupe pour surligner sur le graphe
            </div>
            <AutomateGraph automate={automate} highlightState={highlight} height={260} />
          </div>
        )}

        {/* Résultat conversion */}
        {result && (
          <div className="card fade-in">
            <div className="card-header">
              <h3 style={{ fontSize: 14 }}>
                Résultat — {CONVERSIONS.find(o => o.key === activeOp)?.label}
              </h3>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <span className="badge badge-green">{result.type}</span>
                <span className="badge badge-accent">{result.states?.length} états</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
              {['graph', 'table'].map(v => (
                <button key={v}
                  className={`btn ${tab === v ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: 11, padding: '4px 12px' }}
                  onClick={() => setTab(v)}>
                  {v === 'graph' ? 'Graphe' : 'Table δ'}
                </button>
              ))}
              <button className="btn btn-ghost"
                style={{ fontSize: 11, padding: '4px 12px', marginLeft: 'auto' }}
                onClick={() => { setAutomate(result); setResult(null); setInfo(null); }}>
                ↩ Utiliser comme source
              </button>
            </div>

            {tab === 'graph'
              ? <AutomateGraph automate={result} height={280} />
              : <TransitionTable automate={result} />
            }

            {/* Comparaison */}
            {automate && (
              <div style={{
                marginTop: 12, padding: '10px 14px', background: '#13161e',
                borderRadius: 6, display: 'flex', gap: 24,
                fontFamily: 'Space Mono', fontSize: 12,
              }}>
                <CompareItem label="Type"   before={automate.type}                after={result.type} />
                <CompareItem label="États"  before={automate.states.length}       after={result.states?.length} numeric />
                <CompareItem label="Trans." before={automate.transitions.length}  after={result.transitions?.length} numeric />
              </div>
            )}
          </div>
        )}

        {/* Automate source si rien affiché */}
        {automate && !info && !result && (
          <div className="card fade-in">
            <div className="card-header">
              <h3 style={{ fontSize: 14 }}>Automate source</h3>
            </div>
            <AutomateGraph automate={automate} height={300} />
          </div>
        )}

        {!automate && (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column',
            gap: 12, minHeight: 300,
            color: '#252a38', fontFamily: 'Space Mono', fontSize: 13,
          }}>
            <div style={{ fontSize: 36 }}>Q</div>
            <div>Définissez un automate pour analyser ses états</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sous-composants ────────────────────────────────────────────────────────────

function StateGroup({ label, states, color, desc, onHover }) {
  return (
    <div
      style={{
        background: '#13161e', border: `1px solid ${color}22`,
        borderRadius: 8, padding: '10px 12px', cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={() => onHover(states.length > 0 ? states : null)}
      onMouseLeave={() => onHover(null)}
    >
      <div style={{
        fontFamily: 'Space Mono', fontSize: 11, color,
        fontWeight: 700, marginBottom: 4,
      }}>{label}</div>
      <div style={{ fontSize: 10, color: '#475569', marginBottom: 8 }}>{desc}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {states.length === 0
          ? <span style={{ fontSize: 11, color: '#2e3547', fontFamily: 'Space Mono' }}>∅</span>
          : states.map(s => (
            <span key={s} style={{
              padding: '1px 7px', background: `${color}18`,
              border: `1px solid ${color}44`, borderRadius: 3,
              fontFamily: 'Space Mono', fontSize: 11, color,
            }}>{s}</span>
          ))
        }
      </div>
      <div style={{ marginTop: 8, fontFamily: 'Space Mono', fontSize: 10, color: '#475569' }}>
        {states.length} état{states.length > 1 ? 's' : ''}
      </div>
    </div>
  );
}

function CompareItem({ label, before, after, numeric }) {
  const diff = numeric ? after - before : null;
  return (
    <div>
      <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#64748b' }}>{before}</span>
        <span style={{ color: '#2e3547' }}>→</span>
        <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{after}</span>
        {diff !== null && diff !== 0 && (
          <span style={{ fontSize: 10, color: diff < 0 ? '#10b981' : '#f59e0b' }}>
            ({diff > 0 ? '+' : ''}{diff})
          </span>
        )}
      </div>
    </div>
  );
}
