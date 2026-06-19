"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { logApiUsage } from "./ai-prompts";

export interface MatchPair {
  id?: string;
  startupId: string;
  investorId: string;
  startupName: string;
  investorName: string;
  investorFirm: string;
  sector: string | null;
  stage: string | null;
  country: string | null;
  investorSectors: string[];
  investorStages: string[];
  investorGeos: string[];
  score: number;
  status: string;
  aiReasoning: string | null;
  alignmentPoints: string[];
  concerns: string[];
  startupEmail: string;
  investorEmail: string;
}

function computeScore(
  sector: string | null,
  stage: string | null,
  country: string | null,
  sectors: string[],
  stages: string[],
  geos: string[]
): number {
  let score = 0;
  if (sector && sectors.length && sectors.includes(sector)) score += 40;
  else if (sectors.length === 0) score += 20;
  if (stage && stages.length && stages.includes(stage)) score += 40;
  else if (stages.length === 0) score += 20;
  if (country && geos.length && geos.some(g => country.toLowerCase().includes(g.toLowerCase()) || g.toLowerCase().includes(country.toLowerCase()))) score += 20;
  else if (geos.length === 0) score += 10;
  return score;
}

export async function getMatchPairs(): Promise<MatchPair[]> {
  const admin = createAdminClient();

  const [{ data: startups }, { data: investors }, { data: existingMatches }] = await Promise.all([
    admin.from("startup_profiles").select("id, company_name, sector, stage, country, description, funding_amount, user_id").eq("is_published", true),
    admin.from("investor_profiles").select("id, name, firm, criteria, user_id"),
    admin.from("admin_matches").select("*"),
  ]);

  // Get user emails
  const allUserIds = [
    ...(startups ?? []).map((s: { user_id: string }) => s.user_id),
    ...(investors ?? []).map((i: { user_id: string }) => i.user_id),
  ].filter(Boolean);

  const emailMap: Record<string, string> = {};
  const { data: authUsers } = await admin.auth.admin.listUsers();
  (authUsers?.users ?? []).forEach(u => { if (u.email) emailMap[u.id] = u.email; });

  const matchMap: Record<string, typeof existingMatches extends null ? never : NonNullable<typeof existingMatches>[0]> = {};
  (existingMatches ?? []).forEach((m: { startup_id: string; investor_id: string }) => {
    matchMap[`${m.startup_id}:${m.investor_id}`] = m as NonNullable<typeof existingMatches>[0];
  });

  const pairs: MatchPair[] = [];

  for (const startup of (startups ?? [])) {
    for (const investor of (investors ?? [])) {
      const criteria = investor.criteria ?? {};
      const sectors = Array.isArray(criteria.sectors) ? criteria.sectors : [];
      const stages = Array.isArray(criteria.stages) ? criteria.stages : [];
      const geos = Array.isArray(criteria.geographies) ? criteria.geographies : [];

      const score = computeScore(startup.sector, startup.stage, startup.country, sectors, stages, geos);
      if (score < 40) continue; // Only show reasonable matches

      const existing = matchMap[`${startup.id}:${investor.id}`];

      pairs.push({
        id: existing?.id,
        startupId: startup.id,
        investorId: investor.id,
        startupName: startup.company_name,
        investorName: investor.name,
        investorFirm: investor.firm ?? "",
        sector: startup.sector,
        stage: startup.stage,
        country: startup.country,
        investorSectors: sectors,
        investorStages: stages,
        investorGeos: geos,
        score,
        status: existing?.status ?? "suggested",
        aiReasoning: existing?.ai_reasoning ?? null,
        alignmentPoints: existing?.alignment_points ?? [],
        concerns: existing?.concerns ?? [],
        startupEmail: emailMap[startup.user_id] ?? "",
        investorEmail: emailMap[investor.user_id] ?? "",
      });
    }
  }

  return pairs.sort((a, b) => b.score - a.score).slice(0, 50);
}

export async function generateMatchReasoning(
  startupId: string, investorId: string
): Promise<{ reasoning?: string; alignmentPoints?: string[]; concerns?: string[]; error?: string }> {
  const admin = createAdminClient();
  const [{ data: startup }, { data: investor }] = await Promise.all([
    admin.from("startup_profiles").select("company_name, sector, stage, country, description, funding_amount").eq("id", startupId).single(),
    admin.from("investor_profiles").select("name, firm, criteria").eq("id", investorId).single(),
  ]);

  if (!startup || !investor) return { error: "Not found" };

  const criteria = investor.criteria ?? {};

  const systemPrompt = `You are a venture capital matchmaker with deep expertise in connecting the right startups with the right investors. You provide specific, evidence-based reasoning about match quality.`;
  const userPrompt = `Given this investor's criteria and this startup's profile, explain in 2-3 sentences why this is or is not a strong match. Be specific about what aligns and what does not.

Investor: ${investor.name} at ${investor.firm ?? "Independent"}
Criteria: Stages=${JSON.stringify(criteria.stages ?? [])}, Sectors=${JSON.stringify(criteria.sectors ?? [])}, Geographies=${JSON.stringify(criteria.geographies ?? [])}

Startup: ${startup.company_name}
Sector: ${startup.sector ?? "N/A"} | Stage: ${startup.stage ?? "N/A"} | Location: ${startup.country ?? "N/A"}
Description: ${(startup.description ?? "").slice(0, 200)}
Ask: ${startup.funding_amount ?? "N/A"}

Return JSON: { "reasoning": "2-3 sentence explanation", "alignmentPoints": ["point 1", "point 2"], "concerns": ["concern 1"] }`;

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    await logApiUsage("matchmaking_reasoning", response.usage.input_tokens, response.usage.output_tokens);

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { error: "Invalid response" };

    const result = JSON.parse(jsonMatch[0]);

    // Upsert to admin_matches
    await admin.from("admin_matches").upsert({
      startup_id: startupId,
      investor_id: investorId,
      ai_reasoning: result.reasoning,
      alignment_points: result.alignmentPoints ?? [],
      concerns: result.concerns ?? [],
      status: "suggested",
    }, { onConflict: "startup_id,investor_id" });

    return {
      reasoning: result.reasoning,
      alignmentPoints: result.alignmentPoints ?? [],
      concerns: result.concerns ?? [],
    };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function introduceMatch(
  startupId: string, investorId: string,
  startupEmail: string, investorEmail: string,
  startupName: string, investorName: string, investorFirm: string,
  reasoning: string
): Promise<{ error?: string }> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const admin = createAdminClient();

  const fromEmail = "StartGrid <noreply@startgrid.co>";

  // Email to investor
  await resend.emails.send({
    from: fromEmail,
    to: investorEmail,
    subject: `Introduction: ${startupName} matches your investment criteria`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #F8FAFC;">
        <div style="background: white; border-radius: 12px; padding: 28px; border: 0.5px solid #E2E8F0;">
          <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #4F46E5; text-transform: uppercase; letter-spacing: 0.06em;">StartGrid</p>
          <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0F172A;">Hi ${investorName},</h2>
          <p style="margin: 0 0 16px; font-size: 14px; color: #374151; line-height: 1.6;">We think <strong>${startupName}</strong> is a strong match for your investment criteria.</p>
          ${reasoning ? `<div style="background: #F8FAFC; border-radius: 8px; padding: 14px 16px; margin: 0 0 20px; font-size: 13px; color: #374151; line-height: 1.6; border-left: 3px solid #4F46E5;"><em>${reasoning}</em></div>` : ""}
          <p style="margin: 0 0 20px; font-size: 13px; color: #374151;">Log in to StartGrid to view their full profile and connect.</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://startgrid.co"}" style="display: inline-block; padding: 10px 24px; background: #4F46E5; color: white; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">View on StartGrid →</a>
        </div>
      </div>
    `,
  });

  // Email to startup
  await resend.emails.send({
    from: fromEmail,
    to: startupEmail,
    subject: `New investor match: ${investorName} from ${investorFirm || "Independent"}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #F8FAFC;">
        <div style="background: white; border-radius: 12px; padding: 28px; border: 0.5px solid #E2E8F0;">
          <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #4F46E5; text-transform: uppercase; letter-spacing: 0.06em;">StartGrid</p>
          <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0F172A;">Great news, ${startupName}!</h2>
          <p style="margin: 0 0 16px; font-size: 14px; color: #374151; line-height: 1.6;"><strong>${investorName}</strong>${investorFirm ? ` from ${investorFirm}` : ""} has been matched with your startup based on their investment criteria.</p>
          <p style="margin: 0 0 20px; font-size: 13px; color: #374151;">Log in to StartGrid to view their profile and send a connection request.</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://startgrid.co"}" style="display: inline-block; padding: 10px 24px; background: #4F46E5; color: white; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">View on StartGrid →</a>
        </div>
      </div>
    `,
  });

  // Update status
  await admin.from("admin_matches").upsert({
    startup_id: startupId,
    investor_id: investorId,
    status: "introduced",
  }, { onConflict: "startup_id,investor_id" });

  return {};
}
