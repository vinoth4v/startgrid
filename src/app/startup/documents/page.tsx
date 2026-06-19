import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Sidebar from "@/components/Sidebar";
import { getDocuments } from "@/app/actions/documents";
import DocumentVaultClient from "./DocumentVaultClient";

export default async function DocumentsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: sp } = await admin
    .from("startup_profiles")
    .select("id, company_name")
    .eq("user_id", user.id)
    .single();

  if (!sp) redirect("/startup/dashboard");

  const docs = await getDocuments(sp.id);
  const userInitials = (sp.company_name ?? "SU")
    .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <Sidebar role="startup" userInitials={userInitials} userName={sp.company_name ?? ""} userEmail={user.email ?? ""} userId={user.id} />
      <DocumentVaultClient initialDocs={docs} />
    </>
  );
}
