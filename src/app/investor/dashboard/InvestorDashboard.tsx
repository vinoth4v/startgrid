"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { InvestorCriteria } from "@/app/actions/investor";
import { toggleFavourite } from "@/app/actions/favourites";

interface Startup {
  id: string;
  company_name: string | null;
  sector: string | null;
  stage: string | null;
  country: string | null;
  website: string | null;
}

interface Props {
  investorId: string;
  investorName: string;
  criteria: InvestorCriteria;
  startups: Startup[];
  connectionMap: Record<string, string>;
  favouriteIds: string[];
}

function initials(name: string | null): string {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const STAGES = ["Pre-seed", "Seed", "Series A"];
const SECTORS = ["Climate Tech", "B2B SaaS", "Fintech", "Health Tech", "Deep Tech", "Marketplace"];

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: "5px 10px", borderRadius: 20, cursor: "pointer",
      fontSize: 11, fontWeight: 500,
      border: active ? "0.5px solid #4F46E5" : "0.5px solid #E2E8F0",
      backgroundColor: active ? "#EEF2FF" : "white",
      color: active ? "#4F46E5" : "#94A3B8",
      transition: "all 0.15s ease",
    }}>
      {label}
    </button>
  );
}

const STAGE_COLORS: Record<string, string> = {
  "Pre-seed": "#4F46E5", "Seed": "#7C3AED", "Series A": "#6366F1",
};

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => { setVisible(false); }, 1700);
    const t2 = setTimeout(() => { onDone(); }, 2100);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 999,
      backgroundColor: "#1E293B", color: "white",
      padding: "12px 18px", borderRadius: 10,
      fontSize: 13, fontWeight: 500,
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(8px)",
      transition: "opacity 0.25s ease, transform 0.25s ease",
      display: "flex", alignItems: "center", gap: 8,
      pointerEvents: "none",
    }}>
      <span style={{ color: "#F472B6", fontSize: 15 }}>♥</span>
      {message}
    </div>
  );
}

export default function InvestorDashboard({ investorId, investorName, criteria, startups, connectionMap, favouriteIds }: Props) {
  const [activeStages, setActiveStages] = useState<string[]>([]);
  const [activeSectors, setActiveSectors] = useState<string[]>([]);
  const [activeGeos, setActiveGeos] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "favourites">("all");
  const [favSet, setFavSet] = useState<Set<string>>(() => new Set(favouriteIds));
  const [toast, setToast] = useState<string | null>(null);
  const [toastKey, setToastKey] = useState(0);

  function toggle(arr: string[], val: string, set: (v: string[]) => void) {
    set(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  }

  function clearAll() {
    setActiveStages([]); setActiveSectors([]); setActiveGeos([]);
  }

  const handleFavourite = useCallback(async (startupId: string) => {
    const wasAdded = favSet.has(startupId);
    const next = new Set(favSet);
    if (wasAdded) { next.delete(startupId); } else { next.add(startupId); }
    setFavSet(next);
    setToast(wasAdded ? "Removed from favourites" : "Added to favourites");
    setToastKey(k => k + 1);
    await toggleFavourite(investorId, startupId, !wasAdded);
  }, [favSet, investorId]);

  const filtered = startups.filter(s => {
    if (activeTab === "favourites" && !favSet.has(s.id)) return false;
    if (activeStages.length > 0 && s.stage && !activeStages.includes(s.stage)) return false;
    if (activeSectors.length > 0 && s.sector && !activeSectors.includes(s.sector)) return false;
    if (activeGeos.length > 0 && s.country && !activeGeos.includes(s.country)) return false;
    return true;
  });

  const hasFilters = activeStages.length > 0 || activeSectors.length > 0 || activeGeos.length > 0;
  const favCount = favSet.size;

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      backgroundColor: "#F8FAFC",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      marginLeft: 56,
    }}>

      {/* Filter sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        backgroundColor: "white", borderRight: "0.5px solid #E2E8F0",
        padding: "24px 16px",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 600, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.08em" }}>StartGrid</p>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.2px" }}>{investorName}</p>
        </div>

        <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.1px" }}>Discovery filters</p>

        {/* Stage */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Stage</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {STAGES.map(s => (
              <Chip key={s} label={s} active={activeStages.includes(s)} onClick={() => toggle(activeStages, s, setActiveStages)} />
            ))}
          </div>
        </div>

        {/* Sector */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Sector</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SECTORS.map(s => (
              <Chip key={s} label={s} active={activeSectors.includes(s)} onClick={() => toggle(activeSectors, s, setActiveSectors)} />
            ))}
          </div>
        </div>

        {/* Geography */}
        {criteria.geographies && criteria.geographies.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Geography</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 140, overflowY: "auto" }}>
              {criteria.geographies.map(g => (
                <Chip key={g} label={g} active={activeGeos.includes(g)} onClick={() => toggle(activeGeos, g, setActiveGeos)} />
              ))}
            </div>
          </div>
        )}

        {hasFilters && (
          <button type="button" onClick={clearAll} style={{
            background: "none", border: "none", padding: 0,
            fontSize: 11, color: "#94A3B8", cursor: "pointer",
            textDecoration: "underline", transition: "color 0.15s",
          }}>
            Reset filters
          </button>
        )}
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "24px 28px", minWidth: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.4px" }}>
              Discover startups
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94A3B8" }}>
              {filtered.length} startup{filtered.length !== 1 ? "s" : ""}{activeTab === "favourites" ? " saved" : " match your criteria"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {(["all", "favourites"] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                fontSize: 12, fontWeight: 600,
                border: activeTab === tab ? "0.5px solid #4F46E5" : "0.5px solid #E2E8F0",
                backgroundColor: activeTab === tab ? "#EEF2FF" : "white",
                color: activeTab === tab ? "#4F46E5" : "#64748B",
                transition: "all 0.15s",
              }}
            >
              {tab === "all" ? "All startups" : (
                <>
                  Favourites
                  <span style={{ color: "#F472B6" }}>♥</span>
                  {favCount > 0 && (
                    <span style={{
                      backgroundColor: activeTab === "favourites" ? "#4F46E5" : "#E2E8F0",
                      color: activeTab === "favourites" ? "white" : "#64748B",
                      borderRadius: 20, fontSize: 10, fontWeight: 700,
                      padding: "1px 6px", minWidth: 18, textAlign: "center",
                    }}>
                      {favCount}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        {/* Grid or empty state */}
        {filtered.length === 0 ? (
          <div style={{
            backgroundColor: "white", borderRadius: 12,
            border: "1px dashed #E2E8F0",
            padding: "64px", textAlign: "center",
          }}>
            {activeTab === "favourites" ? (
              <>
                <div style={{ fontSize: 36, marginBottom: 12, color: "#CBD5E1" }}>♡</div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0F172A" }}>No favourites yet</p>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "#94A3B8" }}>
                  Click the heart icon on any startup card to save it here.
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0F172A" }}>No startups match your filters</p>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "#94A3B8" }}>
                  {hasFilters ? "Try adjusting the filters on the left." : "No published startups yet — check back soon."}
                </p>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {filtered.map(startup => {
              const status = connectionMap[startup.id];
              const isFav = favSet.has(startup.id);
              const stageColor = STAGE_COLORS[startup.stage ?? ""] ?? "#6366F1";
              return (
                <div key={startup.id} style={{
                  backgroundColor: "white", borderRadius: 12,
                  border: "0.5px solid #E2E8F0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  padding: "18px",
                  display: "flex", flexDirection: "column", gap: 12,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  position: "relative",
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
                  {/* Heart button */}
                  <button
                    type="button"
                    onClick={() => handleFavourite(startup.id)}
                    title={isFav ? "Remove from favourites" : "Add to favourites"}
                    style={{
                      position: "absolute", top: 14, right: 14,
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 17, lineHeight: 1, padding: 4,
                      color: isFav ? "#F472B6" : "#CBD5E1",
                      transition: "color 0.15s, transform 0.1s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.2)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                  >
                    {isFav ? "♥" : "♡"}
                  </button>

                  {/* Company header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, paddingRight: 24 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      backgroundColor: stageColor,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontWeight: 700, fontSize: 13, letterSpacing: "-0.3px",
                    }}>
                      {initials(startup.company_name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {startup.company_name ?? "Unnamed"}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>
                        {[startup.country, startup.stage].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {startup.sector && (
                      <span style={{ fontSize: 10, fontWeight: 500, color: "#4F46E5", backgroundColor: "#EEF2FF", borderRadius: 20, padding: "3px 8px" }}>
                        {startup.sector}
                      </span>
                    )}
                    {startup.stage && (
                      <span style={{ fontSize: 10, fontWeight: 500, color: "#475569", backgroundColor: "#F8FAFC", border: "0.5px solid #E2E8F0", borderRadius: 20, padding: "3px 8px" }}>
                        {startup.stage}
                      </span>
                    )}
                    {startup.country && (
                      <span style={{ fontSize: 10, fontWeight: 500, color: "#475569", backgroundColor: "#F8FAFC", border: "0.5px solid #E2E8F0", borderRadius: 20, padding: "3px 8px" }}>
                        {startup.country}
                      </span>
                    )}
                  </div>

                  {startup.website && (
                    <p style={{ margin: 0, fontSize: 11, color: "#94A3B8", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {startup.website}
                    </p>
                  )}

                  {/* Divider + actions */}
                  <div style={{ borderTop: "0.5px solid #F1F5F9", paddingTop: 12, display: "flex", gap: 8 }}>
                    <Link href={`/investor/startup/${startup.id}`} style={{ flex: 1 }}>
                      <button type="button" style={{
                        width: "100%", padding: "7px 0", borderRadius: 8,
                        border: "0.5px solid #E2E8F0", backgroundColor: "white",
                        fontSize: 12, fontWeight: 600, color: "#475569",
                        cursor: "pointer", transition: "all 0.15s",
                      }}>
                        View profile
                      </button>
                    </Link>
                    {status === "accepted" ? (
                      <Link href="/messages">
                        <button type="button" style={{
                          padding: "7px 14px", borderRadius: 8,
                          border: "0.5px solid #A7F3D0",
                          backgroundColor: "#ECFDF5",
                          fontSize: 12, fontWeight: 600, color: "#059669",
                          cursor: "pointer",
                        }}>
                          Message →
                        </button>
                      </Link>
                    ) : status === "pending" ? (
                      <button type="button" disabled style={{
                        padding: "7px 14px", borderRadius: 8,
                        border: "0.5px solid #FDE68A", backgroundColor: "#FFFBEB",
                        fontSize: 12, fontWeight: 600, color: "#D97706",
                        cursor: "not-allowed",
                      }}>
                        Pending
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Toast */}
      {toast !== null && (
        <Toast key={toastKey} message={toast} onDone={() => setToast(null)} />
      )}
    </div>
  );
}
