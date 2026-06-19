"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import Anthropic from "@anthropic-ai/sdk";
import { logApiUsage } from "./ai-prompts";

export interface ReportData {
  executiveSummary: string[];
  growthAnalysis: string;
  qualityAssessment: string;
  matchmakingOpportunities: { startup: string; investor: string; reason: string }[];
  platformHealth: string;
  recommendedActions: { action: string; priority: "High" | "Medium" | "Low"; reason: string }[];
  trendForecast: string;
}

export interface AdminReport {
  id: string;
  report_data: ReportData;
  period_start: string;
  period_end: string;
  generated_at: string;
}

export async function getReportHistory(): Promise<AdminReport[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("admin_reports")
    .select("*")
    .order("generated_at", { ascending: false })
    .limit(10);
  return (data ?? []) as AdminReport[];
}

export async function generateWeeklyReport(): Promise<{ report?: AdminReport; error?: string }> {
  const admin = createAdminClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const periodStart = sevenDaysAgo.toISOString().slice(0, 10);
  const periodEnd = new Date().toISOString().slice(0, 10);

  // Gather platform data
  const [
    { count: newStartups },
    { count: newInvestors },
    { count: publishedCount },
    { count: connectionRequests },
    { count: messagesCount },
    { data: startupProfiles },
    { data: pendingReview },
    { data: aiUsage },
    { data: adminMatches },
  ] = await Promise.all([
    admin.from("startup_profiles").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.toISOString()),
    admin.from("investor_profiles").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.toISOString()),
    admin.from("startup_profiles").select("*", { count: "exact", head: true }).eq("is_published", true),
    admin.from("connections").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.toISOString()),
    admin.from("messages").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.toISOString()),
    admin.from("startup_profiles").select("sector, country").eq("is_published", true),
    admin.from("startup_profiles").select("*", { count: "exact", head: true }).eq("review_status", "pending_review"),
    admin.from("api_usage_log").select("prompt_key, cost_usd").gte("created_at", sevenDaysAgo.toISOString()),
    admin.from("admin_matches").select("startup_id, investor_id, match_score").eq("status", "suggested").order("match_score", { ascending: false }).limit(5),
  ]);

  // Top sectors
  const sectorCounts: Record<string, number> = {};
  (startupProfiles ?? []).forEach((s: { sector?: string }) => {
    if (s.sector) sectorCounts[s.sector] = (sectorCounts[s.sector] ?? 0) + 1;
  });
  const topSectors = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s]) => s).join(", ");

  // Countries
  const countryCounts: Record<string, number> = {};
  (startupProfiles ?? []).forEach((s: { country?: string }) => {
    if (s.country) countryCounts[s.country] = (countryCounts[s.country] ?? 0) + 1;
  });
  const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([c, n]) => `${c} (${n})`).join(", ");

  // AI usage
  const aiFeatures = Array.from(new Set((aiUsage ?? []).map((r: { prompt_key?: string }) => r.prompt_key).filter(Boolean))).join(", ");
  const weeklyCost = (aiUsage ?? []).reduce((sum: number, r: { cost_usd?: number }) => sum + (r.cost_usd ?? 0), 0);
  const topMatchScore = (adminMatches ?? [])[0]?.match_score ?? 0;

  const systemPrompt = `You are a Chief of Staff at a European VC firm that operates an investment platform. Write a concise, insightful weekly platform intelligence report for the managing partners. Be analytical, highlight what matters, flag risks and opportunities. Use data to support every claim.`;

  const userPrompt = `Here is this week's StartGrid platform data:
- New startups joined: ${newStartups ?? 0}
- New investors joined: ${newInvestors ?? 0}
- Profiles published: ${publishedCount ?? 0}
- Connection requests sent: ${connectionRequests ?? 0}
- Messages exchanged: ${messagesCount ?? 0}
- Most active sectors: ${topSectors || "N/A"}
- Geographic breakdown: ${topCountries || "N/A"}
- AI features used: ${aiFeatures || "none"}
- Pending moderation queue: ${pendingReview ?? 0}
- Top unconnected match score: ${topMatchScore}
- Platform costs this week: $${weeklyCost.toFixed(4)}

Write a structured intelligence report. Return JSON with these exact keys:
{
  "executiveSummary": ["bullet 1", "bullet 2", "bullet 3"],
  "growthAnalysis": "paragraph",
  "qualityAssessment": "paragraph",
  "matchmakingOpportunities": [{"startup": "...", "investor": "...", "reason": "..."}],
  "platformHealth": "paragraph",
  "recommendedActions": [{"action": "...", "priority": "High|Medium|Low", "reason": "..."}],
  "trendForecast": "paragraph"
}`;

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    await logApiUsage("admin_intelligence_report", response.usage.input_tokens, response.usage.output_tokens);

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { error: "Invalid AI response" };

    const reportData: ReportData = JSON.parse(jsonMatch[0]);

    const { data: saved } = await admin.from("admin_reports").insert({
      report_data: reportData,
      period_start: periodStart,
      period_end: periodEnd,
    }).select().single();

    return { report: saved as AdminReport };
  } catch (e) {
    return { error: String(e) };
  }
}
