import React, { useState } from 'react';
import { solveArden, solveGauss, systemFromAutomate } from '../services/api';
import AutomateEditor from '../components/AutomateEditor';

export default function EquationsPage() {
  const [mode, setMode]     = useState('arden'); // 'arden' | 'gauss' | 'automate'
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [result, setResult] = useState(null);

  // Arden
  const [A, setA] = useState('a');
  const [B, setB] = useState('b');

  // Gauss
  const [variables, setVariables] = useState('X0,X1,X2,X3');
  const [equationsRaw, setEquationsRaw] = useState(
`X0: X0=b, X1=a, const=∅
X1: X1=a, X2=b, const=∅
X2: X1=a, X3=b, const=ε
X3: X1=b, X3=a, const=∅`
  );

  // Automate
  const [automate, setAutomate] = useState(null);

  const parseGauss = () => {
    const vars = variables.split(',').map(s => s.trim()).filter(Boolean);
    const equations = {};
    equationsRaw.split('\n').forEach(line => {
      const [lhs, rest] = line.split(':');
      if (!lhs || !rest) return;
      const varName = lhs.trim();
      const eq = {};
      rest.split(',').forEach(part => {
        const [k, v] = part.trim().split('=');
        if (k && v) eq[k.trim()] = v.trim();
      });
      equations[varName] = eq;
    });
    return { variables: vars, equations };
  };

  const handleArden = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await solveArden(A, B);
      setResult(r);
    } catch (e) { setError('Erreur serveur'); }
    finally { setLoading(false); }
  };

  const handleGauss = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const { variables: vars, equations } = parseGauss();
      const r = await solveGauss(vars, equations);
      setResult(r);
    } catch (e) { setError('Format invalide ou erreur serveur'); }
    finally { setLoading(false); }
  };

  const handleFromAutomate = async () => {
    if (!automate) return setError('Définissez un automate.');
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await systemFromAutomate(automate);
      setResult(r);
    } catch (e) { setError('Erreur serveur'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

      {/* Gauche */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Mode */}
        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: 14 }}>Méthode</h3></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { key: 'arden',    label: 'Lemme d\'Arden', badge: 'badge-accent' },
              { key: 'gauss',    label: 'Méthode de Gauss', badge: 'badge-purple' },
              { key: 'automate', label: 'Depuis automate', badge: 'badge-green' },
            ].map(m => (
              <button key={m.key}
                className={`btn ${mode === m.key ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => { setMode(m.key); setResult(null); }}
                style={{ fontSize: 12 }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Arden */}
        {mode === 'arden' && (
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: 14 }}>Lemme d'Arden</h3>
              <span className="badge badge-accent" style={{ marginLeft: 'auto' }}>§2.3.1</span>
            </div>

            <div style={{
              padding: '12px 16px', background: '#13161e',
              borderRadius: 6, marginBottom: 16, border: '1px solid #252a38',
              fontFamily: 'Space Mono', fontSize: 13, color: '#94a3b8',
            }}>
              X = <span style={{ color: '#f59e0b' }}>A</span>·X +{' '}
              <span style={{ color: '#10b981' }}>B</span>{' '}
              → X = <span style={{ color: '#f59e0b' }}>A</span>*·
              <span style={{ color: '#10b981' }}>B</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label>Coefficient A</label>
                <input className="mono" value={A}
                  onChange={e => setA(e.target.value)} placeholder="a" />
              </div>
              <div>
                <label>Constante B</label>
                <input className="mono" value={B}
                  onChange={e => setB(e.target.value)} placeholder="b" />
              </div>
            </div>

            <div style={{
              padding: '10px 14px', background: '#13161e', borderRadius: 6,
              marginBottom: 16, fontFamily: 'Space Mono', fontSize: 12, color: '#475569',
            }}>
              Equation : X = ({A})·X + ({B})
            </div>

            <button className="btn btn-primary" onClick={handleArden} disabled={loading}>
              {loading ? '...' : '▶ Résoudre'}
            </button>

            {/* Exemples */}
            <div style={{ marginTop: 16 }}>
              <label>Exemples du cours</label>
              {[
                { A: 'a', B: 'b', label: 'X = aX + b' },
                { A: '1', B: '0L2', label: 'X = 1X + 0L₂' },
                { A: 'aa+ba*b+aba*b', B: 'a', label: 'Système §2.3.3' },
              ].map((ex, i) => (
                <button key={i}
                  onClick={() => { setA(ex.A); setB(ex.B); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '6px 10px', background: '#13161e',
                    border: '1px solid #1a1e28', borderRadius: 4,
                    marginBottom: 4, cursor: 'pointer',
                    fontFamily: 'Space Mono', fontSize: 11, color: '#94a3b8',
                  }}>
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gauss */}
        {mode === 'gauss' && (
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: 14 }}>Méthode de Gauss</h3>
              <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>§2.3.3</span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Variables (séparées par virgule)</label>
              <input className="mono" value={variables}
                onChange={e => setVariables(e.target.value)}
                placeholder="X0,X1,X2" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Équations (format: VAR: VAR=coeff, ..., const=valeur)</label>
              <textarea className="mono"
                value={equationsRaw}
                onChange={e => setEquationsRaw(e.target.value)}
                rows={8}
                style={{ resize: 'vertical', lineHeight: 1.8, fontSize: 12 }}
              />
            </div>
            <button className="btn btn-primary" onClick={handleGauss} disabled={loading}>
              {loading ? '...' : '▶ Résoudre'}
            </button>
          </div>
        )}

        {/* Depuis automate */}
        {mode === 'automate' && (
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: 14 }}>Système depuis automate</h3>
              <span className="badge badge-green" style={{ marginLeft: 'auto' }}>§2.3.2</span>
            </div>
            <AutomateEditor initialAutomate={automate} onSave={a => { setAutomate(a); setResult(null); }} />
            <button className="btn btn-primary" onClick={handleFromAutomate}
              disabled={loading || !automate} style={{ marginTop: 12 }}>
              {loading ? '...' : '▶ Construire et résoudre'}
            </button>
          </div>
        )}

        {error && (
          <div style={{
            padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, color: '#ef4444', fontSize: 12,
          }}>{error}</div>
        )}
      </div>

      {/* Droite — Résultats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {result && (
          <div className="card fade-in">
            <div className="card-header">
              <h3 style={{ fontSize: 14 }}>Solution</h3>
            </div>

            {/* Arden */}
            {result.equation && (
              <div>
                <div style={{
                  fontFamily: 'Space Mono', fontSize: 13,
                  color: '#94a3b8', marginBottom: 12,
                }}>
                  {result.equation}
                </div>
                <div style={{
                  padding: '16px 20px', background: '#13161e',
                  border: '1px solid #00e5ff', borderRadius: 8,
                  fontFamily: 'Space Mono', fontSize: 16,
                  color: '#00e5ff',
                }}>
                  {result.solution}
                </div>
              </div>
            )}

            {/* Gauss / Automate */}
            {result.solutions && (
              <div>
                {result.system && (
                  <>
                    <div style={{ fontSize: 11, color: '#475569',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      marginBottom: 10 }}>
                      Système d'équations
                    </div>
                    <div style={{
                      padding: '12px', background: '#13161e',
                      borderRadius: 6, marginBottom: 16,
                      fontFamily: 'Space Mono', fontSize: 12,
                      border: '1px solid #252a38',
                    }}>
                      {Object.entries(result.system.equations || {}).map(([v, eq]) => (
                        <div key={v} style={{ marginBottom: 4, color: '#94a3b8' }}>
                          <span style={{ color: '#7c3aed' }}>{v}</span>
                          {' = '}
                          {Object.entries(eq).map(([k, c]) =>
                            k === 'constant'
                              ? <span key={k} style={{ color: '#10b981' }}> + {c}</span>
                              : <span key={k}> {c}·<span style={{ color: '#7c3aed' }}>{k}</span></span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ fontSize: 11, color: '#475569',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  marginBottom: 10 }}>
                  Solutions
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(result.solutions).map(([v, sol]) => (
                    <div key={v} style={{
                      padding: '10px 14px', background: '#13161e',
                      border: '1px solid #252a38', borderRadius: 6,
                    }}>
                      <div style={{
                        fontFamily: 'Space Mono', fontSize: 12,
                        color: '#7c3aed', marginBottom: 4,
                      }}>{v} =</div>
                      <div style={{
                        fontFamily: 'Space Mono', fontSize: 13,
                        color: '#00e5ff', wordBreak: 'break-all',
                      }}>{sol}</div>
                    </div>
                  ))}
                </div>

                {/* Étapes */}
                {result.steps?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 11, color: '#475569',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      marginBottom: 10 }}>
                      Étapes de résolution
                    </div>
                    {result.steps.map((s, i) => (
                      <div key={i} style={{
                        padding: '8px 12px', background: '#13161e',
                        borderRadius: 4, marginBottom: 4,
                        fontFamily: 'Space Mono', fontSize: 11,
                        border: '1px solid #1a1e28',
                      }}>
                        <span style={{ color: '#7c3aed' }}>{s.variable}</span>
                        <span style={{ color: '#475569' }}> : A=</span>
                        <span style={{ color: '#f59e0b' }}>{s.A}</span>
                        <span style={{ color: '#475569' }}>, B=</span>
                        <span style={{ color: '#10b981' }}>{s.B}</span>
                        <span style={{ color: '#475569' }}> → </span>
                        <span style={{ color: '#00e5ff' }}>{s.solution}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!result && (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column',
            gap: 12, minHeight: 300,
            color: '#252a38', fontFamily: 'Space Mono', fontSize: 13,
          }}>
            <div style={{ fontSize: 36 }}>X = AX + B</div>
            <div>Choisissez une méthode et saisissez les paramètres</div>
          </div>
        )}
      </div>
    </div>
  );
}
