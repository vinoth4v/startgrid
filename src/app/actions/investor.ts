"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { redirect } from "next/navigation";
import { createNotification } from "./notifications";

export interface InvestorCriteria {
  role: string;
  stages: string[];
  sectors: string[];
  revenuePreference: string;
  geographies: string[];
  minTicket: string;
  maxTicket: string;
}

export async function saveInvestorProfile(
  name: string,
  firm: string,
  criteria: InvestorCriteria
): Promise<{ error?: string } | undefined> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("investor_profiles")
    .upsert({ user_id: user.id, name, firm, criteria }, { onConflict: "user_id" });

  if (error) return { error: error.message };

  redirect("/investor/dashboard");
}

export async function sendConnectionRequest(
  startupId: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: investorProfile } = await supabase
    .from("investor_profiles")
    .select("id, name, firm")
    .eq("user_id", user.id)
    .single();

  if (!investorProfile) return { error: "Investor profile not found" };

  const { error } = await supabase.from("connections").insert({
    investor_id: investorProfile.id,
    startup_id: startupId,
    status: "pending",
  });

  if (error) return { error: error.message };

  // Email the startup founder
  try {
    const admin = createAdminClient();
    const { data: startupProfile } = await admin
      .from("startup_profiles")
      .select("user_id, company_name")
      .eq("id", startupId)
      .single();

    if (startupProfile) {
      const { data: startupUser } = await admin.auth.admin.getUserById(startupProfile.user_id);
      if (startupUser?.user?.email) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "StartGrid <invites@start-grid.com>",
          to: startupUser.user.email,
          subject: "New connection request on StartGrid",
          html: `
            <!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;background:#f9fafb;margin:0;padding:40px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px;">
            <tr><td>
              <h1 style="margin:0 0 4px;font-size:22px;color:#18181b;">StartGrid</h1>
              <p style="margin:0 0 24px;font-size:13px;color:#71717a;">The European startup-investor platform</p>
              <p style="font-size:15px;color:#3f3f46;margin:0 0 16px;">
                <strong>${investorProfile.name}</strong> from <strong>${investorProfile.firm || "their firm"}</strong>
                has sent you a connection request on StartGrid.
              </p>
              <a href="https://startgrid.vercel.app/startup/dashboard" style="display:inline-block;background:#4f46e5;color:#fff;padding:11px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;">
                Accept or decline →
              </a>
            </td></tr></table></td></tr></table>
            </body></html>
          `,
        });
      }
    }
  } catch {
    // email failure should not block the connection request
  }

  // In-app notification for startup founder
  try {
    const admin = createAdminClient();
    const { data: startupProfile } = await admin
      .from("startup_profiles")
      .select("user_id, company_name")
      .eq("id", startupId)
      .single();
    if (startupProfile) {
      await createNotification({
        userId: startupProfile.user_id,
        type: "connection_request",
        title: "New connection request",
        body: `${investorProfile.name}${investorProfile.firm ? ` from ${investorProfile.firm}` : ""} wants to connect with you.`,
        link: "/startup/dashboard",
      });
    }
  } catch {
    // notification failure must not block the request
  }

  return { success: true };
}
