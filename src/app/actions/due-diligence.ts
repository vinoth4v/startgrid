"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface DDItem {
  id: string;
  label: string;
  done: boolean;
}

const DEFAULT_CHECKLIST: DDItem[] = [
  { id: "financials",      label: "Review financial statements",           done: false },
  { id: "cap_table",       label: "Verify cap table & equity structure",   done: false },
  { id: "team_bg",         label: "Background check on founders",          done: false },
  { id: "ip_check",        label: "Confirm IP ownership",                  done: false },
  { id: "legal_docs",      label: "Review legal incorporation docs",       done: false },
  { id: "customer_refs",   label: "Speak with 2+ reference customers",     done: false },
  { id: "market_research", label: "Independent market size validation",    done: false },
  { id: "tech_review",     label: "Technical architecture review",         done: false },
  { id: "competitors",     label: "Competitive landscape analysis",        done: false },
  { id: "term_sheet",      label: "Draft & review term sheet",             done: false },
];

export async function getDDChecklist(startupId: string): Promise<DDItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return DEFAULT_CHECKLIST;

  const admin = createAdminClient();
  const { data: ip } = await admin.from("investor_profiles").select("id").eq("user_id", user.id).single();
  if (!ip) return DEFAULT_CHECKLIST;

  const { data } = await admin
    .from("due_diligence")
    .select("checklist")
    .eq("investor_id", ip.id)
    .eq("startup_id", startupId)
    .single();

  if (data?.checklist && Array.isArray(data.checklist) && data.checklist.length > 0) {
    return data.checklist as DDItem[];
  }
  return DEFAULT_CHECKLIST;
}

export async function saveDDChecklist(startupId: string, checklist: DDItem[]): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const admin = createAdminClient();
  const { data: ip } = await admin.from("investor_profiles").select("id").eq("user_id", user.id).single();
  if (!ip) return { error: "Profile not found" };

  const { error } = await admin.from("due_diligence").upsert({
    investor_id: ip.id,
    startup_id: startupId,
    checklist,
    updated_at: new Date().toISOString(),
  }, { onConflict: "investor_id,startup_id" });

  return error ? { error: error.message } : {};
}
