import type { Milestone, MilestoneType } from "@/app/actions/milestones";

const TYPE_MAP: Record<MilestoneType, { emoji: string; label: string }> = {
  first_revenue: { emoji: "🎉", label: "First revenue" },
  new_customer: { emoji: "🤝", label: "New customer" },
  team_hire: { emoji: "👥", label: "Team hire" },
  product_launch: { emoji: "🚀", label: "Product launch" },
  funding_closed: { emoji: "💰", label: "Funding closed" },
  partnership: { emoji: "🤜", label: "Partnership" },
  other: { emoji: "📌", label: "Update" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function MilestonesTimeline({ milestones }: { milestones: Milestone[] }) {
  if (milestones.length === 0) return null;

  return (
    <section style={{
      backgroundColor: "white", borderRadius: 12,
      border: "0.5px solid #E2E8F0",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      padding: "20px",
      marginBottom: 20,
    }}>
      <p style={{ margin: "0 0 18px", fontSize: 13, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.2px" }}>
        Recent milestones
      </p>

      <div style={{ position: "relative", paddingLeft: 28 }}>
        <div style={{
          position: "absolute", left: 9, top: 10, bottom: 4,
          width: 1.5, backgroundColor: "#E2E8F0",
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {milestones.map(m => {
            const info = TYPE_MAP[m.type] ?? TYPE_MAP.other;
            return (
              <div key={m.id} style={{ position: "relative" }}>
                {/* Dot */}
                <div style={{
                  position: "absolute", left: -28, top: 2,
                  width: 18, height: 18, borderRadius: "50%",
                  backgroundColor: "#EEF2FF", border: "2px solid #C7D2FE",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9,
                }}>
                  {info.emoji}
                </div>

                {/* Date */}
                <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 500 }}>
                  {formatDate(m.date)}
                </span>

                <p style={{ margin: "2px 0 4px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                  {m.title}
                </p>

                <span style={{
                  fontSize: 10, fontWeight: 500, color: "#4F46E5",
                  backgroundColor: "#EEF2FF", borderRadius: 20, padding: "2px 8px",
                  display: "inline-block",
                }}>
                  {info.emoji} {info.label}
                </span>

                {m.description && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "#64748B", lineHeight: 1.55 }}>
                    {m.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
