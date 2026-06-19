"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function regenerateShareToken(): Promise<{ token?: string; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();

  // Generate a new 32-char hex token via Supabase
  const newToken = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  const { error } = await admin
    .from("startup_profiles")
    .update({ share_token: newToken })
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { token: newToken };
}
