import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#0F172A" }}>

      {/* ── NAVBAR ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        backgroundColor: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "0.5px solid #E2E8F0",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: 10, letterSpacing: "-0.3px",
            }}>SG</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#0B1628", letterSpacing: "-0.3px" }}>StartGrid</span>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 28 }} className="hidden md:flex">
            {[
              { label: "How it works", href: "#how-it-works" },
              { label: "For founders", href: "#for-founders" },
              { label: "For investors", href: "#for-investors" },
              { label: "About", href: "#about" },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="sg-nav-link">
                {label}
              </a>
            ))}
          </nav>
          <Link href="/request-access" style={{
            display: "inline-flex", alignItems: "center",
            backgroundColor: "#0B1628", color: "white",
            fontSize: 13, fontWeight: 600, padding: "8px 18px",
            borderRadius: 9, textDecoration: "none",
            transition: "background 0.15s",
          }}>
            Request access
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        backgroundColor: "#0B1628",
        backgroundImage: "radial-gradient(circle, rgba(79,70,229,0.2) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        padding: "100px 24px 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glow */}
        <div style={{
          position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
          width: 600, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(79,70,229,0.35) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            backgroundColor: "rgba(79,70,229,0.15)", border: "0.5px solid rgba(99,102,241,0.4)",
            borderRadius: 20, padding: "5px 14px", marginBottom: 32,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#818CF8" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#A5B4FC", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Invitation only · European startups &amp; investors
            </span>
          </div>

          <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.8px", color: "white", margin: "0 0 20px" }}>
            Where Europe's best startups<br />meet the{" "}
            <span style={{
              background: "linear-gradient(135deg, #818CF8 0%, #A78BFA 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>right capital</span>
          </h1>

          <p style={{ fontSize: 15, lineHeight: 1.7, color: "#94A3B8", maxWidth: 560, margin: "0 auto 40px" }}>
            StartGrid is a structured, invitation-only platform that connects vetted European startups
            with serious investors — through standardised profiles, AI-generated pitch decks, and facilitated connections.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/request-access" style={{
              display: "inline-flex", alignItems: "center",
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              color: "white", fontSize: 14, fontWeight: 600, padding: "12px 28px",
              borderRadius: 9, textDecoration: "none",
              boxShadow: "0 4px 20px rgba(79,70,229,0.4)",
              transition: "all 0.15s ease",
            }}>
              Request an invitation
            </Link>
            <a href="#how-it-works" style={{
              display: "inline-flex", alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.07)", border: "0.5px solid rgba(255,255,255,0.15)",
              color: "white", fontSize: 14, fontWeight: 500, padding: "12px 24px",
              borderRadius: 9, textDecoration: "none",
              backdropFilter: "blur(8px)",
            }}>
              See how it works
            </a>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.1)", margin: "44px auto 40px" }} />

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
            {[
              { value: "€2.4B+", label: "Capital represented" },
              { value: "12", label: "Countries" },
              { value: "Invite only", label: "Access model" },
              { value: "AI-powered", label: "Pitch decks" },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: "white", letterSpacing: "-0.4px", margin: 0 }}>{value}</p>
                <p style={{ fontSize: 11, color: "#64748B", margin: "2px 0 0", fontWeight: 500 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUSTED BAR ── */}
      <section style={{ backgroundColor: "#F8FAFC", padding: "20px 24px", borderBottom: "0.5px solid #E2E8F0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Investors from</span>
          {["🇩🇪 Germany", "🇫🇷 France", "🇳🇱 Netherlands", "🇸🇪 Sweden", "🇩🇰 Denmark", "🇳🇴 Norway", "🇫🇮 Finland", "🇦🇹 Austria", "🇪🇸 Spain"].map(c => (
            <span key={c} style={{
              fontSize: 12, fontWeight: 500, color: "#475569",
              backgroundColor: "white", border: "0.5px solid #E2E8F0",
              borderRadius: 20, padding: "4px 12px",
            }}>{c}</span>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: "80px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#4F46E5", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px" }}>HOW IT WORKS</p>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.6px", margin: "0 0 12px" }}>From invitation to investment conversation</h2>
            <p style={{ fontSize: 15, color: "#64748B", margin: 0 }}>Three steps. No cold emails. No guesswork.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {[
              {
                emoji: "✉️", step: "01", title: "Get invited",
                sub: "Curated access only",
                desc: "Every founder and investor was personally invited ensuring every interaction is with a serious counterpart. Quality over quantity, always.",
              },
              {
                emoji: "🤖", step: "02", title: "Build your profile",
                sub: "AI-powered pitch deck, our standard",
                desc: "Founders answer a structured form, our AI generates a standardised 10-slide pitch deck — editable and publishable in minutes.",
              },
              {
                emoji: "🤝", step: "03", title: "Connect with purpose",
                sub: "Investor-initiated, always",
                desc: "Investors set their criteria and browse matching startups. When they find a fit they initiate the connection. We facilitate, never recommend.",
              },
            ].map(({ emoji, step, title, sub, desc }) => (
              <div key={step} style={{
                backgroundColor: "white", borderRadius: 12,
                border: "0.5px solid #E2E8F0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                overflow: "hidden",
              }}>
                <div style={{ height: 3, background: "linear-gradient(90deg, #4F46E5, #7C3AED)" }} />
                <div style={{ padding: "24px 24px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 24 }}>{emoji}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "#4F46E5",
                      backgroundColor: "#EEF2FF", borderRadius: 20,
                      padding: "3px 8px", letterSpacing: "0.04em",
                    }}>STEP {step}</span>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px", margin: "0 0 4px" }}>{title}</h3>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#4F46E5", margin: "0 0 12px" }}>{sub}</p>
                  <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.65, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "80px 24px", backgroundColor: "#F8FAFC" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#4F46E5", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px" }}>PLATFORM FEATURES</p>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.6px", margin: 0 }}>Built for serious dealmaking</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { icon: "🎯", bg: "#EEF2FF", title: "Standardised pitch decks", desc: "AI generates consistent 10-slide decks so investors can compare across opportunities." },
              { icon: "🔍", bg: "#ECFDF5", title: "Criteria-driven discovery", desc: "Investors set their stage, sector, and geography filters — only relevant startups surface." },
              { icon: "💬", bg: "#FFFBEB", title: "Facilitated messaging", desc: "Every conversation is transparent and moderated, ensuring quality over volume." },
              { icon: "🇪🇺", bg: "#F5F3FF", title: "European-first, GDPR-native", desc: "Built in Europe, for Europe — compliant with GDPR from day one." },
            ].map(({ icon, bg, title, desc }) => (
              <div key={title} style={{
                backgroundColor: "white", borderRadius: 12,
                border: "0.5px solid #E2E8F0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                padding: "24px",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  backgroundColor: bg, fontSize: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}>{icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.2px" }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IS IT FOR ── */}
      <section style={{
        padding: "80px 24px",
        backgroundColor: "#0B1628",
        backgroundImage: "radial-gradient(circle, rgba(79,70,229,0.2) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.6px", color: "white", textAlign: "center", margin: "0 0 48px" }}>
            Built for two sides of the same table
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              {
                label: "FOR FOUNDERS",
                title: "Get discovered by the right investors",
                bullets: [
                  "Answer a structured form once",
                  "AI generates your 10-slide pitch deck",
                  "Publish to become visible to matched investors",
                  "Receive and manage connection requests",
                  "Message investors who reach out",
                ],
              },
              {
                label: "FOR INVESTORS",
                title: "Find startups that match your thesis",
                bullets: [
                  "Set your stage, sector, and geography criteria",
                  "Browse standardised pitch decks — no formatting noise",
                  "Initiate connections with startups you like",
                  "Message founders directly on the platform",
                  "Full transparency — all activity is moderated",
                ],
              },
            ].map(({ label, title, bullets }) => (
              <div key={label} id={label === "FOR FOUNDERS" ? "for-founders" : "for-investors"} style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "0.5px solid rgba(79,70,229,0.3)",
                borderRadius: 12, padding: "28px",
                backdropFilter: "blur(8px)",
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#818CF8", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px" }}>{label}</p>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "white", letterSpacing: "-0.3px", margin: "0 0 20px", lineHeight: 1.3 }}>{title}</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {bullets.map(b => (
                    <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#94A3B8", lineHeight: 1.5 }}>
                      <span style={{ color: "#4F46E5", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>›</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{
            borderRadius: 16, overflow: "hidden",
            background: "linear-gradient(135deg, #0B1628 0%, #1E1B4B 100%)",
            backgroundImage: "radial-gradient(circle, rgba(79,70,229,0.2) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            padding: "52px 48px",
            textAlign: "center",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: 400, height: 200,
              background: "radial-gradient(ellipse, rgba(79,70,229,0.25) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: "#818CF8", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px", position: "relative" }}>JOIN STARTGRID</p>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "white", letterSpacing: "-0.5px", margin: "0 0 12px", position: "relative" }}>
              Ready to join StartGrid?
            </h2>
            <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.7, margin: "0 0 36px", position: "relative" }}>
              Access is by invitation only. Apply below and our team will be in touch within 48 hours.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
              <Link href="/request-access?role=startup" style={{
                display: "inline-flex", alignItems: "center",
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                color: "white", fontSize: 13, fontWeight: 600, padding: "11px 24px",
                borderRadius: 9, textDecoration: "none",
                boxShadow: "0 4px 16px rgba(79,70,229,0.4)",
              }}>
                Apply as a founder
              </Link>
              <Link href="/request-access?role=investor" style={{
                display: "inline-flex", alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.35)",
                color: "white", fontSize: 13, fontWeight: 600, padding: "11px 24px",
                borderRadius: 9, textDecoration: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}>
                Apply as an investor
              </Link>
            </div>
            <p style={{ fontSize: 11, color: "#475569", margin: "24px 0 0", position: "relative" }}>
              Operated by a European VC firm · Invitation only · GDPR compliant
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="about" style={{
        backgroundColor: "#0B1628",
        padding: "36px 24px",
        borderTop: "0.5px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: 9,
            }}>SG</div>
            <div>
              <p style={{ margin: 0, color: "white", fontWeight: 600, fontSize: 13 }}>StartGrid</p>
              <p style={{ margin: 0, color: "#475569", fontSize: 11 }}>European startup-investor marketplace</p>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 20 }}>
            {["Privacy", "Terms", "Contact", "GDPR"].map(l => (
              <a key={l} href="#" style={{ fontSize: 12, color: "#475569", textDecoration: "none", fontWeight: 500, transition: "color 0.15s" }}>{l}</a>
            ))}
          </nav>
          <p style={{ fontSize: 12, color: "#334155", margin: 0 }}>© 2026 StartGrid</p>
        </div>
      </footer>

    </div>
  );
}
