"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%", padding: "10px 12px",
  border: "0.5px solid #E2E8F0", borderRadius: 8,
  fontSize: 14, color: "#0F172A", backgroundColor: "white",
  outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
  boxSizing: "border-box",
};

function onFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = "#4F46E5";
  e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
}
function onBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = "#E2E8F0";
  e.target.style.boxShadow = "none";
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => router.push("/login"), 2000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* LEFT PANEL */}
      <div style={{
        width: "50%", minHeight: "100vh",
        backgroundColor: "#0B1628",
        backgroundImage: "radial-gradient(circle, rgba(79,70,229,0.2) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "40px 48px",
      }} className="hidden md:flex">
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

        <div>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.6px", color: "white", lineHeight: 1.2, margin: "0 0 16px" }}>
            Where European startups<br />meet the right investors.
          </h2>
          <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.65, margin: 0 }}>
            Invitation-only. Standardised profiles. Facilitated connections.
          </p>
        </div>

        <div style={{ borderLeft: "2.5px solid #4F46E5", paddingLeft: 20 }}>
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
            {success ? (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  backgroundColor: "#ECFDF5", border: "1.5px solid #A7F3D0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px", fontSize: 20,
                }}>✓</div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 8px", letterSpacing: "-0.3px" }}>
                  Password updated
                </h2>
                <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.65, margin: 0 }}>
                  Redirecting you to sign in…
                </p>
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", margin: "0 0 4px", letterSpacing: "-0.3px" }}>
                  Set a new password
                </h1>
                <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 28px" }}>
                  Choose a strong password for your account
                </p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      New password
                    </label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 characters" required autoComplete="new-password"
                      style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Confirm password
                    </label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••" required autoComplete="new-password"
                      style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                  </div>

                  {error && (
                    <div style={{ backgroundColor: "#FEF2F2", border: "0.5px solid #FECACA", borderRadius: 8, padding: "10px 14px" }}>
                      <p style={{ fontSize: 13, color: "#DC2626", margin: 0 }}>{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading} style={{
                    display: "block", width: "100%", padding: "11px",
                    background: loading ? "#A5B4FC" : "linear-gradient(135deg, #4F46E5, #7C3AED)",
                    color: "white", border: "none", borderRadius: 9,
                    fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading ? "none" : "0 4px 12px rgba(79,70,229,0.3)",
                    transition: "all 0.15s ease", marginTop: 4,
                  }}>
                    {loading ? "Updating…" : "Update password →"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
