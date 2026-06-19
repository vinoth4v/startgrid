"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export type BroadcastSegment = "all" | "startups" | "investors" | "unconnected_startups" | "unpublished_startups" | "inactive_investors";

export interface BroadcastMessage {
  id: string;
  subject: string;
  body: string;
  segment: string[];
  channels: string[];
  status: string;
  scheduled_for: string | null;
  sent_at: string | null;
  sent_count: number;
  created_at: string;
}


export async function getBroadcastMessages(): Promise<BroadcastMessage[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("broadcast_messages")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as BroadcastMessage[];
}

export async function getSegmentPreview(segment: BroadcastSegment): Promise<{ count: number; emails: string[] }> {
  const admin = createAdminClient();
  const { data: authData } = await admin.auth.admin.listUsers();
  const allUsers = authData?.users ?? [];

  if (segment === "all") {
    return { count: allUsers.length, emails: allUsers.slice(0, 5).map(u => u.email ?? "") };
  }

  if (segment === "startups") {
    const { data: sp } = await admin.from("startup_profiles").select("user_id");
    const ids = new Set((sp ?? []).map((s: { user_id: string }) => s.user_id));
    const users = allUsers.filter(u => ids.has(u.id));
    return { count: users.length, emails: users.slice(0, 5).map(u => u.email ?? "") };
  }

  if (segment === "investors") {
    const { data: ip } = await admin.from("investor_profiles").select("user_id");
    const ids = new Set((ip ?? []).map((i: { user_id: string }) => i.user_id));
    const users = allUsers.filter(u => ids.has(u.id));
    return { count: users.length, emails: users.slice(0, 5).map(u => u.email ?? "") };
  }

  if (segment === "unpublished_startups") {
    const { data: sp } = await admin.from("startup_profiles").select("user_id").eq("is_published", false);
    const ids = new Set((sp ?? []).map((s: { user_id: string }) => s.user_id));
    const users = allUsers.filter(u => ids.has(u.id));
    return { count: users.length, emails: users.slice(0, 5).map(u => u.email ?? "") };
  }

  if (segment === "unconnected_startups") {
    const { data: sp } = await admin.from("startup_profiles").select("id, user_id");
    const { data: conns } = await admin.from("connections").select("startup_id").eq("status", "accepted");
    const connectedIds = new Set((conns ?? []).map((c: { startup_id: string }) => c.startup_id));
    const unconn = (sp ?? []).filter((s: { id: string }) => !connectedIds.has(s.id));
    const userIds = new Set(unconn.map((s: { user_id: string }) => s.user_id));
    const users = allUsers.filter(u => userIds.has(u.id));
    return { count: users.length, emails: users.slice(0, 5).map(u => u.email ?? "") };
  }

  return { count: 0, emails: [] };
}

export async function sendBroadcast(
  subject: string,
  body: string,
  segment: BroadcastSegment
): Promise<{ sent?: number; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const admin = createAdminClient();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data: authData } = await admin.auth.admin.listUsers();
  const allUsers = authData?.users ?? [];
  let targetUserIds: Set<string> = new Set(allUsers.map(u => u.id));

  if (segment !== "all") {
    const preview = await getSegmentPreview(segment);
    // Refetch full emails for segment
    if (segment === "startups") {
      const { data: sp } = await admin.from("startup_profiles").select("user_id");
      targetUserIds = new Set((sp ?? []).map((s: { user_id: string }) => s.user_id));
    } else if (segment === "investors") {
      const { data: ip } = await admin.from("investor_profiles").select("user_id");
      targetUserIds = new Set((ip ?? []).map((i: { user_id: string }) => i.user_id));
    } else if (segment === "unpublished_startups") {
      const { data: sp } = await admin.from("startup_profiles").select("user_id").eq("is_published", false);
      targetUserIds = new Set((sp ?? []).map((s: { user_id: string }) => s.user_id));
    } else if (segment === "unconnected_startups") {
      const { data: sp } = await admin.from("startup_profiles").select("id, user_id");
      const { data: conns } = await admin.from("connections").select("startup_id").eq("status", "accepted");
      const connectedIds = new Set((conns ?? []).map((c: { startup_id: string }) => c.startup_id));
      const unconn = (sp ?? []).filter((s: { id: string }) => !connectedIds.has(s.id));
      targetUserIds = new Set(unconn.map((s: { user_id: string }) => s.user_id));
    }
  }

  const recipients = allUsers.filter(u => targetUserIds.has(u.id) && u.email);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://startgrid.co";

  let sent = 0;
  for (const recipient of recipients) {
    const personalised = body
      .replace(/\{\{name\}\}/g, recipient.user_metadata?.full_name ?? recipient.email?.split("@")[0] ?? "there")
      .replace(/\{\{link\}\}/g, siteUrl);

    await resend.emails.send({
      from: "StartGrid <noreply@startgrid.co>",
      to: recipient.email!,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #F8FAFC;">
          <div style="background: white; border-radius: 12px; padding: 28px; border: 0.5px solid #E2E8F0;">
            <p style="margin: 0 0 20px; font-size: 11px; font-weight: 700; color: #4F46E5; text-transform: uppercase; letter-spacing: 0.06em;">StartGrid</p>
            <div style="font-size: 14px; color: #374151; line-height: 1.7; white-space: pre-line;">${personalised}</div>
            <div style="margin-top: 28px; padding-top: 16px; border-top: 0.5px solid #E2E8F0;">
              <a href="${siteUrl}" style="display: inline-block; padding: 10px 24px; background: #4F46E5; color: white; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">Open StartGrid →</a>
            </div>
          </div>
        </div>
      `,
    });
    sent++;
  }

  // Record in DB
  await admin.from("broadcast_messages").insert({
    subject,
    body,
    segment: [segment],
    channels: ["email"],
    status: "sent",
    sent_at: new Date().toISOString(),
    sent_count: sent,
    created_by: user.id,
  });

  return { sent };
}

