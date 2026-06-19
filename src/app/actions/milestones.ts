"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "./notifications";

export type MilestoneType =
  | "first_revenue"
  | "new_customer"
  | "team_hire"
  | "product_launch"
  | "funding_closed"
  | "partnership"
  | "other";

export interface Milestone {
  id: string;
  startup_id: string;
  type: MilestoneType;
  title: string;
  description: string | null;
  date: string;
  created_at: string;
}

export async function getMilestones(startupId: string): Promise<Milestone[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("milestones")
    .select("*")
    .eq("startup_id", startupId)
    .order("date", { ascending: false });
  return (data ?? []) as Milestone[];
}

export async function addMilestone(
  type: MilestoneType,
  title: string,
  description: string,
  date: string
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();

  const { data: startupProfile } = await admin
    .from("startup_profiles")
    .select("id, company_name")
    .eq("user_id", user.id)
    .single();

  if (!startupProfile) return { error: "Startup profile not found" };

  const { error } = await admin.from("milestones").insert({
    startup_id: startupProfile.id,
    type,
    title,
    description: description.trim() || null,
    date,
  });

  if (error) return { error: error.message };

  // Notify investors who have accepted connections
  try {
    const { data: connections } = await admin
      .from("connections")
      .select("investor_id")
      .eq("startup_id", startupProfile.id)
      .eq("status", "accepted");

    if ((connections ?? []).length > 0) {
      const investorIds = (connections ?? []).map((c: { investor_id: string }) => c.investor_id);
      const { data: investors } = await admin
        .from("investor_profiles")
        .select("user_id")
        .in("id", investorIds);

      for (const inv of (investors ?? [])) {
        await createNotification({
          userId: (inv as { user_id: string }).user_id,
          type: "milestone",
          title: `${startupProfile.company_name} posted a milestone`,
          body: `🚀 ${title}`,
          link: `/investor/startup/${startupProfile.id}`,
        });
      }
    }
  } catch {
    // notification failure must not block
  }

  return {};
}
