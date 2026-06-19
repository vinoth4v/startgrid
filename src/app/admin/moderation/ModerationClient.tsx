"use client";

import { useState, useTransition } from "react";
import { ModerationItem, runAIQualityScore, updateModerationStatus } from "@/app/actions/moderation";
import Link from "next/link";

interface AIScoreResult {
  score?: number;
  flags?: string[];
  recommendation?: string;
  summary?: string;
  error?: string;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  draft: { bg: "#F1F5F9", color: "#64748B" },
  pending_review: { bg: "#FEF3C7", color: "#92400E" },
  approved: { bg: "#DCFCE7", color: "#166534" },
  rejected: { bg: "#FEE2E2", color: "#991B1B" },
  revision_requested: { bg: "#E0E7FF", color: "#3730A3" },
};

const TABS = ["all", "pending_review", "approved", "revision_requested", "rejected", "draft"] as const;
type Tab = typeof TABS[number];

interface Props { items: ModerationItem[] }

export default function ModerationClient({ items: initial }: Props) {
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState<Tab>("pending_review");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [aiScores, setAIScores] = useState<Record<string, AIScoreResult>>({});
  const [isPending, startTransition] = useTransition();
  const [scoringId, setScoringId] = useState<string | null>(null);

  const filtered = tab === "all" ? items : items.filter(i => i.review_status === tab);
  const selected = items.find(i => i.id === selectedId);

  const tabCount = (t: Tab) => t === "all" ? items.length : items.filter(i => i.review_status === t).length;

  function handleSelect(id: string) {
    setSelectedId(id);
    setNote("");
  }

  async function handleAIScore(id: string) {
    setScoringId(id);
    const result = await runAIQualityScore(id);
    setAIScores(prev => ({ ...prev, [id]: result }));
    setScoringId(null);
  }

  function handleAction(status: "approved" | "rejected" | "revision_requested") {
    if (!selectedId) return;
    startTransition(async () => {
      await updateModerationStatus(selectedId, status, note);
      setItems(prev => prev.map(i => i.id === selectedId
        ? { ...i, review_status: status, review_note: note, reviewed_at: new Date().toISOString(), is_published: status === "approved" }
        : i
      ));
      setSelectedId(null);
      setNote("");
    });
  }

  const aiData = selectedId ? (aiScores[selectedId] ?? {}) : {};

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{
        backgroundColor: "white", borderBottom: "0.5px solid #E2E8F0",
        padding: "0 32px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>Content Moderation</p>
          <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>Review, score, and approve startup profiles</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
            backgroundColor: "#FEF3C7", color: "#92400E",
          }}>
            {tabCount("pending_review")} pending review
          </span>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
        {/* List panel */}
        <div style={{ width: 340, flexShrink: 0, backgroundColor: "white", borderRight: "0.5px solid #E2E8F0", overflowY: "auto" }}>
          {/* Tabs */}
          <div style={{ padding: "12px 12px 0", display: "flex", flexWrap: "wrap", gap: 6, borderBottom: "0.5px solid #F1F5F9" }}>
            {TABS.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer",
                  fontSize: 10, fontWeight: 700,
                  backgroundColor: tab === t ? "#4F46E5" : "#F1F5F9",
                  color: tab === t ? "white" : "#64748B",
                  letterSpacing: "0.02em",
                }}
              >
                {t.replace(/_/g, " ")} ({tabCount(t)})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p style={{ padding: "20px 16px", color: "#94A3B8", fontSize: 12 }}>No items in this category</p>
          ) : filtered.map(item => {
            const statusStyle = STATUS_COLORS[item.review_status] ?? STATUS_COLORS.draft;
            const ai = aiScores[item.id] ?? {};
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                style={{
                  width: "100%", textAlign: "left", padding: "12px 16px",
                  border: "none", borderBottom: "0.5px solid #F8FAFC",
                  backgroundColor: selectedId === item.id ? "#EEF2FF" : "transparent",
                  cursor: "pointer",
                  borderLeft: selectedId === item.id ? "3px solid #4F46E5" : "3px solid transparent",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: selectedId === item.id ? "#4F46E5" : "#0F172A" }}>
                    {item.company_name}
                  </p>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
                    backgroundColor: statusStyle.bg, color: statusStyle.color,
                    textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0,
                  }}>{item.review_status.replace(/_/g, " ")}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <p style={{ margin: 0, fontSize: 10, color: "#94A3B8" }}>{item.sector} · {item.stage}</p>
                  {ai.score !== undefined && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3,
                      backgroundColor: (ai.score ?? 0) >= 70 ? "#DCFCE7" : (ai.score ?? 0) >= 40 ? "#FEF3C7" : "#FEE2E2",
                      color: (ai.score ?? 0) >= 70 ? "#166534" : (ai.score ?? 0) >= 40 ? "#92400E" : "#991B1B",
                    }}>AI: {ai.score}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          {!selected ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94A3B8" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
              <p style={{ fontSize: 13, margin: 0 }}>Select a startup to review</p>
            </div>
          ) : (
            <div style={{ maxWidth: 700 }}>
              {/* Profile header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#0F172A" }}>{selected.company_name}</h2>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {selected.sector && <span style={{ fontSize: 11, backgroundColor: "#EEF2FF", color: "#4F46E5", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>{selected.sector}</span>}
                    {selected.stage && <span style={{ fontSize: 11, backgroundColor: "#F0FDF4", color: "#166534", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>{selected.stage}</span>}
                    <span style={{ fontSize: 11, color: "#94A3B8" }}>{selected.slide_count} slides · {selected.has_logo ? "✓ logo" : "no logo"} · {selected.has_traction ? "✓ traction" : "no traction"}</span>
                  </div>
                </div>
                <Link href={`/investor/startup/${selected.id}`} target="_blank" style={{
                  padding: "7px 14px", borderRadius: 7, border: "0.5px solid #E2E8F0",
                  backgroundColor: "white", color: "#374151", fontSize: 12, fontWeight: 600,
                  textDecoration: "none",
                }}>View profile →</Link>
              </div>

              {selected.description && (
                <div style={{ backgroundColor: "#F8FAFC", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{selected.description}</p>
                </div>
              )}

              {/* AI Quality Score */}
              <div style={{
                backgroundColor: "white", border: "0.5px solid #E2E8F0", borderRadius: 10,
                padding: "16px 20px", marginBottom: 16,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>AI Quality Score</p>
                  <button
                    type="button"
                    onClick={() => handleAIScore(selected.id)}
                    disabled={scoringId === selected.id}
                    style={{
                      padding: "6px 14px", borderRadius: 7, border: "none",
                      backgroundColor: scoringId === selected.id ? "#94A3B8" : "#4F46E5",
                      color: "white", fontSize: 11, fontWeight: 600, cursor: scoringId === selected.id ? "not-allowed" : "pointer",
                    }}
                  >
                    {scoringId === selected.id ? "Scoring…" : "Run AI Score"}
                  </button>
                </div>

                {aiData.score !== undefined ? (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: "50%",
                        backgroundColor: aiData.score >= 70 ? "#DCFCE7" : aiData.score >= 40 ? "#FEF3C7" : "#FEE2E2",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <span style={{
                          fontSize: 20, fontWeight: 800,
                          color: aiData.score >= 70 ? "#166534" : aiData.score >= 40 ? "#92400E" : "#991B1B",
                        }}>{aiData.score}</span>
                      </div>
                      <div>
                        <p style={{ margin: "0 0 2px", fontSize: 12, color: "#374151" }}>{aiData.summary}</p>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 3,
                          backgroundColor: aiData.recommendation === "approve" ? "#DCFCE7" : aiData.recommendation === "reject" ? "#FEE2E2" : "#FEF3C7",
                          color: aiData.recommendation === "approve" ? "#166534" : aiData.recommendation === "reject" ? "#991B1B" : "#92400E",
                          textTransform: "uppercase", letterSpacing: "0.04em",
                        }}>AI recommendation: {aiData.recommendation}</span>
                      </div>
                    </div>
                    {Array.isArray(aiData.flags) && aiData.flags.length > 0 && (
                      <div>
                        <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: "#374151" }}>Issues flagged:</p>
                        {aiData.flags.map((flag: string, i: number) => (
                          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                            <span style={{ color: "#F59E0B", fontSize: 12 }}>⚠</span>
                            <p style={{ margin: 0, fontSize: 11, color: "#64748B" }}>{flag}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 12, color: "#94A3B8" }}>Click "Run AI Score" to get an automated quality assessment</p>
                )}
              </div>

              {/* Previous review note */}
              {selected.review_note && (
                <div style={{ backgroundColor: "#FFFBEB", border: "0.5px solid #FDE68A", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
                  <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 700, color: "#92400E", textTransform: "uppercase", letterSpacing: "0.05em" }}>Previous review note</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#374151" }}>{selected.review_note}</p>
                </div>
              )}

              {/* Moderation actions */}
              <div style={{ backgroundColor: "white", border: "0.5px solid #E2E8F0", borderRadius: 10, padding: "16px 20px" }}>
                <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Moderation Action</p>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add a note to the founder (optional for approve, recommended for revision/reject)"
                  rows={3}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 7,
                    border: "0.5px solid #E2E8F0", fontSize: 12, outline: "none",
                    lineHeight: 1.5, boxSizing: "border-box", marginBottom: 12,
                  }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button" onClick={() => handleAction("approved")} disabled={isPending}
                    style={{
                      flex: 1, padding: "9px", borderRadius: 7, border: "none",
                      backgroundColor: "#166534", color: "white", fontSize: 12, fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >✓ Approve</button>
                  <button
                    type="button" onClick={() => handleAction("revision_requested")} disabled={isPending}
                    style={{
                      flex: 1, padding: "9px", borderRadius: 7, border: "none",
                      backgroundColor: "#3730A3", color: "white", fontSize: 12, fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >↻ Request Revision</button>
                  <button
                    type="button" onClick={() => handleAction("rejected")} disabled={isPending}
                    style={{
                      flex: 1, padding: "9px", borderRadius: 7, border: "none",
                      backgroundColor: "#991B1B", color: "white", fontSize: 12, fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >✕ Reject</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
