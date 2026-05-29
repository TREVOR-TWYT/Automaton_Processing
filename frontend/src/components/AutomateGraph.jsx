import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * AutomateGraph — Visualisation complète d'un automate avec Cytoscape.js.
 *
 * Fonctionnalités :
 *   - Nœud fantôme invisible → flèche d'entrée pour l'état initial
 *   - Double bordure simulée pour les états finaux (nœud + ghost concentrique)
 *   - Surlignage animé de l'état courant (reconnaissance pas à pas)
 *   - Surlignage d'un ensemble d'états (NFA)
 *   - Arêtes courbées entre paires inverses, boucles sur soi-même
 *   - Contrôles : zoom +/-, fit, layout, export PNG
 *   - Tooltip au survol d'un état
 *   - Légende dynamique
 *
 * Props :
 *   automate        — objet automate standard
 *   highlightState  — string (DFA) ou tableau (NFA) : état(s) à surligner
 *   height          — hauteur du canvas (défaut : 360px)
 *   style           — styles supplémentaires sur le wrapper
 */
export default function AutomateGraph({
  automate,
  highlightState = null,
  height = 360,
  style = {},
}) {
  const containerRef = useRef(null);
  const cyRef        = useRef(null);
  const [tooltip, setTooltip]     = useState(null);  // { x, y, label }
  const [layoutName, setLayoutName] = useState('auto');

  // Normalise highlightState en Set pour comparaison O(1)
  const highlightSet = useCallback(() => {
    if (!highlightState) return new Set();
    if (Array.isArray(highlightState)) return new Set(highlightState);
    return new Set([highlightState]);
  }, [highlightState]);

  // ── Construction des éléments Cytoscape ──────────────────────────────────
  const buildElements = useCallback((a) => {
    const hl = highlightSet();

    // 1. Nœuds réels
    const nodes = a.states.map(state => ({
      data: {
        id:            state,
        label:         state,
        isInitial:     state === a.initial_state,
        isFinal:       a.final_states.includes(state),
        isHighlighted: hl.has(state),
        // pour le ghost double-cercle des états finaux
        isFinalGhost:  false,
      },
      classes: [
        state === a.initial_state    ? 'initial'     : '',
        a.final_states.includes(state) ? 'final'     : '',
        hl.has(state)                ? 'highlighted' : '',
      ].filter(Boolean).join(' '),
    }));

    // 2. Nœud fantôme invisible → flèche initiale
    const ghostNodes = [{
      data: {
        id:           '__init_ghost__',
        label:        '',
        isFinalGhost: false,
      },
      classes: 'ghost-init',
    }];

    // 3. Arête depuis le fantôme vers l'état initial
    const initEdge = [{
      data: {
        id:     '__init_edge__',
        source: '__init_ghost__',
        target: a.initial_state,
        label:  '',
      },
      classes: 'init-edge',
    }];

    // 4. Arêtes réelles — regroupement des symboles par paire (from, to)
    const edgeMap = {};
    a.transitions.forEach(t => {
      const sym   = t.symbol === '' ? 'ε' : t.symbol;
      const dests = Array.isArray(t.to) ? t.to : [t.to];
      dests.forEach(dest => {
        if (!dest) return;
        const key = `${t.from}|||${dest}`;
        if (!edgeMap[key]) edgeMap[key] = { from: t.from, to: dest, symbols: [] };
        if (!edgeMap[key].symbols.includes(sym))
          edgeMap[key].symbols.push(sym);
      });
    });

    // Détecter les paires d'arêtes inverses pour les courber
    const pairSet = new Set(Object.keys(edgeMap));
    const edges = Object.entries(edgeMap).map(([key, e]) => {
      const reverseKey = `${e.to}|||${e.from}`;
      const hasPair    = e.from !== e.to && pairSet.has(reverseKey);
      const isActive   = hl.has(e.from) && hl.has(e.to);
      return {
        data: {
          id:     `e___${key}`,
          source: e.from,
          target: e.to,
          label:  e.symbols.sort().join(', '),
        },
        classes: [
          e.from === e.to ? 'self-loop' : '',
          hasPair         ? 'has-pair'  : '',
          isActive        ? 'active'    : '',
        ].filter(Boolean).join(' '),
      };
    });

    return [...ghostNodes, ...nodes, ...initEdge, ...edges];
  }, [highlightSet]);

  // ── Style Cytoscape ───────────────────────────────────────────────────────
  const CY_STYLE = [
    // Nœud par défaut
    {
      selector: 'node',
      style: {
        'label':          'data(label)',
        'text-valign':    'center',
        'text-halign':    'center',
        'background-color': '#1a1e28',
        'border-color':   '#2e3547',
        'border-width':   2,
        'color':          '#e2e8f0',
        'font-family':    'Space Mono, monospace',
        'font-size':      '12px',
        'font-weight':    '700',
        'width':          46,
        'height':         46,
        'transition-property': 'background-color, border-color, border-width',
        'transition-duration': '0.25s',
      },
    },
    // Fantôme nœud initial — invisible
    {
      selector: 'node.ghost-init',
      style: {
        'width':            1,
        'height':           1,
        'background-color': 'transparent',
        'border-width':     0,
        'label':            '',
        'events':           'no',
      },
    },
    // État initial
    {
      selector: 'node.initial',
      style: {
        'background-color': '#120e1f',
        'border-color':     '#7c3aed',
        'border-width':     2.5,
      },
    },
    // État final — double bordure simulée via overlay
    {
      selector: 'node.final',
      style: {
        'background-color': '#09181f',
        'border-color':     '#00e5ff',
        'border-width':     2.5,
        // Anneau intérieur simulé avec un outline CSS via padding
        'padding':          '4px',
        'overlay-color':    '#00e5ff',
        'overlay-padding':  0,
        'overlay-opacity':  0,
      },
    },
    // État final + initial
    {
      selector: 'node.final.initial',
      style: {
        'border-color': '#00e5ff',
        'background-color': '#09101f',
      },
    },
    // État surligné (courant pendant la reconnaissance)
    {
      selector: 'node.highlighted',
      style: {
        'background-color': '#0f2318',
        'border-color':     '#10b981',
        'border-width':     3.5,
        'color':            '#10b981',
      },
    },
    // ── Arêtes ──────────────────────────────────────────────────────────────
    {
      selector: 'edge',
      style: {
        'label':                    'data(label)',
        'width':                    1.8,
        'line-color':               '#2e3547',
        'target-arrow-color':       '#2e3547',
        'target-arrow-shape':       'triangle',
        'arrow-scale':              1.2,
        'curve-style':              'bezier',
        'color':                    '#64748b',
        'font-family':              'Space Mono, monospace',
        'font-size':                '10px',
        'text-background-color':    '#0d0f14',
        'text-background-opacity':  1,
        'text-background-padding':  '2px',
        'text-margin-y':            -8,
        'edge-text-rotation':       'autorotate',
        'transition-property':      'line-color, target-arrow-color, width',
        'transition-duration':      '0.25s',
      },
    },
    // Arête active (entre deux états surlignés)
    {
      selector: 'edge.active',
      style: {
        'line-color':         '#10b981',
        'target-arrow-color': '#10b981',
        'width':              2.5,
        'color':              '#10b981',
      },
    },
    // Arête initiale (fantôme → initial)
    {
      selector: 'edge.init-edge',
      style: {
        'line-color':         '#7c3aed',
        'target-arrow-color': '#7c3aed',
        'target-arrow-shape': 'triangle',
        'width':              2,
        'label':              '',
        'curve-style':        'straight',
        'events':             'no',
      },
    },
    // Boucle sur soi-même
    {
      selector: 'edge.self-loop',
      style: {
        'curve-style':      'loop',
        'loop-direction':   '0deg',
        'loop-sweep':       '45deg',
        'control-point-step-size': 40,
      },
    },
    // Paires inverses — courbure pour éviter le chevauchement
    {
      selector: 'edge.has-pair',
      style: {
        'curve-style':              'bezier',
        'control-point-distance':   40,
      },
    },
  ];

  // ── Choix du layout ───────────────────────────────────────────────────────
  const getLayout = useCallback((a, name) => {
    const n     = a.states.length;
    const chose = name === 'auto'
      ? (n <= 4 ? 'circle' : n <= 8 ? 'breadthfirst' : 'grid')
      : name;

    const base = { padding: 50, animate: true, animationDuration: 400 };
    switch (chose) {
      case 'circle':
        return { ...base, name: 'circle', spacingFactor: 1.6 };
      case 'breadthfirst':
        return { ...base, name: 'breadthfirst', directed: true,
          spacingFactor: 1.4, roots: `#${a.initial_state}` };
      case 'grid':
        return { ...base, name: 'grid', spacingFactor: 1.2 };
      case 'concentric':
        return { ...base, name: 'concentric',
          concentric: n => n.data('isInitial') ? 2 : 1,
          levelWidth: () => 1 };
      default:
        return { ...base, name: 'circle', spacingFactor: 1.6 };
    }
  }, []);

  // ── Initialisation / mise à jour Cytoscape ────────────────────────────────
  useEffect(() => {
    if (!automate || !containerRef.current || !window.cytoscape) return;

    const elements = buildElements(automate);
    const layout   = getLayout(automate, layoutName);

    // Détruire l'instance précédente
    if (cyRef.current) cyRef.current.destroy();

    const cy = window.cytoscape({
      container: containerRef.current,
      elements,
      style:     CY_STYLE,
      layout,
      minZoom:   0.3,
      maxZoom:   3,
      userZoomingEnabled:    true,
      userPanningEnabled:    true,
      boxSelectionEnabled:   false,
      autoungrabify:         false,
    });

    cyRef.current = cy;

    // ── Tooltip au survol ──────────────────────────────────────────────────
    cy.on('mouseover', 'node:not(.ghost-init)', e => {
      const node  = e.target;
      const pos   = node.renderedPosition();
      const data  = node.data();
      const infos = [];
      if (data.isInitial)     infos.push('initial');
      if (data.isFinal)       infos.push('final');
      if (data.isHighlighted) infos.push('courant');
      setTooltip({
        x:     pos.x + 28,
        y:     pos.y - 10,
        label: `${data.id}${infos.length ? ' — ' + infos.join(', ') : ''}`,
      });
    });
    cy.on('mouseout', 'node', () => setTooltip(null));

    // Cacher le tooltip si on bouge le canvas
    cy.on('pan zoom', () => setTooltip(null));

    return () => {
      setTooltip(null);
      if (cyRef.current) { cyRef.current.destroy(); cyRef.current = null; }
    };
  }, [automate, layoutName, buildElements, getLayout]);

  // ── Mise à jour du surlignage SANS reconstruire le graphe ─────────────────
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !automate) return;

    const hl = highlightSet();

    cy.nodes(':not(.ghost-init)').forEach(node => {
      const id = node.data('id');
      if (hl.has(id)) {
        node.addClass('highlighted');
      } else {
        node.removeClass('highlighted');
      }
    });

    // Arêtes actives : from ET to tous deux surlignés
    cy.edges(':not(.init-edge)').forEach(edge => {
      const src = edge.data('source');
      const tgt = edge.data('target');
      if (hl.has(src) && hl.has(tgt)) {
        edge.addClass('active');
      } else {
        edge.removeClass('active');
      }
    });
  }, [highlightState, highlightSet, automate]);

  // ── Contrôles ─────────────────────────────────────────────────────────────
  const zoomIn  = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const zoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const fit     = () => cyRef.current?.fit(undefined, 50);

  const exportPNG = () => {
    if (!cyRef.current) return;
    const png  = cyRef.current.png({ bg: '#0d0f14', full: true, scale: 2 });
    const link = document.createElement('a');
    link.href     = png;
    link.download = 'automate.png';
    link.click();
  };

  const LAYOUTS = ['auto', 'circle', 'breadthfirst', 'grid', 'concentric'];

  // ── Render ────────────────────────────────────────────────────────────────
  if (!automate) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height, color: '#2e3547',
        fontFamily: 'Space Mono, monospace', fontSize: 12,
        background: '#0d0f14', borderRadius: 8,
        border: '1px solid #1a1e28', gap: 10,
        ...style,
      }}>
        <span style={{ fontSize: 28 }}>∅</span>
        <span>Aucun automate à afficher</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', ...style }}>

      {/* ── Barre d'outils ─────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 8px',
        background: '#13161e',
        borderBottom: '1px solid #1a1e28',
        borderRadius: '8px 8px 0 0',
        flexWrap: 'wrap',
      }}>
        {/* Contrôles zoom */}
        <div style={{ display: 'flex', gap: 4 }}>
          <CtrlBtn onClick={zoomIn}  title="Zoom +"  label="+" />
          <CtrlBtn onClick={zoomOut} title="Zoom −"  label="−" />
          <CtrlBtn onClick={fit}     title="Recadrer" label="⊡" />
        </div>

        <div style={{ width: 1, height: 16, background: '#252a38' }} />

        {/* Layout */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#475569',
            fontFamily: 'Space Mono', letterSpacing: '0.06em' }}>
            LAYOUT
          </span>
          {LAYOUTS.map(l => (
            <button key={l}
              onClick={() => setLayoutName(l)}
              style={{
                padding: '2px 7px',
                background: layoutName === l ? '#252a38' : 'transparent',
                border: `1px solid ${layoutName === l ? '#2e3547' : 'transparent'}`,
                borderRadius: 4, cursor: 'pointer',
                fontFamily: 'Space Mono', fontSize: 10,
                color: layoutName === l ? '#e2e8f0' : '#475569',
                transition: 'all 0.15s',
              }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 16, background: '#252a38' }} />

        {/* Export */}
        <CtrlBtn onClick={exportPNG} title="Exporter PNG" label="↓ PNG"
          style={{ fontSize: 10, padding: '3px 8px' }} />

        {/* Infos automate */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8,
          fontFamily: 'Space Mono', fontSize: 10, color: '#475569' }}>
          <span>{automate.states.length} états</span>
          <span>·</span>
          <span>{automate.transitions.length} transitions</span>
          <span>·</span>
          <span style={{
            color: automate.type === 'DFA' ? '#7c3aed'
              : automate.type === 'NFA' ? '#f59e0b' : '#10b981'
          }}>{automate.type}</span>
        </div>
      </div>

      {/* ── Canvas Cytoscape ────────────────────────────────────────────── */}
      <div style={{ position: 'relative' }}>
        <div
          ref={containerRef}
          style={{
            width:        '100%',
            height:       `${height}px`,
            background:   '#0d0f14',
            borderRadius: '0 0 8px 8px',
            border:       '1px solid #1a1e28',
            borderTop:    'none',
          }}
        />

        {/* Tooltip ──────────────────────────────────────────────────────── */}
        {tooltip && (
          <div style={{
            position:    'absolute',
            left:        tooltip.x,
            top:         tooltip.y,
            background:  '#1a1e28',
            border:      '1px solid #2e3547',
            borderRadius: 4,
            padding:     '4px 10px',
            fontFamily:  'Space Mono, monospace',
            fontSize:    11,
            color:       '#e2e8f0',
            pointerEvents: 'none',
            whiteSpace:  'nowrap',
            zIndex:      10,
            boxShadow:   '0 4px 16px rgba(0,0,0,0.5)',
          }}>
            {tooltip.label}
          </div>
        )}
      </div>

      {/* ── Légende ─────────────────────────────────────────────────────── */}
      <div style={{
        display:    'flex',
        gap:        16,
        padding:    '6px 10px',
        background: '#0d0f14',
        borderTop:  '1px solid #13161e',
        flexWrap:   'wrap',
      }}>
        <LegendItem color="#7c3aed" label="État initial" shape="circle" />
        <LegendItem color="#00e5ff" label="État final"   shape="double" />
        {highlightSet().size > 0 &&
          <LegendItem color="#10b981" label="État courant" shape="circle" />}
        <LegendItem color="#2e3547" label="Transition"   shape="arrow" />
        {automate.type !== 'DFA' && (
          <LegendItem color="#f59e0b" label="Non-déterministe" shape="none" />
        )}
      </div>
    </div>
  );
}

// ── Sous-composants ────────────────────────────────────────────────────────────

function CtrlBtn({ onClick, label, title, style: s = {} }) {
  return (
    <button onClick={onClick} title={title}
      style={{
        padding: '3px 9px',
        background: '#1a1e28',
        border: '1px solid #252a38',
        borderRadius: 4, cursor: 'pointer',
        fontFamily: 'Space Mono', fontSize: 12,
        color: '#94a3b8',
        transition: 'all 0.15s',
        ...s,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#00e5ff';
        e.currentTarget.style.color       = '#00e5ff';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#252a38';
        e.currentTarget.style.color       = '#94a3b8';
      }}
    >
      {label}
    </button>
  );
}

function LegendItem({ color, label, shape }) {
  const dot = shape === 'double'
    ? (
      <span style={{
        display: 'inline-block', width: 12, height: 12,
        borderRadius: '50%',
        border: `2px solid ${color}`,
        outline: `1.5px solid ${color}`,
        outlineOffset: '2px',
        marginRight: 6, flexShrink: 0,
      }} />
    )
    : shape === 'arrow'
    ? (
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        marginRight: 6, color, fontSize: 12,
      }}>──▶</span>
    )
    : shape === 'none'
    ? (
      <span style={{
        display: 'inline-block', width: 12, height: 12,
        border: `2px solid ${color}`, borderRadius: 2,
        marginRight: 6, flexShrink: 0,
      }} />
    )
    : (
      <span style={{
        display: 'inline-block', width: 12, height: 12,
        borderRadius: '50%',
        border: `2px solid ${color}`,
        marginRight: 6, flexShrink: 0,
      }} />
    );

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      fontFamily: 'Space Mono', fontSize: 10, color: '#475569',
    }}>
      {dot}
      {label}
    </div>
  );
}
