"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type FeedEventType =
  | "startup_joined"
  | "pitch_published"
  | "milestone_posted"
  | "funding_updated"
  | "team_update"
  | "product_update"
  | "investor_joined"
  | "connection_made";

export interface FeedEvent {
  id: string;
  actor_id: string | null;
  event_type: FeedEventType;
  startup_id: string | null;
  investor_id: string | null;
  payload: Record<string, unknown>;
  created_at: string;
  // enriched
  actorName?: string;
  actorInitials?: string;
  logoUrl?: string;
  companyName?: string;
  sector?: string;
  stage?: string;
  country?: string;
}

export async function createFeedEvent(
  actorId: string,
  eventType: FeedEventType,
  startupId?: string,
  investorId?: string,
  payload: Record<string, unknown> = {}
) {
  const admin = createAdminClient();
  await admin.from("feed_events").insert({
    actor_id: actorId,
    event_type: eventType,
    startup_id: startupId ?? null,
    investor_id: investorId ?? null,
    payload,
  });
}

export async function getFeedForInvestor(
  investorId: string,
  criteria: { stages?: string[]; sectors?: string[]; geographies?: string[] }
): Promise<FeedEvent[]> {
  const admin = createAdminClient();

  // Get connected startup IDs
  const { data: conns } = await admin
    .from("connections")
    .select("startup_id")
    .eq("investor_id", investorId)
    .eq("status", "accepted");
  const connectedIds = (conns ?? []).map((c: { startup_id: string }) => c.startup_id);

  // Get recent feed events
  const { data: events } = await admin
    .from("feed_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(60);

  if (!events) return [];

  // Get startup info
  const startupIds = Array.from(new Set((events ?? []).filter(e => e.startup_id).map(e => e.startup_id)));
  const { data: startups } = startupIds.length > 0
    ? await admin.from("startup_profiles").select("id, company_name, sector, stage, country, logo_url").in("id", startupIds)
    : { data: [] };
  const startupMap = Object.fromEntries((startups ?? []).map((s: { id: string; company_name: string; sector: string; stage: string; country: string; logo_url: string }) => [s.id, s]));

  // Get investor info
  const investorIds2 = Array.from(new Set((events ?? []).filter(e => e.investor_id).map(e => e.investor_id)));
  const { data: investors } = investorIds2.length > 0
    ? await admin.from("investor_profiles").select("id, name, firm").in("id", investorIds2)
    : { data: [] };
  const investorMap = Object.fromEntries((investors ?? []).map((i: { id: string; name: string; firm: string }) => [i.id, i]));

  return (events ?? []).map(e => {
    const s = e.startup_id ? startupMap[e.startup_id] : null;
    const inv = e.investor_id ? investorMap[e.investor_id] : null;
    const name = s?.company_name ?? inv?.name ?? "StartGrid";
    const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

    // Check if matches investor criteria
    const stageMatch = !criteria.stages?.length || (s && criteria.stages.includes(s.stage));
    const sectorMatch = !criteria.sectors?.length || (s && criteria.sectors.includes(s.sector));

    return {
      ...e,
      actorName: name,
      actorInitials: initials,
      logoUrl: s?.logo_url ?? null,
      companyName: s?.company_name,
      sector: s?.sector,
      stage: s?.stage,
      country: s?.country,
      isMatch: stageMatch && sectorMatch,
      isConnected: s && connectedIds.includes(s.id),
    } as FeedEvent & { isMatch: boolean; isConnected: boolean };
  });
}

export async function getFeedForStartup(startupId: string): Promise<FeedEvent[]> {
  const admin = createAdminClient();
  const { data: events } = await admin
    .from("feed_events")
    .select("*")
    .eq("startup_id", startupId)
    .order("created_at", { ascending: false })
    .limit(40);
  return (events ?? []) as FeedEvent[];
}
