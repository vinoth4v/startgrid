"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export interface Connection {
  id: string;
  connectedAt: string;
  role: "startup" | "investor";
  // startup fields
  startupId?: string;
  companyName?: string;
  sector?: string;
  stage?: string;
  country?: string;
  website?: string;
  logoUrl?: string;
  fundingGoal?: string;
  // investor fields
  investorId?: string;
  investorName?: string;
  firm?: string;
  criteria?: { sectors?: string[]; stages?: string[]; geographies?: string[] };
}

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d}d ago`;
  const m = Math.floor(d / 30);
  if (m < 12) return `${m}mo ago`;
  return `${Math.floor(m / 12)}y ago`;
}

const SORT_OPTIONS = [
  { value: "recent", label: "Recently connected" },
  { value: "alpha", label: "Alphabetical A–Z" },
  { value: "sector", label: "By sector" },
  { value: "country", label: "By country" },
];

interface Props {
  connections: Connection[];
  myRole: string;
}

export default function ConnectionsClient({ connections, myRole }: Props) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = connections.filter(c => {
      if (!q) return true;
      const fields = [
        c.companyName, c.investorName, c.firm,
        c.sector, c.country, c.stage,
        ...(c.criteria?.sectors ?? []),
      ].filter(Boolean).join(" ").toLowerCase();
      return fields.includes(q);
    });

    list = [...list].sort((a, b) => {
      if (sort === "alpha") {
        const na = (a.companyName ?? a.investorName ?? "").toLowerCase();
        const nb = (b.companyName ?? b.investorName ?? "").toLowerCase();
        return na.localeCompare(nb);
      }
      if (sort === "sector") {
        return (a.sector ?? "").localeCompare(b.sector ?? "");
      }
      if (sort === "country") {
        return (a.country ?? "").localeCompare(b.country ?? "");
      }
      // recent (default)
      return new Date(b.connectedAt).getTime() - new Date(a.connectedAt).getTime();
    });

    return list;
  }, [connections, search, sort]);

  const profileHref = (c: Connection) =>
    c.role === "startup"
      ? `/investor/startup/${c.startupId}`
      : c.investorId
        ? `/investor/profile/${c.investorId}`
        : `/startup/dashboard`;

  return (
    <div style={{
      marginLeft: 56, minHeight: "100vh", backgroundColor: "#F8FAFC",
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
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>My connections</p>
        </div>
        <span style={{ fontSize: 12, color: "#94A3B8" }}>
          {filtered.length} connection{filtered.length !== 1 ? "s" : ""}{search ? " found" : ""}
        </span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px" }}>
        {/* Search + Sort */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search your connections…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "10px 12px 10px 38px",
                borderRadius: 9, border: "0.5px solid #E2E8F0",
                backgroundColor: "white", fontSize: 13, color: "#0F172A",
                outline: "none", boxSizing: "border-box",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            />
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{
              padding: "10px 14px", borderRadius: 9,
              border: "0.5px solid #E2E8F0", backgroundColor: "white",
              fontSize: 13, color: "#475569", cursor: "pointer", outline: "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Empty state */}
        {connections.length === 0 ? (
          <div style={{
            backgroundColor: "white", borderRadius: 12,
            border: "1px dashed #E2E8F0", padding: "64px 40px", textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🤝</div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>No connections yet</p>
            <p style={{ margin: "6px 0 24px", fontSize: 13, color: "#94A3B8" }}>
              {myRole === "investor"
                ? "Browse startups and send connection requests to start building your network."
                : "When investors connect with you, they'll appear here."}
            </p>
            {myRole === "investor" && (
              <Link href="/investor/dashboard" style={{
                display: "inline-flex", alignItems: "center",
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                color: "white", fontSize: 13, fontWeight: 600,
                padding: "10px 20px", borderRadius: 9, textDecoration: "none",
                boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
              }}>
                Discover startups →
              </Link>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            backgroundColor: "white", borderRadius: 12,
            border: "1px dashed #E2E8F0", padding: "48px 40px", textAlign: "center",
          }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0F172A" }}>No connections match "{search}"</p>
            <button type="button" onClick={() => setSearch("")} style={{
              marginTop: 12, background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "#4F46E5", fontWeight: 600,
            }}>Clear search</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {filtered.map(c => {
              const isStartup = c.role === "startup";
              const name = isStartup ? c.companyName : c.investorName;
              const sub = isStartup ? c.sector : c.firm;

              return (
                <div key={c.id} style={{
                  backgroundColor: "white", borderRadius: 12,
                  border: "0.5px solid #E2E8F0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  padding: 20, display: "flex", flexDirection: "column", gap: 14,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#C7D2FE";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(79,70,229,0.08)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#E2E8F0";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                  }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: isStartup ? "linear-gradient(135deg, #4F46E5, #7C3AED)" : "linear-gradient(135deg, #0F3E9E, #1B63D8)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden",
                      color: "white", fontWeight: 700, fontSize: 14,
                    }}>
                      {isStartup && c.logoUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={c.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : initials(name)
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {name ?? "—"}
                      </p>
                      {sub && <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>{sub}</p>}
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                      backgroundColor: isStartup ? "#EEF2FF" : "#F0FDF4",
                      color: isStartup ? "#4F46E5" : "#059669",
                      border: `0.5px solid ${isStartup ? "#C7D2FE" : "#A7F3D0"}`,
                      flexShrink: 0,
                    }}>
                      {isStartup ? "Startup" : "Investor"}
                    </div>
                  </div>

                  {/* Badges */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {c.sector && (
                      <span style={{ fontSize: 10, fontWeight: 500, color: "#4F46E5", backgroundColor: "#EEF2FF", borderRadius: 20, padding: "3px 8px" }}>
                        {c.sector}
                      </span>
                    )}
                    {isStartup && c.stage && (
                      <span style={{ fontSize: 10, fontWeight: 500, color: "#475569", backgroundColor: "#F8FAFC", border: "0.5px solid #E2E8F0", borderRadius: 20, padding: "3px 8px" }}>
                        {c.stage}
                      </span>
                    )}
                    {c.country && (
                      <span style={{ fontSize: 10, fontWeight: 500, color: "#475569", backgroundColor: "#F8FAFC", border: "0.5px solid #E2E8F0", borderRadius: 20, padding: "3px 8px" }}>
                        📍 {c.country}
                      </span>
                    )}
                    {!isStartup && c.criteria?.stages?.slice(0, 2).map(s => (
                      <span key={s} style={{ fontSize: 10, fontWeight: 500, color: "#475569", backgroundColor: "#F8FAFC", border: "0.5px solid #E2E8F0", borderRadius: 20, padding: "3px 8px" }}>
                        {s}
                      </span>
                    ))}
                    {isStartup && c.fundingGoal && (
                      <span style={{ fontSize: 10, fontWeight: 500, color: "#059669", backgroundColor: "#F0FDF4", border: "0.5px solid #A7F3D0", borderRadius: 20, padding: "3px 8px" }}>
                        Ask: {c.fundingGoal}
                      </span>
                    )}
                  </div>

                  {/* Status + connected date */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10B981" }} />
                    <span style={{ fontSize: 11, color: "#64748B" }}>Connected {timeAgo(c.connectedAt)}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, borderTop: "0.5px solid #F1F5F9", paddingTop: 12 }}>
                    <Link href="/messages" style={{ flex: 1 }}>
                      <button type="button" style={{
                        width: "100%", padding: "8px 0", borderRadius: 8,
                        background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                        border: "none", color: "white", fontSize: 12, fontWeight: 600,
                        cursor: "pointer",
                      }}>
                        Message →
                      </button>
                    </Link>
                    {isStartup && c.startupId && myRole === "investor" && (
                      <Link href={`/investor/startup/${c.startupId}`}>
                        <button type="button" style={{
                          padding: "8px 14px", borderRadius: 8,
                          border: "0.5px solid #E2E8F0", backgroundColor: "white",
                          fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer",
                        }}>
                          View profile
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
