"use server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function submitAccessRequest(data: {
  name: string;
  email: string;
  role: "startup" | "investor";
  message: string;
}) {
  const admin = createAdminClient();
  const { error } = await admin.from("access_requests").insert(data);
  if (error) return { error: error.message };
  return { success: true };
}

export async function approveAccessRequest(
  id: string,
  email: string,
  role: string,
  name: string
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "admin") return { error: "Unauthorized" };

  const admin = createAdminClient();

  await admin.from("access_requests").update({ status: "approved" }).eq("id", id);

  const { data: invitation, error: inviteError } = await admin
    .from("invitations")
    .insert({ email, role, invited_by: user.id })
    .select("token")
    .single();

  if (inviteError || !invitation) return { error: "Failed to create invitation" };

  const resend = new Resend(process.env.RESEND_API_KEY);
  const inviteUrl = `https://startgrid.vercel.app/accept-invite?token=${invitation.token}`;
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  await resend.emails.send({
    from: "StartGrid <invites@start-grid.com>",
    to: email,
    subject: `You're invited to join StartGrid`,
    html: `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
      <tr><td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;padding:40px;">
          <tr><td>
            <h1 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#18181b;">StartGrid</h1>
            <p style="margin:0 0 32px;font-size:13px;color:#71717a;">The European startup-investor platform</p>
            <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;">
              Hi ${name}, your access request has been approved! You've been invited to join StartGrid as a <strong>${roleLabel}</strong>.
            </p>
            <p style="margin:0 0 28px;font-size:14px;color:#71717a;">
              Click the button below to set up your account. This invitation is unique to you.
            </p>
            <a href="${inviteUrl}" style="display:inline-block;background:#18181b;color:#ffffff;padding:11px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;">
              Accept invitation →
            </a>
            <p style="margin:28px 0 0;font-size:12px;color:#a1a1aa;">
              Or copy this link: <span style="color:#52525b;">${inviteUrl}</span>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`,
  });

  return { success: true };
}

export async function rejectAccessRequest(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "admin") return { error: "Unauthorized" };

  const admin = createAdminClient();
  await admin.from("access_requests").update({ status: "rejected" }).eq("id", id);
  return { success: true };
}
