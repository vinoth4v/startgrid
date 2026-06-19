import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Sidebar from "@/components/Sidebar";
import FeedClient, { type FeedEventUI } from "./FeedClient";
import { getFeedForInvestor, getFeedForStartup } from "@/app/actions/feed";

export default async function FeedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const role = user.user_metadata?.role as string;

  let displayName = "";
  let userInitials = "ME";
  let events: FeedEventUI[] = [];

  if (role === "startup") {
    const { data: sp } = await admin
      .from("startup_profiles")
      .select("id, company_name")
      .eq("user_id", user.id)
      .single();

    displayName = sp?.company_name ?? "";
    userInitials = (displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2) || "SU").toUpperCase();

    if (sp?.id) {
      const raw = await getFeedForStartup(sp.id);
      events = raw as unknown as FeedEventUI[];
    }
  } else if (role === "investor") {
    const { data: ip } = await admin
      .from("investor_profiles")
      .select("id, name, criteria")
      .eq("user_id", user.id)
      .single();

    displayName = ip?.name ?? "";
    userInitials = (displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2) || "IN").toUpperCase();

    if (ip?.id) {
      const crit = (ip.criteria ?? {}) as { stages?: string[]; sectors?: string[]; geographies?: string[] };
      const raw = await getFeedForInvestor(ip.id, {
        stages: crit.stages ?? [],
        sectors: crit.sectors ?? [],
        geographies: crit.geographies ?? [],
      });
      events = raw as unknown as FeedEventUI[];
    }
  } else {
    redirect("/admin/dashboard");
  }

  return (
    <>
      <Sidebar
        role={role}
        userInitials={userInitials}
        userName={displayName}
        userEmail={user.email ?? ""}
        userId={user.id}
      />
      <FeedClient events={events} myRole={role} />
    </>
  );
}
