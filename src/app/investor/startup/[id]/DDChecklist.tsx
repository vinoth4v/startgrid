"use client";

import { useState } from "react";
import { getDDChecklist, saveDDChecklist, type DDItem } from "@/app/actions/due-diligence";

interface Props {
  startupId: string;
  companyName: string;
}

export default function DDChecklist({ startupId, companyName }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<DDItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleOpen() {
    setOpen(true);
    if (items) return;
    setLoading(true);
    const list = await getDDChecklist(startupId);
    setItems(list);
    setLoading(false);
  }

  async function toggle(id: string) {
    if (!items) return;
    const updated = items.map(i => i.id === id ? { ...i, done: !i.done } : i);
    setItems(updated);
    setSaving(true);
    await saveDDChecklist(startupId, updated);
    setSaving(false);
  }

  const doneCount = items?.filter(i => i.done).length ?? 0;
  const total = items?.length ?? 0;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <>
      <button type="button" onClick={handleOpen} style={{
        padding: "9px 18px", borderRadius: 9,
        border: "0.5px solid #E2E8F0", backgroundColor: "white",
        fontSize: 13, fontWeight: 600, color: "#475569",
        cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
      }}>
        ☑ Due Diligence
        {items && total > 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 20,
            backgroundColor: pct === 100 ? "#ECFDF5" : "#F1F5F9",
            color: pct === 100 ? "#059669" : "#64748B",
          }}>
            {pct}%
          </span>
        )}
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
            width: "100%", maxWidth: 520, maxHeight: "85vh",
            overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}>
            {/* Header */}
            <div style={{
              padding: "20px 24px", borderBottom: "0.5px solid #E2E8F0",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Due Diligence
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                  {companyName}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {total > 0 && (
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: pct === 100 ? "#059669" : "#0F172A" }}>
                      {pct}%
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: "#94A3B8" }}>{doneCount}/{total} done</p>
                  </div>
                )}
                <button type="button" onClick={() => setOpen(false)} style={{
                  background: "#F1F5F9", border: "none", color: "#64748B",
                  width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
                  fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                }}>×</button>
              </div>
            </div>

            {/* Progress bar */}
            {total > 0 && (
              <div style={{ height: 3, backgroundColor: "#F1F5F9" }}>
                <div style={{
                  height: "100%", width: `${pct}%`,
                  background: "linear-gradient(90deg, #4F46E5, #059669)",
                  transition: "width 0.3s ease",
                }} />
              </div>
            )}

            {/* Body */}
            <div style={{ overflowY: "auto", flex: 1, padding: "16px 24px" }}>
              {loading ? (
                <p style={{ textAlign: "center", fontSize: 13, color: "#94A3B8", padding: "32px 0" }}>Loading checklist…</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {(items ?? []).map(item => (
                    <label key={item.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px", borderRadius: 8, cursor: "pointer",
                      backgroundColor: item.done ? "#F0FDF4" : "transparent",
                      transition: "background 0.15s",
                    }}>
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => toggle(item.id)}
                        style={{ width: 16, height: 16, accentColor: "#059669", cursor: "pointer", flexShrink: 0 }}
                      />
                      <span style={{
                        fontSize: 13, fontWeight: 500,
                        color: item.done ? "#059669" : "#334155",
                        textDecoration: item.done ? "line-through" : "none",
                        lineHeight: 1.4,
                      }}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 24px", borderTop: "0.5px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#94A3B8" }}>
                {saving ? "Saving…" : "Auto-saved"}
              </span>
              <button type="button" onClick={() => setOpen(false)} style={{
                padding: "8px 20px", borderRadius: 8,
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
