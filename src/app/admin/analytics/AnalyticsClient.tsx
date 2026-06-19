"use client";

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface KPI { label: string; value: string | number; sub?: string; icon: string; color: string }
interface DayPoint { date: string; startups: number; investors: number }
interface ConnPoint { date: string; requests: number; accepted: number }
interface SectorItem { name: string; value: number }
interface StageItem { name: string; count: number }
interface AIItem { prompt_key: string; calls: number; cost: number }
interface GeoItem { country: string; count: number }

interface Props {
  kpis: KPI[];
  signupsByDay: DayPoint[];
  connectionsByDay: ConnPoint[];
  topSectors: SectorItem[];
  stageBreakdown: StageItem[];
  aiUsage: AIItem[];
  geoBreakdown: GeoItem[];
  totalApiCost: number;
  weeklyApiCost: number;
  avgConnectionRate: number;
}

const PIE_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#84CC16"];

export default function AnalyticsClient(props: Props) {
  const {
    kpis, signupsByDay, connectionsByDay, topSectors,
    stageBreakdown, aiUsage, geoBreakdown, totalApiCost, weeklyApiCost,
  } = props;

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
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>Analytics Dashboard</p>
          <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>Platform growth, engagement, and AI usage</p>
        </div>
        <span style={{ fontSize: 11, color: "#94A3B8" }}>Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1200 }}>
        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          {kpis.map(k => (
            <div key={k.label} style={{
              backgroundColor: "white", borderRadius: 12,
              border: "0.5px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              padding: "18px 20px",
              borderTop: `3px solid ${k.color}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{k.icon}</span>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
              </div>
              <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.8px" }}>{k.value}</p>
              {k.sub && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94A3B8" }}>{k.sub}</p>}
            </div>
          ))}
        </div>

        {/* Row 1: Signups over time */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{
            backgroundColor: "white", borderRadius: 12,
            border: "0.5px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            padding: "20px",
          }}>
            <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>New Signups (30 days)</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={signupsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6, border: "0.5px solid #E2E8F0" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="startups" stroke="#10B981" strokeWidth={2} dot={false} name="Startups" />
                <Line type="monotone" dataKey="investors" stroke="#4F46E5" strokeWidth={2} dot={false} name="Investors" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            backgroundColor: "white", borderRadius: 12,
            border: "0.5px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            padding: "20px",
          }}>
            <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Sector Distribution</p>
            <p style={{ margin: "0 0 12px", fontSize: 11, color: "#94A3B8" }}>Startups by sector</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={topSectors} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(props) => `${props.name ?? ""} ${(((props.percent as number | undefined) ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                  {topSectors.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Connections + Stage breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{
            backgroundColor: "white", borderRadius: 12,
            border: "0.5px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            padding: "20px",
          }}>
            <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Connection Activity (30 days)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={connectionsByDay} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                <Legend iconType="rect" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="requests" fill="#C7D2FE" name="Requests" radius={[3, 3, 0, 0]} />
                <Bar dataKey="accepted" fill="#4F46E5" name="Accepted" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            backgroundColor: "white", borderRadius: 12,
            border: "0.5px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            padding: "20px",
          }}>
            <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Stage Breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stageBreakdown} layout="vertical" barSize={14}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748B" }} tickLine={false} axisLine={false} width={70} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} name="Startups" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 3: AI Usage + Geo */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{
            backgroundColor: "white", borderRadius: 12,
            border: "0.5px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            padding: "20px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>AI Feature Usage</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94A3B8" }}>API calls by prompt type</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0F172A" }}>${totalApiCost.toFixed(2)}</p>
                <p style={{ margin: "1px 0 0", fontSize: 10, color: "#94A3B8" }}>total cost</p>
              </div>
            </div>
            {aiUsage.length === 0 ? (
              <p style={{ color: "#94A3B8", fontSize: 12 }}>No AI usage yet</p>
            ) : (
              <div>
                {aiUsage.map((item, i) => (
                  <div key={item.prompt_key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                    <p style={{ margin: 0, flex: 1, fontSize: 12, color: "#374151" }}>{item.prompt_key.replace(/_/g, " ")}</p>
                    <span style={{ fontSize: 11, color: "#64748B" }}>{item.calls} calls</span>
                    <span style={{ fontSize: 11, color: "#94A3B8", minWidth: 60, textAlign: "right" }}>${Number(item.cost).toFixed(3)}</span>
                  </div>
                ))}
                <div style={{ borderTop: "0.5px solid #F1F5F9", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>This week</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#4F46E5" }}>${weeklyApiCost.toFixed(3)}</span>
                </div>
              </div>
            )}
          </div>

          <div style={{
            backgroundColor: "white", borderRadius: 12,
            border: "0.5px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            padding: "20px",
          }}>
            <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Geographic Distribution</p>
            {geoBreakdown.length === 0 ? (
              <p style={{ color: "#94A3B8", fontSize: 12 }}>No geographic data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={geoBreakdown.slice(0, 8)} layout="vertical" barSize={14}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="country" tick={{ fontSize: 10, fill: "#64748B" }} tickLine={false} axisLine={false} width={90} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} name="Startups" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Row 4: Platform health summary */}
        <div style={{
          backgroundColor: "white", borderRadius: 12,
          border: "0.5px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          padding: "20px",
        }}>
          <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Quick Stats</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {[
              { label: "Avg connection rate", value: `${props.avgConnectionRate.toFixed(1)}%`, desc: "requests → accepted" },
              { label: "Total AI cost", value: `$${totalApiCost.toFixed(2)}`, desc: "all time" },
              { label: "This week AI cost", value: `$${weeklyApiCost.toFixed(3)}`, desc: "last 7 days" },
              { label: "Top sector", value: topSectors[0]?.name ?? "—", desc: `${topSectors[0]?.value ?? 0} startups` },
              { label: "Top country", value: geoBreakdown[0]?.country ?? "—", desc: `${geoBreakdown[0]?.count ?? 0} startups` },
            ].map(s => (
              <div key={s.label} style={{ padding: "12px 14px", backgroundColor: "#F8FAFC", borderRadius: 8 }}>
                <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
                <p style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 700, color: "#0F172A" }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: 10, color: "#94A3B8" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
