import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

interface PitchSlide { title?: string; content?: string }

interface StartupData {
  id: string;
  company_name: string | null;
  sector: string | null;
  stage: string | null;
  country: string | null;
  city: string | null;
  founded_year: string | null;
  employee_count: string | null;
  website: string | null;
  logo_url: string | null;
  pitch_data: PitchSlide[] | null;
  raw_onboarding_data: {
    description?: string;
    problem?: string;
    solution?: string;
    traction?: string;
    marketSize?: string;
    teamBackground?: string;
    fundingAmount?: string;
    useOfFunds?: string;
  } | null;
}

const ROWS: { label: string; key?: keyof StartupData | string; fromData?: (s: StartupData) => string }[] = [
  { label: "Sector",         key: "sector" },
  { label: "Stage",          key: "stage" },
  { label: "Location",       fromData: s => [s.city, s.country].filter(Boolean).join(", ") || "—" },
  { label: "Founded",        key: "founded_year" },
  { label: "Team size",      key: "employee_count" },
  { label: "Website",        key: "website" },
  { label: "Description",    fromData: s => s.raw_onboarding_data?.description ?? "—" },
  { label: "Problem",        fromData: s => s.raw_onboarding_data?.problem ?? "—" },
  { label: "Solution",       fromData: s => s.raw_onboarding_data?.solution ?? "—" },
  { label: "Market size",    fromData: s => s.raw_onboarding_data?.marketSize ?? "—" },
  { label: "Traction",       fromData: s => s.raw_onboarding_data?.traction ?? "—" },
  { label: "Team background",fromData: s => s.raw_onboarding_data?.teamBackground ?? "—" },
  { label: "Funding ask",    fromData: s => s.raw_onboarding_data?.fundingAmount ?? "—" },
  { label: "Use of funds",   fromData: s => s.raw_onboarding_data?.useOfFunds ?? "—" },
  { label: "Pitch slides",   fromData: s => s.pitch_data?.length ? `${s.pitch_data.length} slides` : "—" },
];

function getValue(row: typeof ROWS[0], s: StartupData): string {
  if (row.fromData) return row.fromData(s);
  if (!row.key) return "—";
  const val = s[row.key as keyof StartupData];
  return (typeof val === "string" ? val : null) ?? "—";
}

function initials(name: string | null): string {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default async function ComparePage({ searchParams }: { searchParams: { ids?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ids = (searchParams.ids ?? "").split(",").filter(Boolean).slice(0, 3);
  if (ids.length < 2) redirect("/investor/dashboard");

  const admin = createAdminClient();
  const { data: ip } = await admin.from("investor_profiles").select("id, name").eq("user_id", user.id).single();
  if (!ip) redirect("/investor/dashboard");

  const { data: startups } = await admin
    .from("startup_profiles")
    .select("id, company_name, sector, stage, country, city, founded_year, employee_count, website, logo_url, pitch_data, raw_onboarding_data")
    .in("id", ids);

  const ordered = ids.map(id => (startups ?? []).find((s: StartupData) => s.id === id)).filter(Boolean) as StartupData[];
  const userInitials = (ip.name ?? "").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "IN";
  const colWidth = `${Math.floor(100 / ordered.length)}%`;

  return (
    <>
      <Sidebar role="investor" userInitials={userInitials} userName={ip.name ?? ""} userEmail={user.email ?? ""} userId={user.id} />
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
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>Side-by-side comparison</p>
          </div>
          <Link href="/investor/dashboard" style={{ fontSize: 12, color: "#64748B", textDecoration: "none", fontWeight: 500 }}>
            ← Back to discover
          </Link>
        </div>

        <div style={{ padding: "28px 32px", overflowX: "auto" }}>
          {/* Company headers */}
          <div style={{ display: "flex", gap: 0, marginBottom: 0 }}>
            <div style={{ width: 180, flexShrink: 0 }} />
            {ordered.map(s => (
              <div key={s.id} style={{
                flex: 1, textAlign: "center", padding: "20px 16px",
                backgroundColor: "white", borderTop: "3px solid #4F46E5",
                borderLeft: "0.5px solid #E2E8F0", borderRight: "0.5px solid #E2E8F0",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, margin: "0 auto 10px",
                  background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 700, fontSize: 15, overflow: "hidden",
                }}>
                  {s.logo_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={s.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : initials(s.company_name)
                  }
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                  {s.company_name ?? "Unnamed"}
                </p>
                <Link href={`/investor/startup/${s.id}`} style={{
                  fontSize: 11, fontWeight: 600, color: "#4F46E5", textDecoration: "none",
                }}>
                  View profile →
                </Link>
              </div>
            ))}
          </div>

          {/* Comparison rows */}
          {ROWS.map((row, idx) => (
            <div key={row.label} style={{ display: "flex" }}>
              <div style={{
                width: 180, flexShrink: 0, padding: "14px 16px",
                backgroundColor: idx % 2 === 0 ? "#F8FAFC" : "white",
                borderBottom: "0.5px solid #F1F5F9",
                borderLeft: "0.5px solid #E2E8F0",
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {row.label}
                </span>
              </div>
              {ordered.map(s => {
                const val = getValue(row, s);
                return (
                  <div key={s.id} style={{
                    flex: 1, padding: "14px 16px",
                    backgroundColor: idx % 2 === 0 ? "#F8FAFC" : "white",
                    borderBottom: "0.5px solid #F1F5F9",
                    borderLeft: "0.5px solid #E2E8F0",
                    borderRight: "0.5px solid #E2E8F0",
                    fontSize: 12, color: val === "—" ? "#CBD5E1" : "#334155",
                    lineHeight: 1.5,
                  }}>
                    {val}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
