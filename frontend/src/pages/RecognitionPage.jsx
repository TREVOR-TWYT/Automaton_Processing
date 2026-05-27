import React, { useState, useEffect, useRef } from "react";
import AutomateEditor from "../components/AutomateEditor";
import AutomateGraph from "../components/AutomateGraph";
import TransitionTable from "../components/TransitionTable";
import StepByStep from "../components/StepByStep";
import { recognizeWord } from "../services/api";

export default function RecognitionPage() {
  const [automate, setAutomate] = useState(null);
  const [word, setWord] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("editor");

  // ── Lecture pas à pas ────────────────────────────────────────────────────
  const [playStep, setPlayStep] = useState(-1); // -1 = inactif
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef(null);

  // Déduire l'état (ou l'ensemble d'états) à surligner selon l'étape courante
  const currentHighlight = (() => {
    if (!result || playStep < 0) return null;
    const steps = result.steps ?? [];
    if (steps.length === 0) return result.final_state ?? null;
    if (playStep === 0) {
      // Avant lecture : état(s) initial(aux)
      return steps[0]?.current_state ?? null;
    }
    const step = steps[playStep - 1];
    if (!step) return result.final_state ?? null;
    return step.next_state ?? null;
  })();

  // Lecture automatique : avance d'une étape toutes les 700ms
  useEffect(() => {
    if (!playing) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setPlayStep((prev) => {
        const max = result?.steps?.length ?? 0;
        if (prev >= max) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(intervalRef.current);
  }, [playing, result]);

  const stopPlay = () => {
    setPlaying(false);
    clearInterval(intervalRef.current);
  };
  const resetPlay = () => {
    stopPlay();
    setPlayStep(-1);
  };

  const handleSave = (a) => {
    setAutomate(a);
    setResult(null);
    resetPlay();
    setTab("graph");
  };

  const handleRecognize = async () => {
    if (!automate) return setError("Définissez d'abord un automate.");
    setLoading(true);
    setError("");
    setResult(null);
    resetPlay();
    try {
      const r = await recognizeWord(automate, word);
      setResult(r);
      setTab("graph");
    } catch (e) {
      setError(e.response?.data?.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const maxStep = result?.steps?.length ?? 0;
  const hasResult = result !== null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* ── Colonne gauche — Automate ──────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <span
              style={{
                color: "#7c3aed",
                fontFamily: "Space Mono",
                fontSize: 18,
              }}
            >
              A
            </span>
            <h3 style={{ fontSize: 14 }}>Définition de l'automate</h3>
            <span className="badge badge-purple" style={{ marginLeft: "auto" }}>
              {automate?.type ?? "Non défini"}
            </span>
          </div>

          {/* Onglets */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
            {[
              { key: "editor", label: "Éditeur" },
              { key: "graph", label: "Graphe" },
              { key: "table", label: "Table δ" },
            ].map((t) => (
              <button
                key={t.key}
                className={`btn ${tab === t.key ? "btn-primary" : "btn-ghost"}`}
                style={{ fontSize: 11, padding: "5px 12px" }}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "editor" && (
            <AutomateEditor initialAutomate={automate} onSave={handleSave} />
          )}

          {tab === "graph" && (
            <>
              <AutomateGraph
                automate={automate}
                highlightState={currentHighlight}
                height={320}
              />

              {/* ── Contrôles pas à pas ─────────────────────────────── */}
              {hasResult && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 12px",
                    background: "#13161e",
                    borderRadius: 6,
                    border: "1px solid #1a1e28",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#475569",
                      marginBottom: 8,
                    }}
                  >
                    Lecture pas à pas
                  </div>

                  {/* Barre de progression */}
                  <div
                    style={{
                      height: 4,
                      background: "#252a38",
                      borderRadius: 2,
                      marginBottom: 10,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${maxStep > 0 ? ((playStep < 0 ? 0 : playStep) / maxStep) * 100 : 0}%`,
                        background: result.accepted ? "#10b981" : "#ef4444",
                        borderRadius: 2,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>

                  {/* Boutons */}
                  <div
                    style={{ display: "flex", gap: 6, alignItems: "center" }}
                  >
                    <StepBtn
                      onClick={() => {
                        resetPlay();
                        setPlayStep(0);
                      }}
                      disabled={playStep === 0}
                      title="Début"
                    >
                      ⏮
                    </StepBtn>
                    <StepBtn
                      onClick={() => setPlayStep((p) => Math.max(0, p - 1))}
                      disabled={playStep <= 0}
                      title="Précédent"
                    >
                      ◀
                    </StepBtn>

                    {playing ? (
                      <StepBtn
                        onClick={stopPlay}
                        title="Pause"
                        style={{ color: "#f59e0b", borderColor: "#f59e0b" }}
                      >
                        ⏸
                      </StepBtn>
                    ) : (
                      <StepBtn
                        onClick={() => {
                          if (playStep < 0) setPlayStep(0);
                          setPlaying(true);
                        }}
                        disabled={playStep >= maxStep}
                        title="Lecture auto"
                        style={{ color: "#10b981", borderColor: "#10b981" }}
                      >
                        ▶
                      </StepBtn>
                    )}

                    <StepBtn
                      onClick={() =>
                        setPlayStep((p) => Math.min(maxStep, p + 1))
                      }
                      disabled={playStep >= maxStep || playStep < 0}
                      title="Suivant"
                    >
                      ▶|
                    </StepBtn>
                    <StepBtn
                      onClick={() => setPlayStep(maxStep)}
                      disabled={playStep === maxStep}
                      title="Fin"
                    >
                      ⏭
                    </StepBtn>

                    <span
                      style={{
                        marginLeft: "auto",
                        fontFamily: "Space Mono",
                        fontSize: 11,
                        color: "#475569",
                      }}
                    >
                      {playStep < 0 ? "—" : `${playStep} / ${maxStep}`}
                    </span>

                    <StepBtn
                      onClick={resetPlay}
                      title="Réinitialiser"
                      style={{ fontSize: 11 }}
                    >
                      ↺
                    </StepBtn>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "table" && <TransitionTable automate={automate} />}
        </div>

        {/* Infos automate */}
        {automate && (
          <div className="card fade-in">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <InfoChip
                label="États"
                value={automate.states.length}
                color="#7c3aed"
              />
              <InfoChip
                label="Alphabet"
                value={`{${automate.alphabet.join(", ")}}`}
                color="#00e5ff"
              />
              <InfoChip
                label="Transitions"
                value={automate.transitions.length}
                color="#10b981"
              />
              <InfoChip
                label="États finaux"
                value={automate.final_states.join(", ")}
                color="#f59e0b"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Colonne droite — Reconnaissance ───────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <span
              style={{
                color: "#00e5ff",
                fontFamily: "Space Mono",
                fontSize: 18,
              }}
            >
              w
            </span>
            <h3 style={{ fontSize: 14 }}>Test de reconnaissance</h3>
            <span className="badge badge-accent" style={{ marginLeft: "auto" }}>
              Algo 1
            </span>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Mot à tester</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="mono"
                value={word}
                onChange={(e) => {
                  setWord(e.target.value);
                  setResult(null);
                  resetPlay();
                }}
                onKeyDown={(e) => e.key === "Enter" && handleRecognize()}
                placeholder="ex: aabb"
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                onClick={handleRecognize}
                disabled={loading || !automate}
                style={{ whiteSpace: "nowrap" }}
              >
                {loading ? "..." : "▶ Tester"}
              </button>
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#475569",
                marginTop: 6,
                fontFamily: "Space Mono",
              }}
            >
              Mot vide : laisser vide. Symbole ε : champ symbol vide.
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "8px 12px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 6,
                color: "#ef4444",
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          {hasResult && (
            <div className="fade-in">
              <StepByStep
                steps={result.steps}
                accepted={result.accepted}
                message={result.message}
                finalState={result.final_state}
                allPaths={result.all_paths}
              />
            </div>
          )}
        </div>

        {/* Exemples rapides */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 13 }}>Exemples rapides</h3>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["", "a", "b", "ab", "ba", "aab", "abb", "aabb", "bab"].map(
              (w) => (
                <button
                  key={w}
                  className="btn btn-ghost"
                  style={{ fontSize: 11, fontFamily: "Space Mono" }}
                  onClick={() => {
                    setWord(w);
                    setResult(null);
                    resetPlay();
                  }}
                >
                  {w === "" ? "ε" : w}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Pseudocode */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 13 }}>Algorithme 1 — Cours §3.2.1</h3>
          </div>
          <pre
            style={{
              fontSize: 11,
              color: "#94a3b8",
              lineHeight: 1.8,
              fontFamily: "Space Mono",
              whiteSpace: "pre-wrap",
            }}
          >
            {`q := q0
i := 1
while(i ≤ n) do
  q := δ(q, u_i)
  i := i + 1
od
if(q ∈ F) return true
else return false`}
          </pre>
          <div style={{ marginTop: 10, color: "#475569", fontSize: 11 }}>
            Complexité DFA : <span style={{ color: "#00e5ff" }}>O(|u|)</span>
            {automate?.type !== "DFA" && (
              <span>
                {" "}
                · NFA : <span style={{ color: "#f59e0b" }}>O(|u| × |Q|)</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sous-composants ────────────────────────────────────────────────────────────

function InfoChip({ label, value, color }) {
  return (
    <div
      style={{
        background: "#13161e",
        border: "1px solid #252a38",
        borderRadius: 6,
        padding: "6px 12px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#475569",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: "Space Mono", fontSize: 12, color }}>
        {String(value)}
      </div>
    </div>
  );
}

function StepBtn({ onClick, disabled, title, children, style: s = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 30,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1e28",
        border: "1px solid #252a38",
        borderRadius: 4,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "Space Mono",
        fontSize: 13,
        color: disabled ? "#2e3547" : "#94a3b8",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s",
        ...s,
      }}
    >
      {children}
    </button>
  );
}
