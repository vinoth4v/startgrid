"use client";

import { useState } from "react";
import { submitFeedback } from "@/app/actions/feedback";

interface Props {
  startupId: string;
  companyName: string;
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: "overall_rating", label: "Overall impression" },
  { key: "team_rating", label: "Team" },
  { key: "market_rating", label: "Market opportunity" },
  { key: "product_rating", label: "Product / solution" },
];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 22, color: (hover || value) >= n ? "#F59E0B" : "#E2E8F0",
            padding: 0, lineHeight: 1,
          }}
        >★</button>
      ))}
    </div>
  );
}

export default function FeedbackModal({ startupId, companyName }: Props) {
  const [open, setOpen] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({
    overall_rating: 0, team_rating: 0, market_rating: 0, product_rating: 0,
  });
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (Object.values(ratings).some(v => v === 0)) return;
    setSubmitting(true);
    await submitFeedback(startupId, {
      overall_rating: ratings.overall_rating,
      team_rating: ratings.team_rating,
      market_rating: ratings.market_rating,
      product_rating: ratings.product_rating,
      comment,
    });
    setSubmitting(false);
    setDone(true);
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={{
        padding: "9px 18px", borderRadius: 9,
        border: "0.5px solid #E2E8F0", backgroundColor: "white",
        fontSize: 13, fontWeight: 600, color: "#475569",
        cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
      }}>
        ★ Leave feedback
      </button>

      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          backgroundColor: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }} onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={{
            backgroundColor: "white", borderRadius: 16,
            width: "100%", maxWidth: 480,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{
              padding: "20px 24px", borderBottom: "0.5px solid #E2E8F0",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Anonymous</p>
                <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Rate {companyName}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} style={{
                background: "#F1F5F9", border: "none", color: "#64748B",
                width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 14,
              }}>×</button>
            </div>

            <div style={{ padding: "24px" }}>
              {done ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <p style={{ fontSize: 32, margin: "0 0 12px" }}>✓</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>Feedback submitted</p>
                  <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>Your anonymous rating has been recorded.</p>
                  <button type="button" onClick={() => setOpen(false)} style={{
                    marginTop: 20, padding: "9px 20px", borderRadius: 8,
                    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                    border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>
                    Close
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {CATEGORIES.map(cat => (
                    <div key={cat.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{cat.label}</span>
                      <StarRating value={ratings[cat.key]} onChange={v => setRatings(r => ({ ...r, [cat.key]: v }))} />
                    </div>
                  ))}

                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: "#64748B" }}>Comments (optional)</p>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Any specific thoughts on the pitch or product?"
                      rows={3}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: 8,
                        border: "0.5px solid #E2E8F0", fontSize: 13, color: "#334155",
                        resize: "none", outline: "none", boxSizing: "border-box",
                        fontFamily: "inherit", backgroundColor: "#F8FAFC",
                      }}
                    />
                  </div>

                  <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>
                    🔒 Your identity is kept anonymous. Startups see aggregate ratings only.
                  </p>

                  <button type="button" onClick={handleSubmit} disabled={submitting || Object.values(ratings).some(v => v === 0)} style={{
                    padding: "10px 20px", borderRadius: 9,
                    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                    border: "none", color: "white", fontSize: 13, fontWeight: 600,
                    cursor: Object.values(ratings).some(v => v === 0) ? "not-allowed" : "pointer",
                    opacity: Object.values(ratings).some(v => v === 0) || submitting ? 0.6 : 1,
                  }}>
                    {submitting ? "Submitting…" : "Submit feedback"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
