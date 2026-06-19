"use client";

import { useState, useTransition } from "react";
import { AdminReport, ReportData, generateWeeklyReport } from "@/app/actions/admin-report";

const PRIORITY_COLOR: Record<string, { bg: string; color: string }> = {
  High: { bg: "#FEE2E2", color: "#991B1B" },
  Medium: { bg: "#FEF3C7", color: "#92400E" },
  Low: { bg: "#DCFCE7", color: "#166534" },
};

interface Props { history: AdminReport[] }

export default function ReportClient({ history: initial }: Props) {
  const [history, setHistory] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const selected = history.find(r => r.id === selectedId);
  const report = selected?.report_data as ReportData | undefined;

  function handleGenerate() {
    setError("");
    startTransition(async () => {
      const result = await generateWeeklyReport();
      if (result.error) {
        setError(result.error);
      } else if (result.report) {
        setHistory(prev => [result.report!, ...prev]);
        setSelectedId(result.report!.id);
      }
    });
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div style={{ display: "flex", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Sidebar: report history */}
      <div style={{
        width: 260, flexShrink: 0,
        backgroundColor: "white", borderRight: "0.5px solid #E2E8F0",
        overflowY: "auto", minHeight: "100vh",
        position: "sticky", top: 0, height: "100vh",
      }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: "0.5px solid #E2E8F0" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Report History</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748B" }}>{history.length} reports generated</p>
        </div>

        <div style={{ padding: "10px 8px" }}>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isPending}
            style={{
              width: "100%", padding: "9px 12px", borderRadius: 8, border: "none",
              backgroundColor: isPending ? "#94A3B8" : "#4F46E5",
              color: "white", fontSize: 12, fontWeight: 700, cursor: isPending ? "not-allowed" : "pointer",
              marginBottom: 10,
            }}
          >
            {isPending ? "Generating…" : "Generate This Week's Report"}
          </button>
          {error && <p style={{ margin: "0 0 8px", fontSize: 11, color: "#EF4444" }}>{error}</p>}
        </div>

        {history.map(r => (
          <button
            key={r.id}
            type="button"
            onClick={() => setSelectedId(r.id)}
            style={{
              width: "100%", textAlign: "left", padding: "10px 16px",
              border: "none", borderBottom: "0.5px solid #F8FAFC",
              backgroundColor: selectedId === r.id ? "#EEF2FF" : "transparent",
              cursor: "pointer",
              borderLeft: selectedId === r.id ? "3px solid #4F46E5" : "3px solid transparent",
            }}
          >
            <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: selectedId === r.id ? 700 : 500, color: selectedId === r.id ? "#4F46E5" : "#374151" }}>
              {r.period_start} → {r.period_end}
            </p>
            <p style={{ margin: 0, fontSize: 10, color: "#94A3B8" }}>
              {new Date(r.generated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </button>
        ))}

        {history.length === 0 && (
          <p style={{ padding: "12px 16px", fontSize: 12, color: "#94A3B8" }}>No reports yet. Generate your first report above.</p>
        )}
      </div>

      {/* Main report view */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Header */}
        <div style={{
          backgroundColor: "white", borderBottom: "0.5px solid #E2E8F0",
          padding: "0 32px", height: 56,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>Admin Intelligence Report</p>
            {selected && <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>Period: {selected.period_start} to {selected.period_end}</p>}
          </div>
          {selected && (
            <button type="button" onClick={handlePrint} style={{
              padding: "7px 14px", borderRadius: 7, border: "0.5px solid #E2E8F0",
              backgroundColor: "white", color: "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>Download PDF</button>
          )}
        </div>

        {!report ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", color: "#94A3B8" }}>
            <p style={{ fontSize: 36, marginBottom: 8 }}>📈</p>
            <p style={{ fontSize: 13, margin: "0 0 20px" }}>No report selected</p>
            <button type="button" onClick={handleGenerate} disabled={isPending} style={{
              padding: "10px 24px", borderRadius: 8, border: "none",
              backgroundColor: isPending ? "#94A3B8" : "#4F46E5",
              color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              {isPending ? "Generating…" : "Generate First Report"}
            </button>
          </div>
        ) : (
          <div style={{ padding: "28px 40px", maxWidth: 760 }}>
            {/* Executive Summary */}
            <div style={{
              backgroundColor: "#0C1E35", borderRadius: 14,
              padding: "22px 28px", marginBottom: 24,
            }}>
              <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, color: "#A5B4FC", textTransform: "uppercase", letterSpacing: "0.08em" }}>Executive Summary</p>
              <p style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "-0.3px" }}>Weekly Platform Intelligence Report</p>
              <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                {(report.executiveSummary ?? []).map((bullet, i) => (
                  <li key={i} style={{ color: "#CBD5E1", fontSize: 13, lineHeight: 1.7, marginBottom: 4 }}>{bullet}</li>
                ))}
              </ul>
            </div>

            {/* Growth Analysis */}
            <Section title="Growth Analysis" icon="📈">
              <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.8 }}>{report.growthAnalysis}</p>
            </Section>

            {/* Quality Assessment */}
            <Section title="Quality Assessment" icon="⭐">
              <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.8 }}>{report.qualityAssessment}</p>
            </Section>

            {/* Matchmaking opportunities */}
            {(report.matchmakingOpportunities ?? []).length > 0 && (
              <Section title="Matchmaking Opportunities" icon="⚡">
                {report.matchmakingOpportunities.map((opp, i) => (
                  <div key={i} style={{
                    padding: "12px 14px", backgroundColor: "#EEF2FF", borderRadius: 8, marginBottom: 8,
                    borderLeft: "3px solid #4F46E5",
                  }}>
                    <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "#3730A3" }}>{opp.startup} × {opp.investor}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#4338CA" }}>{opp.reason}</p>
                  </div>
                ))}
              </Section>
            )}

            {/* Recommended actions */}
            {(report.recommendedActions ?? []).length > 0 && (
              <Section title="Recommended Actions" icon="🎯">
                {report.recommendedActions.map((action, i) => {
                  const pc = PRIORITY_COLOR[action.priority] ?? PRIORITY_COLOR.Medium;
                  return (
                    <div key={i} style={{
                      padding: "12px 14px", backgroundColor: "#F8FAFC", borderRadius: 8, marginBottom: 8,
                      display: "flex", gap: 12, alignItems: "flex-start",
                    }}>
                      <span style={{
                        fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 4,
                        backgroundColor: pc.bg, color: pc.color,
                        textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0, marginTop: 2,
                      }}>{action.priority}</span>
                      <div>
                        <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "#374151" }}>{action.action}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#64748B" }}>{action.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </Section>
            )}

            {/* Platform Health */}
            <Section title="Platform Health" icon="❤️">
              <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.8 }}>{report.platformHealth}</p>
            </Section>

            {/* Trend Forecast */}
            <Section title="Trend Forecast" icon="🔮">
              <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.8 }}>{report.trendForecast}</p>
            </Section>

            <p style={{ margin: "24px 0 0", fontSize: 10, color: "#CBD5E1", textAlign: "center" }}>
              Generated by StartGrid AI · {selected && new Date(selected.generated_at).toLocaleString("en-GB")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: "white", border: "0.5px solid #E2E8F0", borderRadius: 12,
      padding: "18px 22px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{title}</p>
      </div>
      {children}
    </div>
  );
}
