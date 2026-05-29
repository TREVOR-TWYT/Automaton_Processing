import React, { useState, useEffect } from 'react';
import RecognitionPage from './pages/RecognitionPage';
import TransformPage   from './pages/TransformPage';
import RegexPage       from './pages/RegexPage';
import EquationsPage   from './pages/EquationsPage';
import GlushkovPage    from './pages/GlushkovPage';
import StatesPage      from './pages/StatesPage';
import ClosurePage     from './pages/ClosurePage';

const PAGES = [
  {
    key: 'recognition',
    label: 'Reconnaissance',
    icon: '▶',
    badge: '§3.2.1',
    desc: 'Tester si un mot est reconnu (DFA / NFA / ε-NFA)',
    color: '#00e5ff',
    group: 'Automates',
  },
  {
    key: 'states',
    label: 'États',
    icon: 'Q',
    badge: '§3.2.3',
    desc: 'Accessibles · Co-accessibles · Utiles · Conversions · Canonique',
    color: '#a78bfa',
    group: 'Automates',
  },
  {
    key: 'transform',
    label: 'Transformations',
    icon: '⟳',
    badge: '§3.2.2–5',
    desc: 'Complétion · Émondage · Déterminisation · Minimisation',
    color: '#7c3aed',
    group: 'Automates',
  },
  {
    key: 'closure',
    label: 'Clôtures',
    icon: '∪',
    badge: '§3.3.1',
    desc: 'Union · Intersection · Complémentation · Concaténation · Étoile',
    color: '#10b981',
    group: 'Automates',
  },
  {
    key: 'regex',
    label: 'Expressions régulières',
    icon: 'Σ',
    badge: '§3.3.2',
    desc: 'Regex ↔ Automates (Thompson · Glushkov · BMC)',
    color: '#06b6d4',
    group: 'Regex',
  },
  {
    key: 'glushkov',
    label: 'Glushkov',
    icon: 'G',
    badge: '§4.4',
    desc: 'NFA sans ε-transitions · Comparaison Thompson vs Glushkov',
    color: '#34d399',
    group: 'Regex',
  },
  {
    key: 'equations',
    label: 'Équations',
    icon: 'X',
    badge: '§2.3',
    desc: 'Lemme d\'Arden · Méthode de Gauss · Système depuis automate',
    color: '#f59e0b',
    group: 'Langages',
  },
];

const GROUPS = ['Automates', 'Regex', 'Langages'];

const PAGE_MAP = {
  recognition: RecognitionPage,
  states:      StatesPage,
  transform:   TransformPage,
  closure:     ClosurePage,
  regex:       RegexPage,
  glushkov:    GlushkovPage,
  equations:   EquationsPage,
};

export default function App() {
  const [page, setPage]                 = useState('recognition');
  const [cytoscapeReady, setCytoReady]  = useState(false);

  useEffect(() => {
    if (window.cytoscape) { setCytoReady(true); return; }
    const s = document.createElement('script');
    s.src     = 'https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js';
    s.onload  = () => setCytoReady(true);
    document.head.appendChild(s);
  }, []);

  const currentPage  = PAGES.find(p => p.key === page);
  const PageComponent = PAGE_MAP[page];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 0,
        padding: '0 20px', height: 52,
        background: '#090b10',
        borderBottom: '1px solid #1a1e28',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 20 }}>
          <div style={{
            width: 30, height: 30,
            background: 'linear-gradient(135deg, #7c3aed, #00e5ff)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Space Mono', fontWeight: 700, fontSize: 10, color: '#000',
          }}>INF</div>
          <div>
            <div style={{ fontFamily: 'Space Mono', fontWeight: 700, fontSize: 12, color: '#e2e8f0' }}>
              INF3421
            </div>
            <div style={{ fontSize: 9, color: '#2e3547', letterSpacing: '0.08em' }}>
              LANGAGES FORMELS & COMPILATION
            </div>
          </div>
        </div>

        {/* Navigation groupée */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1 }}>
          {GROUPS.map((group, gi) => (
            <div key={group} style={{
              display: 'flex', alignItems: 'center',
              borderLeft: gi > 0 ? '1px solid #1a1e28' : 'none',
              paddingLeft: gi > 0 ? 12 : 0,
              marginLeft: gi > 0 ? 8 : 0,
            }}>
              <span style={{
                fontSize: 9, color: '#2e3547', letterSpacing: '0.1em',
                textTransform: 'uppercase', marginRight: 6,
                fontFamily: 'Space Mono',
              }}>{group}</span>
              {PAGES.filter(p => p.group === group).map(p => (
                <button key={p.key} onClick={() => setPage(p.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px',
                    background: page === p.key ? '#13161e' : 'transparent',
                    border: page === p.key ? `1px solid ${p.color}33` : '1px solid transparent',
                    borderRadius: 5,
                    color: page === p.key ? p.color : '#475569',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 12, cursor: 'pointer',
                    transition: 'all 0.15s',
                    marginRight: 2,
                  }}
                  onMouseEnter={e => { if (page !== p.key) e.currentTarget.style.color = '#94a3b8'; }}
                  onMouseLeave={e => { if (page !== p.key) e.currentTarget.style.color = '#475569'; }}
                >
                  <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: page === p.key ? p.color : '#252a38' }}>
                    {p.icon}
                  </span>
                  {p.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#2e3547', fontFamily: 'Space Mono' }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: cytoscapeReady ? '#10b981' : '#f59e0b',
            }} />
            {cytoscapeReady ? 'Prêt' : 'Chargement...'}
          </div>
          <div style={{
            padding: '2px 8px', background: '#13161e',
            border: '1px solid #1a1e28', borderRadius: 4,
            fontFamily: 'Space Mono', fontSize: 9, color: '#2e3547',
          }}>
            Flask · localhost:5000
          </div>
        </div>
      </header>

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <div style={{
        padding: '7px 20px', background: '#090b10',
        borderBottom: '1px solid #13161e',
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#1a1e28' }}>
          UY1 / INF3421 / 2025-2026
        </span>
        <span style={{ color: '#1a1e28' }}>/</span>
        <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#252a38' }}>
          {currentPage?.group}
        </span>
        <span style={{ color: '#1a1e28' }}>/</span>
        <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: currentPage?.color }}>
          {currentPage?.label}
        </span>
        <span style={{
          padding: '0px 6px', background: '#13161e',
          border: '1px solid #1a1e28', borderRadius: 3,
          fontFamily: 'Space Mono', fontSize: 9, color: '#2e3547',
        }}>
          {currentPage?.badge}
        </span>
        <span style={{ fontSize: 10, color: '#1a1e28', marginLeft: 4 }}>
          — {currentPage?.desc}
        </span>
      </div>

      {/* ── Contenu ──────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {PageComponent && <PageComponent key={page} />}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{
        height: 28, borderTop: '1px solid #0d0f14',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', flexShrink: 0,
      }}>
        <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#1a1e28' }}>
          INF3421 — Etienne Kouokam — Université de Yaoundé I — Département d'Informatique — 2025-2026
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: 'Space Mono', fontSize: 9, color: '#1a1e28' }}>
          Flask 3 · React 18 · Cytoscape 3.28
        </span>
      </footer>
    </div>
  );
}
