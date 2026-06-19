"use client";

import { useState } from "react";
import Link from "next/link";

export interface FeedEventUI {
  id: string;
  event_type: string;
  actorName: string;
  actorInitials: string;
  logoUrl?: string | null;
  companyName?: string;
  sector?: string;
  stage?: string;
  country?: string;
  startup_id?: string | null;
  payload: Record<string, unknown>;
  created_at: string;
  isMatch?: boolean;
  isConnected?: boolean;
}

const EVENT_META: Record<string, { emoji: string; color: string; label: (e: FeedEventUI) => string; desc: (e: FeedEventUI) => string }> = {
  startup_joined: {
    emoji: "🚀", color: "#4F46E5",
    label: e => `${e.companyName ?? e.actorName} just joined StartGrid`,
    desc: e => `${e.sector ?? "Startup"} · ${e.stage ?? ""} · ${e.country ?? ""}`.replace(/\s·\s$/, ""),
  },
  pitch_published: {
    emoji: "📢", color: "#7C3AED",
    label: e => `${e.companyName ?? e.actorName} published their pitch deck`,
    desc: () => `View their full 10-slide pitch on StartGrid`,
  },
  milestone_posted: {
    emoji: "🏁", color: "#059669",
    label: e => `${e.companyName ?? e.actorName} posted a milestone`,
    desc: e => `🚀 ${(e.payload?.title as string) ?? "New update"}`,
  },
  funding_updated: {
    emoji: "💰", color: "#D97706",
    label: e => `${e.companyName ?? e.actorName} updated their funding round`,
    desc: () => `Round status updated`,
  },
  team_update: {
    emoji: "👥", color: "#0891B2",
    label: e => `${e.companyName ?? e.actorName} made a team update`,
    desc: e => (e.payload?.detail as string) ?? "",
  },
  product_update: {
    emoji: "⚙️", color: "#7C3AED",
    label: e => `${e.companyName ?? e.actorName} shipped a product update`,
    desc: e => (e.payload?.detail as string) ?? "",
  },
  investor_joined: {
    emoji: "💼", color: "#1B63D8",
    label: e => `${e.actorName} joined StartGrid as an investor`,
    desc: () => "New investor on the platform",
  },
  connection_made: {
    emoji: "🤝", color: "#059669",
    label: e => `${e.actorName} made a new connection`,
    desc: () => "New connection on StartGrid",
  },
};

const TIPS = [
  "💡 Tip: Startups with logos get 3× more profile views from investors.",
  "💡 Tip: Founders who post milestones regularly get 2× more connection requests.",
  "💡 Tip: A complete pitch deck (10 slides) increases your match rate by 40%.",
  "💡 Tip: Add a LinkedIn URL to your profile to build investor trust.",
];

const FILTER_TABS = ["All", "Connected", "New matches", "Milestones", "Platform"];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

interface Props {
  events: FeedEventUI[];
  myRole: string;
}

export default function FeedClient({ events, myRole }: Props) {
  const [activeTab, setActiveTab] = useState("All");
  const [visibleCount, setVisibleCount] = useState(20);

  const filtered = events.filter(e => {
    if (activeTab === "All") return true;
    if (activeTab === "Connected") return e.isConnected;
    if (activeTab === "New matches") return e.isMatch && !e.isConnected;
    if (activeTab === "Milestones") return e.event_type === "milestone_posted";
    if (activeTab === "Platform") return ["investor_joined", "connection_made"].includes(e.event_type);
    return true;
  });

  const visible = filtered.slice(0, visibleCount);

  return (
    <div style={{
      marginLeft: 56, minHeight: "100vh", backgroundColor: "#F8FAFC",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: "white", borderBottom: "0.5px solid #E2E8F0",
        padding: "0 32px", height: 56,
        display: "flex", alignItems: "center",
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.06em" }}>StartGrid</p>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>Activity feed</p>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 32px" }}>
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, overflowX: "auto" }}>
          {FILTER_TABS.map(tab => (
            <button key={tab} type="button" onClick={() => { setActiveTab(tab); setVisibleCount(20); }} style={{
              padding: "7px 14px", borderRadius: 8, cursor: "pointer",
              fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
              border: activeTab === tab ? "0.5px solid #4F46E5" : "0.5px solid #E2E8F0",
              backgroundColor: activeTab === tab ? "#EEF2FF" : "white",
              color: activeTab === tab ? "#4F46E5" : "#64748B",
              transition: "all 0.15s",
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Startup tip card */}
        {myRole === "startup" && (
          <div style={{
            backgroundColor: "#EEF2FF", border: "0.5px solid #C7D2FE",
            borderRadius: 10, padding: "12px 16px", marginBottom: 20,
            fontSize: 13, color: "#4338CA",
          }}>
            {TIPS[Math.floor(Date.now() / 86400000) % TIPS.length]}
          </div>
        )}

        {/* Feed */}
        {visible.length === 0 ? (
          <div style={{
            backgroundColor: "white", borderRadius: 12,
            border: "1px dashed #E2E8F0", padding: "64px 40px", textAlign: "center",
          }}>
            <p style={{ fontSize: 32, margin: "0 0 12px" }}>📭</p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Nothing here yet</p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#94A3B8" }}>
              {activeTab === "All" ? "Activity from startups and investors will appear here." : `No ${activeTab.toLowerCase()} events yet.`}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visible.map(e => {
              const meta = EVENT_META[e.event_type] ?? EVENT_META.startup_joined;
              const isCriteria = e.isMatch && !e.isConnected;

              return (
                <div key={e.id} style={{
                  backgroundColor: "white", borderRadius: 12,
                  border: `0.5px solid ${isCriteria ? "#C7D2FE" : "#E2E8F0"}`,
                  borderLeft: `3px solid ${isCriteria ? "#4F46E5" : "#E2E8F0"}`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  padding: "16px 18px",
                  display: "flex", gap: 14,
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: `linear-gradient(135deg, ${meta.color}33, ${meta.color}66)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden",
                    fontSize: e.logoUrl ? undefined : 16,
                  }}>
                    {e.logoUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={e.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : meta.emoji
                    }
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A", lineHeight: 1.4 }}>
                        {meta.label(e)}
                      </p>
                      <span style={{ fontSize: 11, color: "#94A3B8", flexShrink: 0, marginTop: 1 }}>
                        {timeAgo(e.created_at)}
                      </span>
                    </div>

                    {meta.desc(e) && (
                      <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>
                        {meta.desc(e)}
                      </p>
                    )}

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
                      {e.sector && (
                        <span style={{ fontSize: 10, fontWeight: 500, color: "#4F46E5", backgroundColor: "#EEF2FF", borderRadius: 20, padding: "2px 8px" }}>
                          {e.sector}
                        </span>
                      )}
                      {e.stage && (
                        <span style={{ fontSize: 10, fontWeight: 500, color: "#475569", backgroundColor: "#F8FAFC", border: "0.5px solid #E2E8F0", borderRadius: 20, padding: "2px 8px" }}>
                          {e.stage}
                        </span>
                      )}
                      {e.country && (
                        <span style={{ fontSize: 10, color: "#94A3B8", padding: "2px 0" }}>📍 {e.country}</span>
                      )}
                      {isCriteria && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#4F46E5", backgroundColor: "#EEF2FF", border: "0.5px solid #C7D2FE", borderRadius: 20, padding: "2px 8px" }}>
                          ✦ Matches your criteria
                        </span>
                      )}
                      {myRole === "investor" && e.startup_id && !e.isConnected && (
                        <Link href={`/investor/startup/${e.startup_id}`} style={{
                          fontSize: 11, fontWeight: 600, color: "white",
                          background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                          borderRadius: 6, padding: "4px 10px",
                          textDecoration: "none", marginLeft: 4,
                        }}>
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Load more */}
            {visibleCount < filtered.length && (
              <button
                type="button"
                onClick={() => setVisibleCount(v => v + 20)}
                style={{
                  padding: "11px", borderRadius: 9, width: "100%",
                  border: "0.5px solid #E2E8F0", backgroundColor: "white",
                  fontSize: 13, fontWeight: 600, color: "#4F46E5", cursor: "pointer",
                }}
              >
                Load more ({filtered.length - visibleCount} remaining)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
