export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import HealthClient from "./HealthClient";

export default async function AdminHealthPage() {
  const admin = createAdminClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    { data: usageLogs },
    { data: errorLogs },
    { count: startupCount },
    { count: userCount },
    { count: connectionCount },
    { count: messageCount },
  ] = await Promise.all([
    admin.from("api_usage_log").select("prompt_key, input_tokens, output_tokens, cost_usd, created_at").order("created_at", { ascending: false }).limit(200),
    admin.from("error_log").select("*").order("created_at", { ascending: false }).limit(50),
    admin.from("startup_profiles").select("*", { count: "exact", head: true }),
    admin.auth.admin.listUsers().then(r => ({ count: r.data?.users?.length ?? 0 })),
    admin.from("connections").select("*", { count: "exact", head: true }).eq("status", "accepted"),
    admin.from("messages").select("*", { count: "exact", head: true }),
  ]);

  const totalCost = (usageLogs ?? []).reduce((sum: number, r: { cost_usd?: number }) => sum + (r.cost_usd ?? 0), 0);
  const weeklyLogs = (usageLogs ?? []).filter((r: { created_at: string }) => r.created_at >= sevenDaysAgo.toISOString());
  const weeklyCost = weeklyLogs.reduce((sum: number, r: { cost_usd?: number }) => sum + (r.cost_usd ?? 0), 0);
  const totalTokens = (usageLogs ?? []).reduce((sum: number, r: { input_tokens?: number; output_tokens?: number }) => sum + (r.input_tokens ?? 0) + (r.output_tokens ?? 0), 0);

  // Cost by day (last 14 days)
  const costByDay: Record<string, number> = {};
  const days14: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days14.push(key);
    costByDay[key] = 0;
  }
  (usageLogs ?? []).forEach((r: { created_at: string; cost_usd?: number }) => {
    const k = r.created_at.slice(0, 10);
    if (costByDay[k] !== undefined) costByDay[k] += r.cost_usd ?? 0;
  });
  const costTrend = days14.map(k => ({
    date: new Date(k).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    cost: parseFloat(costByDay[k].toFixed(4)),
  }));

  // Usage by prompt key
  const byKey: Record<string, { calls: number; cost: number; tokens: number }> = {};
  (usageLogs ?? []).forEach((r: { prompt_key?: string; cost_usd?: number; input_tokens?: number; output_tokens?: number }) => {
    const k = r.prompt_key ?? "unknown";
    if (!byKey[k]) byKey[k] = { calls: 0, cost: 0, tokens: 0 };
    byKey[k].calls++;
    byKey[k].cost += r.cost_usd ?? 0;
    byKey[k].tokens += (r.input_tokens ?? 0) + (r.output_tokens ?? 0);
  });
  const usageByKey = Object.entries(byKey)
    .sort((a, b) => b[1].cost - a[1].cost)
    .map(([key, stats]) => ({ key, ...stats }));

  return (
    <HealthClient
      totalCost={totalCost}
      weeklyCost={weeklyCost}
      totalTokens={totalTokens}
      totalApiCalls={(usageLogs ?? []).length}
      costTrend={costTrend}
      usageByKey={usageByKey}
      errorLogs={(errorLogs ?? []) as { id: string; error_type?: string; message?: string; page?: string; created_at: string }[]}
      platformStats={{
        startups: startupCount ?? 0,
        users: userCount,
        connections: connectionCount ?? 0,
        messages: messageCount ?? 0,
      }}
    />
  );
}
