import { createAdminClient } from "@/lib/supabase/admin";
import AnalyticsClient from "./AnalyticsClient";

function formatDay(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default async function AdminAnalyticsPage() {
  const admin = createAdminClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    { count: totalStartups },
    { count: totalInvestors },
    { count: totalConnections },
    { count: totalMessages },
    { count: publishedStartups },
    { data: allStartupProfiles },
    { data: allInvestorProfiles },
    { data: recentConnections },
    { data: rawAIUsage },
    { data: weeklyAIUsage },
  ] = await Promise.all([
    admin.from("startup_profiles").select("*", { count: "exact", head: true }),
    admin.from("investor_profiles").select("*", { count: "exact", head: true }),
    admin.from("connections").select("*", { count: "exact", head: true }).eq("status", "accepted"),
    admin.from("messages").select("*", { count: "exact", head: true }),
    admin.from("startup_profiles").select("*", { count: "exact", head: true }).eq("is_published", true),
    admin.from("startup_profiles").select("sector, stage, country, created_at").order("created_at", { ascending: false }),
    admin.from("investor_profiles").select("created_at").order("created_at", { ascending: false }),
    admin.from("connections").select("status, created_at").gte("created_at", thirtyDaysAgo.toISOString()),
    admin.from("api_usage_log").select("prompt_key, input_tokens, output_tokens, cost_usd"),
    admin.from("api_usage_log").select("prompt_key, cost_usd").gte("created_at", sevenDaysAgo.toISOString()),
  ]);

  // Build 30-day buckets
  const days: Date[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  const dayKeys = days.map(d => d.toISOString().slice(0, 10));
  const startupsByDay: Record<string, number> = {};
  const investorsByDay: Record<string, number> = {};
  dayKeys.forEach(k => { startupsByDay[k] = 0; investorsByDay[k] = 0; });

  (allStartupProfiles ?? []).forEach((s: { created_at: string }) => {
    const k = s.created_at.slice(0, 10);
    if (startupsByDay[k] !== undefined) startupsByDay[k]++;
  });
  (allInvestorProfiles ?? []).forEach((inv: { created_at: string }) => {
    const k = inv.created_at.slice(0, 10);
    if (investorsByDay[k] !== undefined) investorsByDay[k]++;
  });

  const signupsByDay = dayKeys.map((k, i) => ({
    date: formatDay(days[i]),
    startups: startupsByDay[k],
    investors: investorsByDay[k],
  }));

  // Connections by day
  const connRequestsByDay: Record<string, number> = {};
  const connAcceptedByDay: Record<string, number> = {};
  dayKeys.forEach(k => { connRequestsByDay[k] = 0; connAcceptedByDay[k] = 0; });
  (recentConnections ?? []).forEach((c: { status: string; created_at: string }) => {
    const k = c.created_at.slice(0, 10);
    if (connRequestsByDay[k] !== undefined) {
      connRequestsByDay[k]++;
      if (c.status === "accepted") connAcceptedByDay[k]++;
    }
  });
  const connectionsByDay = dayKeys.map((k, i) => ({
    date: formatDay(days[i]),
    requests: connRequestsByDay[k],
    accepted: connAcceptedByDay[k],
  }));

  // Sector breakdown
  const sectorCounts: Record<string, number> = {};
  (allStartupProfiles ?? []).forEach((s: { sector?: string }) => {
    if (!s.sector) return;
    sectorCounts[s.sector] = (sectorCounts[s.sector] ?? 0) + 1;
  });
  const topSectors = Object.entries(sectorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // Stage breakdown
  const stageCounts: Record<string, number> = {};
  (allStartupProfiles ?? []).forEach((s: { stage?: string }) => {
    if (!s.stage) return;
    stageCounts[s.stage] = (stageCounts[s.stage] ?? 0) + 1;
  });
  const stageBreakdown = Object.entries(stageCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  // Geo breakdown
  const geoCounts: Record<string, number> = {};
  (allStartupProfiles ?? []).forEach((s: { country?: string }) => {
    if (!s.country) return;
    geoCounts[s.country] = (geoCounts[s.country] ?? 0) + 1;
  });
  const geoBreakdown = Object.entries(geoCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([country, count]) => ({ country, count }));

  // AI usage
  const aiByKey: Record<string, { calls: number; cost: number }> = {};
  (rawAIUsage ?? []).forEach((row: { prompt_key?: string; cost_usd?: number }) => {
    const k = row.prompt_key ?? "unknown";
    if (!aiByKey[k]) aiByKey[k] = { calls: 0, cost: 0 };
    aiByKey[k].calls++;
    aiByKey[k].cost += row.cost_usd ?? 0;
  });
  const aiUsage = Object.entries(aiByKey)
    .sort((a, b) => b[1].calls - a[1].calls)
    .map(([prompt_key, stats]) => ({ prompt_key, ...stats }));

  const totalApiCost = (rawAIUsage ?? []).reduce((sum: number, r: { cost_usd?: number }) => sum + (r.cost_usd ?? 0), 0);
  const weeklyApiCost = (weeklyAIUsage ?? []).reduce((sum: number, r: { cost_usd?: number }) => sum + (r.cost_usd ?? 0), 0);

  // Connection rate
  const totalReqCount = (recentConnections ?? []).length;
  const acceptedCount = (recentConnections ?? []).filter((c: { status: string }) => c.status === "accepted").length;
  const avgConnectionRate = totalReqCount > 0 ? (acceptedCount / totalReqCount) * 100 : 0;

  const kpis = [
    { label: "Total Startups", value: totalStartups ?? 0, sub: `${publishedStartups ?? 0} published`, icon: "🚀", color: "#10B981" },
    { label: "Total Investors", value: totalInvestors ?? 0, sub: "Active accounts", icon: "💼", color: "#4F46E5" },
    { label: "Connections Made", value: totalConnections ?? 0, sub: "Accepted only", icon: "🤝", color: "#F59E0B" },
    { label: "Messages Sent", value: totalMessages ?? 0, sub: "All time", icon: "💬", color: "#8B5CF6" },
    { label: "AI Calls", value: (rawAIUsage ?? []).length, sub: "All time", icon: "🤖", color: "#06B6D4" },
    { label: "Platform Cost", value: `$${totalApiCost.toFixed(2)}`, sub: "Anthropic API", icon: "💰", color: "#EF4444" },
    { label: "This Week Cost", value: `$${weeklyApiCost.toFixed(3)}`, sub: "Last 7 days", icon: "📅", color: "#EC4899" },
    { label: "Connection Rate", value: `${avgConnectionRate.toFixed(1)}%`, sub: "Request → accept", icon: "📈", color: "#84CC16" },
  ];

  return (
    <AnalyticsClient
      kpis={kpis}
      signupsByDay={signupsByDay}
      connectionsByDay={connectionsByDay}
      topSectors={topSectors}
      stageBreakdown={stageBreakdown}
      aiUsage={aiUsage}
      geoBreakdown={geoBreakdown}
      totalApiCost={totalApiCost}
      weeklyApiCost={weeklyApiCost}
      avgConnectionRate={avgConnectionRate}
    />
  );
}
