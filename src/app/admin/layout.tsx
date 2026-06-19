import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "admin") redirect("/login");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar userEmail={user.email ?? ""} userId={user.id} />
      <div style={{ flex: 1, marginLeft: 220, minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
        {children}
      </div>
    </div>
  );
}
