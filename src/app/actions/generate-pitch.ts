"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface OnboardingData {
  // Step 1
  companyName: string;
  sector: string;
  stage: string;
  country: string;
  website: string;
  description: string;
  // Step 2
  problem: string;
  solution: string;
  marketSize: string;
  traction: string;
  // Step 3
  teamBackground: string;
  fundingAmount: string;
  useOfFunds: string;
}

export interface PitchSlide {
  slideNumber: number;
  title: string;
  content: string[];
  speakerNote: string;
}

export async function generatePitch(
  data: OnboardingData
): Promise<{ error: string } | undefined> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userPrompt = `Create a 10-slide pitch deck for this startup:

Company: ${data.companyName}
Sector: ${data.sector}
Stage: ${data.stage}
Country: ${data.country}
Website: ${data.website || "Not provided"}
Description: ${data.description}

Problem being solved: ${data.problem}
Solution: ${data.solution}
Total addressable market: ${data.marketSize}
Traction: ${data.traction}

Founding team: ${data.teamBackground}
Funding ask: ${data.fundingAmount}
Use of funds: ${data.useOfFunds}

Return a JSON array of exactly 10 objects, each with:
- slideNumber (integer 1–10)
- title (the slide heading, concise)
- content (array of 3–4 bullet point strings, specific and data-driven)
- speakerNote (one sentence of delivery guidance for the founder)`;

  let slides: PitchSlide[];

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system:
        "You are StartGrid's pitch deck AI. You create standardised, professional 10-slide pitch decks for European startups seeking investment. You write with clarity, precision and conviction. Never use buzzwords. Always ground claims in specifics. Return ONLY valid JSON, no markdown, no explanation.",
      messages: [{ role: "user", content: userPrompt }],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";
    const json = raw
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
    slides = JSON.parse(json);

    if (!Array.isArray(slides) || slides.length !== 10) {
      throw new Error("Unexpected response shape from AI");
    }
  } catch {
    return { error: "Failed to generate pitch deck. Please try again." };
  }

  const { error: upsertError } = await supabase
    .from("startup_profiles")
    .upsert(
      {
        user_id: user.id,
        company_name: data.companyName,
        sector: data.sector,
        stage: data.stage,
        country: data.country,
        website: data.website || null,
        pitch_data: slides,
        is_published: false,
      },
      { onConflict: "user_id" }
    );

  if (upsertError) return { error: upsertError.message };

  redirect("/startup/pitch-preview");
}

export async function publishProfile(
  updatedSlides: PitchSlide[]
): Promise<{ error: string } | undefined> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("startup_profiles")
    .update({ pitch_data: updatedSlides, is_published: true })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  redirect("/startup/dashboard");
}
