import Link from "next/link";
import type { PitchSlide } from "@/app/actions/generate-pitch";

interface ProfileData {
  logo_url?: string | null;
  city?: string | null;
  linkedin_url?: string | null;
  is_published?: boolean | null;
  raw_onboarding_data?: {
    problem?: string;
    traction?: string;
    team?: string;
  } | null;
}

interface Props {
  profile: ProfileData;
  slides: PitchSlide[];
}

interface CheckItem {
  label: string;
  done: boolean;
  points: number;
  link: string;
}

function ringColor(score: number) {
  if (score <= 40) return "#EF4444";
  if (score <= 70) return "#F59E0B";
  return "#10B981";
}

function strengthLabel(score: number) {
  if (score <= 40) return "Weak";
  if (score <= 70) return "Good";
  return "Strong";
}

export default function ProfileStrength({ profile, slides }: Props) {
  const raw = profile.raw_onboarding_data;

  const items: CheckItem[] = [
    { label: "Logo uploaded", done: !!profile.logo_url, points: 15, link: "/startup/onboard?mode=edit" },
    { label: "Company description filled", done: !!(raw?.problem && raw.problem.length > 20), points: 10, link: "/startup/onboard?mode=edit" },
    { label: "All 10 pitch slides complete", done: slides.length >= 10, points: 25, link: "/startup/pitch-preview" },
    { label: "Traction info added", done: !!(raw?.traction && raw.traction.length > 10), points: 15, link: "/startup/onboard?mode=edit" },
    { label: "Team info added", done: !!(raw?.team && raw.team.length > 10), points: 15, link: "/startup/onboard?mode=edit" },
    { label: "City / location set", done: !!profile.city, points: 5, link: "/startup/onboard?mode=edit" },
    { label: "LinkedIn URL added", done: !!profile.linkedin_url, points: 5, link: "/startup/onboard?mode=edit" },
    { label: "Profile published", done: !!profile.is_published, points: 10, link: "/startup/pitch-preview" },
  ];

  const score = items.reduce((sum, item) => sum + (item.done ? item.points : 0), 0);
  const incomplete = items.filter(i => !i.done);
  const color = ringColor(score);
  const label = strengthLabel(score);

  const R = 40;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - score / 100);

  return (
    <div style={{
      backgroundColor: "white", borderRadius: 12,
      border: "0.5px solid #E2E8F0",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      padding: "20px",
      marginBottom: 20,
    }}>
      <p style={{ margin: "0 0 16px", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Profile strength
      </p>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Ring */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={R} fill="none" stroke="#F1F5F9" strokeWidth="8" />
            <circle
              cx="50" cy="50" r={R}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={offset}
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
            <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: 20, fontWeight: 700, fill: "#0F172A", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
              {score}
            </text>
          </svg>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color }}>
            {label}
          </p>
        </div>

        {/* Checklist */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {incomplete.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: "#059669", fontWeight: 600 }}>
              ✓ Your profile is complete!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: "#64748B" }}>
                Complete these to boost your score:
              </p>
              {incomplete.map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: "1.5px solid #CBD5E1", backgroundColor: "#F8FAFC",
                    }} />
                    <span style={{ fontSize: 12, color: "#475569", lineHeight: 1.4 }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: 10, color: "#94A3B8", flexShrink: 0 }}>+{item.points}pts</span>
                  </div>
                  <Link href={item.link} style={{
                    fontSize: 11, fontWeight: 600, color: "#4F46E5",
                    textDecoration: "none", flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}>
                    → Fix it
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
