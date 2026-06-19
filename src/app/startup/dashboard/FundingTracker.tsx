"use client";

import { useState } from "react";

interface Props {
  startupId: string;
  initialGoal: string | null;
  initialRaised: string | null;
  initialStatus: string | null;
}

function parseMoney(val: string): number {
  if (!val) return 0;
  const s = val.replace(/[$,\s]/g, "").toUpperCase();
  if (s.endsWith("M")) return parseFloat(s) * 1_000_000;
  if (s.endsWith("K")) return parseFloat(s) * 1_000;
  return parseFloat(s) || 0;
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

import { updateFundingRound } from "@/app/actions/funding";

export default function FundingTracker({ startupId, initialGoal, initialRaised, initialStatus }: Props) {
  const [goal, setGoal] = useState(initialGoal ?? "");
  const [raised, setRaised] = useState(initialRaised ?? "");
  const [status, setStatus] = useState(initialStatus ?? "open");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const goalN = parseMoney(goal);
  const raisedN = parseMoney(raised);
  const pct = goalN > 0 ? Math.min(100, Math.round((raisedN / goalN) * 100)) : 0;

  async function save() {
    setSaving(true);
    await updateFundingRound(startupId, goal, raised, status);
    setSaving(false);
    setEditing(false);
  }

  const statusColor: Record<string, string> = {
    open: "#4F46E5", closing: "#D97706", closed: "#059669",
  };

  if (!goal && !editing) {
    return (
      <div style={{
        backgroundColor: "white", borderRadius: 12,
        border: "0.5px solid #E2E8F0", padding: "20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>💰 Funding Round</p>
          <button type="button" onClick={() => setEditing(true)} style={{
            padding: "6px 12px", borderRadius: 7, cursor: "pointer",
            border: "0.5px solid #E2E8F0", backgroundColor: "white",
            fontSize: 12, fontWeight: 600, color: "#4F46E5",
          }}>
            Set up →
          </button>
        </div>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94A3B8" }}>Track your current fundraising round progress.</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: "white", borderRadius: 12,
      border: "0.5px solid #E2E8F0", padding: "20px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>💰 Funding Round</p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!editing && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
              backgroundColor: `${statusColor[status] ?? "#4F46E5"}15`,
              color: statusColor[status] ?? "#4F46E5",
              border: `0.5px solid ${statusColor[status] ?? "#4F46E5"}40`,
              textTransform: "capitalize",
            }}>
              {status}
            </span>
          )}
          <button type="button" onClick={() => setEditing(v => !v)} style={{
            padding: "5px 10px", borderRadius: 7, cursor: "pointer",
            border: "0.5px solid #E2E8F0", backgroundColor: "white",
            fontSize: 11, fontWeight: 600, color: "#64748B",
          }}>
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 5px", fontSize: 11, fontWeight: 600, color: "#64748B" }}>Funding goal</p>
              <input type="text" value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. $2M" style={{
                width: "100%", padding: "9px 12px", borderRadius: 8, border: "0.5px solid #E2E8F0",
                fontSize: 13, color: "#334155", outline: "none", boxSizing: "border-box", backgroundColor: "#F8FAFC",
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 5px", fontSize: 11, fontWeight: 600, color: "#64748B" }}>Amount raised</p>
              <input type="text" value={raised} onChange={e => setRaised(e.target.value)} placeholder="e.g. $500K" style={{
                width: "100%", padding: "9px 12px", borderRadius: 8, border: "0.5px solid #E2E8F0",
                fontSize: 13, color: "#334155", outline: "none", boxSizing: "border-box", backgroundColor: "#F8FAFC",
              }} />
            </div>
          </div>
          <div>
            <p style={{ margin: "0 0 5px", fontSize: 11, fontWeight: 600, color: "#64748B" }}>Round status</p>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{
              padding: "9px 12px", borderRadius: 8, border: "0.5px solid #E2E8F0",
              fontSize: 13, color: "#334155", outline: "none", backgroundColor: "#F8FAFC",
            }}>
              <option value="open">Open</option>
              <option value="closing">Closing soon</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <button type="button" onClick={save} disabled={saving} style={{
            padding: "9px 20px", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer",
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            border: "none", color: "white", fontSize: 13, fontWeight: 600,
            opacity: saving ? 0.7 : 1, alignSelf: "flex-start",
          }}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>
              {raisedN > 0 ? formatMoney(raisedN) : "Nothing raised yet"} raised
            </span>
            {goalN > 0 && (
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                {pct}% of {formatMoney(goalN)}
              </span>
            )}
          </div>
          {goalN > 0 && (
            <div style={{ height: 8, backgroundColor: "#EEF2FF", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${pct}%`,
                background: pct === 100 ? "linear-gradient(90deg, #059669, #10B981)" : "linear-gradient(90deg, #4F46E5, #7C3AED)",
                borderRadius: 4, transition: "width 0.4s ease",
              }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
