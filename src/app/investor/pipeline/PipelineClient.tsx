"use client";

import { useState } from "react";
import Link from "next/link";
import { moveDeal, removeDeal, type PipelineDeal, type PipelineStage } from "@/app/actions/pipeline";

const STAGES: { id: PipelineStage; label: string; color: string; bg: string }[] = [
  { id: "reviewing",      label: "Reviewing",       color: "#475569", bg: "#F8FAFC" },
  { id: "due_diligence",  label: "Due Diligence",   color: "#1B63D8", bg: "#EFF6FF" },
  { id: "term_sheet",     label: "Term Sheet",      color: "#7C3AED", bg: "#F5F3FF" },
  { id: "closed_won",     label: "Closed Won",      color: "#059669", bg: "#ECFDF5" },
  { id: "closed_lost",    label: "Closed Lost",     color: "#DC2626", bg: "#FEF2F2" },
];

function initials(name: string | undefined): string {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

interface Props {
  initialDeals: PipelineDeal[];
}

export default function PipelineClient({ initialDeals }: Props) {
  const [deals, setDeals] = useState<PipelineDeal[]>(initialDeals);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<PipelineStage | null>(null);

  function getDealsForStage(stage: PipelineStage) {
    return deals.filter(d => d.stage === stage);
  }

  async function handleDrop(stage: PipelineStage, dealId: string) {
    const deal = deals.find(d => d.id === dealId);
    if (!deal || deal.stage === stage) return;
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage } : d));
    await moveDeal(dealId, stage);
  }

  async function handleRemove(dealId: string) {
    setDeals(prev => prev.filter(d => d.id !== dealId));
    await removeDeal(dealId);
  }

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
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>Deal Pipeline</p>
        </div>
      </div>

      {/* Kanban board */}
      <div style={{
        display: "flex", gap: 12, padding: "24px 24px",
        overflowX: "auto", minHeight: "calc(100vh - 56px)",
        alignItems: "flex-start",
      }}>
        {STAGES.map(stage => {
          const stageDeals = getDealsForStage(stage.id);
          const isOver = over === stage.id;

          return (
            <div
              key={stage.id}
              onDragOver={e => { e.preventDefault(); setOver(stage.id); }}
              onDragLeave={() => setOver(null)}
              onDrop={e => {
                e.preventDefault();
                setOver(null);
                const id = e.dataTransfer.getData("dealId");
                if (id) handleDrop(stage.id, id);
              }}
              style={{
                minWidth: 240, width: 240, flexShrink: 0,
                backgroundColor: isOver ? stage.bg : "#F1F5F9",
                border: `1.5px dashed ${isOver ? stage.color : "transparent"}`,
                borderRadius: 12, padding: "12px 10px",
                transition: "all 0.15s",
              }}
            >
              {/* Column header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 2px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: stage.color }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{stage.label}</span>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                  backgroundColor: "white", color: stage.color, border: `0.5px solid ${stage.color}40`,
                }}>
                  {stageDeals.length}
                </span>
              </div>

              {/* Deal cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {stageDeals.map(deal => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={e => {
                      e.dataTransfer.setData("dealId", deal.id);
                      setDragging(deal.id);
                    }}
                    onDragEnd={() => setDragging(null)}
                    style={{
                      backgroundColor: "white", borderRadius: 10,
                      border: "0.5px solid #E2E8F0",
                      boxShadow: dragging === deal.id ? "0 8px 20px rgba(0,0,0,0.12)" : "0 1px 3px rgba(0,0,0,0.04)",
                      padding: "12px 14px",
                      cursor: "grab", userSelect: "none",
                      opacity: dragging === deal.id ? 0.5 : 1,
                      transition: "box-shadow 0.15s, opacity 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontSize: 10, fontWeight: 700, overflow: "hidden",
                      }}>
                        {deal.logoUrl
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={deal.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : initials(deal.companyName)
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {deal.companyName ?? "Unnamed"}
                        </p>
                        {deal.sector && (
                          <p style={{ margin: 0, fontSize: 10, color: "#94A3B8" }}>{deal.sector}</p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <Link href={`/investor/startup/${deal.startup_id}`} style={{
                        flex: 1, textAlign: "center", fontSize: 10, fontWeight: 600,
                        color: "#4F46E5", backgroundColor: "#EEF2FF", border: "0.5px solid #C7D2FE",
                        borderRadius: 6, padding: "5px 0", textDecoration: "none", display: "block",
                      }}>
                        View →
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemove(deal.id)}
                        title="Remove from pipeline"
                        style={{
                          width: 26, height: 26, borderRadius: 6, border: "0.5px solid #FECDD3",
                          backgroundColor: "#FFF1F2", color: "#DC2626", cursor: "pointer",
                          fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div style={{
                    border: "1px dashed #E2E8F0", borderRadius: 10,
                    padding: "20px 14px", textAlign: "center",
                    fontSize: 11, color: "#CBD5E1",
                  }}>
                    Drop startups here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {deals.length === 0 && (
        <div style={{
          position: "absolute", top: "50%", left: "calc(50% + 28px)", transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}>
          <p style={{ fontSize: 40, margin: "0 0 12px" }}>📋</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>No deals in pipeline</p>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
            Add startups from their profile page to start tracking deals.
          </p>
          <Link href="/investor/dashboard" style={{
            display: "inline-block", marginTop: 20,
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            color: "white", fontSize: 13, fontWeight: 600,
            padding: "10px 20px", borderRadius: 9, textDecoration: "none",
          }}>
            Discover startups →
          </Link>
        </div>
      )}
    </div>
  );
}
