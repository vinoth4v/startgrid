import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Sidebar from "@/components/Sidebar";
import ConnectButtonFromStartup from "./ConnectButtonFromStartup";

function initials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function Badge({ children, color = "#4F46E5", bg = "#EEF2FF" }: { children: React.ReactNode; color?: string; bg?: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, color, backgroundColor: bg,
      margin: "0 4px 4px 0",
    }}>{children}</span>
  );
}

export default async function InvestorProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = user.user_metadata?.role as string;
  const admin = createAdminClient();

  const { data: investor } = await admin
    .from("investor_profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!investor) redirect("/");

  const criteria = investor.criteria ?? {};
  const sectors: string[] = criteria.sectors ?? [];
  const stages: string[] = criteria.stages ?? [];
  const geos: string[] = criteria.geographies ?? [];
  const minTicket: string = criteria.minTicket ?? "";
  const maxTicket: string = criteria.maxTicket ?? "";

  // Check if a connection already exists (startup role only)
  let connectionStatus: string | null = null;
  let startupId: string | null = null;
  if (role === "startup") {
    const { data: sp } = await admin.from("startup_profiles").select("id").eq("user_id", user.id).single();
    startupId = sp?.id ?? null;
    if (startupId) {
      const { data: conn } = await admin
        .from("connections")
        .select("status")
        .eq("startup_id", startupId)
        .eq("investor_id", params.id)
        .maybeSingle();
      connectionStatus = conn?.status ?? null;
    }
  }

  // Get investor's user email for display (only show if connected)
  let investorEmail: string | null = null;
  if (connectionStatus === "accepted") {
    const { data: invUser } = await admin.auth.admin.getUserById(investor.user_id);
    investorEmail = invUser?.user?.email ?? null;
  }

  const userName = user.user_metadata?.full_name ?? user.email ?? "";
  const userInitials = userName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || (user.email?.[0] ?? "U").toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Sidebar role={role} userInitials={userInitials} userName={userName} userEmail={user.email ?? ""} userId={user.id} />

      <main style={{ flex: 1, marginLeft: 56, padding: "32px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* Back link */}
          <a href={role === "startup" ? "/startup/dashboard" : "/investor/dashboard"} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "#64748B", textDecoration: "none", marginBottom: 24,
          }}>← Back</a>

          {/* Profile header card */}
          <div style={{
            backgroundColor: "white", borderRadius: 14,
            border: "0.5px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: "28px 32px", marginBottom: 16,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 20 }}>
              {/* Avatar */}
              <div style={{
                width: 72, height: 72, borderRadius: 14,
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: 22, fontWeight: 800, flexShrink: 0,
              }}>
                {initials(investor.name ?? "?")}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" }}>
                  {investor.name}
                </h1>
                {investor.firm && (
                  <p style={{ margin: "0 0 8px", fontSize: 14, color: "#64748B", fontWeight: 500 }}>{investor.firm}</p>
                )}
                {investorEmail && (
                  <a href={`mailto:${investorEmail}`} style={{ fontSize: 12, color: "#4F46E5", textDecoration: "none" }}>
                    {investorEmail}
                  </a>
                )}
              </div>

              {/* Connect / status button — only for startups */}
              {role === "startup" && startupId && (
                <ConnectButtonFromStartup
                  investorId={params.id}
                  connectionStatus={connectionStatus}
                />
              )}
            </div>

            {/* Role badge */}
            {criteria.role && (
              <Badge color="#166534" bg="#DCFCE7">{criteria.role}</Badge>
            )}
          </div>

          {/* Investment criteria */}
          <div style={{
            backgroundColor: "white", borderRadius: 14,
            border: "0.5px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: "24px 32px", marginBottom: 16,
          }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.2px" }}>Investment Criteria</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Sectors</p>
                {sectors.length ? sectors.map(s => <Badge key={s}>{s}</Badge>) : <p style={{ margin: 0, fontSize: 12, color: "#94A3B8" }}>Any sector</p>}
              </div>

              <div>
                <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Stages</p>
                {stages.length ? stages.map(s => <Badge key={s} color="#92400E" bg="#FEF3C7">{s}</Badge>) : <p style={{ margin: 0, fontSize: 12, color: "#94A3B8" }}>Any stage</p>}
              </div>

              <div>
                <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Geographies</p>
                {geos.length ? geos.map(g => <Badge key={g} color="#0E7490" bg="#E0F2FE">{g}</Badge>) : <p style={{ margin: 0, fontSize: 12, color: "#94A3B8" }}>Any geography</p>}
              </div>

              {(minTicket || maxTicket) && (
                <div>
                  <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Ticket Size</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                    {minTicket && maxTicket ? `${minTicket} – ${maxTicket}` : minTicket || maxTicket}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* What they look for */}
          {criteria.revenuePreference && (
            <div style={{
              backgroundColor: "white", borderRadius: 14,
              border: "0.5px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              padding: "24px 32px",
            }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Revenue Preference</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>{criteria.revenuePreference}</p>
            </div>
          )}

          {/* Connected — show contact prompt */}
          {connectionStatus === "accepted" && (
            <div style={{
              marginTop: 16, padding: "16px 20px", borderRadius: 10,
              backgroundColor: "#EEF2FF", border: "0.5px solid #C7D2FE",
            }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "#3730A3" }}>You're connected</p>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#4338CA" }}>You can message {investor.name} directly.</p>
              <a href="/messages" style={{
                display: "inline-block", padding: "8px 18px", borderRadius: 7,
                backgroundColor: "#4F46E5", color: "white", fontSize: 12, fontWeight: 600,
                textDecoration: "none",
              }}>Go to Messages →</a>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
