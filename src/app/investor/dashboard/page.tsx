import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import InvestorDashboard from "./InvestorDashboard";
import Sidebar from "@/components/Sidebar";

export default async function InvestorDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: investorProfile } = await admin
    .from("investor_profiles")
    .select("id, name, firm, criteria")
    .eq("user_id", user.id)
    .single();

  if (!investorProfile || !investorProfile.criteria?.stages?.length) {
    redirect("/investor/onboard");
  }

  const { data: startups } = await admin
    .from("startup_profiles")
    .select("id, company_name, sector, stage, country, website, is_published, user_id")
    .eq("is_published", true);

  const { data: connections } = await admin
    .from("connections")
    .select("startup_id, status")
    .eq("investor_id", investorProfile.id);

  const connectionMap: Record<string, string> = {};
  (connections ?? []).forEach((c) => {
    connectionMap[c.startup_id] = c.status;
  });

  const { data: favourites } = await admin
    .from("investor_favourites")
    .select("startup_id")
    .eq("investor_id", investorProfile.id);

  const favouriteIds = (favourites ?? []).map((f: { startup_id: string }) => f.startup_id);

  const userInitials = investorProfile.name
    .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <Sidebar role="investor" userInitials={userInitials} />
      <InvestorDashboard
        investorId={investorProfile.id}
        investorName={investorProfile.name}
        criteria={investorProfile.criteria}
        startups={startups ?? []}
        connectionMap={connectionMap}
        favouriteIds={favouriteIds}
      />
    </>
  );
}
