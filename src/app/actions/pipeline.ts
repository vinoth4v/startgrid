"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PipelineStage = "reviewing" | "due_diligence" | "term_sheet" | "closed_won" | "closed_lost";

export interface PipelineDeal {
  id: string;
  startup_id: string;
  stage: PipelineStage;
  notes: string | null;
  amount: string | null;
  position: number;
  created_at: string;
  // enriched
  companyName?: string;
  sector?: string;
  stageName?: string;
  logoUrl?: string | null;
}

export async function getPipelineDeals(): Promise<PipelineDeal[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();
  const { data: ip } = await admin.from("investor_profiles").select("id").eq("user_id", user.id).single();
  if (!ip) return [];

  const { data: deals } = await admin
    .from("deal_pipeline")
    .select("*")
    .eq("investor_id", ip.id)
    .order("position");

  if (!deals || deals.length === 0) return [];

  const startupIds = deals.map((d: { startup_id: string }) => d.startup_id);
  const { data: startups } = await admin
    .from("startup_profiles")
    .select("id, company_name, sector, stage, logo_url")
    .in("id", startupIds);

  const sm = Object.fromEntries((startups ?? []).map((s: { id: string; company_name: string; sector: string; stage: string; logo_url: string }) => [s.id, s]));

  return (deals as PipelineDeal[]).map(d => {
    const s = sm[d.startup_id];
    return { ...d, companyName: s?.company_name, sector: s?.sector, stageName: s?.stage, logoUrl: s?.logo_url };
  });
}

export async function addToPipeline(startupId: string, stage: PipelineStage = "reviewing"): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const admin = createAdminClient();
  const { data: ip } = await admin.from("investor_profiles").select("id").eq("user_id", user.id).single();
  if (!ip) return { error: "Profile not found" };

  const { error } = await admin.from("deal_pipeline").insert({
    investor_id: ip.id,
    startup_id: startupId,
    stage,
    position: Date.now(),
  });

  return error ? { error: error.message } : {};
}

export async function moveDeal(dealId: string, newStage: PipelineStage): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("deal_pipeline")
    .update({ stage: newStage, updated_at: new Date().toISOString() })
    .eq("id", dealId);

  return error ? { error: error.message } : {};
}

export async function removeDeal(dealId: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const admin = createAdminClient();
  const { error } = await admin.from("deal_pipeline").delete().eq("id", dealId);
  return error ? { error: error.message } : {};
}

export async function updateDealNotes(dealId: string, notes: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const admin = createAdminClient();
  const { error } = await admin.from("deal_pipeline").update({ notes }).eq("id", dealId);
  return error ? { error: error.message } : {};
}
