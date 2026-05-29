import React, { useState } from 'react';
import AutomateEditor from '../components/AutomateEditor';
import AutomateGraph from '../components/AutomateGraph';
import TransitionTable from '../components/TransitionTable';
import {
  automateUnion, automateIntersection, automateComplement,
  automateConcatenation, automateKleeneStar,
} from '../services/api';

const UNARY_OPS = [
  {
    key: 'complement',
    label: 'Complémentation',
    symbol: 'L̄',
    badge: 'badge-red',
    section: '§3.3.1 Thm 4',
    desc: 'Inverse les états finaux (DFA complet requis)',
    color: '#ef4444',
    fn: automateComplement,
  },
  {
    key: 'kleene',
    label: 'Étoile de Kleene',
    symbol: 'L*',
    badge: 'badge-yellow',
    section: '§3.3.1 Thm 9',
    desc: 'ε-transition de chaque état final vers l\'initial',
    color: '#f59e0b',
    fn: automateKleeneStar,
  },
];

const BINARY_OPS = [
  {
    key: 'union',
    label: 'Union',
    symbol: 'L₁ ∪ L₂',
    badge: 'badge-accent',
    section: '§3.3.1 Thm 5',
    desc: 'Automate produit, F = F₁×Q₂ ∪ Q₁×F₂',
    color: '#00e5ff',
    fn: automateUnion,
  },
  {
    key: 'intersection',
    label: 'Intersection',
    symbol: 'L₁ ∩ L₂',
    badge: 'badge-green',
    section: '§3.3.1 Thm 6',
    desc: 'Automate produit, F = F₁×F₂',
    color: '#10b981',
    fn: automateIntersection,
  },
  {
    key: 'concat',
    label: 'Concaténation',
    symbol: 'L₁·L₂',
    badge: 'badge-purple',
    section: '§3.3.1 Thm 8',
    desc: 'ε-transitions des états finaux A₁ vers l\'initial A₂',
    color: '#7c3aed',
    fn: automateConcatenation,
  },
];

export default function ClosurePage() {
  const [a1, setA1]           = useState(null);
  const [a2, setA2]           = useState(null);
  const [result, setResult]   = useState(null);
  const [activeOp, setActiveOp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [viewTab, setViewTab] = useState('graph');
  const [editTab, setEditTab] = useState('a1'); // 'a1' | 'a2'

  const runUnary = async (op) => {
    if (!a1) return setError("Définissez l'automate A₁.");
    setLoading(true); setError(''); setResult(null); setActiveOp(op.key);
    try {
      setResult(await op.fn(a1));
    } catch (e) { setError(e.response?.data?.message || 'Erreur serveur'); }
    finally { setLoading(false); }
  };

  const runBinary = async (op) => {
    if (!a1 || !a2) return setError('Définissez les deux automates A₁ et A₂.');
    setLoading(true); setError(''); setResult(null); setActiveOp(op.key);
    try {
      setResult(await op.fn(a1, a2));
    } catch (e) { setError(e.response?.data?.message || 'Erreur serveur'); }
    finally { setLoading(false); }
  };

  const currentOpDef = [...UNARY_OPS, ...BINARY_OPS].find(o => o.key === activeOp);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }}>

      {/* ── Gauche ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Éditeurs A1 / A2 */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 14 }}>Automates sources</h3>
          </div>

          {/* Onglets A1 / A2 */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            <button
              className={`btn ${editTab === 'a1' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: 12 }}
              onClick={() => setEditTab('a1')}>
              A₁ {a1 && <span style={{ marginLeft: 4, opacity: 0.7 }}>({a1.type})</span>}
            </button>
            <button
              className={`btn ${editTab === 'a2' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: 12 }}
              onClick={() => setEditTab('a2')}>
              A₂ {a2 && <span style={{ marginLeft: 4, opacity: 0.7 }}>({a2.type})</span>}
              <span style={{ marginLeft: 4, fontSize: 10, color: '#475569' }}>
                (opérations binaires)
              </span>
            </button>
          </div>

          {editTab === 'a1' && (
            <AutomateEditor initialAutomate={a1}
              onSave={a => { setA1(a); setResult(null); }} />
          )}
          {editTab === 'a2' && (
            <AutomateEditor initialAutomate={a2}
              onSave={a => { setA2(a); setResult(null); }} />
          )}
        </div>

        {/* Opérations unaires */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 14 }}>Opérations unaires (sur A₁)</h3>
          </div>
          {UNARY_OPS.map(op => (
            <OpButton key={op.key} op={op}
              onClick={() => runUnary(op)}
              active={activeOp === op.key}
              disabled={loading || !a1} />
          ))}
        </div>

        {/* Opérations binaires */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 14 }}>Opérations binaires (A₁ OP A₂)</h3>
          </div>
          {BINARY_OPS.map(op => (
            <OpButton key={op.key} op={op}
              onClick={() => runBinary(op)}
              active={activeOp === op.key}
              disabled={loading || !a1 || !a2} />
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

        {/* Aperçu des automates sources */}
        {(a1 || a2) && !result && (
          <div style={{ display: 'grid', gridTemplateColumns: a2 ? '1fr 1fr' : '1fr', gap: 16 }}>
            {a1 && (
              <div className="card fade-in">
                <div className="card-header">
                  <h3 style={{ fontSize: 13 }}>A₁</h3>
                  <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>{a1.type}</span>
                </div>
                <AutomateGraph automate={a1} height={200} />
              </div>
            )}
            {a2 && (
              <div className="card fade-in">
                <div className="card-header">
                  <h3 style={{ fontSize: 13 }}>A₂</h3>
                  <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>{a2.type}</span>
                </div>
                <AutomateGraph automate={a2} height={200} />
              </div>
            )}
          </div>
        )}

        {/* Résultat */}
        {result && currentOpDef && (
          <div className="card fade-in">
            <div className="card-header">
              <h3 style={{ fontSize: 14 }}>
                Résultat —{' '}
                <span style={{ color: currentOpDef.color, fontFamily: 'Space Mono' }}>
                  {currentOpDef.symbol}
                </span>
              </h3>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <span className={`badge ${currentOpDef.badge}`}>{currentOpDef.section}</span>
                <span className="badge badge-green">{result.states?.length} états</span>
                <span className="badge badge-accent">{result.type}</span>
              </div>
            </div>

            {/* Description de la construction */}
            <div style={{
              padding: '8px 12px', background: '#13161e',
              border: `1px solid ${currentOpDef.color}22`,
              borderRadius: 6, marginBottom: 14,
              fontFamily: 'Space Mono', fontSize: 11,
              color: '#64748b', lineHeight: 1.8,
            }}>
              <span style={{ color: currentOpDef.color, fontWeight: 700 }}>
                {currentOpDef.label}
              </span> — {currentOpDef.desc}
            </div>

            {/* Onglets */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
              {['graph', 'table'].map(v => (
                <button key={v}
                  className={`btn ${viewTab === v ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: 11, padding: '4px 12px' }}
                  onClick={() => setViewTab(v)}>
                  {v === 'graph' ? 'Graphe' : 'Table δ'}
                </button>
              ))}
              <button className="btn btn-ghost"
                style={{ fontSize: 11, padding: '4px 12px', marginLeft: 'auto' }}
                onClick={() => { setA1(result); setResult(null); setEditTab('a1'); }}>
                ↩ Utiliser comme A₁
              </button>
            </div>

            {viewTab === 'graph'
              ? <AutomateGraph automate={result} height={300} />
              : <TransitionTable automate={result} />
            }

            {/* Statistiques comparatives */}
            <div style={{
              marginTop: 14, padding: '10px 14px',
              background: '#13161e', borderRadius: 6,
              display: 'flex', gap: 20, flexWrap: 'wrap',
              fontFamily: 'Space Mono', fontSize: 12,
            }}>
              {a1 && <StatItem label="A₁ états" value={a1.states.length} color="#7c3aed" />}
              {a2 && <StatItem label="A₂ états" value={a2.states.length} color="#00e5ff" />}
              <StatItem label="Résultat états" value={result.states?.length} color={currentOpDef.color} />
              <StatItem label="Résultat finaux" value={result.final_states?.length} color="#10b981" />
              <StatItem label="Transitions" value={result.transitions?.length} color="#f59e0b" />
            </div>
          </div>
        )}

        {!a1 && !a2 && !result && (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column',
            gap: 12, minHeight: 300,
            color: '#252a38', fontFamily: 'Space Mono', fontSize: 13,
          }}>
            <div style={{ fontSize: 36, display: 'flex', gap: 12 }}>
              <span>∪</span><span>∩</span><span style={{ fontSize: 28 }}>L̄</span>
            </div>
            <div>Définissez un ou deux automates et choisissez une opération</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sous-composants ────────────────────────────────────────────────────────────

function OpButton({ op, onClick, active, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px', width: '100%', textAlign: 'left',
        background: active ? '#1a1e28' : '#13161e',
        border: `1px solid ${active ? op.color + '44' : '#1a1e28'}`,
        borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
        marginBottom: 6, opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
      }}>
      <span style={{
        fontFamily: 'Space Mono', fontSize: 18,
        color: active ? op.color : '#2e3547',
        minWidth: 36, textAlign: 'center',
      }}>
        {op.symbol}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: 'Space Mono', fontSize: 12,
          color: active ? op.color : '#94a3b8',
        }}>
          {op.label}
        </div>
        <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
          {op.desc}
        </div>
      </div>
      <span className={`badge ${op.badge}`} style={{ fontSize: 10 }}>{op.section}</span>
    </button>
  );
}

function StatItem({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
      <div style={{ color, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
