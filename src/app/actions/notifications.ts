"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

export async function createNotification({
  userId,
  type,
  title,
  body,
  link,
}: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
}) {
  const admin = createAdminClient();
  await admin.from("notifications").insert({ user_id: userId, type, title, body, link: link ?? null });
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as Notification[];
}

export async function markNotificationRead(notificationId: string) {
  const admin = createAdminClient();
  await admin.from("notifications").update({ read: true }).eq("id", notificationId);
}

export async function markAllNotificationsRead(userId: string) {
  const admin = createAdminClient();
  await admin.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}
