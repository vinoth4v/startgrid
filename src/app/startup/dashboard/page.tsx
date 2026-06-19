import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PitchSlide } from "@/app/actions/generate-pitch";
import ConnectionRequests from "./ConnectionRequests";
import Sidebar from "@/components/Sidebar";

function initials(name: string | null | undefined): string {
  if (!name) return "SU";
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default async function StartupDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("startup_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const slides: PitchSlide[] = Array.isArray(profile?.pitch_data) ? (profile.pitch_data as PitchSlide[]) : [];
  const slidesComplete = slides.length;
  const hasProfile = !!profile?.company_name;

  const pendingRequests: { connectionId: string; investorName: string; firm: string }[] = [];
  let acceptedConnCount = 0;

  if (profile?.id) {
    const { data: connections } = await admin
      .from("connections")
      .select("id, investor_id, status")
      .eq("startup_id", profile.id);

    const pending = (connections ?? []).filter((c: { status: string }) => c.status === "pending");
    acceptedConnCount = (connections ?? []).filter((c: { status: string }) => c.status === "accepted").length;

    if (pending.length > 0) {
      const investorIds = pending.map((c: { investor_id: string }) => c.investor_id);
      const { data: investors } = await admin
        .from("investor_profiles")
        .select("id, name, firm")
        .in("id", investorIds);

      const investorMap = Object.fromEntries(
        (investors ?? []).map((i: { id: string; name: string; firm: string }) => [i.id, i])
      );

      pending.forEach((c: { id: string; investor_id: string }) => {
        const inv = investorMap[c.investor_id];
        if (inv) pendingRequests.push({ connectionId: c.id, investorName: inv.name, firm: inv.firm ?? "" });
      });
    }
  }

  const userInitials = initials(profile?.company_name ?? user.user_metadata?.full_name);

  return (
    <>
      <Sidebar role="startup" userInitials={userInitials} />

      <div style={{ marginLeft: 56, minHeight: "100vh", backgroundColor: "#F8FAFC", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

        {/* Top bar */}
        <div style={{
          backgroundColor: "white", borderBottom: "0.5px solid #E2E8F0",
          padding: "0 28px", height: 56,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.06em" }}>StartGrid</p>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>
              {hasProfile ? profile.company_name : "Startup Dashboard"}
            </p>
          </div>
          {hasProfile && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              backgroundColor: profile.is_published ? "#ECFDF5" : "#FFFBEB",
              border: `0.5px solid ${profile.is_published ? "#A7F3D0" : "#FDE68A"}`,
              borderRadius: 20, padding: "4px 12px",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: profile.is_published ? "#059669" : "#D97706" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: profile.is_published ? "#059669" : "#D97706" }}>
                {profile.is_published ? "Live" : "Draft"}
              </span>
            </div>
          )}
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 28px" }}>

          {/* Connection requests */}
          {pendingRequests.length > 0 && <ConnectionRequests requests={pendingRequests} />}

          {/* No profile */}
          {!hasProfile ? (
            <div style={{
              backgroundColor: "white", borderRadius: 12,
              border: "0.5px solid #C7D2FE",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              padding: "52px 40px", textAlign: "center",
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px", fontSize: 22,
              }}>🚀</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.4px", margin: "0 0 8px" }}>
                Complete your profile to get discovered
              </h2>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.65, margin: "0 0 28px", maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
                Answer a few questions and our AI will generate a professional 10-slide pitch deck that investors can browse.
              </p>
              <Link href="/startup/onboard" style={{
                display: "inline-flex", alignItems: "center",
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                color: "white", fontSize: 14, fontWeight: 600, padding: "11px 28px",
                borderRadius: 9, textDecoration: "none",
                boxShadow: "0 4px 16px rgba(79,70,229,0.35)",
              }}>
                Get started →
              </Link>
            </div>
          ) : (
            <>
              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Profile views", value: "0", sub: "All time" },
                  { label: "Connection requests", value: String(pendingRequests.length), sub: "Pending" },
                  { label: "Active conversations", value: String(acceptedConnCount), sub: "Accepted" },
                ].map(({ label, value, sub }) => (
                  <div key={label} style={{
                    backgroundColor: "white", borderRadius: 12,
                    border: "0.5px solid #E2E8F0",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    padding: "16px 20px",
                  }}>
                    <p style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.5px" }}>{value}</p>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{label}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>{sub}</p>
                  </div>
                ))}
              </div>

              {/* Profile + Pitch deck cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>

                {/* Profile summary */}
                <div style={{
                  backgroundColor: "white", borderRadius: 12,
                  border: "0.5px solid #E2E8F0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  padding: "20px",
                }}>
                  <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Company profile
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                    {[profile.stage, profile.sector, profile.country].filter(Boolean).map((tag: string) => (
                      <span key={tag} style={{
                        fontSize: 11, fontWeight: 500, color: "#475569",
                        backgroundColor: "#F8FAFC", border: "0.5px solid #E2E8F0",
                        borderRadius: 20, padding: "3px 10px",
                      }}>{tag}</span>
                    ))}
                  </div>
                  {profile.website && (
                    <p style={{ fontSize: 12, color: "#94A3B8", margin: "0 0 16px", fontFamily: "monospace" }}>{profile.website}</p>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href="/startup/pitch-preview" style={{
                      padding: "7px 14px", borderRadius: 8,
                      border: "0.5px solid #E2E8F0", backgroundColor: "white",
                      fontSize: 12, fontWeight: 600, color: "#475569",
                      textDecoration: "none",
                    }}>View profile</Link>
                    <Link href="/startup/onboard?mode=edit" style={{
                      padding: "7px 14px", borderRadius: 8,
                      backgroundColor: "transparent", border: "none",
                      fontSize: 12, fontWeight: 500, color: "#94A3B8",
                      textDecoration: "none",
                    }}>Edit</Link>
                  </div>
                </div>

                {/* Pitch deck */}
                <div style={{
                  backgroundColor: "white", borderRadius: 12,
                  border: "0.5px solid #E2E8F0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  padding: "20px",
                }}>
                  <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Pitch deck
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                    <span style={{ fontSize: 36, fontWeight: 700, color: "#4F46E5", letterSpacing: "-1px" }}>{slidesComplete}</span>
                    <span style={{ fontSize: 13, color: "#94A3B8" }}>/ 10 slides</span>
                  </div>
                  <div style={{
                    height: 4, backgroundColor: "#EEF2FF", borderRadius: 4, marginBottom: 16, overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%", borderRadius: 4,
                      background: "linear-gradient(90deg, #4F46E5, #7C3AED)",
                      width: `${(slidesComplete / 10) * 100}%`,
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                  <Link href="/startup/pitch-preview" style={{
                    display: "inline-flex", alignItems: "center",
                    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                    color: "white", fontSize: 12, fontWeight: 600, padding: "8px 16px",
                    borderRadius: 8, textDecoration: "none",
                    boxShadow: "0 2px 8px rgba(79,70,229,0.25)",
                  }}>
                    {slidesComplete === 10 ? "Review pitch deck" : "Complete pitch deck"}
                  </Link>
                </div>
              </div>

              {/* Publish nudge */}
              {slidesComplete === 10 && !profile.is_published && (
                <div style={{
                  backgroundColor: "#FFFBEB", border: "0.5px solid #FDE68A",
                  borderRadius: 12, padding: "16px 20px",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#92400E", letterSpacing: "-0.2px" }}>
                      Your pitch deck is ready to publish
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#B45309" }}>
                      Review your slides and publish to become visible to investors.
                    </p>
                  </div>
                  <Link href="/startup/pitch-preview" style={{
                    display: "inline-flex", alignItems: "center", flexShrink: 0,
                    backgroundColor: "#D97706", color: "white",
                    fontSize: 12, fontWeight: 600, padding: "9px 18px",
                    borderRadius: 9, textDecoration: "none",
                    boxShadow: "0 2px 8px rgba(217,119,6,0.3)",
                  }}>
                    Publish profile →
                  </Link>
                </div>
              )}

              {/* Messages link */}
              {acceptedConnCount > 0 && (
                <div style={{
                  marginTop: 16, backgroundColor: "white", borderRadius: 12,
                  border: "0.5px solid #E2E8F0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  padding: "16px 20px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      backgroundColor: "#EEF2FF",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                    }}>💬</div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Messages</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>{acceptedConnCount} active conversation{acceptedConnCount !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <Link href="/messages" style={{
                    padding: "7px 16px", borderRadius: 8,
                    border: "0.5px solid #C7D2FE", backgroundColor: "#EEF2FF",
                    fontSize: 12, fontWeight: 600, color: "#4F46E5",
                    textDecoration: "none",
                  }}>
                    View messages →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
