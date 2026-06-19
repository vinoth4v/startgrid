"use client";

import { useState } from "react";
import { getReadinessScore, invalidateReadinessScore, type ReadinessFeedback } from "@/app/actions/readiness-score";

const GRADE_META: Record<string, { color: string; bg: string; border: string; label: string }> = {
  A: { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", label: "Investor ready" },
  B: { color: "#1B63D8", bg: "#EFF6FF", border: "#BFDBFE", label: "Strong profile" },
  C: { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", label: "Needs polish" },
  D: { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", label: "Early stage" },
};

export default function ReadinessScore() {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<ReadinessFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen() {
    setOpen(true);
    if (feedback) return;
    setLoading(true);
    setError(null);
    const result = await getReadinessScore();
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    if (result.feedback) setFeedback(result.feedback);
  }

  async function handleRefresh() {
    setFeedback(null);
    setLoading(true);
    await invalidateReadinessScore();
    const result = await getReadinessScore();
    setLoading(false);
    if (result.feedback) setFeedback(result.feedback);
  }

  const meta = feedback ? GRADE_META[feedback.grade] ?? GRADE_META.D : null;

  return (
    <>
      <button type="button" onClick={handleOpen} style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "11px 18px", borderRadius: 10,
        background: "linear-gradient(135deg, #0F172A, #1E3A5F)",
        border: "none", color: "white", fontSize: 13, fontWeight: 600,
        cursor: "pointer", width: "100%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}>
        <span style={{ fontSize: 16 }}>✦</span>
        AI Investor Readiness Score
      </button>

      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }} onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={{
            backgroundColor: "white", borderRadius: 16,
            width: "100%", maxWidth: 560, maxHeight: "88vh",
            overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            {/* Header */}
            <div style={{
              padding: "20px 24px", borderBottom: "0.5px solid #E2E8F0",
              background: "linear-gradient(135deg, #0F172A, #1E3A5F)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>AI-Powered</p>
                <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 700, color: "white" }}>Investor Readiness Score</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} style={{
                background: "rgba(255,255,255,0.1)", border: "none", color: "white",
                width: 30, height: 30, borderRadius: "50%", cursor: "pointer",
                fontSize: 16,
              }}>×</button>
            </div>

            {/* Body */}
            <div style={{ overflowY: "auto", flex: 1, padding: "28px 24px" }}>
              {loading && (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <p style={{ fontSize: 28, margin: "0 0 12px" }}>✦</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Analysing your profile…</p>
                  <p style={{ fontSize: 13, color: "#94A3B8", margin: "4px 0 0" }}>Claude is reviewing your pitch and completeness</p>
                </div>
              )}
              {error && (
                <div style={{ backgroundColor: "#FFF1F2", border: "0.5px solid #FECDD3", borderRadius: 8, padding: "14px 16px", color: "#E11D48", fontSize: 13 }}>
                  {error}
                </div>
              )}
              {feedback && meta && !loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {/* Grade + score */}
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{
                      width: 80, height: 80, borderRadius: 20,
                      backgroundColor: meta.bg, border: `2px solid ${meta.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 36, fontWeight: 900, color: meta.color, letterSpacing: "-2px" }}>
                        {feedback.grade}
                      </span>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#0F172A", letterSpacing: "-1px" }}>
                        {feedback.score}<span style={{ fontSize: 14, fontWeight: 500, color: "#94A3B8" }}>/100</span>
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 600, color: meta.color }}>
                        {meta.label}
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>
                        {feedback.summary}
                      </p>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div style={{ height: 8, backgroundColor: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${feedback.score}%`,
                      background: `linear-gradient(90deg, ${meta.color}, ${meta.border})`,
                      borderRadius: 4, transition: "width 0.5s ease",
                    }} />
                  </div>

                  {/* Strengths */}
                  <div style={{ backgroundColor: "#F0FDF4", borderRadius: 10, border: "0.5px solid #A7F3D0", padding: "16px 18px" }}>
                    <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      ✓ Strengths
                    </p>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {feedback.strengths.map((s, i) => (
                        <li key={i} style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div style={{ backgroundColor: "#FFFBEB", borderRadius: 10, border: "0.5px solid #FDE68A", padding: "16px 18px" }}>
                    <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      ↑ Areas to improve
                    </p>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {feedback.improvements.map((s, i) => (
                        <li key={i} style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <p style={{ margin: 0, fontSize: 11, color: "#94A3B8", textAlign: "right" }}>
                    Generated {new Date(feedback.generatedAt).toLocaleDateString()} · Powered by Claude
                  </p>
                </div>
              )}
            </div>

            {feedback && !loading && (
              <div style={{
                padding: "14px 24px", borderTop: "0.5px solid #F1F5F9",
                display: "flex", justifyContent: "flex-end",
              }}>
                <button type="button" onClick={handleRefresh} style={{
                  padding: "8px 16px", borderRadius: 8,
                  border: "0.5px solid #E2E8F0", backgroundColor: "white",
                  fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer",
                }}>
                  Regenerate
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
