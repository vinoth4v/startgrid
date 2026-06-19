"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function acceptConnection(connectionId: string): Promise<{ error?: string }> {
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

  const { data: conn, error } = await admin
    .from("connections")
    .update({ status: "accepted" })
    .eq("id", connectionId)
    .eq("startup_id", startupProfile.id)
    .select("investor_id")
    .single();

  if (error || !conn) return { error: error?.message ?? "Failed to accept connection" };

  // Email the investor
  const { data: investorProfile } = await admin
    .from("investor_profiles")
    .select("name, firm, user_id")
    .eq("id", conn.investor_id)
    .single();

  if (investorProfile) {
    const { data: investorUser } = await admin.auth.admin.getUserById(investorProfile.user_id);
    if (investorUser?.user?.email) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "StartGrid <invites@start-grid.com>",
        to: investorUser.user.email,
        subject: "Your connection request was accepted",
        html: `
          <!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;background:#f9fafb;margin:0;padding:40px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px;">
          <tr><td>
            <h1 style="margin:0 0 4px;font-size:22px;color:#18181b;">StartGrid</h1>
            <p style="margin:0 0 24px;font-size:13px;color:#71717a;">The European startup-investor platform</p>
            <p style="font-size:15px;color:#3f3f46;margin:0 0 16px;">
              <strong>${startupProfile.company_name}</strong> has accepted your connection request.
              You can now message them directly on StartGrid.
            </p>
            <a href="https://startgrid.vercel.app/messages" style="display:inline-block;background:#4f46e5;color:#fff;padding:11px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;">
              Go to Messages →
            </a>
          </td></tr></table></td></tr></table>
          </body></html>
        `,
      });
    }
  }

  redirect("/messages");
}

export async function declineConnection(connectionId: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();

  const { data: startupProfile } = await admin
    .from("startup_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!startupProfile) return { error: "Startup profile not found" };

  const { error } = await admin
    .from("connections")
    .update({ status: "declined" })
    .eq("id", connectionId)
    .eq("startup_id", startupProfile.id);

  if (error) return { error: error.message };

  revalidatePath("/startup/dashboard");
  return {};
}

export async function sendMessage(
  connectionId: string,
  content: string
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();
  const { error } = await admin.from("messages").insert({
    connection_id: connectionId,
    sender_id: user.id,
    content: content.trim(),
  });

  if (error) return { error: error.message };
  return {};
}

export async function fetchMessages(connectionId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("messages")
    .select("id, sender_id, content, created_at")
    .eq("connection_id", connectionId)
    .order("created_at", { ascending: true });
  return data ?? [];
}
