"use client";

import { useState, useTransition } from "react";
import { addMilestone, type Milestone, type MilestoneType } from "@/app/actions/milestones";

const MILESTONE_TYPES: { value: MilestoneType; emoji: string; label: string }[] = [
  { value: "first_revenue", emoji: "🎉", label: "First revenue" },
  { value: "new_customer", emoji: "🤝", label: "New customer signed" },
  { value: "team_hire", emoji: "👥", label: "Key team hire" },
  { value: "product_launch", emoji: "🚀", label: "Product launched" },
  { value: "funding_closed", emoji: "💰", label: "Funding closed" },
  { value: "partnership", emoji: "🤜", label: "Partnership announced" },
  { value: "other", emoji: "📌", label: "Other" },
];

function typeInfo(type: MilestoneType) {
  return MILESTONE_TYPES.find(t => t.value === type) ?? MILESTONE_TYPES[6];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

interface Props {
  startupId: string;
  initialMilestones: Milestone[];
}

export default function MilestonesSection({ initialMilestones }: Props) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState<MilestoneType>("product_launch");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openModal() { setModalOpen(true); setFormError(null); setTitle(""); setDescription(""); }
  function closeModal() { setModalOpen(false); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setFormError("Title is required."); return; }
    startTransition(async () => {
      const result = await addMilestone(type, title, description, date);
      if (result.error) { setFormError(result.error); return; }
      const info = typeInfo(type);
      setMilestones(prev => [{
        id: Math.random().toString(),
        startup_id: "",
        type,
        title: title.trim(),
        description: description.trim() || null,
        date,
        created_at: new Date().toISOString(),
      }, ...prev]);
      closeModal();
    });
  }

  return (
    <>
      <div style={{
        backgroundColor: "white", borderRadius: 12,
        border: "0.5px solid #E2E8F0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        padding: "20px",
        marginTop: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Milestones
            </p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Share your progress</p>
          </div>
          <button
            type="button"
            onClick={openModal}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 8,
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              border: "none", color: "white", fontSize: 12, fontWeight: 600,
              cursor: "pointer", boxShadow: "0 2px 8px rgba(79,70,229,0.25)",
            }}
          >
            + Add milestone
          </button>
        </div>

        {milestones.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#94A3B8" }}>
            <p style={{ fontSize: 24, margin: "0 0 8px" }}>🏁</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0F172A" }}>No milestones yet</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94A3B8" }}>
              Post your first milestone to show investors your momentum.
            </p>
          </div>
        ) : (
          <div style={{ position: "relative", paddingLeft: 24 }}>
            {/* Vertical line */}
            <div style={{
              position: "absolute", left: 7, top: 8, bottom: 8,
              width: 1.5, backgroundColor: "#E2E8F0",
            }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {milestones.map(m => {
                const info = typeInfo(m.type);
                return (
                  <div key={m.id} style={{ display: "flex", gap: 14, position: "relative" }}>
                    <div style={{
                      position: "absolute", left: -24, top: 2,
                      width: 16, height: 16, borderRadius: "50%",
                      backgroundColor: "#EEF2FF", border: "2px solid #C7D2FE",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, flexShrink: 0,
                    }}>
                      {info.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{m.title}</span>
                        <span style={{ fontSize: 10, color: "#94A3B8", flexShrink: 0 }}>{formatDate(m.date)}</span>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 500, color: "#4F46E5",
                        backgroundColor: "#EEF2FF", borderRadius: 20, padding: "2px 8px",
                        display: "inline-block", marginBottom: m.description ? 4 : 0,
                      }}>
                        {info.emoji} {info.label}
                      </span>
                      {m.description && (
                        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>
                          {m.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            backgroundColor: "white", borderRadius: 14,
            padding: 28, width: "100%", maxWidth: 480,
            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>
              Add a milestone
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Type */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  Milestone type
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as MilestoneType)}
                  style={{
                    width: "100%", padding: "9px 12px", borderRadius: 8,
                    border: "0.5px solid #D1D5DB", fontSize: 13, color: "#374151",
                    backgroundColor: "white", cursor: "pointer", outline: "none",
                  }}
                >
                  {MILESTONE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  What happened? <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Closed our first paying customer"
                  style={{
                    width: "100%", padding: "9px 12px", borderRadius: 8,
                    border: "0.5px solid #D1D5DB", fontSize: 13, color: "#374151",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  Tell investors more <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%", padding: "9px 12px", borderRadius: 8,
                    border: "0.5px solid #D1D5DB", fontSize: 13, color: "#374151",
                    outline: "none", resize: "vertical", boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Date */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{
                    padding: "9px 12px", borderRadius: 8,
                    border: "0.5px solid #D1D5DB", fontSize: 13, color: "#374151",
                    outline: "none",
                  }}
                />
              </div>

              {formError && (
                <p style={{ margin: 0, fontSize: 12, color: "#EF4444" }}>{formError}</p>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button type="button" onClick={closeModal} style={{
                  padding: "9px 18px", borderRadius: 8,
                  border: "0.5px solid #E2E8F0", backgroundColor: "white",
                  fontSize: 13, fontWeight: 600, color: "#475569",
                  cursor: "pointer",
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={isPending} style={{
                  padding: "9px 20px", borderRadius: 8,
                  background: isPending ? "#A5B4FC" : "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  border: "none", color: "white", fontSize: 13, fontWeight: 600,
                  cursor: isPending ? "not-allowed" : "pointer",
                  boxShadow: isPending ? "none" : "0 2px 8px rgba(79,70,229,0.25)",
                }}>
                  {isPending ? "Posting…" : "Post milestone →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
