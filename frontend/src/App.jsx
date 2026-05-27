import React, { useState, useEffect } from 'react';
import RecognitionPage from './pages/RecognitionPage';
import TransformPage   from './pages/TransformPage';
import RegexPage       from './pages/RegexPage';
import EquationsPage   from './pages/EquationsPage';

const PAGES = [
  {
    key: 'recognition',
    label: 'Reconnaissance',
    icon: '▶',
    badge: 'Algo 1',
    desc: 'Tester si un mot est reconnu par un DFA',
    color: '#00e5ff',
  },
  {
    key: 'transform',
    label: 'Transformations',
    icon: '⟳',
    badge: 'Algos 2-3',
    desc: 'Complétion, émondage, déterminisation, minimisation',
    color: '#7c3aed',
  },
  {
    key: 'regex',
    label: 'Expressions régulières',
    icon: 'Σ',
    badge: 'Thompson · BMC',
    desc: 'Regex ↔ Automates (Thompson, Glushkov, BMC)',
    color: '#10b981',
  },
  {
    key: 'equations',
    label: 'Équations',
    icon: 'X',
    badge: 'Arden · Gauss',
    desc: 'Systèmes d\'équations linéaires sur les langages',
    color: '#f59e0b',
  },
];

export default function App() {
  const [page, setPage] = useState('recognition');
  const [cytoscapeReady, setCytoscapeReady] = useState(false);

  // Charger Cytoscape via CDN
  useEffect(() => {
    if (window.cytoscape) { setCytoscapeReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js';
    script.onload = () => setCytoscapeReady(true);
    document.head.appendChild(script);
  }, []);

  const currentPage = PAGES.find(p => p.key === page);

  const PageComponent = {
    recognition: RecognitionPage,
    transform:   TransformPage,
    regex:       RegexPage,
    equations:   EquationsPage,
  }[page];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden',
      background: 'var(--bg)',
    }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 20,
        padding: '0 24px',
        height: 56,
        background: '#0d0f14',
        borderBottom: '1px solid #1a1e28',
        flexShrink: 0,
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #7c3aed, #00e5ff)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Space Mono', fontWeight: 700, fontSize: 12, color: '#000',
          }}>
            INF
          </div>
          <div>
            <div style={{
              fontFamily: 'Space Mono', fontWeight: 700,
              fontSize: 13, color: '#e2e8f0', letterSpacing: '-0.02em',
            }}>
              INF3421
            </div>
            <div style={{ fontSize: 10, color: '#475569', letterSpacing: '0.06em' }}>
              LANGAGES FORMELS & COMPILATION
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div style={{ width: 1, height: 24, background: '#252a38' }} />

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {PAGES.map(p => (
            <button
              key={p.key}
              onClick={() => setPage(p.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px',
                background: page === p.key ? '#1a1e28' : 'transparent',
                border: page === p.key
                  ? `1px solid ${p.color}22`
                  : '1px solid transparent',
                borderRadius: 6,
                color: page === p.key ? p.color : '#475569',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 13, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (page !== p.key) e.currentTarget.style.color = '#94a3b8';
              }}
              onMouseLeave={e => {
                if (page !== p.key) e.currentTarget.style.color = '#475569';
              }}
            >
              <span style={{
                fontFamily: 'Space Mono', fontSize: 11,
                color: page === p.key ? p.color : '#2e3547',
              }}>
                {p.icon}
              </span>
              {p.label}
            </button>
          ))}
        </nav>

        {/* Infos droite */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 11, color: '#475569', fontFamily: 'Space Mono',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: cytoscapeReady ? '#10b981' : '#f59e0b',
              boxShadow: cytoscapeReady
                ? '0 0 6px rgba(16,185,129,0.6)'
                : '0 0 6px rgba(245,158,11,0.6)',
            }} />
            {cytoscapeReady ? 'Prêt' : 'Chargement...'}
          </div>
          <div style={{
            padding: '3px 10px',
            background: '#13161e',
            border: '1px solid #252a38',
            borderRadius: 4,
            fontFamily: 'Space Mono', fontSize: 10,
            color: '#475569',
          }}>
            Flask API : localhost:5000
          </div>
        </div>
      </header>

      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <div style={{
        padding: '10px 24px',
        background: '#0d0f14',
        borderBottom: '1px solid #13161e',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: '#2e3547' }}>
          UY1 / INF3421 / 2025-2026
        </span>
        <span style={{ color: '#2e3547' }}>/</span>
        <span style={{
          fontFamily: 'Space Mono', fontSize: 11,
          color: currentPage?.color,
        }}>
          {currentPage?.label}
        </span>
        <span style={{
          marginLeft: 6,
          padding: '1px 8px',
          background: '#13161e',
          border: '1px solid #1a1e28',
          borderRadius: 3,
          fontFamily: 'Space Mono', fontSize: 10,
          color: '#475569',
        }}>
          {currentPage?.badge}
        </span>
        <span style={{ marginLeft: 4, fontSize: 11, color: '#2e3547' }}>
          — {currentPage?.desc}
        </span>
      </div>

      {/* ── Contenu ────────────────────────────────────────── */}
      <main style={{
        flex: 1, overflow: 'auto',
        padding: '20px 24px',
      }}>
        {PageComponent && <PageComponent key={page} />}
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer style={{
        height: 32,
        borderTop: '1px solid #13161e',
        display: 'flex', alignItems: 'center',
        padding: '0 24px',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'Space Mono', fontSize: 10, color: '#252a38',
        }}>
          INF3421 — Etienne Kouokam — Université de Yaoundé I — Département d'Informatique
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: 'Space Mono', fontSize: 10, color: '#252a38' }}>
          Flask 3.x · React 18
        </span>
      </footer>
    </div>
  );
}
