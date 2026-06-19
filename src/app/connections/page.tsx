import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Sidebar from "@/components/Sidebar";
import ConnectionsClient, { type Connection } from "./ConnectionsClient";

export default async function ConnectionsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const role = user.user_metadata?.role as string;

  let myProfileId: string | null = null;
  let displayName = "";
  let userInitials = "ME";
  const connections: Connection[] = [];

  if (role === "startup") {
    const { data: sp } = await admin
      .from("startup_profiles")
      .select("id, company_name")
      .eq("user_id", user.id)
      .single();
    myProfileId = sp?.id ?? null;
    displayName = sp?.company_name ?? "";
    userInitials = (displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2) || "SU").toUpperCase();

    if (myProfileId) {
      const { data: conns } = await admin
        .from("connections")
        .select("id, investor_id, created_at")
        .eq("startup_id", myProfileId)
        .eq("status", "accepted");

      if ((conns ?? []).length > 0) {
        const investorIds = (conns ?? []).map((c: { investor_id: string }) => c.investor_id);
        const { data: investors } = await admin
          .from("investor_profiles")
          .select("id, name, firm, criteria, user_id")
          .in("id", investorIds);

        const investorMap = Object.fromEntries(
          (investors ?? []).map((i: { id: string; name: string; firm: string; criteria: unknown; user_id: string }) => [i.id, i])
        );

        for (const c of (conns ?? [])) {
          const inv = investorMap[c.investor_id];
          if (!inv) continue;
          const crit = inv.criteria as { sectors?: string[]; stages?: string[]; geographies?: string[] } | null;
          connections.push({
            id: c.id,
            connectedAt: c.created_at,
            role: "investor",
            investorId: inv.id,
            investorName: inv.name,
            firm: inv.firm,
            criteria: crit ?? undefined,
            sector: crit?.sectors?.[0],
            country: crit?.geographies?.[0],
          });
        }
      }
    }
  } else if (role === "investor") {
    const { data: ip } = await admin
      .from("investor_profiles")
      .select("id, name, firm")
      .eq("user_id", user.id)
      .single();
    myProfileId = ip?.id ?? null;
    displayName = ip?.name ?? "";
    userInitials = (displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2) || "IN").toUpperCase();

    if (myProfileId) {
      const { data: conns } = await admin
        .from("connections")
        .select("id, startup_id, created_at")
        .eq("investor_id", myProfileId)
        .eq("status", "accepted");

      if ((conns ?? []).length > 0) {
        const startupIds = (conns ?? []).map((c: { startup_id: string }) => c.startup_id);
        const { data: startups } = await admin
          .from("startup_profiles")
          .select("id, company_name, sector, stage, country, logo_url, raw_onboarding_data")
          .in("id", startupIds);

        const startupMap = Object.fromEntries(
          (startups ?? []).map((s: { id: string; company_name: string; sector: string; stage: string; country: string; logo_url: string; raw_onboarding_data: { ask?: string } | null }) => [s.id, s])
        );

        for (const c of (conns ?? [])) {
          const s = startupMap[c.startup_id];
          if (!s) continue;
          connections.push({
            id: c.id,
            connectedAt: c.created_at,
            role: "startup",
            startupId: s.id,
            companyName: s.company_name,
            sector: s.sector,
            stage: s.stage,
            country: s.country,
            logoUrl: s.logo_url,
            fundingGoal: s.raw_onboarding_data?.ask,
          });
        }
      }
    }
  }

  return (
    <>
      <Sidebar role={role} userInitials={userInitials} userName={displayName} userEmail={user.email ?? ""} userId={user.id} />
      <ConnectionsClient connections={connections} myRole={role} />
    </>
  );
}
