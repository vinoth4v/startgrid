"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { logApiUsage } from "./ai-prompts";

export interface ModerationItem {
  id: string;
  company_name: string;
  sector: string | null;
  stage: string | null;
  description: string | null;
  is_published: boolean;
  review_status: string;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  has_logo: boolean;
  slide_count: number;
  has_traction: boolean;
  aiScore?: number;
  aiFlags?: string[];
  aiRecommendation?: string;
  aiSummary?: string;
}

export async function getModerationQueue(): Promise<ModerationItem[]> {
  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("startup_profiles")
    .select("id, company_name, sector, stage, description, is_published, review_status, review_note, reviewed_at, created_at, logo_url, pitch_deck, traction")
    .order("created_at", { ascending: false });

  return (profiles ?? []).map((p: {
    id: string; company_name: string; sector: string | null; stage: string | null;
    description: string | null; is_published: boolean; review_status: string;
    review_note: string | null; reviewed_at: string | null; created_at: string;
    logo_url: string | null; pitch_deck: unknown[] | null; traction: string | null;
  }) => ({
    id: p.id,
    company_name: p.company_name,
    sector: p.sector,
    stage: p.stage,
    description: p.description,
    is_published: p.is_published,
    review_status: p.review_status ?? "draft",
    review_note: p.review_note,
    reviewed_at: p.reviewed_at,
    created_at: p.created_at,
    has_logo: !!p.logo_url,
    slide_count: Array.isArray(p.pitch_deck) ? p.pitch_deck.length : 0,
    has_traction: !!p.traction && p.traction.length > 10,
  }));
}

export async function runAIQualityScore(startupId: string): Promise<{
  score?: number; flags?: string[]; recommendation?: string; summary?: string; error?: string;
}> {
  const admin = createAdminClient();
  const { data: p } = await admin
    .from("startup_profiles")
    .select("company_name, sector, stage, description, problem, solution, traction, team_background, logo_url, pitch_deck")
    .eq("id", startupId)
    .single();

  if (!p) return { error: "Startup not found" };

  const pitchDeck = Array.isArray(p.pitch_deck) ? p.pitch_deck : [];
  const pitchSummary = pitchDeck.slice(0, 3).map((s: { title?: string; content?: string }) => s.content ?? "").join(" ").slice(0, 400);

  const systemPrompt = `You are a senior investment analyst conducting quality control on startup pitch decks submitted to an investment platform. Be rigorous and objective.`;
  const userPrompt = `Rate this pitch deck quality from 0-100. Check: completeness, clarity, specificity, market credibility, team strength, financial realism.

Company: ${p.company_name} | Sector: ${p.sector ?? "N/A"} | Stage: ${p.stage ?? "N/A"}
Slides: ${pitchDeck.length} of 10
Description: ${(p.description ?? "").slice(0, 200)}
Pitch content summary: ${pitchSummary}
Has logo: ${!!p.logo_url} | Has traction: ${!!p.traction} | Has team info: ${!!p.team_background}

Return JSON ONLY:
{
  "score": 0-100,
  "flags": ["issue 1", "issue 2"],
  "recommendation": "approve|revise|reject",
  "summary": "one sentence assessment"
}`;

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    await logApiUsage("moderation_quality", response.usage.input_tokens, response.usage.output_tokens);

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { error: "Invalid AI response" };
    const result = JSON.parse(jsonMatch[0]);
    return {
      score: result.score,
      flags: result.flags ?? [],
      recommendation: result.recommendation,
      summary: result.summary,
    };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function updateModerationStatus(
  startupId: string,
  status: "approved" | "rejected" | "revision_requested",
  note: string
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const admin = createAdminClient();
  const updates: Record<string, unknown> = {
    review_status: status,
    review_note: note,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  };

  if (status === "approved") {
    updates.is_published = true;
  } else if (status === "rejected") {
    updates.is_published = false;
  }

  const { error } = await admin
    .from("startup_profiles")
    .update(updates)
    .eq("id", startupId);

  return error ? { error: error.message } : {};
}
