"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface InvestmentBrief {
  companyOverview: string;
  marketOpportunity: string;
  teamStrengths: string;
  keyRisks: string;
  investmentThesis: string;
  generatedAt: string;
}

export async function generateInvestmentBrief(startupId: string): Promise<{ brief?: InvestmentBrief; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const admin = createAdminClient();

  // Get investor profile
  const { data: ip } = await admin
    .from("investor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!ip) return { error: "Investor profile not found" };

  // Check for cached brief in investor_notes
  const { data: existing } = await admin
    .from("investor_notes")
    .select("content")
    .eq("investor_id", ip.id)
    .eq("startup_id", startupId)
    .single();

  if (existing?.content) {
    const parsed = tryParseBrief(existing.content);
    if (parsed) return { brief: parsed };
  }

  // Get startup data
  const { data: startup } = await admin
    .from("startup_profiles")
    .select("company_name, sector, stage, country, pitch_data, city, founded_year, employee_count")
    .eq("id", startupId)
    .single();

  if (!startup) return { error: "Startup not found" };

  const pitch = Array.isArray(startup.pitch_data) ? startup.pitch_data : [];
  const pitchText = pitch.map((s: { title?: string; content?: string }) =>
    `${s.title ?? ""}: ${s.content ?? ""}`
  ).join("\n");

  const client = new Anthropic();
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `You are an investment analyst. Based on the following startup information, write a concise investment brief with exactly these 5 sections (each 2-3 sentences). Return ONLY JSON, no other text.

Startup: ${startup.company_name}
Sector: ${startup.sector} | Stage: ${startup.stage} | Location: ${[startup.city, startup.country].filter(Boolean).join(", ")}
Founded: ${startup.founded_year ?? "unknown"} | Team size: ${startup.employee_count ?? "unknown"}

Pitch deck content:
${pitchText || "Not available"}

Return this JSON:
{
  "companyOverview": "...",
  "marketOpportunity": "...",
  "teamStrengths": "...",
  "keyRisks": "...",
  "investmentThesis": "..."
}`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  let brief: InvestmentBrief;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] ?? "{}");
    brief = { ...parsed, generatedAt: new Date().toISOString() };
  } catch {
    return { error: "Failed to parse AI response" };
  }

  // Cache as special marker in investor_notes (prefix so we don't overwrite real notes)
  const BRIEF_MARKER = "[[AI_BRIEF]]";
  const cachePayload = `${BRIEF_MARKER}${JSON.stringify(brief)}`;
  await admin.from("investor_notes").upsert({
    investor_id: ip.id,
    startup_id: startupId,
    content: cachePayload,
    updated_at: new Date().toISOString(),
  }, { onConflict: "investor_id,startup_id" });

  return { brief };
}

function tryParseBrief(content: string): InvestmentBrief | null {
  const BRIEF_MARKER = "[[AI_BRIEF]]";
  if (!content.startsWith(BRIEF_MARKER)) return null;
  try {
    return JSON.parse(content.slice(BRIEF_MARKER.length));
  } catch {
    return null;
  }
}
