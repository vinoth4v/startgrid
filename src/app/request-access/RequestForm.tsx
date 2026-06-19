"use client";

import { useState } from "react";
import Link from "next/link";
import { submitAccessRequest } from "@/app/actions/access-requests";

export default function RequestForm({ defaultRole }: { defaultRole: "startup" | "investor" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"startup" | "investor">(defaultRole);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const res = await submitAccessRequest({ name, email, role, message });
    if (res?.error) {
      setErrorMsg(res.error);
      setStatus("error");
    } else {
      setStatus("success");
    }
  }

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#F8FAFC",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      {/* Top bar */}
      <header style={{
        backgroundColor: "white", borderBottom: "0.5px solid #E2E8F0",
        padding: "0 24px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 700, fontSize: 10,
          }}>SG</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0B1628", letterSpacing: "-0.3px" }}>StartGrid</span>
        </Link>
        <Link href="/login" style={{ fontSize: 13, color: "#64748B", textDecoration: "none", fontWeight: 500 }}>
          Already have an invite? Sign in →
        </Link>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        {status === "success" ? (
          <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", margin: "0 auto 20px",
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24,
            }}>✓</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.4px", margin: "0 0 10px" }}>
              Request submitted!
            </h1>
            <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, margin: "0 0 28px" }}>
              We've received your request to join StartGrid. Our team reviews every application personally and will be in touch within 48 hours.
            </p>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center",
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              color: "white", fontSize: 13, fontWeight: 600, padding: "10px 22px",
              borderRadius: 9, textDecoration: "none",
            }}>
              Back to StartGrid
            </Link>
          </div>
        ) : (
          <div style={{ maxWidth: 480, width: "100%" }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                backgroundColor: "#EEF2FF", border: "0.5px solid #C7D2FE",
                borderRadius: 20, padding: "4px 12px", marginBottom: 16,
              }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#4F46E5" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#4F46E5", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Invitation only
                </span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.5px", margin: "0 0 8px" }}>
                Request access to StartGrid
              </h1>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, margin: 0 }}>
                Fill in your details and our team will review your application within 48 hours.
              </p>
            </div>

            {/* Form card */}
            <div style={{
              backgroundColor: "white", borderRadius: 14,
              border: "0.5px solid #E2E8F0",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              padding: "28px 28px 24px",
            }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Role selector */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>
                    I am joining as
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {(["startup", "investor"] as const).map(r => (
                      <button key={r} type="button" onClick={() => setRole(r)}
                        style={{
                          padding: "10px 16px", borderRadius: 9, cursor: "pointer",
                          fontSize: 13, fontWeight: 600,
                          border: role === r ? "1.5px solid #4F46E5" : "1.5px solid #E2E8F0",
                          backgroundColor: role === r ? "#EEF2FF" : "white",
                          color: role === r ? "#4F46E5" : "#64748B",
                          transition: "all 0.15s",
                        }}>
                        {r === "startup" ? "🚀 Founder" : "💼 Investor"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                    {role === "startup" ? "Your name" : "Your name"}
                  </label>
                  <input
                    type="text"
                    placeholder={role === "startup" ? "Jane Smith" : "James Clarke"}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    style={{
                      width: "100%", padding: "10px 12px",
                      border: "0.5px solid #E2E8F0", borderRadius: 8,
                      fontSize: 13, color: "#0F172A", backgroundColor: "white",
                      outline: "none", boxSizing: "border-box",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                    onFocus={e => { e.target.style.borderColor = "#4F46E5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                    onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                    Work email
                  </label>
                  <input
                    type="email"
                    placeholder={role === "startup" ? "jane@yourcompany.com" : "james@vcfirm.com"}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{
                      width: "100%", padding: "10px 12px",
                      border: "0.5px solid #E2E8F0", borderRadius: 8,
                      fontSize: 13, color: "#0F172A", backgroundColor: "white",
                      outline: "none", boxSizing: "border-box",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                    onFocus={e => { e.target.style.borderColor = "#4F46E5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                    onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                {/* Message */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                    {role === "startup" ? "Tell us about your startup" : "Tell us about your investment focus"}
                  </label>
                  <textarea
                    placeholder={role === "startup"
                      ? "What does your company do, and what stage are you at?"
                      : "What stage and sectors do you invest in?"}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%", padding: "10px 12px",
                      border: "0.5px solid #E2E8F0", borderRadius: 8,
                      fontSize: 13, color: "#0F172A", backgroundColor: "white",
                      outline: "none", resize: "vertical", boxSizing: "border-box",
                      lineHeight: 1.6, fontFamily: "inherit",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                    onFocus={e => { e.target.style.borderColor = "#4F46E5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                    onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                {errorMsg && (
                  <p style={{ fontSize: 12, color: "#DC2626", margin: 0 }}>{errorMsg}</p>
                )}

                <button type="submit" disabled={status === "loading"}
                  style={{
                    padding: "12px 24px", borderRadius: 9, border: "none",
                    background: status === "loading" ? "#C7D2FE" : "linear-gradient(135deg, #4F46E5, #7C3AED)",
                    color: "white", fontSize: 13, fontWeight: 600,
                    cursor: status === "loading" ? "not-allowed" : "pointer",
                    boxShadow: status === "loading" ? "none" : "0 4px 14px rgba(79,70,229,0.35)",
                    transition: "all 0.15s",
                  }}>
                  {status === "loading" ? "Submitting…" : "Submit request"}
                </button>
              </form>
            </div>

            <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", marginTop: 16 }}>
              Our team reviews every request personally · Usually within 48 hours
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
