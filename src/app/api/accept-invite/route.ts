import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, fullName, password } = body as {
    token?: string;
    fullName?: string;
    password?: string;
  };

  if (!token || !fullName || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Validate the invitation
  const { data: invitation, error: fetchError } = await supabase
    .from("invitations")
    .select("id, email, role, used_at")
    .eq("token", token)
    .single();

  if (fetchError || !invitation) {
    return NextResponse.json(
      { error: "Invitation not found" },
      { status: 404 }
    );
  }

  if (invitation.used_at) {
    return NextResponse.json(
      { error: "This invitation has already been used" },
      { status: 400 }
    );
  }

  // Create the auth user — email_confirm: true bypasses the confirmation email
  const { data: authData, error: createError } =
    await supabase.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true,
      user_metadata: {
        role: invitation.role,
        full_name: fullName,
      },
    });

  if (createError || !authData.user) {
    return NextResponse.json(
      { error: createError?.message ?? "Failed to create account" },
      { status: 400 }
    );
  }

  const userId = authData.user.id;

  // Create the role-specific profile
  if (invitation.role === "startup") {
    await supabase.from("startup_profiles").insert({ user_id: userId });
  } else if (invitation.role === "investor") {
    await supabase.from("investor_profiles").insert({
      user_id: userId,
      name: fullName,
      firm: "",
      criteria: { role: "", stages: [], sectors: [], revenuePreference: "Both", geographies: [], minTicket: "", maxTicket: "" },
    });
  }

  // Mark the invitation as used
  await supabase
    .from("invitations")
    .update({ used_at: new Date().toISOString() })
    .eq("id", invitation.id);

  return NextResponse.json({
    success: true,
    email: invitation.email,
    role: invitation.role,
  });
}
