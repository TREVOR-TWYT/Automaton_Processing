import React, { useState } from 'react';
import AutomateGraph from '../components/AutomateGraph';
import TransitionTable from '../components/TransitionTable';
import { regexGlushkov, regexCompare } from '../services/api';

const EXAMPLES = [
  { regex: '(a|b)*abb', desc: 'Mots terminant par abb' },
  { regex: 'a*b*',      desc: 'a* suivi de b*' },
  { regex: 'ab+c?',     desc: 'a, b+, c optionnel' },
  { regex: '(ab)*',     desc: 'Répétitions de ab' },
  { regex: 'a+b?c*',    desc: 'Combinaison' },
];

export default function GlushkovPage() {
  const [regex, setRegex]       = useState('(a|b)*abb');
  const [alphabet, setAlphabet] = useState('a,b');
  const [mode, setMode]         = useState('glushkov'); // 'glushkov' | 'compare'
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [activeStep, setActiveStep] = useState('nfa');

  const alph = () => alphabet.split(',').map(s => s.trim()).filter(Boolean);

  const handleGlushkov = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await regexGlushkov(regex, alph());
      setResult({ type: 'glushkov', nfa: r });
      setActiveStep('nfa');
    } catch (e) {
      setError(e.response?.data?.message || 'Expression invalide');
    } finally { setLoading(false); }
  };

  const handleCompare = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await regexCompare(regex, alph());
      setResult({ type: 'compare', ...r });
      setActiveStep('thompson_enfa');
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur');
    } finally { setLoading(false); }
  };

  const getActiveAutomate = () => {
    if (!result) return null;
    if (result.type === 'glushkov') return result.nfa;
    const map = {
      thompson_enfa: result.thompson?.e_nfa,
      thompson_dfa:  result.thompson?.dfa,
      thompson_min:  result.thompson?.min,
      glushkov_nfa:  result.glushkov?.nfa,
      glushkov_dfa:  result.glushkov?.dfa,
      glushkov_min:  result.glushkov?.min,
    };
    return map[activeStep] || null;
  };

  const compareSteps = [
    { key: 'thompson_enfa', label: 'Thompson ε-AFND', group: 'thompson', color: '#7c3aed' },
    { key: 'thompson_dfa',  label: 'Thompson AFD',    group: 'thompson', color: '#7c3aed' },
    { key: 'thompson_min',  label: 'Thompson minimal',group: 'thompson', color: '#7c3aed' },
    { key: 'glushkov_nfa',  label: 'Glushkov NFA',    group: 'glushkov', color: '#10b981' },
    { key: 'glushkov_dfa',  label: 'Glushkov AFD',    group: 'glushkov', color: '#10b981' },
    { key: 'glushkov_min',  label: 'Glushkov minimal',group: 'glushkov', color: '#10b981' },
  ];

  const cur = getActiveAutomate();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>

      {/* ── Panneau gauche ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Mode */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 14 }}>Mode</h3>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`btn ${mode === 'glushkov' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => { setMode('glushkov'); setResult(null); }}
              style={{ fontSize: 12 }}>
              Glushkov seul
            </button>
            <button className={`btn ${mode === 'compare' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => { setMode('compare'); setResult(null); }}
              style={{ fontSize: 12 }}>
              Thompson vs Glushkov
            </button>
          </div>
        </div>

        {/* Saisie */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 14 }}>Expression régulière</h3>
            <span className="badge badge-green" style={{ marginLeft: 'auto' }}>
              Glushkov §4.4
            </span>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Expression</label>
            <input className="mono" value={regex}
              onChange={e => setRegex(e.target.value)}
              placeholder="(a|b)*abb" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Alphabet</label>
            <input className="mono" value={alphabet}
              onChange={e => setAlphabet(e.target.value)}
              placeholder="a,b" />
          </div>

          <button className="btn btn-primary" onClick={mode === 'compare' ? handleCompare : handleGlushkov}
            disabled={loading}>
            {loading ? '...' : mode === 'compare' ? '▶ Comparer' : '▶ Construire NFA Glushkov'}
          </button>
        </div>

        {/* Exemples */}
        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: 13 }}>Exemples</h3></div>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => setRegex(ex.regex)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 10px', background: '#13161e',
                border: '1px solid #1a1e28', borderRadius: 6,
                cursor: 'pointer', textAlign: 'left', width: '100%',
                marginBottom: 4,
              }}>
              <code style={{ fontFamily: 'Space Mono', fontSize: 12, color: '#10b981', minWidth: 100 }}>
                {ex.regex}
              </code>
              <span style={{ color: '#475569', fontSize: 11 }}>{ex.desc}</span>
            </button>
          ))}
        </div>

        {/* Propriétés Glushkov */}
        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: 13 }}>Propriétés Glushkov</h3></div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 11, color: '#64748b', lineHeight: 2 }}>
            <div>• <span style={{ color: '#10b981' }}>n+1 états</span> pour n symboles</div>
            <div>• <span style={{ color: '#10b981' }}>Aucune ε-transition</span></div>
            <div>• Au plus <span style={{ color: '#10b981' }}>n² transitions</span></div>
            <div>• Thompson : <span style={{ color: '#7c3aed' }}>2n états</span>, nombreuses ε</div>
            <div>• AFD minimal identique pour les deux</div>
          </div>
        </div>
      </div>

      {/* ── Panneau droit ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div style={{
            padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, color: '#ef4444', fontSize: 12,
          }}>{error}</div>
        )}

        {/* Résultat Glushkov simple */}
        {result?.type === 'glushkov' && cur && (
          <div className="card fade-in">
            <div className="card-header">
              <h3 style={{ fontSize: 14 }}>NFA de Glushkov — <code style={{ color: '#10b981' }}>{regex}</code></h3>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <span className="badge badge-green">{cur.states.length} états</span>
                <span className="badge badge-accent">{cur.transitions.length} transitions</span>
                <span className="badge badge-purple">Aucune ε-transition</span>
              </div>
            </div>
            <AutomateGraph automate={cur} height={300} />
            <div style={{ marginTop: 12 }}>
              <TransitionTable automate={cur} />
            </div>
          </div>
        )}

        {/* Comparaison Thompson vs Glushkov */}
        {result?.type === 'compare' && (
          <div className="card fade-in">
            <div className="card-header">
              <h3 style={{ fontSize: 14 }}>Thompson vs Glushkov — <code style={{ color: '#10b981' }}>{regex}</code></h3>
            </div>

            {/* Stats comparatives */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
              marginBottom: 16,
            }}>
              <StatsBox
                title="Thompson (ε-AFND)"
                color="#7c3aed"
                enfa={result.thompson?.e_nfa}
                dfa={result.thompson?.dfa}
                min={result.thompson?.min}
              />
              <StatsBox
                title="Glushkov (NFA)"
                color="#10b981"
                nfa={result.glushkov?.nfa}
                dfa={result.glushkov?.dfa}
                min={result.glushkov?.min}
              />
            </div>

            {/* Onglets */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr) repeat(3,1fr)',
              gap: 4, marginBottom: 16,
              border: '1px solid #252a38', borderRadius: 6, overflow: 'hidden',
            }}>
              {compareSteps.map((s, i) => (
                <button key={s.key}
                  onClick={() => setActiveStep(s.key)}
                  style={{
                    padding: '7px 4px', border: 'none',
                    borderRight: i < 5 ? '1px solid #252a38' : 'none',
                    borderBottom: i < 3 ? '1px solid #252a38' : 'none',
                    background: activeStep === s.key ? '#1a1e28' : '#13161e',
                    color: activeStep === s.key ? s.color : '#475569',
                    cursor: 'pointer', fontSize: 10,
                    fontFamily: 'Space Mono',
                    transition: 'all 0.15s',
                  }}>
                  {s.label}
                </button>
              ))}
            </div>

            {cur && (
              <>
                <AutomateGraph automate={cur} height={280} />
                <div style={{ marginTop: 12 }}>
                  <TransitionTable automate={cur} />
                </div>
              </>
            )}
          </div>
        )}

        {!result && (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column',
            gap: 12, minHeight: 320,
            color: '#252a38', fontFamily: 'Space Mono', fontSize: 13,
          }}>
            <div style={{ fontSize: 36 }}>G</div>
            <div>Entrez une expression régulière et construisez le NFA de Glushkov</div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatsBox({ title, color, enfa, nfa, dfa, min }) {
  const first = enfa || nfa;
  return (
    <div style={{
      background: '#13161e', border: `1px solid ${color}22`,
      borderRadius: 8, padding: '12px 14px',
    }}>
      <div style={{ fontFamily: 'Space Mono', fontSize: 12, color, marginBottom: 10, fontWeight: 700 }}>
        {title}
      </div>
      {first && (
        <Row label={enfa ? 'ε-AFND' : 'NFA'} states={first.states?.length} trans={first.transitions?.length} color={color} />
      )}
      {dfa && <Row label="AFD" states={dfa.states?.length} trans={dfa.transitions?.length} color={color} />}
      {min && <Row label="Minimal" states={min.states?.length} trans={min.transitions?.length} color={color} highlight />}
    </div>
  );
}

function Row({ label, states, trans, color, highlight }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '4px 0',
      borderBottom: '1px solid #1a1e28',
      fontFamily: 'Space Mono', fontSize: 11,
      color: highlight ? color : '#64748b',
      fontWeight: highlight ? 700 : 400,
    }}>
      <span>{label}</span>
      <span>{states} états · {trans} trans.</span>
    </div>
  );
}
