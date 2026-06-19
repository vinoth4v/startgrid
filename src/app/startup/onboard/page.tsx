"use client";

import { useState, useTransition, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generatePitch, type OnboardingData, type IdentityData } from "@/app/actions/generate-pitch";

const SECTORS = ["Climate Tech", "B2B SaaS", "Fintech", "Health Tech", "Deep Tech", "Marketplace", "Other"];
const STAGES = ["Pre-seed", "Seed", "Series A"];
const TEAM_SIZES = ["1–5", "6–15", "16–50", "50+"];
const EU_COUNTRIES = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus",
  "Czech Republic", "Denmark", "Estonia", "Finland", "France",
  "Germany", "Greece", "Hungary", "Ireland", "Italy",
  "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands",
  "Norway", "Poland", "Portugal", "Romania", "Slovakia",
  "Slovenia", "Spain", "Sweden", "Switzerland", "United Kingdom",
];

const STEPS = [
  { number: 1, label: "Company identity" },
  { number: 2, label: "Company basics" },
  { number: 3, label: "Your opportunity" },
  { number: 4, label: "Team & the ask" },
];

const EMPTY: OnboardingData = {
  companyName: "", sector: "", stage: "", country: "",
  website: "", description: "",
  problem: "", solution: "", marketSize: "", traction: "",
  teamBackground: "", fundingAmount: "", useOfFunds: "",
};

const EMPTY_IDENTITY: IdentityData = {
  logoUrl: "", coverImageUrl: "", city: "", address: "",
  foundedYear: "", employeeCount: "", linkedinUrl: "",
};

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%", padding: "10px 12px",
  border: "0.5px solid #E2E8F0", borderRadius: 8,
  fontSize: 14, color: "#0F172A", backgroundColor: "white",
  outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
  boxSizing: "border-box", fontFamily: "inherit",
};
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: "vertical" as const, lineHeight: 1.6 };
const selectStyle: React.CSSProperties = {
  ...inputStyle, appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 36,
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600,
  color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column" }}><label style={labelStyle}>{label}</label>{children}</div>;
}
function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.target.style.borderColor = "#4F46E5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
}
function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none";
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
      {STEPS.map((step, i) => (
        <div key={step.number} style={{ display: "flex", alignItems: "center", flex: i < total - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, flexShrink: 0,
              ...(step.number < current
                ? { background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "white", boxShadow: "0 2px 8px rgba(79,70,229,0.3)" }
                : step.number === current
                ? { backgroundColor: "white", border: "2px solid #4F46E5", color: "#4F46E5" }
                : { backgroundColor: "white", border: "1.5px solid #E2E8F0", color: "#94A3B8" }),
            }}>
              {step.number < current ? "✓" : step.number}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: step.number <= current ? "#0F172A" : "#94A3B8" }} className="hidden sm:block">
              {step.label}
            </span>
          </div>
          {i < total - 1 && (
            <div style={{
              flex: 1, height: 1.5, marginLeft: 12,
              backgroundColor: step.number < current ? "#4F46E5" : "#E2E8F0",
              transition: "background-color 0.3s",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

interface ImageUploaderProps {
  label: string;
  hint?: string;
  value: string;
  userId: string;
  storagePath: string;
  square?: boolean;
  onChange: (url: string) => void;
}

function ImageUploader({ label, hint, value, userId, storagePath, square, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    const supabase = createClient();
    const path = `${storagePath}/${userId}/${Date.now()}-${file.name.replace(/\s/g, "_")}`;
    const { error } = await supabase.storage
      .from("startgrid-assets")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("startgrid-assets").getPublicUrl(path);
      onChange(publicUrl);
    }
    setUploading(false);
  }

  const previewSize = square ? 80 : undefined;

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {hint && <p style={{ fontSize: 12, color: "#94A3B8", margin: "0 0 8px" }}>{hint}</p>}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {value && (
          <div style={{
            width: previewSize ?? 120, height: previewSize ?? 56, borderRadius: square ? 10 : 8,
            overflow: "hidden", flexShrink: 0, border: "0.5px solid #E2E8F0",
            backgroundColor: "#F8FAFC",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          style={{
            flex: 1, border: `1.5px dashed ${dragOver ? "#4F46E5" : "#C7D2FE"}`,
            borderRadius: 10, padding: "16px 20px", textAlign: "center",
            cursor: uploading ? "not-allowed" : "pointer",
            backgroundColor: dragOver ? "#EEF2FF" : "#F8FAFC",
            transition: "all 0.15s",
          }}
        >
          {uploading ? (
            <p style={{ margin: 0, fontSize: 12, color: "#6366F1" }}>Uploading…</p>
          ) : (
            <>
              <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, color: "#4F46E5" }}>
                {value ? "Replace image" : "Click or drag to upload"}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>PNG, JPG, WebP</p>
            </>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      </div>
    </div>
  );
}

function OnboardInner() {
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("mode") === "edit";

  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState("");
  const [identity, setIdentity] = useState<IdentityData>(EMPTY_IDENTITY);
  const [data, setData] = useState<OnboardingData>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loadingProfile, setLoadingProfile] = useState(isEdit);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
      if (!isEdit) return;
      supabase
        .from("startup_profiles")
        .select("company_name, sector, stage, country, website, logo_url, cover_image_url, city, address, founded_year, employee_count, linkedin_url, raw_onboarding_data")
        .eq("user_id", user?.id ?? "")
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            const raw = profile.raw_onboarding_data as OnboardingData | null;
            setIdentity({
              logoUrl: profile.logo_url ?? "",
              coverImageUrl: profile.cover_image_url ?? "",
              city: profile.city ?? "",
              address: profile.address ?? "",
              foundedYear: profile.founded_year ?? "",
              employeeCount: profile.employee_count ?? "",
              linkedinUrl: profile.linkedin_url ?? "",
            });
            setData({
              companyName: profile.company_name ?? "",
              sector: profile.sector ?? "",
              stage: profile.stage ?? "",
              country: profile.country ?? "",
              website: profile.website ?? "",
              description: raw?.description ?? "",
              problem: raw?.problem ?? "",
              solution: raw?.solution ?? "",
              marketSize: raw?.marketSize ?? "",
              traction: raw?.traction ?? "",
              teamBackground: raw?.teamBackground ?? "",
              fundingAmount: raw?.fundingAmount ?? "",
              useOfFunds: raw?.useOfFunds ?? "",
            });
          }
          setLoadingProfile(false);
        });
    });
  }, [isEdit]);

  function updateId(field: keyof IdentityData, value: string) {
    setIdentity(prev => ({ ...prev, [field]: value }));
  }
  function update(field: keyof OnboardingData, value: string) {
    setData(prev => ({ ...prev, [field]: value }));
  }

  function validateStep2() {
    if (!data.companyName.trim()) return "Company name is required.";
    if (!data.sector) return "Please select a sector.";
    if (!data.stage) return "Please select a stage.";
    if (!data.country) return "Please select a country.";
    if (!data.description.trim()) return "Please add a short description.";
    return null;
  }
  function validateStep3() {
    if (!data.problem.trim()) return "Please describe the problem you're solving.";
    if (!data.solution.trim()) return "Please describe your solution.";
    if (!data.marketSize.trim()) return "Please enter your market size.";
    if (!data.traction.trim()) return "Please describe your traction.";
    return null;
  }
  function validateStep4() {
    if (!data.teamBackground.trim()) return "Please describe your team.";
    if (!data.fundingAmount.trim()) return "Please enter the amount you're raising.";
    if (!data.useOfFunds.trim()) return "Please describe your use of funds.";
    return null;
  }

  function handleNext() {
    const err = step === 2 ? validateStep2() : step === 3 ? validateStep3() : null;
    if (err) { setError(err); return; }
    setError(null); setStep(s => s + 1);
  }
  function handleGenerate() {
    const err = validateStep4();
    if (err) { setError(err); return; }
    setError(null);
    startTransition(async () => {
      const result = await generatePitch(data, isEdit, identity);
      if (result?.error) setError(result.error);
    });
  }

  if (loadingProfile) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 13, color: "#94A3B8", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>Loading your profile…</p>
      </main>
    );
  }

  const stepTitles: Record<number, string> = {
    1: "Company identity",
    2: "Company basics",
    3: "Your opportunity",
    4: "Team & the ask",
  };
  const stepSubtitles: Record<number, string> = {
    1: "Add your logo, location and company details.",
    2: "Tell us the fundamentals about your startup.",
    3: "Help investors understand the problem and your solution.",
    4: "Tell investors who you are and what you need.",
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", padding: "48px 24px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 580, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: 10,
            }}>SG</div>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#0B1628", letterSpacing: "-0.2px" }}>StartGrid</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.5px", margin: "0 0 8px" }}>
            {isEdit ? "Edit your profile" : "Build your investor profile"}
          </h1>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
            {isEdit ? "Update your details and regenerate your pitch deck" : "Answer a few questions and our AI will generate your pitch deck"}
          </p>
        </div>

        <StepIndicator current={step} total={STEPS.length} />

        {/* Card */}
        <div style={{ backgroundColor: "white", borderRadius: 12, border: "0.5px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "28px 28px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 700, fontSize: 13,
              }}>{step}</div>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.2px" }}>{stepTitles[step]}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#94A3B8" }}>{stepSubtitles[step]}</p>
              </div>
            </div>
          </div>

          <div style={{ padding: "0 28px", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ── STEP 1: COMPANY IDENTITY ── */}
            {step === 1 && (
              <>
                {userId && (
                  <ImageUploader
                    label="Company logo"
                    hint="Shown on your public profile. Square image recommended."
                    value={identity.logoUrl ?? ""}
                    userId={userId}
                    storagePath="logos"
                    square
                    onChange={url => updateId("logoUrl", url)}
                  />
                )}
                {userId && (
                  <ImageUploader
                    label="Cover image (optional)"
                    hint="Wide banner for your profile header. 1200×400 recommended."
                    value={identity.coverImageUrl ?? ""}
                    userId={userId}
                    storagePath="covers"
                    onChange={url => updateId("coverImageUrl", url)}
                  />
                )}
                <Field label="City *">
                  <input style={inputStyle} placeholder="e.g. Copenhagen" value={identity.city ?? ""}
                    onChange={e => updateId("city", e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
                <Field label="Full address (optional)">
                  <input style={inputStyle} placeholder="e.g. Nørrebrogade 44, 2200 Copenhagen" value={identity.address ?? ""}
                    onChange={e => updateId("address", e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Founded year">
                    <input style={inputStyle} placeholder="e.g. 2023" value={identity.foundedYear ?? ""}
                      onChange={e => updateId("foundedYear", e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
                  </Field>
                  <Field label="Team size">
                    <select style={selectStyle} value={identity.employeeCount ?? ""}
                      onChange={e => updateId("employeeCount", e.target.value)} onFocus={focusStyle} onBlur={blurStyle}>
                      <option value="">Select size</option>
                      {TEAM_SIZES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="LinkedIn URL (optional)">
                  <input type="url" style={inputStyle} placeholder="https://linkedin.com/company/acme" value={identity.linkedinUrl ?? ""}
                    onChange={e => updateId("linkedinUrl", e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
              </>
            )}

            {/* ── STEP 2: COMPANY BASICS ── */}
            {step === 2 && (
              <>
                <Field label="Company name *">
                  <input style={inputStyle} placeholder="Acme GmbH" value={data.companyName}
                    onChange={e => update("companyName", e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Sector *">
                    <select style={selectStyle} value={data.sector}
                      onChange={e => update("sector", e.target.value)} onFocus={focusStyle} onBlur={blurStyle}>
                      <option value="">Select sector</option>
                      {SECTORS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Stage *">
                    <select style={selectStyle} value={data.stage}
                      onChange={e => update("stage", e.target.value)} onFocus={focusStyle} onBlur={blurStyle}>
                      <option value="">Select stage</option>
                      {STAGES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Country *">
                  <select style={selectStyle} value={data.country}
                    onChange={e => update("country", e.target.value)} onFocus={focusStyle} onBlur={blurStyle}>
                    <option value="">Select country</option>
                    {EU_COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Website (optional)">
                  <input type="url" style={inputStyle} placeholder="https://acme.com" value={data.website}
                    onChange={e => update("website", e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
                <Field label={`Short description * (${data.description.length}/200)`}>
                  <textarea rows={3} style={textareaStyle} placeholder="Describe your startup in 2 sentences"
                    value={data.description}
                    onChange={e => update("description", e.target.value.slice(0, 200))}
                    onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
              </>
            )}

            {/* ── STEP 3: YOUR OPPORTUNITY ── */}
            {step === 3 && (
              <>
                <Field label="What problem are you solving? *">
                  <textarea rows={4} style={textareaStyle}
                    placeholder="Describe the pain point in specific terms. Who suffers from it and how acutely?"
                    value={data.problem} onChange={e => update("problem", e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
                <Field label="How does your product solve it? *">
                  <textarea rows={4} style={textareaStyle}
                    placeholder="What does your product do and why is your approach better than alternatives?"
                    value={data.solution} onChange={e => update("solution", e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
                <Field label="Total addressable market *">
                  <input style={inputStyle}
                    placeholder="e.g. €4.2B European logistics software market (Gartner 2024)"
                    value={data.marketSize} onChange={e => update("marketSize", e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
                <Field label="Traction — users, revenue, pilots, or LOIs *">
                  <textarea rows={3} style={textareaStyle}
                    placeholder="e.g. 12 paying customers, €8k MRR, 3 enterprise pilots with Siemens and Bosch"
                    value={data.traction} onChange={e => update("traction", e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
              </>
            )}

            {/* ── STEP 4: TEAM & THE ASK ── */}
            {step === 4 && (
              <>
                <Field label="Founding team & relevant experience *">
                  <textarea rows={4} style={textareaStyle}
                    placeholder="e.g. CEO: ex-McKinsey, 8 years in logistics. CTO: ex-Zalando engineering lead, built systems at €1B scale."
                    value={data.teamBackground} onChange={e => update("teamBackground", e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
                <Field label="How much are you raising? *">
                  <input style={inputStyle} placeholder="e.g. €750k" value={data.fundingAmount}
                    onChange={e => update("fundingAmount", e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
                <Field label="Use of funds *">
                  <textarea rows={3} style={textareaStyle}
                    placeholder="e.g. 60% product & engineering (2 senior hires), 30% sales, 10% operations"
                    value={data.useOfFunds} onChange={e => update("useOfFunds", e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "24px 28px 28px" }}>
            {error && (
              <div style={{ backgroundColor: "#FEF2F2", border: "0.5px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: "#DC2626", margin: 0 }}>{error}</p>
              </div>
            )}

            {isPending && (
              <div style={{ backgroundColor: "#EEF2FF", border: "0.5px solid #C7D2FE", borderRadius: 10, padding: "20px", textAlign: "center", marginBottom: 16 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 18, height: 18, border: "2.5px solid #C7D2FE",
                    borderTopColor: "#4F46E5", borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#4338CA" }}>
                    StartGrid AI is {isEdit ? "regenerating" : "crafting"} your pitch deck…
                  </span>
                </div>
                <p style={{ fontSize: 11, color: "#6366F1", margin: "8px 0 0" }}>This usually takes about 15 seconds</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {step > 1 ? (
                <button type="button" onClick={() => { setError(null); setStep(s => s - 1); }} disabled={isPending} style={{
                  padding: "9px 16px", borderRadius: 9, border: "0.5px solid #E2E8F0", backgroundColor: "white",
                  fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer", transition: "all 0.15s",
                }}>← Back</button>
              ) : <span />}

              {step < 4 ? (
                <button type="button" onClick={step === 1 ? () => { setError(null); setStep(2); } : handleNext} style={{
                  padding: "9px 24px", borderRadius: 9,
                  background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  border: "none", color: "white", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", boxShadow: "0 4px 12px rgba(79,70,229,0.3)", transition: "all 0.15s",
                }}>Next →</button>
              ) : (
                <button type="button" onClick={handleGenerate} disabled={isPending} style={{
                  padding: "11px 28px", borderRadius: 9,
                  background: isPending ? "#A5B4FC" : "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  border: "none", color: "white", fontSize: 14, fontWeight: 600,
                  cursor: isPending ? "not-allowed" : "pointer",
                  boxShadow: isPending ? "none" : "0 4px 16px rgba(79,70,229,0.35)",
                  transition: "all 0.15s", width: "100%",
                }}>
                  {isPending ? "Generating…" : isEdit ? "Regenerate my pitch deck →" : "Generate my pitch deck with AI →"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OnboardPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <p style={{ fontSize: 13, color: "#94A3B8" }}>Loading…</p>
      </main>
    }>
      <OnboardInner />
    </Suspense>
  );
}
