"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function updateFundingRound(
  startupId: string,
  goal: string,
  raised: string,
  status: string
): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin.from("startup_profiles").update({
    funding_goal_amount: goal,
    funding_raised: raised,
    funding_round_status: status,
  }).eq("id", startupId);
  return error ? { error: error.message } : {};
}
