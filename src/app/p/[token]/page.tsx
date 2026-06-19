import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PitchSlide } from "@/app/actions/generate-pitch";
import PublicPitchClient from "./PublicPitchClient";

function initials(name: string | null): string {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default async function PublicPitchPage({ params }: { params: { token: string } }) {
  const admin = createAdminClient();

  const { data: startup } = await admin
    .from("startup_profiles")
    .select("id, company_name, sector, stage, country, website, pitch_data, is_published, logo_url, cover_image_url, city, founded_year, employee_count, linkedin_url, share_token")
    .eq("share_token", params.token)
    .eq("is_published", true)
    .single();

  if (!startup) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: "#F8FAFC",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 32, marginBottom: 16 }}>🔒</p>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: "0 0 8px" }}>
            This pitch is not available
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 24px" }}>
            The link may have expired, or the startup has not published their pitch yet.
          </p>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center",
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            color: "white", fontSize: 13, fontWeight: 600, padding: "10px 20px",
            borderRadius: 9, textDecoration: "none",
          }}>
            Go to StartGrid →
          </Link>
        </div>
      </div>
    );
  }

  const slides: PitchSlide[] = Array.isArray(startup.pitch_data) ? (startup.pitch_data as PitchSlide[]) : [];

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#F8FAFC",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Top bar */}
      <div style={{
        backgroundColor: "white", borderBottom: "0.5px solid #E2E8F0",
        padding: "0 28px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: "linear-gradient(135deg, #1B63D8, #0F3E9E)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" />
            </svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0C1E35", letterSpacing: "-0.3px" }}>StartGrid</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: "#94A3B8" }}>Powered by StartGrid</span>
          <Link href="/request-access" style={{
            fontSize: 12, fontWeight: 600, color: "white",
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            padding: "6px 14px", borderRadius: 8, textDecoration: "none",
            boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
          }}>
            Join StartGrid →
          </Link>
        </div>
      </div>

      {/* Company header */}
      <div style={{
        backgroundColor: "#0B1628",
        backgroundImage: startup.cover_image_url
          ? `url(${startup.cover_image_url})`
          : "radial-gradient(circle, rgba(79,70,229,0.2) 1px, transparent 1px)",
        backgroundSize: startup.cover_image_url ? "cover" : "24px 24px",
        backgroundPosition: "center",
        padding: "36px 40px",
        position: "relative",
      }}>
        {startup.cover_image_url && (
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(11,22,40,0.6)" }} />
        )}
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", gap: 24, position: "relative", zIndex: 1 }}>
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
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "white", letterSpacing: "-0.5px", margin: "0 0 8px" }}>
              {startup.company_name ?? "Unnamed Startup"}
            </h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {startup.sector && (
                <span style={{ fontSize: 11, fontWeight: 500, color: "#A5B4FC", backgroundColor: "rgba(79,70,229,0.2)", border: "0.5px solid rgba(99,102,241,0.3)", borderRadius: 20, padding: "3px 10px" }}>
                  {startup.sector}
                </span>
              )}
              {startup.stage && (
                <span style={{ fontSize: 11, color: "#CBD5E1", backgroundColor: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "3px 10px" }}>
                  {startup.stage}
                </span>
              )}
              {(startup.city ?? startup.country) && (
                <span style={{ fontSize: 11, color: "#CBD5E1", backgroundColor: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "3px 10px" }}>
                  📍 {[startup.city, startup.country].filter(Boolean).join(", ")}
                </span>
              )}
              {startup.founded_year && (
                <span style={{ fontSize: 11, color: "#CBD5E1", backgroundColor: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "3px 10px" }}>
                  Est. {startup.founded_year}
                </span>
              )}
              {startup.website && (
                <a href={startup.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#A5B4FC", backgroundColor: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "3px 10px", textDecoration: "none" }}>
                  Website ↗
                </a>
              )}
            </div>
            <Link href="/login" style={{
              display: "inline-flex", alignItems: "center",
              backgroundColor: "white", color: "#4F46E5",
              fontSize: 13, fontWeight: 600, padding: "9px 18px",
              borderRadius: 9, textDecoration: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}>
              Sign in to request a connection →
            </Link>
          </div>
        </div>
      </div>

      {/* Pitch deck */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 40px" }}>
        {slides.length > 0 ? (
          <PublicPitchClient slides={slides} />
        ) : (
          <div style={{
            backgroundColor: "white", borderRadius: 12,
            border: "1px dashed #E2E8F0", padding: "48px",
            textAlign: "center",
          }}>
            <p style={{ margin: 0, fontSize: 14, color: "#94A3B8" }}>No pitch deck available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
