import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  // Fetch the invitation so we know the email and whether it was accepted
  const { data: invitation, error: fetchError } = await admin
    .from("invitations")
    .select("id, email, role, used_at")
    .eq("id", params.id)
    .single();

  if (fetchError || !invitation) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  // If the invitation was accepted, delete the auth user (profiles cascade or we delete manually)
  if (invitation.used_at) {
    // Find the auth user by email
    const { data: userList } = await admin.auth.admin.listUsers();
    const targetUser = userList?.users?.find((u) => u.email === invitation.email);

    if (targetUser) {
      // Delete role-specific profile first
      if (invitation.role === "startup") {
        await admin.from("startup_profiles").delete().eq("user_id", targetUser.id);
      } else if (invitation.role === "investor") {
        await admin.from("investor_profiles").delete().eq("user_id", targetUser.id);
      }

      // Delete the auth user
      await admin.auth.admin.deleteUser(targetUser.id);
    }
  }

  // Delete the invitation row
  const { error } = await admin.from("invitations").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
