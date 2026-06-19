import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import MessagesClient from "./MessagesClient";
import Sidebar from "@/components/Sidebar";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { c?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const role = user.user_metadata?.role as string;

  // Find the user's profile id depending on role
  let myProfileId: string | null = null;
  let myDisplayName = "";

  if (role === "startup") {
    const { data } = await admin
      .from("startup_profiles")
      .select("id, company_name")
      .eq("user_id", user.id)
      .single();
    myProfileId = data?.id ?? null;
    myDisplayName = data?.company_name ?? "Your company";
  } else {
    const { data } = await admin
      .from("investor_profiles")
      .select("id, name")
      .eq("user_id", user.id)
      .single();
    myProfileId = data?.id ?? null;
    myDisplayName = data?.name ?? "You";
  }

  if (!myProfileId) redirect(role === "startup" ? "/startup/dashboard" : "/investor/dashboard");

  // Fetch accepted connections
  const column = role === "startup" ? "startup_id" : "investor_id";
  const { data: connections } = await admin
    .from("connections")
    .select("id, investor_id, startup_id, status, created_at")
    .eq(column, myProfileId)
    .eq("status", "accepted");

  const userInitials = myDisplayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "ME";

  if (!connections || connections.length === 0) {
    return (
      <>
        <Sidebar role={role} userInitials={userInitials} userName={myDisplayName} userEmail={user.email ?? ""} userId={user.id} />
        <MessagesClient
          userId={user.id}
          threads={[]}
          initialMessages={[]}
          selectedConnectionId={null}
          myDisplayName={myDisplayName}
          senderMap={{}}
        />
      </>
    );
  }

  // Enrich threads with other party info
  const investorIds = connections.map((c: { investor_id: string }) => c.investor_id);
  const startupIds = connections.map((c: { startup_id: string }) => c.startup_id);

  const [{ data: investorProfiles }, { data: startupProfiles }] = await Promise.all([
    admin.from("investor_profiles").select("id, name, firm, user_id, criteria").in("id", investorIds),
    admin.from("startup_profiles").select("id, company_name, sector, stage, country, website, logo_url, user_id").in("id", startupIds),
  ]);

  const investorMap = Object.fromEntries((investorProfiles ?? []).map((i: { id: string; name: string; firm: string; user_id: string; criteria: unknown }) => [i.id, i]));
  const startupMap = Object.fromEntries((startupProfiles ?? []).map((s: { id: string; company_name: string; sector: string; stage: string; country: string; website: string; logo_url: string; user_id: string }) => [s.id, s]));

  // Build sender display name map (userId → display name)
  const senderMap: Record<string, string> = {};
  (investorProfiles ?? []).forEach((i: { user_id: string; name: string; firm: string }) => {
    senderMap[i.user_id] = `${i.name}${i.firm ? `, ${i.firm}` : ""}`;
  });
  (startupProfiles ?? []).forEach((s: { user_id: string; company_name: string }) => {
    senderMap[s.user_id] = s.company_name;
  });

  const threads = connections.map((c: { id: string; investor_id: string; startup_id: string; created_at: string }) => {
    const investor = investorMap[c.investor_id];
    const startup = startupMap[c.startup_id];
    const otherName = role === "startup"
      ? `${investor?.name ?? "Investor"}${investor?.firm ? ` · ${investor.firm}` : ""}`
      : (startup?.company_name ?? "Startup");
    return {
      connectionId: c.id,
      otherName,
      sector: startup?.sector ?? null,
      stage: startup?.stage ?? null,
      country: startup?.country ?? null,
      website: startup?.website ?? null,
      logoUrl: startup?.logo_url ?? null,
      firm: investor?.firm ?? null,
      startupId: startup?.id ?? null,
      lastMessage: null as string | null,
      lastAt: c.created_at,
    };
  });

  // Fetch last message for each connection for preview
  const allConnectionIds = connections.map((c: { id: string }) => c.id);
  const { data: lastMessages } = await admin
    .from("messages")
    .select("connection_id, content, created_at")
    .in("connection_id", allConnectionIds)
    .order("created_at", { ascending: false });

  const lastMsgMap: Record<string, { content: string; created_at: string }> = {};
  (lastMessages ?? []).forEach((m: { connection_id: string; content: string; created_at: string }) => {
    if (!lastMsgMap[m.connection_id]) lastMsgMap[m.connection_id] = m;
  });

  threads.forEach((t) => {
    const lm = lastMsgMap[t.connectionId];
    if (lm) {
      t.lastMessage = lm.content;
      t.lastAt = lm.created_at;
    }
  });

  // Fetch initial messages for selected connection
  const selectedConnectionId = searchParams.c ?? threads[0]?.connectionId ?? null;
  let initialMessages: { id: string; sender_id: string; content: string; created_at: string }[] = [];
  if (selectedConnectionId) {
    const { data } = await admin
      .from("messages")
      .select("id, sender_id, content, created_at")
      .eq("connection_id", selectedConnectionId)
      .order("created_at", { ascending: true });
    initialMessages = data ?? [];
  }

  return (
    <>
      <Sidebar role={role} userInitials={userInitials} userName={myDisplayName} userEmail={user.email ?? ""} userId={user.id} />
      <MessagesClient
        userId={user.id}
        myRole={role}
        threads={threads}
        initialMessages={initialMessages}
        selectedConnectionId={selectedConnectionId}
        myDisplayName={myDisplayName}
        senderMap={senderMap}
      />
    </>
  );
}
