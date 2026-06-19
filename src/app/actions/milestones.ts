"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "./notifications";
import { Resend } from "resend";

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

      const resend = new Resend(process.env.RESEND_API_KEY);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://startgrid.co";
      const { data: authUsers } = await admin.auth.admin.listUsers();
      const emailMap = Object.fromEntries((authUsers?.users ?? []).map(u => [u.id, u.email ?? ""]));

      for (const inv of (investors ?? [])) {
        const userId = (inv as { user_id: string }).user_id;
        await createNotification({
          userId,
          type: "milestone",
          title: `${startupProfile.company_name} posted a milestone`,
          body: `🚀 ${title}`,
          link: `/investor/startup/${startupProfile.id}`,
        });
        const email = emailMap[userId];
        if (email) {
          await resend.emails.send({
            from: "StartGrid <noreply@startgrid.co>",
            to: email,
            subject: `${startupProfile.company_name} just hit a milestone`,
            html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 16px;background:#F8FAFC">
              <div style="background:white;border-radius:12px;padding:28px;border:0.5px solid #E2E8F0">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#4F46E5;text-transform:uppercase;letter-spacing:0.06em">StartGrid</p>
                <h2 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#0F172A">${startupProfile.company_name} hit a milestone</h2>
                <div style="background:#EEF2FF;border-left:3px solid #4F46E5;border-radius:6px;padding:12px 16px;margin:0 0 20px">
                  <p style="margin:0;font-size:15px;font-weight:600;color:#3730A3">🚀 ${title}</p>
                  ${description ? `<p style="margin:6px 0 0;font-size:13px;color:#4338CA">${description}</p>` : ""}
                </div>
                <a href="${siteUrl}/investor/startup/${startupProfile.id}" style="display:inline-block;padding:10px 22px;background:#4F46E5;color:white;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">View startup →</a>
              </div>
            </div>`,
          });
        }
      }
    }
  } catch {
    // notification failure must not block
  }

  return {};
}
