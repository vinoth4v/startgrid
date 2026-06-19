"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ReadinessFeedback {
  grade: "A" | "B" | "C" | "D";
  score: number;
  strengths: string[];
  improvements: string[];
  summary: string;
  generatedAt: string;
}

export async function getReadinessScore(): Promise<{ feedback?: ReadinessFeedback; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const admin = createAdminClient();
  const { data: sp } = await admin
    .from("startup_profiles")
    .select("id, company_name, sector, stage, country, pitch_data, logo_url, traction, team, linkedin_url, is_published, readiness_score, readiness_feedback, raw_onboarding_data, employee_count")
    .eq("user_id", user.id)
    .single();

  if (!sp) return { error: "Startup profile not found" };

  // Return cached if available
  if (sp.readiness_score && sp.readiness_feedback) {
    return { feedback: sp.readiness_feedback as ReadinessFeedback };
  }

  const pitch = Array.isArray(sp.pitch_data) ? sp.pitch_data : [];
  const od = (sp.raw_onboarding_data ?? {}) as Record<string, string>;

  const client = new Anthropic();
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    messages: [{
      role: "user",
      content: `You are a startup investor readiness analyst. Evaluate this startup's investor readiness on a scale of 0-100 and provide a grade (A=80+, B=60-79, C=40-59, D<40). Return ONLY JSON.

Startup: ${sp.company_name} | Sector: ${sp.sector} | Stage: ${sp.stage}
Has logo: ${!!sp.logo_url} | Has pitch deck: ${pitch.length > 0} (${pitch.length} slides)
Has traction data: ${!!(od.traction)} | Has team info: ${!!(od.teamBackground)} | Has LinkedIn: ${!!sp.linkedin_url}
Is published: ${!!sp.is_published} | Employee count: ${sp.employee_count ?? "unknown"}
Description: ${od.description ?? "none"}
Problem: ${od.problem ?? "none"}
Solution: ${od.solution ?? "none"}
Traction: ${od.traction ?? "none"}
Funding ask: ${od.fundingAmount ?? "none"}
Use of funds: ${od.useOfFunds ?? "none"}

Return:
{
  "grade": "A|B|C|D",
  "score": 0-100,
  "summary": "One sentence overall assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"]
}`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  let feedback: ReadinessFeedback;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] ?? "{}");
    feedback = { ...parsed, generatedAt: new Date().toISOString() };
  } catch {
    return { error: "Failed to parse AI response" };
  }

  // Cache in DB
  await admin.from("startup_profiles").update({
    readiness_score: feedback.score,
    readiness_feedback: feedback,
  }).eq("id", sp.id);

  return { feedback };
}

export async function invalidateReadinessScore(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const admin = createAdminClient();
  await admin.from("startup_profiles").update({
    readiness_score: null,
    readiness_feedback: null,
  }).eq("user_id", user.id);
}
