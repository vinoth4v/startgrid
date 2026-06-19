"use client";

import { useState, useTransition } from "react";
import { AIPrompt, PromptVersion, savePrompt, togglePromptActive, getPromptVersions, restorePromptVersion, testPrompt } from "@/app/actions/ai-prompts";

const PERSONA_LABEL: Record<string, string> = { startup: "Startup", investor: "Investor", system: "System" };
const PERSONA_COLOR: Record<string, string> = { startup: "#10B981", investor: "#4F46E5", system: "#F59E0B" };
const MODELS = ["claude-sonnet-4-6", "claude-haiku-4-5-20251001", "claude-opus-4-8"];

interface Props { prompts: AIPrompt[] }

export default function PromptsClient({ prompts }: Props) {
  const [selected, setSelected] = useState<AIPrompt>(prompts[0] ?? null);
  const [systemPrompt, setSystemPrompt] = useState(prompts[0]?.system_prompt ?? "");
  const [userTemplate, setUserTemplate] = useState(prompts[0]?.user_prompt_template ?? "");
  const [model, setModel] = useState(prompts[0]?.model ?? "claude-sonnet-4-6");
  const [maxTokens, setMaxTokens] = useState(prompts[0]?.max_tokens ?? 1000);
  const [temperature, setTemperature] = useState(prompts[0]?.temperature ?? 0.7);
  const [changeNote, setChangeNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Tester state
  const [testerOpen, setTesterOpen] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [testResult, setTestResult] = useState<{ text?: string; inputTokens?: number; outputTokens?: number; costUsd?: number; error?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Version history modal
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const grouped: Record<string, AIPrompt[]> = {};
  for (const p of prompts) {
    const g = p.persona ?? "system";
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(p);
  }

  function selectPrompt(p: AIPrompt) {
    setSelected(p);
    setSystemPrompt(p.system_prompt);
    setUserTemplate(p.user_prompt_template);
    setModel(p.model);
    setMaxTokens(p.max_tokens);
    setTemperature(p.temperature);
    setChangeNote("");
    setSaved(false);
    setSaveError("");
    setTestResult(null);
  }

  function handleSave() {
    if (!selected) return;
    startTransition(async () => {
      const result = await savePrompt(selected.id, {
        system_prompt: systemPrompt,
        user_prompt_template: userTemplate,
        model, max_tokens: maxTokens, temperature,
      }, changeNote || "Updated via admin console");
      if (result.error) {
        setSaveError(result.error);
      } else {
        setSaved(true);
        setChangeNote("");
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  function handleToggleActive() {
    if (!selected) return;
    startTransition(async () => {
      await togglePromptActive(selected.id, !selected.is_active);
    });
  }

  async function handleTest() {
    setIsTesting(true);
    const result = await testPrompt(systemPrompt, testInput || userTemplate.substring(0, 300), model, Math.min(maxTokens, 500), temperature);
    setTestResult(result);
    setIsTesting(false);
  }

  async function handleShowVersions() {
    if (!selected) return;
    setLoadingVersions(true);
    setVersionsOpen(true);
    const v = await getPromptVersions(selected.id);
    setVersions(v);
    setLoadingVersions(false);
  }

  async function handleRestore(versionId: string) {
    if (!selected) return;
    startTransition(async () => {
      await restorePromptVersion(selected.id, versionId, "Restored from version history");
      setVersionsOpen(false);
    });
  }

  const isDirty = selected && (
    systemPrompt !== selected.system_prompt ||
    userTemplate !== selected.user_prompt_template ||
    model !== selected.model ||
    maxTokens !== selected.max_tokens ||
    temperature !== selected.temperature
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Left sidebar */}
      <div style={{
        width: 260, flexShrink: 0,
        backgroundColor: "white",
        borderRight: "0.5px solid #E2E8F0",
        overflowY: "auto",
        position: "sticky", top: 0, height: "100vh",
      }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: "0.5px solid #E2E8F0" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>All Prompts</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748B" }}>{prompts.length} prompts</p>
        </div>

        {["startup", "investor", "system"].map(persona => {
          const group = grouped[persona] ?? [];
          if (!group.length) return null;
          return (
            <div key={persona}>
              <div style={{ padding: "10px 16px 4px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  backgroundColor: PERSONA_COLOR[persona], flexShrink: 0,
                }} />
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {PERSONA_LABEL[persona]}
                </p>
              </div>
              {group.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPrompt(p)}
                  style={{
                    width: "100%", textAlign: "left",
                    padding: "8px 16px",
                    backgroundColor: selected?.id === p.id ? "#EEF2FF" : "transparent",
                    border: "none", cursor: "pointer",
                    borderLeft: selected?.id === p.id ? `3px solid #4F46E5` : "3px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{
                      margin: 0, fontSize: 12, fontWeight: selected?.id === p.id ? 600 : 500,
                      color: selected?.id === p.id ? "#4F46E5" : "#374151",
                    }}>{p.name}</p>
                    {!p.is_active && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#F59E0B", backgroundColor: "#FEF3C7", padding: "1px 5px", borderRadius: 3 }}>OFF</span>
                    )}
                  </div>
                  <p style={{ margin: "1px 0 0", fontSize: 10, color: "#94A3B8" }}>v{p.version} · {p.key}</p>
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {/* Main editor */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Top bar */}
        <div style={{
          backgroundColor: "white", borderBottom: "0.5px solid #E2E8F0",
          padding: "0 32px", height: 56,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>AI Prompt Management</p>
            <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>Control every AI interaction on StartGrid</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {saved && <span style={{ fontSize: 12, color: "#10B981", fontWeight: 600 }}>✓ Saved</span>}
            {saveError && <span style={{ fontSize: 12, color: "#EF4444" }}>{saveError}</span>}
          </div>
        </div>

        {!selected ? (
          <div style={{ padding: 40, color: "#94A3B8", fontSize: 14 }}>Select a prompt to edit</div>
        ) : (
          <div style={{ padding: "24px 32px", maxWidth: 1100 }}>
            {/* Prompt header */}
            <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{
                    padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                    backgroundColor: `${PERSONA_COLOR[selected.persona]}20`,
                    color: PERSONA_COLOR[selected.persona],
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>{selected.persona}</span>
                  <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "monospace" }}>key: {selected.key}</span>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>v{selected.version}</span>
                  {isDirty && <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 600 }}>● unsaved changes</span>}
                </div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.4px" }}>{selected.name}</h2>
                {selected.description && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748B" }}>{selected.description}</p>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={handleShowVersions} style={{
                  padding: "7px 14px", borderRadius: 7, border: "0.5px solid #E2E8F0",
                  backgroundColor: "white", color: "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>History</button>
                <button type="button" onClick={handleToggleActive} style={{
                  padding: "7px 14px", borderRadius: 7, border: "none",
                  backgroundColor: selected.is_active ? "#FEF3C7" : "#DCFCE7",
                  color: selected.is_active ? "#92400E" : "#166534",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>
                  {selected.is_active ? "Disable" : "Enable"}
                </button>
              </div>
            </div>

            {/* Prompt editors */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  System Prompt
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  rows={14}
                  style={{
                    width: "100%", padding: "12px 14px",
                    border: "0.5px solid #E2E8F0", borderRadius: 8,
                    fontSize: 12, fontFamily: "ui-monospace, monospace",
                    lineHeight: 1.6, color: "#1E293B",
                    resize: "vertical", boxSizing: "border-box",
                    outline: "none", backgroundColor: "#FAFAFA",
                  }}
                />
                <p style={{ margin: "4px 0 0", fontSize: 10, color: "#94A3B8" }}>{systemPrompt.length} chars</p>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  User Prompt Template
                  <span style={{ marginLeft: 6, fontWeight: 400, color: "#94A3B8", textTransform: "none" }}>use {"{{"+"variable"+"}}"} placeholders</span>
                </label>
                <textarea
                  value={userTemplate}
                  onChange={e => setUserTemplate(e.target.value)}
                  rows={14}
                  style={{
                    width: "100%", padding: "12px 14px",
                    border: "0.5px solid #E2E8F0", borderRadius: 8,
                    fontSize: 12, fontFamily: "ui-monospace, monospace",
                    lineHeight: 1.6, color: "#1E293B",
                    resize: "vertical", boxSizing: "border-box",
                    outline: "none", backgroundColor: "#FAFAFA",
                  }}
                />
                <p style={{ margin: "4px 0 0", fontSize: 10, color: "#94A3B8" }}>{userTemplate.length} chars</p>
              </div>
            </div>

            {/* Model settings */}
            <div style={{
              backgroundColor: "white", border: "0.5px solid #E2E8F0", borderRadius: 10,
              padding: "16px 20px", marginBottom: 16,
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20,
            }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Model</label>
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  style={{
                    width: "100%", padding: "8px 10px", borderRadius: 7,
                    border: "0.5px solid #E2E8F0", fontSize: 12, color: "#374151",
                    outline: "none", backgroundColor: "white",
                  }}
                >
                  {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Max Tokens: <span style={{ color: "#4F46E5" }}>{maxTokens}</span>
                </label>
                <input
                  type="range" min={100} max={4000} step={100}
                  value={maxTokens}
                  onChange={e => setMaxTokens(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#4F46E5" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94A3B8", marginTop: 2 }}>
                  <span>100</span><span>4000</span>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Temperature: <span style={{ color: "#4F46E5" }}>{Number(temperature).toFixed(1)}</span>
                </label>
                <input
                  type="range" min={0} max={1} step={0.1}
                  value={temperature}
                  onChange={e => setTemperature(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#4F46E5" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94A3B8", marginTop: 2 }}>
                  <span>0 (precise)</span><span>1 (creative)</span>
                </div>
              </div>
            </div>

            {/* Prompt tester */}
            <div style={{ backgroundColor: "white", border: "0.5px solid #E2E8F0", borderRadius: 10, marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => setTesterOpen(o => !o)}
                style={{
                  width: "100%", padding: "14px 20px", textAlign: "left",
                  border: "none", backgroundColor: "transparent", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>⚡</span>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>AI Prompt Tester</p>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>Send a live test to Claude</span>
                </div>
                <span style={{ color: "#94A3B8", fontSize: 14 }}>{testerOpen ? "▲" : "▼"}</span>
              </button>

              {testerOpen && (
                <div style={{ padding: "0 20px 20px", borderTop: "0.5px solid #F1F5F9" }}>
                  <p style={{ margin: "12px 0 6px", fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>Test Input</p>
                  <textarea
                    value={testInput}
                    onChange={e => setTestInput(e.target.value)}
                    placeholder="Enter a test user message (leave blank to use the start of the user template)"
                    rows={4}
                    style={{
                      width: "100%", padding: "10px 12px",
                      border: "0.5px solid #E2E8F0", borderRadius: 7,
                      fontSize: 12, fontFamily: "ui-monospace, monospace",
                      lineHeight: 1.5, boxSizing: "border-box", outline: "none",
                    }}
                  />
                  <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
                    <button
                      type="button" onClick={handleTest} disabled={isTesting}
                      style={{
                        padding: "8px 18px", borderRadius: 7, border: "none",
                        backgroundColor: isTesting ? "#94A3B8" : "#4F46E5",
                        color: "white", fontSize: 12, fontWeight: 600, cursor: isTesting ? "not-allowed" : "pointer",
                      }}
                    >
                      {isTesting ? "Running…" : "Run Test"}
                    </button>
                    <span style={{ fontSize: 11, color: "#94A3B8" }}>Uses current unsaved settings</span>
                  </div>

                  {testResult && (
                    <div style={{ marginTop: 16, padding: 16, backgroundColor: "#F8FAFC", borderRadius: 8, border: "0.5px solid #E2E8F0" }}>
                      {testResult.error ? (
                        <p style={{ margin: 0, fontSize: 12, color: "#EF4444", fontFamily: "monospace" }}>{testResult.error}</p>
                      ) : (
                        <>
                          <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                            <span style={{ fontSize: 11, color: "#64748B" }}>In: <strong>{testResult.inputTokens}</strong> tokens</span>
                            <span style={{ fontSize: 11, color: "#64748B" }}>Out: <strong>{testResult.outputTokens}</strong> tokens</span>
                            <span style={{ fontSize: 11, color: "#64748B" }}>Cost: <strong>${testResult.costUsd?.toFixed(5)}</strong></span>
                          </div>
                          <pre style={{ margin: 0, fontSize: 11, color: "#1E293B", whiteSpace: "pre-wrap", fontFamily: "ui-monospace, monospace", maxHeight: 300, overflowY: "auto" }}>
                            {testResult.text}
                          </pre>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Save bar */}
            <div style={{
              backgroundColor: "white", border: "0.5px solid #E2E8F0", borderRadius: 10,
              padding: "16px 20px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <input
                type="text"
                value={changeNote}
                onChange={e => setChangeNote(e.target.value)}
                placeholder="Change note (optional) e.g. 'Improved tone for B2B focus'"
                style={{
                  flex: 1, padding: "8px 12px", borderRadius: 7,
                  border: "0.5px solid #E2E8F0", fontSize: 12, outline: "none",
                }}
              />
              <button
                type="button" onClick={handleSave} disabled={isPending || !isDirty}
                style={{
                  padding: "8px 20px", borderRadius: 7, border: "none",
                  backgroundColor: !isDirty || isPending ? "#E2E8F0" : "#4F46E5",
                  color: !isDirty || isPending ? "#94A3B8" : "white",
                  fontSize: 12, fontWeight: 700, cursor: !isDirty || isPending ? "not-allowed" : "pointer",
                  letterSpacing: "0.02em",
                }}
              >
                {isPending ? "Saving…" : "Save & Increment Version"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Version history modal */}
      {versionsOpen && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }} onClick={() => setVersionsOpen(false)}>
          <div style={{
            backgroundColor: "white", borderRadius: 14, padding: "28px",
            width: 600, maxHeight: "80vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Version History</h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748B" }}>{selected?.name}</p>
              </div>
              <button type="button" onClick={() => setVersionsOpen(false)} style={{
                width: 28, height: 28, borderRadius: "50%", border: "none",
                backgroundColor: "#F1F5F9", color: "#64748B", fontSize: 14, cursor: "pointer",
              }}>✕</button>
            </div>

            {loadingVersions ? (
              <p style={{ color: "#94A3B8", fontSize: 13 }}>Loading versions…</p>
            ) : versions.length === 0 ? (
              <p style={{ color: "#94A3B8", fontSize: 13 }}>No version history yet. Save changes to create versions.</p>
            ) : versions.map(v => (
              <div key={v.id} style={{
                padding: "14px 16px", border: "0.5px solid #E2E8F0", borderRadius: 8, marginBottom: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      backgroundColor: "#EEF2FF", color: "#4F46E5",
                      fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                    }}>v{v.version}</span>
                    <span style={{ fontSize: 11, color: "#94A3B8" }}>
                      {new Date(v.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <button type="button" onClick={() => handleRestore(v.id)} style={{
                    padding: "5px 12px", borderRadius: 6, border: "0.5px solid #4F46E5",
                    backgroundColor: "white", color: "#4F46E5", fontSize: 11, fontWeight: 600, cursor: "pointer",
                  }}>Restore</button>
                </div>
                {v.change_note && (
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "#64748B", fontStyle: "italic" }}>"{v.change_note}"</p>
                )}
                <details>
                  <summary style={{ fontSize: 11, color: "#94A3B8", cursor: "pointer" }}>View prompt content</summary>
                  <pre style={{ margin: "8px 0 0", fontSize: 10, color: "#374151", whiteSpace: "pre-wrap", fontFamily: "ui-monospace, monospace", backgroundColor: "#F8FAFC", padding: 10, borderRadius: 6, maxHeight: 160, overflowY: "auto" }}>
                    {v.system_prompt}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
