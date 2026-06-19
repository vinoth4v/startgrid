import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = user.user_metadata?.role as string ?? "";
  const fullName = user.user_metadata?.full_name ?? "";
  const userInitials = fullName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || (user.email?.[0] ?? "U").toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Sidebar role={role} userInitials={userInitials} userName={fullName} userEmail={user.email ?? ""} userId={user.id} />
      <main style={{ flex: 1, marginLeft: 56, padding: "32px" }}>
        <SettingsClient
          userId={user.id}
          email={user.email ?? ""}
          fullName={fullName}
          role={role}
        />
      </main>
    </div>
  );
}
