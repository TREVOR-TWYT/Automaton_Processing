import React, { useState } from 'react';
import AutomateGraph from '../components/AutomateGraph';
import TransitionTable from '../components/TransitionTable';
import { regexToThompson, regexToAutomate, automateToRegex } from '../services/api';
import AutomateEditor from '../components/AutomateEditor';

const EXAMPLES = [
  { regex: '(a|b)*abb', desc: 'Mots se terminant par abb' },
  { regex: 'a*b*',      desc: 'a* suivi de b*' },
  { regex: '(ab)*',     desc: 'Répétitions de ab' },
  { regex: 'a+b?',      desc: 'Au moins un a, b optionnel' },
  { regex: '(a|b)*ba(a|b)*', desc: 'Contient ba' },
];

export default function RegexPage() {
  const [regex, setRegex]       = useState('(a|b)*abb');
  const [alphabet, setAlphabet] = useState('a,b');
  const [mode, setMode]         = useState('to'); // 'to' | 'from'
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [step, setStep]         = useState('min_dfa'); // 'e_nfa'|'dfa'|'min_dfa'
  const [automate, setAutomate] = useState(null);

  const handleConvert = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const alph = alphabet.split(',').map(s => s.trim()).filter(Boolean);
      const r = await regexToAutomate(regex, alph);
      setResult(r);
      setStep('min_dfa');
    } catch (e) {
      setError(e.response?.data?.message || 'Expression régulière invalide');
    } finally { setLoading(false); }
  };

  const handleThompsonOnly = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const alph = alphabet.split(',').map(s => s.trim()).filter(Boolean);
      const r = await regexToThompson(regex, alph);
      setResult({ e_nfa: r });
      setStep('e_nfa');
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur');
    } finally { setLoading(false); }
  };

  const handleFromAutomate = async () => {
    if (!automate) return setError('Définissez un automate.');
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await automateToRegex(automate);
      setResult({ regex_result: r.regex });
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur');
    } finally { setLoading(false); }
  };

  const currentAutomate = result?.[step];
  const steps = [
    { key: 'e_nfa',   label: 'ε-AFND (Thompson)', available: !!result?.e_nfa },
    { key: 'dfa',     label: 'AFD (sous-ensembles)', available: !!result?.dfa },
    { key: 'min_dfa', label: 'AFD minimal (Moore)', available: !!result?.min_dfa },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

      {/* Gauche */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Sélection mode */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 14 }}>Mode</h3>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={`btn ${mode === 'to' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => { setMode('to'); setResult(null); }}
            >
              Regex → Automate
            </button>
            <button
              className={`btn ${mode === 'from' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => { setMode('from'); setResult(null); }}
            >
              Automate → Regex
            </button>
          </div>
        </div>

        {/* Mode : Regex → Automate */}
        {mode === 'to' && (
          <>
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: 14 }}>Expression régulière</h3>
                <span className="badge badge-accent" style={{ marginLeft: 'auto' }}>
                  EReg(Σ)
                </span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label>Expression</label>
                <input className="mono" value={regex}
                  onChange={e => setRegex(e.target.value)}
                  placeholder="(a|b)*abb" />
                <div style={{ fontSize: 11, color: '#475569', marginTop: 6,
                  fontFamily: 'Space Mono' }}>
                  Opérateurs : | (union), * (étoile), + (plus), ? (optionnel), () (groupes)
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label>Alphabet</label>
                <input className="mono" value={alphabet}
                  onChange={e => setAlphabet(e.target.value)}
                  placeholder="a,b,c" />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" onClick={handleThompsonOnly}
                  disabled={loading} style={{ fontSize: 12 }}>
                  Thompson seul
                </button>
                <button className="btn btn-primary" onClick={handleConvert}
                  disabled={loading}>
                  {loading ? '...' : '▶ Chaîne complète'}
                </button>
              </div>
            </div>

            {/* Exemples */}
            <div className="card">
              <div className="card-header"><h3 style={{ fontSize: 13 }}>Exemples</h3></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {EXAMPLES.map((ex, i) => (
                  <button key={i} onClick={() => setRegex(ex.regex)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', background: '#13161e',
                      border: '1px solid #1a1e28', borderRadius: 6,
                      cursor: 'pointer', textAlign: 'left',
                    }}>
                    <code style={{
                      fontFamily: 'Space Mono', fontSize: 12,
                      color: '#00e5ff', minWidth: 120,
                    }}>{ex.regex}</code>
                    <span style={{ color: '#475569', fontSize: 11 }}>{ex.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Mode : Automate → Regex */}
        {mode === 'from' && (
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: 14 }}>Automate source</h3>
              <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>
                BMC
              </span>
            </div>
            <AutomateEditor initialAutomate={automate} onSave={a => { setAutomate(a); setResult(null); }} />
            <button className="btn btn-primary"
              onClick={handleFromAutomate} disabled={loading}
              style={{ marginTop: 12 }}>
              {loading ? '...' : '▶ Extraire la Regex (BMC)'}
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

        {/* Résultat regex BMC */}
        {result?.regex_result !== undefined && (
          <div className="card fade-in">
            <div className="card-header">
              <h3 style={{ fontSize: 14 }}>Expression régulière extraite</h3>
              <span className="badge badge-green" style={{ marginLeft: 'auto' }}>BMC §3.3.2</span>
            </div>
            <div style={{
              padding: '16px 20px',
              background: '#13161e', borderRadius: 8,
              fontFamily: 'Space Mono', fontSize: 16,
              color: '#00e5ff', letterSpacing: '0.02em',
              border: '1px solid #252a38', wordBreak: 'break-all',
            }}>
              {result.regex_result}
            </div>
          </div>
        )}

        {/* Chaîne complète */}
        {(result?.e_nfa || result?.dfa || result?.min_dfa) && (
          <div className="card fade-in">
            <div className="card-header">
              <h3 style={{ fontSize: 14 }}>
                Chaîne : Regex → ε-AFND → AFD → AFD minimal
              </h3>
            </div>

            {/* Étapes */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 16,
              border: '1px solid #252a38', borderRadius: 6, overflow: 'hidden' }}>
              {steps.map((s, i) => (
                <button key={s.key}
                  onClick={() => s.available && setStep(s.key)}
                  disabled={!s.available}
                  style={{
                    flex: 1, padding: '8px 4px', border: 'none',
                    borderRight: i < 2 ? '1px solid #252a38' : 'none',
                    background: step === s.key ? '#252a38' : '#13161e',
                    color: step === s.key ? '#e2e8f0'
                      : s.available ? '#94a3b8' : '#2e3547',
                    cursor: s.available ? 'pointer' : 'not-allowed',
                    fontSize: 11, fontFamily: 'Space Mono',
                    transition: 'all 0.15s',
                  }}>
                  {s.label}
                  {s.available && result[s.key] && (
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
                      {result[s.key].states?.length} états
                    </div>
                  )}
                </button>
              ))}
            </div>

            {currentAutomate && (
              <>
                <AutomateGraph automate={currentAutomate} />
                <div style={{ marginTop: 12 }}>
                  <TransitionTable automate={currentAutomate} />
                </div>
              </>
            )}
          </div>
        )}

        {!result && (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            color: '#252a38', fontFamily: 'Space Mono', fontSize: 13,
            flexDirection: 'column', gap: 12, minHeight: 300,
          }}>
            <div style={{ fontSize: 36 }}>Σ*</div>
            <div>Entrez une expression régulière et lancez la conversion</div>
          </div>
        )}
      </div>
    </div>
  );
}
