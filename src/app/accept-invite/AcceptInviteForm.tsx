"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  token: string;
  email: string;
  role: string;
}

const DASHBOARD: Record<string, string> = {
  startup: "/startup/dashboard",
  investor: "/investor/dashboard",
  admin: "/admin/dashboard",
};

export default function AcceptInviteForm({ token, email, role }: Props) {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) { setError("Please enter your full name."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);

    try {
      const res = await fetch("/api/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, fullName: fullName.trim(), password }),
      });

      let data: { error?: string; email?: string; role?: string } = {};
      try { data = await res.json(); } catch {
        throw new Error("Server returned an unexpected response. Please try again.");
      }

      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        throw new Error(`Account created but sign-in failed: ${signInError.message}. Please go to /login.`);
      }

      window.location.href = DASHBOARD[data.role ?? role] ?? "/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setLoading(false);
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
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            backgroundColor: "rgba(79,70,229,0.2)", border: "0.5px solid rgba(99,102,241,0.4)",
            borderRadius: 20, padding: "5px 14px", marginBottom: 20,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#A5B4FC", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {roleLabel} invitation
            </span>
          </div>
          <h2 style={{
            fontSize: 30, fontWeight: 700, letterSpacing: "-0.6px",
            color: "white", lineHeight: 1.2, margin: "0 0 14px",
          }}>
            You've been invited<br />to StartGrid.
          </h2>
          <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.65, margin: 0 }}>
            Complete your account setup to get started.
          </p>
        </div>

        {/* Quote */}
        <div style={{ borderLeft: "2.5px solid #4F46E5", paddingLeft: 20 }}>
          <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.7, fontStyle: "italic", margin: "0 0 10px" }}>
            "StartGrid connects the right founders with the right capital — no noise, no cold outreach."
          </p>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#475569", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            The StartGrid team
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
              Create your account
            </h1>
            <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 6px" }}>
              You were invited as a{" "}
              <span style={{
                fontWeight: 600, color: "#4F46E5",
                backgroundColor: "#EEF2FF", borderRadius: 20,
                padding: "1px 8px", fontSize: 12,
              }}>{roleLabel}</span>
            </p>
            <p style={{ fontSize: 12, color: "#94A3B8", margin: "0 0 28px" }}>
              Signing up as <span style={{ color: "#475569", fontWeight: 500 }}>{email}</span>
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  autoComplete="name"
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
                  placeholder="Min. 8 characters"
                  required
                  autoComplete="new-password"
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
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
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
                  transition: "all 0.15s ease", marginTop: 4,
                }}
              >
                {loading ? "Creating account…" : "Create account →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
