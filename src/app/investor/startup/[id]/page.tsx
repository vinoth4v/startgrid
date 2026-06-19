import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PitchSlide } from "@/app/actions/generate-pitch";
import ConnectButton from "./ConnectButton";
import Sidebar from "@/components/Sidebar";

function initials(name: string | null): string {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default async function StartupProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: startup } = await admin
    .from("startup_profiles")
    .select("id, company_name, sector, stage, country, website, pitch_data, is_published")
    .eq("id", params.id)
    .eq("is_published", true)
    .single();

  if (!startup) notFound();

  const { data: investorProfile } = await admin
    .from("investor_profiles")
    .select("id, name")
    .eq("user_id", user.id)
    .single();

  let connectionStatus: string | null = null;
  if (investorProfile) {
    const { data: conn } = await admin
      .from("connections")
      .select("status")
      .eq("investor_id", investorProfile.id)
      .eq("startup_id", startup.id)
      .single();
    connectionStatus = conn?.status ?? null;
  }

  const slides: PitchSlide[] = Array.isArray(startup.pitch_data) ? (startup.pitch_data as PitchSlide[]) : [];

  const userInitials = (investorProfile?.name ?? "")
    .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "IN";

  return (
    <>
      <Sidebar role="investor" userInitials={userInitials} />

      <main style={{
        marginLeft: 56, minHeight: "100vh", backgroundColor: "#F8FAFC",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>

        {/* Navy profile header with dot-grid */}
        <div style={{
          backgroundColor: "#0B1628",
          backgroundImage: "radial-gradient(circle, rgba(79,70,229,0.2) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          padding: "36px 40px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 24, position: "relative", zIndex: 1 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, flexShrink: 0,
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px",
              boxShadow: "0 4px 16px rgba(79,70,229,0.4)",
            }}>
              {initials(startup.company_name)}
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "white", letterSpacing: "-0.5px", margin: "0 0 8px" }}>
                {startup.company_name ?? "Unnamed Startup"}
              </h1>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {startup.sector && (
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#A5B4FC", backgroundColor: "rgba(79,70,229,0.2)", border: "0.5px solid rgba(99,102,241,0.3)", borderRadius: 20, padding: "3px 10px" }}>
                    {startup.sector}
                  </span>
                )}
                {startup.stage && (
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#CBD5E1", backgroundColor: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "3px 10px" }}>
                    {startup.stage}
                  </span>
                )}
                {startup.country && (
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#CBD5E1", backgroundColor: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "3px 10px" }}>
                    {startup.country}
                  </span>
                )}
                {startup.website && (
                  <a href={startup.website} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 11, fontWeight: 500, color: "#A5B4FC",
                    backgroundColor: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)",
                    borderRadius: 20, padding: "3px 10px",
                    textDecoration: "none", transition: "background 0.15s",
                  }}>
                    Website ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 40px" }}>

          {/* Pitch deck */}
          {slides.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>Pitch deck</h2>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  backgroundColor: "#ECFDF5", border: "0.5px solid #A7F3D0",
                  borderRadius: 20, padding: "3px 10px",
                }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#059669" }}>Verified by StartGrid</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                {slides.map(slide => (
                  <div key={slide.slideNumber} style={{
                    backgroundColor: "white", borderRadius: 12,
                    border: "0.5px solid #E2E8F0",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    overflow: "hidden", position: "relative",
                  }}>
                    <div style={{
                      position: "absolute", bottom: 0, left: 0,
                      width: 3, height: "35%",
                      background: "linear-gradient(180deg, #4F46E5, #7C3AED)",
                    }} />
                    <div style={{ padding: "16px 16px 14px" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#4F46E5", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {String(slide.slideNumber).padStart(2, "0")}
                      </span>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", margin: "6px 0 10px", lineHeight: 1.3, letterSpacing: "-0.2px" }}>
                        {slide.title}
                      </h3>
                      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 10px", display: "flex", flexDirection: "column", gap: 5 }}>
                        {slide.content.map((bullet, i) => (
                          <li key={i} style={{ display: "flex", gap: 7, fontSize: 11, color: "#475569", lineHeight: 1.55 }}>
                            <span style={{ color: "#4F46E5", fontWeight: 700, flexShrink: 0 }}>›</span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                      <div style={{ borderTop: "0.5px solid #F1F5F9", paddingTop: 8 }}>
                        <p style={{ fontSize: 10, color: "#94A3B8", fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>{slide.speakerNote}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Connect card */}
          <div style={{
            backgroundColor: "white", borderRadius: 12,
            border: "0.5px solid #E2E8F0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            padding: "24px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24,
            flexWrap: "wrap",
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>
                Interested in {startup.company_name ?? "this startup"}?
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748B" }}>
                Send a connection request to start a direct conversation.
              </p>
            </div>
            <ConnectButton startupId={startup.id} initialStatus={connectionStatus} />
          </div>
        </div>
      </main>
    </>
  );
}
