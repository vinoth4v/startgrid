"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getNote(investorId: string, startupId: string): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("investor_notes")
    .select("content")
    .eq("investor_id", investorId)
    .eq("startup_id", startupId)
    .single();
  return data?.content ?? "";
}

export async function saveNote(
  investorId: string,
  startupId: string,
  content: string
): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("investor_notes")
    .upsert({ investor_id: investorId, startup_id: startupId, content, updated_at: new Date().toISOString() }, { onConflict: "investor_id,startup_id" });
  if (error) return { error: error.message };
  return {};
}

export async function getNoteExistence(
  investorId: string,
  startupIds: string[]
): Promise<string[]> {
  if (startupIds.length === 0) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("investor_notes")
    .select("startup_id")
    .eq("investor_id", investorId)
    .in("startup_id", startupIds)
    .not("content", "eq", "");
  return (data ?? []).map((r: { startup_id: string }) => r.startup_id);
}
