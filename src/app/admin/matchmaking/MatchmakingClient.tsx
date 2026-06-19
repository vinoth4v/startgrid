"use client";

import { useState, useTransition } from "react";
import { MatchPair, generateMatchReasoning, introduceMatch } from "@/app/actions/matchmaking";

const SCORE_COLOR = (s: number) => s >= 80 ? "#166534" : s >= 60 ? "#92400E" : "#3730A3";
const SCORE_BG = (s: number) => s >= 80 ? "#DCFCE7" : s >= 60 ? "#FEF3C7" : "#E0E7FF";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  suggested: { bg: "#F1F5F9", color: "#64748B" },
  introduced: { bg: "#DCFCE7", color: "#166534" },
  connected: { bg: "#EEF2FF", color: "#4F46E5" },
  archived: { bg: "#F1F5F9", color: "#94A3B8" },
};

interface LocalPair extends MatchPair {
  localReasoning?: string;
  localAlignmentPoints?: string[];
  localConcerns?: string[];
  localStatus?: string;
}

interface Props { pairs: MatchPair[] }

export default function MatchmakingClient({ pairs: initial }: Props) {
  const [pairs, setPairs] = useState<LocalPair[]>(initial);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [filterScore, setFilterScore] = useState(40);
  const [filterStatus, setFilterStatus] = useState("all");
  const [reasoningId, setReasoningId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [introducing, setIntroducing] = useState<string | null>(null);
  const [introSent, setIntroSent] = useState<Set<string>>(new Set());

  const key = (p: MatchPair) => `${p.startupId}:${p.investorId}`;

  const filtered = pairs.filter(p => {
    if (p.score < filterScore) return false;
    if (filterStatus !== "all" && (p.localStatus ?? p.status) !== filterStatus) return false;
    return true;
  });

  const selected = selectedKey ? pairs.find(p => key(p) === selectedKey) : null;

  async function handleReasoning(pair: LocalPair) {
    const k = key(pair);
    setReasoningId(k);
    const result = await generateMatchReasoning(pair.startupId, pair.investorId);
    if (!result.error) {
      setPairs(prev => prev.map(p => key(p) === k
        ? { ...p, localReasoning: result.reasoning, localAlignmentPoints: result.alignmentPoints, localConcerns: result.concerns }
        : p
      ));
    }
    setReasoningId(null);
  }

  async function handleIntroduce(pair: LocalPair) {
    const k = key(pair);
    setIntroducing(k);
    const reasoning = pair.localReasoning ?? pair.aiReasoning ?? "";
    await introduceMatch(
      pair.startupId, pair.investorId,
      pair.startupEmail, pair.investorEmail,
      pair.startupName, pair.investorName, pair.investorFirm,
      reasoning
    );
    setIntroSent(prev => new Set(prev).add(k));
    setPairs(prev => prev.map(p => key(p) === k ? { ...p, localStatus: "introduced" } : p));
    setIntroducing(null);
  }

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
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>Smart Matchmaking Engine</p>
          <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>AI-powered startup–investor pair analysis</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#64748B" }}>Min score:</span>
          <select
            value={filterScore}
            onChange={e => setFilterScore(Number(e.target.value))}
            style={{ padding: "5px 8px", borderRadius: 6, border: "0.5px solid #E2E8F0", fontSize: 12, outline: "none" }}
          >
            <option value={40}>40+</option>
            <option value={60}>60+</option>
            <option value={80}>80+</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: "5px 8px", borderRadius: 6, border: "0.5px solid #E2E8F0", fontSize: 12, outline: "none" }}
          >
            <option value="all">All statuses</option>
            <option value="suggested">Suggested</option>
            <option value="introduced">Introduced</option>
            <option value="connected">Connected</option>
          </select>
          <span style={{ fontSize: 11, color: "#94A3B8" }}>{filtered.length} pairs</span>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
        {/* List */}
        <div style={{ width: 360, flexShrink: 0, backgroundColor: "white", borderRight: "0.5px solid #E2E8F0", overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <p style={{ padding: "24px 16px", color: "#94A3B8", fontSize: 12 }}>No matches found with current filters</p>
          ) : filtered.map(pair => {
            const k = key(pair);
            const status = pair.localStatus ?? pair.status;
            const statusStyle = STATUS_COLORS[status] ?? STATUS_COLORS.suggested;
            const hasReasoning = pair.localReasoning ?? pair.aiReasoning;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setSelectedKey(k)}
                style={{
                  width: "100%", textAlign: "left", padding: "12px 16px",
                  border: "none", borderBottom: "0.5px solid #F8FAFC",
                  backgroundColor: selectedKey === k ? "#EEF2FF" : "transparent",
                  cursor: "pointer",
                  borderLeft: selectedKey === k ? "3px solid #4F46E5" : "3px solid transparent",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 1px", fontSize: 12, fontWeight: 700, color: selectedKey === k ? "#4F46E5" : "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {pair.startupName}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {pair.investorName}{pair.investorFirm ? ` · ${pair.investorFirm}` : ""}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0, marginLeft: 8 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 800,
                      color: SCORE_COLOR(pair.score),
                      backgroundColor: SCORE_BG(pair.score),
                      padding: "2px 7px", borderRadius: 4,
                    }}>{pair.score}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3,
                      backgroundColor: statusStyle.bg, color: statusStyle.color,
                      textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>{status}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {pair.sector && <span style={{ fontSize: 9, color: "#94A3B8", backgroundColor: "#F8FAFC", padding: "1px 5px", borderRadius: 3 }}>{pair.sector}</span>}
                  {pair.stage && <span style={{ fontSize: 9, color: "#94A3B8", backgroundColor: "#F8FAFC", padding: "1px 5px", borderRadius: 3 }}>{pair.stage}</span>}
                  {hasReasoning && <span style={{ fontSize: 9, color: "#4F46E5", fontWeight: 700 }}>✓ AI scored</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          {!selected ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94A3B8" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>⚡</p>
              <p style={{ fontSize: 13, margin: 0 }}>Select a match pair to analyse</p>
            </div>
          ) : (
            <div style={{ maxWidth: 680 }}>
              {/* Score badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 10,
                  backgroundColor: SCORE_BG(selected.score),
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: SCORE_COLOR(selected.score) }}>{selected.score}</span>
                </div>
                <div>
                  <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Match Score</p>
                  <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{selected.startupName} × {selected.investorName}</h2>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>
                    {selected.investorFirm ? `${selected.investorFirm} · ` : ""}{selected.sector} · {selected.stage} · {selected.country ?? "Unknown"}
                  </p>
                </div>
              </div>

              {/* Match criteria breakdown */}
              <div style={{
                backgroundColor: "white", border: "0.5px solid #E2E8F0", borderRadius: 10,
                padding: "16px 20px", marginBottom: 16,
              }}>
                <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "#374151" }}>Criteria Alignment</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    {
                      label: "Sector",
                      startup: selected.sector,
                      investor: selected.investorSectors,
                      match: !selected.investorSectors.length || selected.investorSectors.includes(selected.sector ?? ""),
                    },
                    {
                      label: "Stage",
                      startup: selected.stage,
                      investor: selected.investorStages,
                      match: !selected.investorStages.length || selected.investorStages.includes(selected.stage ?? ""),
                    },
                    {
                      label: "Geography",
                      startup: selected.country,
                      investor: selected.investorGeos,
                      match: !selected.investorGeos.length || selected.investorGeos.some(g => (selected.country ?? "").toLowerCase().includes(g.toLowerCase())),
                    },
                  ].map(row => (
                    <div key={row.label} style={{ padding: "10px 12px", backgroundColor: "#F8FAFC", borderRadius: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</p>
                        <span style={{ fontSize: 12, color: row.match ? "#10B981" : "#EF4444" }}>{row.match ? "✓" : "✗"}</span>
                      </div>
                      <p style={{ margin: "0 0 2px", fontSize: 12, color: "#374151" }}>Startup: {row.startup ?? "N/A"}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#64748B" }}>Investor: {row.investor.length ? row.investor.join(", ") : "Any"}</p>
                    </div>
                  ))}
                  <div style={{ padding: "10px 12px", backgroundColor: "#F8FAFC", borderRadius: 8 }}>
                    <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Contact</p>
                    <p style={{ margin: "0 0 2px", fontSize: 11, color: "#374151", overflow: "hidden", textOverflow: "ellipsis" }}>S: {selected.startupEmail || "—"}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#374151", overflow: "hidden", textOverflow: "ellipsis" }}>I: {selected.investorEmail || "—"}</p>
                  </div>
                </div>
              </div>

              {/* AI Reasoning */}
              <div style={{
                backgroundColor: "white", border: "0.5px solid #E2E8F0", borderRadius: 10,
                padding: "16px 20px", marginBottom: 16,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#374151" }}>AI Reasoning</p>
                  <button
                    type="button"
                    onClick={() => handleReasoning(selected)}
                    disabled={reasoningId === key(selected)}
                    style={{
                      padding: "5px 12px", borderRadius: 6, border: "none",
                      backgroundColor: reasoningId === key(selected) ? "#94A3B8" : "#4F46E5",
                      color: "white", fontSize: 11, fontWeight: 600,
                      cursor: reasoningId === key(selected) ? "not-allowed" : "pointer",
                    }}
                  >
                    {reasoningId === key(selected) ? "Analysing…" : (selected.localReasoning ?? selected.aiReasoning) ? "Re-analyse" : "Run AI Analysis"}
                  </button>
                </div>

                {(selected.localReasoning ?? selected.aiReasoning) ? (
                  <div>
                    <p style={{ margin: "0 0 14px", fontSize: 13, color: "#374151", lineHeight: 1.6, fontStyle: "italic" }}>
                      "{selected.localReasoning ?? selected.aiReasoning}"
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em" }}>Alignment</p>
                        {(selected.localAlignmentPoints ?? selected.alignmentPoints ?? []).map((pt: string, i: number) => (
                          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                            <span style={{ color: "#10B981", fontSize: 12, flexShrink: 0 }}>✓</span>
                            <p style={{ margin: 0, fontSize: 11, color: "#374151" }}>{pt}</p>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: "#991B1B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Concerns</p>
                        {(selected.localConcerns ?? selected.concerns ?? []).map((c: string, i: number) => (
                          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                            <span style={{ color: "#EF4444", fontSize: 12, flexShrink: 0 }}>✗</span>
                            <p style={{ margin: 0, fontSize: 11, color: "#374151" }}>{c}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 12, color: "#94A3B8" }}>Run AI analysis to get detailed match reasoning</p>
                )}
              </div>

              {/* Introduce button */}
              <div style={{
                backgroundColor: "white", border: "0.5px solid #E2E8F0", borderRadius: 10,
                padding: "16px 20px",
              }}>
                <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#374151" }}>Introduce this pair</p>
                <p style={{ margin: "0 0 14px", fontSize: 11, color: "#64748B" }}>
                  Sends an email to both parties highlighting the match. The startup and investor will see each other on the platform.
                </p>
                {introSent.has(key(selected)) ? (
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#10B981" }}>✓ Introduction sent!</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleIntroduce(selected)}
                    disabled={!!introducing || !selected.startupEmail || !selected.investorEmail}
                    style={{
                      padding: "9px 20px", borderRadius: 7, border: "none",
                      backgroundColor: introducing ? "#94A3B8" : (!selected.startupEmail || !selected.investorEmail) ? "#E2E8F0" : "#0C1E35",
                      color: "white", fontSize: 13, fontWeight: 700,
                      cursor: introducing || !selected.startupEmail || !selected.investorEmail ? "not-allowed" : "pointer",
                    }}
                  >
                    {introducing === key(selected) ? "Sending…" : "✉ Introduce them"}
                  </button>
                )}
                {(!selected.startupEmail || !selected.investorEmail) && (
                  <p style={{ margin: "8px 0 0", fontSize: 11, color: "#EF4444" }}>Missing email for one or both parties</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
