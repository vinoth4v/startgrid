"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !data.user) {
      setError(signInError?.message ?? "Sign in failed. Please try again.");
      setLoading(false);
      return;
    }

    const role = data.user.user_metadata?.role as string | undefined;

    if (role === "admin") {
      router.push("/admin/dashboard");
    } else if (role === "investor") {
      router.push("/investor/dashboard");
    } else if (role === "startup") {
      router.push("/startup/dashboard");
    } else {
      const { data: startupProfile } = await supabase
        .from("startup_profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .single();
      router.push(startupProfile ? "/startup/dashboard" : "/investor/dashboard");
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* LEFT PANEL — navy with dot-grid */}
      <div style={{
        width: "50%", minHeight: "100vh",
        backgroundColor: "#0B1628",
        backgroundImage: "radial-gradient(circle, rgba(79,70,229,0.2) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "40px 48px",
      }} className="hidden md:flex">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 700, fontSize: 11,
            boxShadow: "0 2px 8px rgba(79,70,229,0.4)",
          }}>SG</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "white", letterSpacing: "-0.3px" }}>StartGrid</span>
        </div>

        {/* Headline */}
        <div>
          <h2 style={{
            fontSize: 32, fontWeight: 700, letterSpacing: "-0.6px",
            color: "white", lineHeight: 1.2, margin: "0 0 16px",
          }}>
            Where European startups<br />meet the right investors.
          </h2>
          <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.65, margin: 0 }}>
            Invitation-only. Standardised profiles. Facilitated connections.
          </p>
        </div>

        {/* Quote */}
        <div style={{
          borderLeft: "2.5px solid #4F46E5",
          paddingLeft: 20,
        }}>
          <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.7, fontStyle: "italic", margin: "0 0 10px" }}>
            "The quality of conversations on StartGrid is unlike anything I've seen on other platforms."
          </p>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#475569", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Early investor, Munich
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: "#F8FAFC", padding: "40px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          {/* Mobile logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }} className="flex md:hidden">
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: 10,
            }}>SG</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#0B1628" }}>StartGrid</span>
          </div>

          <div style={{
            backgroundColor: "white", borderRadius: 16,
            border: "0.5px solid #E2E8F0",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            padding: "32px",
          }}>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", margin: "0 0 4px", letterSpacing: "-0.3px" }}>
              Sign in to StartGrid
            </h1>
            <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 28px" }}>
              Use your invitation credentials
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="sg-input"
                  style={{
                    display: "block", width: "100%", padding: "10px 12px",
                    border: "0.5px solid #E2E8F0", borderRadius: 8,
                    fontSize: 14, color: "#0F172A", backgroundColor: "white",
                    outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => { e.target.style.borderColor = "#4F46E5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    display: "block", width: "100%", padding: "10px 12px",
                    border: "0.5px solid #E2E8F0", borderRadius: 8,
                    fontSize: 14, color: "#0F172A", backgroundColor: "white",
                    outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => { e.target.style.borderColor = "#4F46E5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {error && (
                <div style={{
                  backgroundColor: "#FEF2F2", border: "0.5px solid #FECACA",
                  borderRadius: 8, padding: "10px 14px",
                }}>
                  <p style={{ fontSize: 13, color: "#DC2626", margin: 0 }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "block", width: "100%", padding: "11px",
                  background: loading ? "#A5B4FC" : "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  color: "white", border: "none", borderRadius: 9,
                  fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 4px 12px rgba(79,70,229,0.3)",
                  transition: "all 0.15s ease",
                  marginTop: 4,
                }}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div style={{
              marginTop: 20, padding: "12px 14px",
              backgroundColor: "#EEF2FF", borderRadius: 8,
              border: "0.5px solid #C7D2FE",
            }}>
              <p style={{ fontSize: 12, color: "#4338CA", margin: 0, lineHeight: 1.55 }}>
                Don't have access? You need an invitation from the StartGrid team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
