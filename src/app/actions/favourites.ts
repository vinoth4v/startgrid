"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function toggleFavourite(
  investorId: string,
  startupId: string,
  add: boolean
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();

  if (add) {
    const { error } = await admin
      .from("investor_favourites")
      .upsert({ investor_id: investorId, startup_id: startupId }, { onConflict: "investor_id,startup_id" });
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await admin
      .from("investor_favourites")
      .delete()
      .eq("investor_id", investorId)
      .eq("startup_id", startupId);
    if (error) return { success: false, error: error.message };
  }

  return { success: true };
}
