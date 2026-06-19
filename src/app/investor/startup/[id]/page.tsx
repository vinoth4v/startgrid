import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PitchSlide } from "@/app/actions/generate-pitch";
import ConnectButton from "./ConnectButton";
import PitchSection from "./PitchSection";
import PrivateNotes from "./PrivateNotes";
import MilestonesTimeline from "./MilestonesTimeline";
import AIBriefButton from "./AIBriefButton";
import DDChecklist from "./DDChecklist";
import AddToPipelineButton from "./AddToPipelineButton";
import FeedbackModal from "./FeedbackModal";
import Sidebar from "@/components/Sidebar";
import { getNote } from "@/app/actions/investor-notes";
import { getMilestones } from "@/app/actions/milestones";

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
    .select("id, company_name, sector, stage, country, website, pitch_data, is_published, logo_url, cover_image_url, city, founded_year, employee_count, linkedin_url")
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

  const existingNote = investorProfile ? await getNote(investorProfile.id, startup.id) : "";
  const milestones = await getMilestones(startup.id);

  const userInitials = (investorProfile?.name ?? "")
    .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "IN";

  return (
    <>
      <Sidebar role="investor" userInitials={userInitials} userName={investorProfile?.name ?? ""} userEmail={user.email ?? ""} userId={user.id} />

      <main style={{
        marginLeft: 56, minHeight: "100vh", backgroundColor: "#F8FAFC",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>

        {/* Profile header — cover image or navy dot-grid */}
        <div style={{
          backgroundColor: "#0B1628",
          backgroundImage: startup.cover_image_url
            ? `url(${startup.cover_image_url})`
            : "radial-gradient(circle, rgba(79,70,229,0.2) 1px, transparent 1px)",
          backgroundSize: startup.cover_image_url ? "cover" : "24px 24px",
          backgroundPosition: "center",
          padding: "36px 40px",
          position: "relative", overflow: "hidden",
        }}>
          {startup.cover_image_url && (
            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(11,22,40,0.6)" }} />
          )}
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 24, position: "relative", zIndex: 1 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 14, flexShrink: 0,
              border: "2px solid rgba(255,255,255,0.2)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              overflow: "hidden",
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {startup.logo_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={startup.logo_url} alt={startup.company_name ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ color: "white", fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px" }}>{initials(startup.company_name)}</span>
              }
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
                {(startup.city ?? startup.country) && (
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#CBD5E1", backgroundColor: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "3px 10px" }}>
                    📍 {[startup.city, startup.country].filter(Boolean).join(", ")}
                  </span>
                )}
                {startup.founded_year && (
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#CBD5E1", backgroundColor: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "3px 10px" }}>
                    Est. {startup.founded_year}
                  </span>
                )}
                {startup.employee_count && (
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#CBD5E1", backgroundColor: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "3px 10px" }}>
                    {startup.employee_count} people
                  </span>
                )}
                {startup.website && (
                  <a href={startup.website} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 11, fontWeight: 500, color: "#A5B4FC",
                    backgroundColor: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)",
                    borderRadius: 20, padding: "3px 10px",
                    textDecoration: "none",
                  }}>
                    Website ↗
                  </a>
                )}
                {startup.linkedin_url && (
                  <a href={startup.linkedin_url} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 11, fontWeight: 500, color: "#A5B4FC",
                    backgroundColor: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)",
                    borderRadius: 20, padding: "3px 10px",
                    textDecoration: "none",
                  }}>
                    LinkedIn ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 40px" }}>

          {/* Pitch deck */}
          {slides.length > 0 && <PitchSection slides={slides} />}

          {/* Milestones */}
          <MilestonesTimeline milestones={milestones} />

          {/* Private notes */}
          {investorProfile && (
            <PrivateNotes
              investorId={investorProfile.id}
              startupId={startup.id}
              initialContent={existingNote}
            />
          )}

          {/* Action bar */}
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
                Send a connection request or generate an AI investment brief.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {investorProfile && (
                <>
                  <FeedbackModal startupId={startup.id} companyName={startup.company_name ?? "Startup"} />
                  <AddToPipelineButton startupId={startup.id} />
                  <DDChecklist startupId={startup.id} companyName={startup.company_name ?? "Startup"} />
                  <AIBriefButton startupId={startup.id} companyName={startup.company_name ?? "Startup"} />
                </>
              )}
              <ConnectButton startupId={startup.id} initialStatus={connectionStatus} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
