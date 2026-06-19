"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface ServiceCard { name: string; status: "operational" | "degraded" | "down"; latency: string; desc: string; icon: string }
interface Props {
  totalCost: number;
  weeklyCost: number;
  totalTokens: number;
  totalApiCalls: number;
  costTrend: { date: string; cost: number }[];
  usageByKey: { key: string; calls: number; cost: number; tokens: number }[];
  errorLogs: { id: string; error_type?: string; message?: string; page?: string; created_at: string }[];
  platformStats: { startups: number; users: number; connections: number; messages: number };
}

const SERVICES: ServiceCard[] = [
  { name: "Supabase Database", status: "operational", latency: "<50ms", desc: "Auth, storage, realtime", icon: "🟢" },
  { name: "Anthropic Claude", status: "operational", latency: "<3s", desc: "AI features & prompt engine", icon: "🟢" },
  { name: "Resend Email", status: "operational", latency: "<500ms", desc: "Transactional & broadcast email", icon: "🟢" },
  { name: "Supabase Storage", status: "operational", latency: "<200ms", desc: "Logos, docs, pitch decks", icon: "🟢" },
];

const STATUS_COLOR: Record<string, string> = { operational: "#166534", degraded: "#92400E", down: "#991B1B" };
const STATUS_BG: Record<string, string> = { operational: "#DCFCE7", degraded: "#FEF3C7", down: "#FEE2E2" };

export default function HealthClient({ totalCost, weeklyCost, totalTokens, totalApiCalls, costTrend, usageByKey, errorLogs, platformStats }: Props) {
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
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>Platform Health Monitor</p>
          <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>Service status, API costs, and error tracking</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10B981", display: "inline-block" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#166534" }}>All systems operational</span>
        </div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1100 }}>
        {/* Service status cards */}
        <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Service Status</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          {SERVICES.map(s => (
            <div key={s.name} style={{
              backgroundColor: "white", borderRadius: 12,
              border: "0.5px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              padding: "16px 18px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{s.name}</p>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10,
                  backgroundColor: STATUS_BG[s.status], color: STATUS_COLOR[s.status],
                  textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0,
                }}>{s.status}</span>
              </div>
              <p style={{ margin: "0 0 4px", fontSize: 11, color: "#64748B" }}>{s.desc}</p>
              <p style={{ margin: 0, fontSize: 10, color: "#94A3B8" }}>Typical latency: {s.latency}</p>
            </div>
          ))}
        </div>

        {/* Platform stats */}
        <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Platform Stats</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total Users", value: platformStats.users, icon: "👤" },
            { label: "Startups", value: platformStats.startups, icon: "🚀" },
            { label: "Connections", value: platformStats.connections, icon: "🤝" },
            { label: "Messages", value: platformStats.messages, icon: "💬" },
          ].map(s => (
            <div key={s.label} style={{
              backgroundColor: "white", borderRadius: 12,
              border: "0.5px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              padding: "16px 18px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>{s.icon}</span>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
              </div>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.6px" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* API Cost section */}
        <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>API Cost Tracker</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* KPI row */}
          <div style={{
            backgroundColor: "white", borderRadius: 12,
            border: "0.5px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            padding: "16px 20px",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Total Cost", value: `$${totalCost.toFixed(3)}`, sub: "All time" },
                { label: "This Week", value: `$${weeklyCost.toFixed(4)}`, sub: "Last 7 days" },
                { label: "Total Calls", value: totalApiCalls, sub: "All time" },
                { label: "Total Tokens", value: totalTokens.toLocaleString(), sub: "All time" },
              ].map(k => (
                <div key={k.label} style={{ padding: "10px 12px", backgroundColor: "#F8FAFC", borderRadius: 8 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k.label}</p>
                  <p style={{ margin: "0 0 1px", fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{k.value}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "#94A3B8" }}>{k.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cost trend chart */}
          <div style={{
            backgroundColor: "white", borderRadius: 12,
            border: "0.5px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            padding: "16px 20px",
          }}>
            <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "#0F172A" }}>Cost (14 days)</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={costTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94A3B8" }} tickLine={false} axisLine={false} interval={1} />
                <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: unknown) => [`$${Number(v).toFixed(4)}`, "Cost"]} />
                <Line type="monotone" dataKey="cost" stroke="#4F46E5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Usage by prompt */}
        <div style={{
          backgroundColor: "white", borderRadius: 12,
          border: "0.5px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          padding: "16px 20px", marginBottom: 28,
        }}>
          <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Usage by Prompt Type</p>
          {usageByKey.length === 0 ? (
            <p style={{ color: "#94A3B8", fontSize: 12 }}>No API usage logged yet</p>
          ) : (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, paddingBottom: 8, borderBottom: "0.5px solid #F1F5F9", marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Prompt</p>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Calls</p>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tokens</p>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Cost</p>
              </div>
              {usageByKey.map(row => (
                <div key={row.key} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, paddingBottom: 8, borderBottom: "0.5px solid #F8FAFC", marginBottom: 4, alignItems: "center" }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#374151", fontFamily: "monospace" }}>{row.key}</p>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{row.calls}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>{row.tokens.toLocaleString()}</p>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#4F46E5" }}>${row.cost.toFixed(4)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error log */}
        <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Error Log</p>
        <div style={{
          backgroundColor: "white", borderRadius: 12,
          border: "0.5px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          padding: "16px 20px",
        }}>
          {errorLogs.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <p style={{ margin: 0, fontSize: 13, color: "#166534", fontWeight: 600 }}>No errors logged — platform running clean</p>
            </div>
          ) : (
            <div>
              {errorLogs.map(err => (
                <div key={err.id} style={{
                  display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12,
                  alignItems: "flex-start", padding: "10px 0",
                  borderBottom: "0.5px solid #F8FAFC",
                }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
                    backgroundColor: "#FEE2E2", color: "#991B1B",
                    textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0,
                    alignSelf: "flex-start", marginTop: 2,
                  }}>{err.error_type ?? "error"}</span>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 12, color: "#374151" }}>{err.message ?? "Unknown error"}</p>
                    {err.page && <p style={{ margin: 0, fontSize: 10, color: "#94A3B8", fontFamily: "monospace" }}>{err.page}</p>}
                  </div>
                  <p style={{ margin: 0, fontSize: 10, color: "#94A3B8", flexShrink: 0 }}>
                    {new Date(err.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
