"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface FeedbackData {
  overall_rating: number;
  team_rating: number;
  market_rating: number;
  product_rating: number;
  comment: string;
}

export async function submitFeedback(startupId: string, feedback: FeedbackData): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const admin = createAdminClient();
  const { data: ip } = await admin.from("investor_profiles").select("id").eq("user_id", user.id).single();
  if (!ip) return { error: "Investor profile not found" };

  const { error } = await admin.from("investor_feedback").upsert({
    investor_id: ip.id,
    startup_id: startupId,
    ...feedback,
    is_anonymous: true,
  }, { onConflict: "investor_id,startup_id" });

  return error ? { error: error.message } : {};
}

export interface AggregatedFeedback {
  count: number;
  avgOverall: number;
  avgTeam: number;
  avgMarket: number;
  avgProduct: number;
  comments: string[];
}

export async function getFeedbackForStartup(startupId: string): Promise<AggregatedFeedback> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("investor_feedback")
    .select("overall_rating, team_rating, market_rating, product_rating, comment")
    .eq("startup_id", startupId);

  if (!data || data.length === 0) {
    return { count: 0, avgOverall: 0, avgTeam: 0, avgMarket: 0, avgProduct: 0, comments: [] };
  }

  const avg = (key: string) => {
    const vals = data.map((d: Record<string, number | null>) => d[key]).filter(v => v != null) as number[];
    return vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
  };

  return {
    count: data.length,
    avgOverall: avg("overall_rating"),
    avgTeam: avg("team_rating"),
    avgMarket: avg("market_rating"),
    avgProduct: avg("product_rating"),
    comments: data.map((d: { comment: string | null }) => d.comment).filter(Boolean) as string[],
  };
}
