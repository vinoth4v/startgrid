import { getFeedbackForStartup } from "@/app/actions/feedback";

interface Props { startupId: string }

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ fontSize: 13, color: n <= Math.round(rating) ? "#F59E0B" : "#E2E8F0" }}>★</span>
      ))}
      <span style={{ fontSize: 11, color: "#64748B", marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </div>
  );
}

export default async function FeedbackCard({ startupId }: Props) {
  const fb = await getFeedbackForStartup(startupId);
  if (fb.count === 0) return null;

  return (
    <div style={{
      backgroundColor: "white", borderRadius: 12,
      border: "0.5px solid #E2E8F0",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      padding: "20px", marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>⭐ Investor Feedback</p>
        <span style={{ fontSize: 11, color: "#94A3B8" }}>{fb.count} anonymous rating{fb.count !== 1 ? "s" : ""}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Overall",  value: fb.avgOverall },
          { label: "Team",     value: fb.avgTeam },
          { label: "Market",   value: fb.avgMarket },
          { label: "Product",  value: fb.avgProduct },
        ].map(r => (
          <div key={r.label} style={{ backgroundColor: "#F8FAFC", borderRadius: 8, padding: "10px 12px" }}>
            <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{r.label}</p>
            <Stars rating={r.value} />
          </div>
        ))}
      </div>

      {fb.comments.length > 0 && (
        <div>
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 600, color: "#64748B" }}>Comments</p>
          {fb.comments.slice(0, 3).map((c, i) => (
            <div key={i} style={{
              backgroundColor: "#F8FAFC", borderRadius: 7, padding: "8px 12px", marginBottom: 6,
              fontSize: 12, color: "#475569", lineHeight: 1.5,
              borderLeft: "2px solid #C7D2FE",
            }}>
              "{c}"
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
