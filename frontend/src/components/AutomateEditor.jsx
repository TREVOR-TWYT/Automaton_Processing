import React, { useState } from 'react';

/**
 * Éditeur d'automate : permet de saisir/modifier un automate manuellement.
 * onSave(automate) : callback appelé quand l'automate est validé.
 */
export default function AutomateEditor({ initialAutomate = null, onSave }) {
  const empty = {
    type: 'DFA',
    alphabet: 'a,b',
    states: 'q0,q1,q2',
    initial_state: 'q0',
    final_states: 'q2',
    transitions: [{ from: 'q0', symbol: 'a', to: 'q1' }],
  };

  const toForm = (a) => a ? {
    type: a.type,
    alphabet: a.alphabet.join(','),
    states: a.states.join(','),
    initial_state: a.initial_state,
    final_states: a.final_states.join(','),
    transitions: a.transitions.map(t => ({
      from: t.from,
      symbol: t.symbol,
      to: Array.isArray(t.to) ? t.to.join(',') : t.to,
    })),
  } : empty;

  const [form, setForm] = useState(toForm(initialAutomate));
  const [error, setError] = useState('');

  const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const addTransition = () =>
    setForm(f => ({
      ...f,
      transitions: [...f.transitions, { from: '', symbol: '', to: '' }]
    }));

  const removeTransition = (i) =>
    setForm(f => ({
      ...f,
      transitions: f.transitions.filter((_, idx) => idx !== i)
    }));

  const updateTransition = (i, field, value) =>
    setForm(f => ({
      ...f,
      transitions: f.transitions.map((t, idx) =>
        idx === i ? { ...t, [field]: value } : t
      )
    }));

  const validate = () => {
    setError('');
    const alphabet = form.alphabet.split(',').map(s => s.trim()).filter(Boolean);
    const states   = form.states.split(',').map(s => s.trim()).filter(Boolean);
    const finals   = form.final_states.split(',').map(s => s.trim()).filter(Boolean);

    if (!states.length)          return setError('Ajoutez au moins un état.');
    if (!alphabet.length)        return setError('Ajoutez au moins un symbole.');
    if (!form.initial_state)     return setError('Définissez l\'état initial.');
    if (!states.includes(form.initial_state))
      return setError(`L'état initial "${form.initial_state}" n'est pas dans la liste des états.`);

    const transitions = form.transitions
      .filter(t => t.from || t.to || t.symbol)
      .map(t => ({
        from: t.from.trim(),
        symbol: t.symbol.trim(),
        to: form.type === 'DFA'
          ? t.to.trim()
          : t.to.split(',').map(s => s.trim()).filter(Boolean),
      }));

    onSave({
      type: form.type,
      alphabet,
      states,
      initial_state: form.initial_state.trim(),
      final_states: finals,
      transitions,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Type */}
      <div>
        <label>Type d'automate</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['DFA', 'NFA', 'e-NFA'].map(t => (
            <button
              key={t}
              className={`btn ${form.type === t ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => updateField('type', t)}
              style={{ fontSize: 12 }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Alphabet & États */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label>Alphabet (séparés par virgule)</label>
          <input
            className="mono"
            value={form.alphabet}
            onChange={e => updateField('alphabet', e.target.value)}
            placeholder="a,b,c"
          />
        </div>
        <div>
          <label>États</label>
          <input
            className="mono"
            value={form.states}
            onChange={e => updateField('states', e.target.value)}
            placeholder="q0,q1,q2"
          />
        </div>
        <div>
          <label>État initial</label>
          <input
            className="mono"
            value={form.initial_state}
            onChange={e => updateField('initial_state', e.target.value)}
            placeholder="q0"
          />
        </div>
        <div>
          <label>États finaux (séparés par virgule)</label>
          <input
            className="mono"
            value={form.final_states}
            onChange={e => updateField('final_states', e.target.value)}
            placeholder="q2"
          />
        </div>
      </div>

      {/* Transitions */}
      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 8,
        }}>
          <label style={{ marginBottom: 0 }}>
            Transitions {form.type === 'e-NFA' && '(symbole vide = ε)'}
          </label>
          <button className="btn btn-ghost" onClick={addTransition}
            style={{ fontSize: 11 }}>
            + Ajouter
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* En-tête */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 1fr 32px',
            gap: 6, padding: '4px 0',
          }}>
            {['De', 'Symbole', form.type === 'DFA' ? 'Vers' : 'Vers (virgule si NFA)', ''].map((h, i) => (
              <span key={i} style={{
                fontSize: 10, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: '#475569',
              }}>{h}</span>
            ))}
          </div>

          {form.transitions.map((t, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 80px 1fr 32px', gap: 6,
            }}>
              <input className="mono" value={t.from}
                onChange={e => updateTransition(i, 'from', e.target.value)}
                placeholder="q0" />
              <input className="mono" value={t.symbol}
                onChange={e => updateTransition(i, 'symbol', e.target.value)}
                placeholder="a" style={{ textAlign: 'center' }} />
              <input className="mono" value={t.to}
                onChange={e => updateTransition(i, 'to', e.target.value)}
                placeholder={form.type === 'DFA' ? 'q1' : 'q1,q2'} />
              <button
                onClick={() => removeTransition(i)}
                style={{
                  background: 'transparent', color: '#475569',
                  border: '1px solid #252a38', borderRadius: 4,
                  cursor: 'pointer', fontSize: 14,
                }}
              >×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div style={{
          padding: '8px 12px', background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 6, color: '#ef4444', fontSize: 12,
        }}>
          {error}
        </div>
      )}

      <button className="btn btn-primary" onClick={validate}
        style={{ alignSelf: 'flex-start' }}>
        ✓ Valider l'automate
      </button>
    </div>
  );
}
