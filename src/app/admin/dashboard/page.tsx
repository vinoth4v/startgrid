import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Separator } from "@/components/ui/separator";
import InviteForm from "./InviteForm";
import InvitationTable from "./InvitationTable";
import AdminTabs from "./AdminTabs";
import Sidebar from "@/components/Sidebar";

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "admin") redirect("/login");

  const admin = createAdminClient();

  // Invitations
  const { data: invitations } = await admin
    .from("invitations")
    .select("id, email, role, used_at, created_at")
    .order("created_at", { ascending: false });

  // Stats
  const [
    { count: startupCount },
    { count: investorCount },
    { count: activeConns },
  ] = await Promise.all([
    admin.from("startup_profiles").select("*", { count: "exact", head: true }).not("company_name", "is", null),
    admin.from("investor_profiles").select("*", { count: "exact", head: true }),
    admin.from("connections").select("*", { count: "exact", head: true }).eq("status", "accepted"),
  ]);

  // Members tab data
  const { data: authData } = await admin.auth.admin.listUsers();
  const { data: startupProfiles } = await admin.from("startup_profiles").select("user_id, company_name");
  const { data: investorProfiles } = await admin.from("investor_profiles").select("user_id, name, firm");

  const startupByUser = Object.fromEntries((startupProfiles ?? []).map((s: { user_id: string; company_name: string }) => [s.user_id, s]));
  const investorByUser = Object.fromEntries((investorProfiles ?? []).map((i: { user_id: string; name: string; firm: string }) => [i.user_id, i]));

  const members = (authData?.users ?? []).map((u) => {
    const role = u.user_metadata?.role ?? "unknown";
    const sp = startupByUser[u.id];
    const ip = investorByUser[u.id];
    const name = ip?.name ?? sp?.company_name ?? u.user_metadata?.full_name ?? "";
    return {
      id: u.id,
      email: u.email ?? "",
      role,
      name,
      status: (sp?.company_name || ip?.name) ? "active" as const : "pending" as const,
      joinedAt: u.created_at,
    };
  });

  // Connections tab data
  const { data: allConnections } = await admin
    .from("connections")
    .select("id, investor_id, startup_id, status, created_at")
    .order("created_at", { ascending: false });

  const invProfileIds = (allConnections ?? []).map((c: { investor_id: string }) => c.investor_id);
  const stProfileIds = (allConnections ?? []).map((c: { startup_id: string }) => c.startup_id);

  const [{ data: invProfs }, { data: stProfs }] = await Promise.all([
    admin.from("investor_profiles").select("id, name, firm").in("id", invProfileIds.length ? invProfileIds : ["none"]),
    admin.from("startup_profiles").select("id, company_name").in("id", stProfileIds.length ? stProfileIds : ["none"]),
  ]);

  const invProfMap = Object.fromEntries((invProfs ?? []).map((i: { id: string; name: string; firm: string }) => [i.id, i]));
  const stProfMap = Object.fromEntries((stProfs ?? []).map((s: { id: string; company_name: string }) => [s.id, s]));

  const connections = (allConnections ?? []).map((c: { id: string; investor_id: string; startup_id: string; status: string; created_at: string }) => ({
    id: c.id,
    investorName: invProfMap[c.investor_id]?.name ?? "Unknown",
    investorFirm: invProfMap[c.investor_id]?.firm ?? "",
    startupName: stProfMap[c.startup_id]?.company_name ?? "Unknown",
    status: c.status,
    createdAt: c.created_at,
  }));

  // Access requests tab data
  const { data: accessRequestsRaw } = await admin
    .from("access_requests")
    .select("id, name, email, role, message, status, created_at")
    .order("created_at", { ascending: false });

  const accessRequests = (accessRequestsRaw ?? []).map((r: {
    id: string; name: string; email: string; role: string;
    message: string | null; status: string; created_at: string;
  }) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    message: r.message,
    status: r.status,
    createdAt: r.created_at,
  }));

  // Messages tab data
  const { data: allMessages } = await admin
    .from("messages")
    .select("id, connection_id, sender_id, content, created_at")
    .order("created_at", { ascending: true });

  const connMap = Object.fromEntries(connections.map((c) => [c.id, c]));

  // Build sender display name map
  const senderMap: Record<string, string> = {};
  members.forEach((m) => { senderMap[m.id] = m.name || m.email; });

  const messages = (allMessages ?? []).map((m: { id: string; connection_id: string; sender_id: string; content: string; created_at: string }) => {
    const conn = connMap[m.connection_id];
    return {
      id: m.id,
      connectionId: m.connection_id,
      investorName: conn?.investorName ?? "Unknown",
      startupName: conn?.startupName ?? "Unknown",
      senderName: senderMap[m.sender_id] ?? "Unknown",
      content: m.content,
      createdAt: m.created_at,
    };
  });

  return (
    <>
      <Sidebar role="admin" userInitials="AD" userName={user.email ?? "Admin"} userEmail={user.email ?? ""} userId={user.id} />
      <main style={{
        marginLeft: 56, minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: "white", borderBottom: "0.5px solid #E2E8F0",
          padding: "0 32px", height: 56,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.06em" }}>StartGrid</p>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>Admin Dashboard</p>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "#94A3B8" }}>Full platform visibility</p>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px" }}>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
            {[
              { label: "Startups", value: startupCount ?? 0, icon: "🚀" },
              { label: "Investors", value: investorCount ?? 0, icon: "💼" },
              { label: "Active connections", value: activeConns ?? 0, icon: "🤝" },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{
                backgroundColor: "white", borderRadius: 12,
                border: "0.5px solid #E2E8F0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                padding: "20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                </div>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.8px" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Send invitation */}
          <div style={{
            backgroundColor: "white", borderRadius: 12,
            border: "0.5px solid #E2E8F0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            padding: "20px 24px", marginBottom: 20,
          }}>
            <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.2px" }}>Send invitation</p>
            <InviteForm />
          </div>

          {/* All invitations */}
          <div style={{
            backgroundColor: "white", borderRadius: 12,
            border: "0.5px solid #E2E8F0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            padding: "20px 24px", marginBottom: 28,
          }}>
            <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.2px" }}>All invitations</p>
            <InvitationTable initial={invitations ?? []} />
          </div>

          {/* Platform activity tabs */}
          <div style={{
            backgroundColor: "white", borderRadius: 12,
            border: "0.5px solid #E2E8F0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            padding: "20px 24px",
          }}>
            <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.2px" }}>Platform activity</p>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "#94A3B8" }}>Members, connections, and messages across the platform</p>
            <AdminTabs members={members} connections={connections} messages={messages} accessRequests={accessRequests} />
          </div>
        </div>
      </main>
    </>
  );
}
