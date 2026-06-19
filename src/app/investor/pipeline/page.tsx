import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import { getPipelineDeals } from "@/app/actions/pipeline";
import { createAdminClient } from "@/lib/supabase/admin";
import PipelineClient from "./PipelineClient";

export default async function PipelinePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: ip } = await admin
    .from("investor_profiles")
    .select("id, name")
    .eq("user_id", user.id)
    .single();

  if (!ip) redirect("/investor/dashboard");

  const deals = await getPipelineDeals();
  const userInitials = (ip.name ?? "")
    .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "IN";

  return (
    <>
      <Sidebar role="investor" userInitials={userInitials} userName={ip.name ?? ""} userEmail={user.email ?? ""} userId={user.id} />
      <PipelineClient initialDeals={deals} />
    </>
  );
}
