import Link from "next/link";

// ── Logo mark: Nordic north-star / compass ──────────────────────────────────
function LogoMark({ size = 28, color = "white" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" />
    </svg>
  );
}

// ── SVG icon set (stroke-style, consistent weight) ─────────────────────────
function IconMail() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 5.5a2 2 0 001.4 1.4L21 12l-5.8 2.1a2 2 0 00-1.4 1.4L12 21l-1.8-5.5a2 2 0 00-1.4-1.4L3 12l5.8-2.1a2 2 0 001.4-1.4L12 3z" />
    </svg>
  );
}

function IconNetwork() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.7 10.7l6.6-4.4M8.7 13.3l6.6 4.4" />
    </svg>
  );
}

function IconDocument() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#0C1E35", backgroundColor: "#ffffff" }}>

      {/* ── NAVBAR ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        backgroundColor: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid #E4EAF2",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "linear-gradient(135deg, #1B63D8, #0F3E9E)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(27,99,216,0.35)",
            }}>
              <LogoMark size={18} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#0C1E35", letterSpacing: "-0.4px" }}>StartGrid</span>
          </div>

          <nav style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden md:flex">
            {[
              { label: "How it works", href: "#how-it-works" },
              { label: "For founders", href: "#for-founders" },
              { label: "For investors", href: "#for-investors" },
              { label: "About", href: "#about" },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="sg-nav-link">{label}</a>
            ))}
          </nav>

          <Link href="/request-access" style={{
            display: "inline-flex", alignItems: "center",
            background: "linear-gradient(135deg, #1B63D8, #0F3E9E)",
            color: "white", fontSize: 13, fontWeight: 600, padding: "8px 20px",
            borderRadius: 9, textDecoration: "none",
            boxShadow: "0 2px 10px rgba(27,99,216,0.35)",
          }}>
            Request access
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(165deg, #EBF2FF 0%, #F4F8FF 45%, #ffffff 100%)",
        padding: "100px 24px 84px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -100, left: "8%", width: 560, height: 560,
          borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(27,99,216,0.09) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", top: -80, right: "4%", width: 400, height: 400,
          borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(15,62,158,0.06) 0%, transparent 70%)",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 740, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            backgroundColor: "#EBF2FF", border: "1px solid #BDD4F5",
            borderRadius: 20, padding: "5px 14px", marginBottom: 28,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#1B63D8" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#1240A0", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Invitation only · Nordic &amp; European focus
            </span>
          </div>

          <h1 style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.2px", color: "#0C1E35", margin: "0 0 22px" }}>
            Where Europe's best startups<br />meet the{" "}
            <span style={{
              background: "linear-gradient(135deg, #1B63D8 0%, #0F3E9E 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>right capital</span>
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.78, color: "#3D5470", maxWidth: 560, margin: "0 auto 40px" }}>
            A structured, invitation-only platform connecting vetted Nordic and European
            startups with serious investors — through standardised profiles,
            AI-generated pitch decks, and facilitated connections.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/request-access" style={{
              display: "inline-flex", alignItems: "center",
              background: "linear-gradient(135deg, #1B63D8, #0F3E9E)",
              color: "white", fontSize: 14, fontWeight: 600, padding: "13px 28px",
              borderRadius: 10, textDecoration: "none",
              boxShadow: "0 4px 18px rgba(27,99,216,0.38)",
            }}>
              Request an invitation
            </Link>
            <a href="#how-it-works" style={{
              display: "inline-flex", alignItems: "center",
              backgroundColor: "white", border: "1.5px solid #DDE8F5",
              color: "#1B63D8", fontSize: 14, fontWeight: 500, padding: "12px 24px",
              borderRadius: 10, textDecoration: "none",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              See how it works →
            </a>
          </div>

          <div style={{
            display: "flex", justifyContent: "center",
            marginTop: 56, paddingTop: 40, borderTop: "1px solid #DDE8F5",
          }}>
            {[
              { value: "€2.4B+", label: "Capital represented" },
              { value: "12", label: "Countries" },
              { value: "Invite only", label: "Access model" },
              { value: "AI-powered", label: "Pitch decks" },
            ].map(({ value, label }, i) => (
              <div key={label} style={{
                textAlign: "center", padding: "0 36px",
                borderRight: i < 3 ? "1px solid #DDE8F5" : "none",
              }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: "#1B63D8", letterSpacing: "-0.5px", margin: 0 }}>{value}</p>
                <p style={{ fontSize: 11, color: "#7B95AE", margin: "4px 0 0", fontWeight: 500 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUSTED BAR ── */}
      <section style={{ backgroundColor: "#F5F8FC", padding: "18px 24px", borderTop: "1px solid #E4EAF2", borderBottom: "1px solid #E4EAF2" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#7B95AE", textTransform: "uppercase", letterSpacing: "0.07em" }}>Investors from</span>
          {["🇩🇰 Denmark", "🇸🇪 Sweden", "🇳🇴 Norway", "🇫🇮 Finland", "🇩🇪 Germany", "🇳🇱 Netherlands", "🇫🇷 France", "🇦🇹 Austria", "🇪🇸 Spain"].map(c => (
            <span key={c} style={{
              fontSize: 12, fontWeight: 500, color: "#2D4A6A",
              backgroundColor: "white", border: "1px solid #DDE8F5",
              borderRadius: 20, padding: "4px 12px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}>{c}</span>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: "92px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#1B63D8", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 10px" }}>HOW IT WORKS</p>
            <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.7px", margin: "0 0 14px", color: "#0C1E35" }}>From invitation to investment conversation</h2>
            <p style={{ fontSize: 16, color: "#4C6072", margin: 0 }}>Three steps. No cold emails. No guesswork.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {[
              {
                Icon: IconMail, step: "01", title: "Get invited",
                sub: "Curated access only",
                desc: "Every founder and investor is personally invited — ensuring every interaction is with a serious counterpart. Quality over quantity, always.",
                accentColor: "#1B63D8", accentBg: "#EBF2FF",
              },
              {
                Icon: IconSparkle, step: "02", title: "Build your profile",
                sub: "AI-powered pitch deck in minutes",
                desc: "Founders answer a structured form, our AI generates a standardised 10-slide pitch deck — editable and publishable in minutes.",
                accentColor: "#0D7A8A", accentBg: "#E6F7F9",
              },
              {
                Icon: IconNetwork, step: "03", title: "Connect with purpose",
                sub: "Investor-initiated, always",
                desc: "Investors set their criteria and browse matching startups. When they find a fit, they initiate the connection. We facilitate, never recommend.",
                accentColor: "#1B63D8", accentBg: "#EBF2FF",
              },
            ].map(({ Icon, step, title, sub, desc, accentColor, accentBg }) => (
              <div key={step} style={{
                backgroundColor: "white", borderRadius: 14,
                border: "1px solid #E4EAF2",
                boxShadow: "0 2px 12px rgba(12,30,53,0.06)",
                overflow: "hidden",
              }}>
                <div style={{ height: 3, background: `linear-gradient(90deg, #1B63D8, #0D7A8A)` }} />
                <div style={{ padding: "26px 26px 30px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      backgroundColor: accentBg, color: accentColor,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Icon />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: accentColor, backgroundColor: accentBg, borderRadius: 20, padding: "3px 9px" }}>STEP {step}</span>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px", margin: "0 0 5px", color: "#0C1E35" }}>{title}</h3>
                  <p style={{ fontSize: 12, fontWeight: 600, color: accentColor, margin: "0 0 12px" }}>{sub}</p>
                  <p style={{ fontSize: 14, color: "#4C6072", lineHeight: 1.72, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "92px 24px", backgroundColor: "#F5F8FC" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#1B63D8", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 10px" }}>PLATFORM FEATURES</p>
            <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.7px", margin: "0 0 14px", color: "#0C1E35" }}>Built for serious dealmaking</h2>
            <p style={{ fontSize: 16, color: "#4C6072", margin: 0 }}>Every feature exists to reduce friction and increase signal quality.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { Icon: IconDocument, bg: "#EBF2FF", color: "#1B63D8", title: "Standardised pitch decks", desc: "AI generates consistent 10-slide decks so investors can compare opportunities without formatting noise." },
              { Icon: IconSearch, bg: "#E6F7F9", color: "#0D7A8A", title: "Criteria-driven discovery", desc: "Investors set stage, sector, and geography filters — only the most relevant startups surface." },
              { Icon: IconChat, bg: "#EEF3FB", color: "#2D5FA8", title: "Facilitated messaging", desc: "Every conversation is transparent and moderated, ensuring quality and integrity over volume." },
              { Icon: IconShield, bg: "#E8F0FA", color: "#1B5490", title: "European-first, GDPR-native", desc: "Built in Europe, for Europe — compliant with GDPR and data residency requirements from day one." },
            ].map(({ Icon, bg, color, title, desc }) => (
              <div key={title} style={{
                backgroundColor: "white", borderRadius: 14,
                border: "1px solid #E4EAF2",
                boxShadow: "0 2px 8px rgba(12,30,53,0.05)",
                padding: "26px",
              }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  backgroundColor: bg, color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 18,
                }}>
                  <Icon />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.2px", color: "#0C1E35" }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#4C6072", lineHeight: 1.68, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "92px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#1B63D8", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 10px" }}>WHAT THEY SAY</p>
            <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.7px", margin: "0 0 14px", color: "#0C1E35" }}>Trusted by founders and investors across Europe</h2>
            <p style={{ fontSize: 16, color: "#4C6072", margin: 0 }}>From pre-seed to Series A — across 12 countries.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              {
                quote: "StartGrid cut through the noise completely. Within two weeks of publishing our pitch deck, we had three serious investors reach out — all the right fit for our stage and sector.",
                name: "Sophie Laurent", role: "Co-founder & CEO", company: "Lumio Health",
                country: "🇫🇷 Paris", initials: "SL", color: "#1B63D8", bg: "#EBF2FF",
              },
              {
                quote: "The quality gap is significant. Every startup has a proper deck, clear stage, and real traction data. I spend far less time screening and far more time in conversations that actually go somewhere.",
                name: "Marcus Wieland", role: "Partner", company: "Nordvik Ventures",
                country: "🇸🇪 Stockholm", initials: "MW", color: "#0D7A8A", bg: "#E6F7F9",
              },
              {
                quote: "The invitation-only model is what made us trust the platform. We knew every investor viewing our deck was serious. We closed our seed round six weeks after joining.",
                name: "Arjun Mehta", role: "Founder", company: "Fieldsense AI",
                country: "🇩🇰 Copenhagen", initials: "AM", color: "#1B5490", bg: "#EEF3FB",
              },
            ].map(({ quote, name, role, company, country, initials, color, bg }) => (
              <div key={name} style={{
                backgroundColor: "white", borderRadius: 14,
                border: "1px solid #E4EAF2",
                boxShadow: "0 2px 12px rgba(12,30,53,0.06)",
                padding: "28px", display: "flex", flexDirection: "column",
              }}>
                <span style={{ fontSize: 44, lineHeight: 1, color: "#BDD4F5", fontFamily: "Georgia, serif", marginBottom: 14 }}>"</span>
                <p style={{ fontSize: 14, color: "#2D4A6A", lineHeight: 1.8, margin: "0 0 22px", flex: 1 }}>{quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 18, borderTop: "1px solid #EBF0F8" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    backgroundColor: bg, color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 13, border: `1.5px solid ${color}30`,
                  }}>{initials}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0C1E35" }}>{name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#4C6072" }}>{role} · {company}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#7B95AE", marginTop: 2 }}>{country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div style={{
            marginTop: 48, backgroundColor: "#F5F8FC", borderRadius: 14,
            border: "1px solid #E4EAF2", padding: "24px 40px",
            display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap",
          }}>
            {[
              { value: "€2.4B+", label: "Capital represented by investors" },
              { value: "12", label: "European countries" },
              { value: "100%", label: "Invitation-only access" },
              { value: "48h", label: "Average response time" },
            ].map(({ value, label }, i) => (
              <div key={label} style={{
                textAlign: "center", padding: "8px 36px",
                borderRight: i < 3 ? "1px solid #DDE8F5" : "none",
              }}>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#1B63D8", letterSpacing: "-0.6px" }}>{value}</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#7B95AE", fontWeight: 500 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IS IT FOR ── */}
      <section style={{ padding: "92px 24px", backgroundColor: "#EBF2FF" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#1B63D8", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 10px" }}>WHO IS IT FOR</p>
            <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.7px", color: "#0C1E35", margin: "0 0 14px" }}>Built for two sides of the same table</h2>
            <p style={{ fontSize: 16, color: "#4C6072", margin: 0 }}>Whether you are raising or deploying capital, StartGrid was made for you.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {[
              {
                id: "for-founders",
                label: "FOR FOUNDERS",
                accent: "#1B63D8",
                accentBg: "#EBF2FF",
                borderColor: "#1B63D8",
                title: "Get discovered by the right investors",
                bullets: [
                  "Answer a structured form once",
                  "AI generates your 10-slide pitch deck",
                  "Publish to become visible to matched investors",
                  "Receive and manage connection requests",
                  "Message investors who reach out",
                ],
                cta: "Apply as a founder",
                href: "/request-access?role=startup",
              },
              {
                id: "for-investors",
                label: "FOR INVESTORS",
                accent: "#0D7A8A",
                accentBg: "#E6F7F9",
                borderColor: "#0D7A8A",
                title: "Find startups that match your thesis",
                bullets: [
                  "Set your stage, sector, and geography criteria",
                  "Browse standardised pitch decks — no noise",
                  "Initiate connections with startups you like",
                  "Message founders directly on the platform",
                  "Full transparency — all activity is moderated",
                ],
                cta: "Apply as an investor",
                href: "/request-access?role=investor",
              },
            ].map(({ id, label, accent, accentBg, title, bullets, cta, href }) => (
              <div key={id} id={id} style={{
                backgroundColor: "white", borderRadius: 16,
                border: "1px solid #DDE8F5",
                boxShadow: "0 4px 20px rgba(12,30,53,0.07)",
                overflow: "hidden",
              }}>
                <div style={{ height: 4, backgroundColor: accent }} />
                <div style={{ padding: "30px 30px 28px" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: accent,
                    backgroundColor: accentBg, borderRadius: 20, padding: "3px 10px",
                    letterSpacing: "0.08em",
                  }}>{label}</span>
                  <h3 style={{ fontSize: 19, fontWeight: 700, color: "#0C1E35", letterSpacing: "-0.3px", margin: "14px 0 20px", lineHeight: 1.3 }}>{title}</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {bullets.map(b => (
                      <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#3D5470", lineHeight: 1.55 }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                          backgroundColor: accentBg, color: accent,
                          display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
                        }}>
                          <IconCheck />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link href={href} style={{
                    display: "inline-flex", alignItems: "center",
                    background: `linear-gradient(135deg, ${accent}, ${accent}CC)`,
                    color: "white", fontSize: 13, fontWeight: 600, padding: "10px 20px",
                    borderRadius: 9, textDecoration: "none",
                    boxShadow: `0 3px 10px ${accent}40`,
                  }}>{cta} →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "92px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{
            borderRadius: 20,
            background: "linear-gradient(140deg, #0C2D6B 0%, #1B63D8 55%, #0D7A8A 100%)",
            padding: "56px 48px", textAlign: "center",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }} />
            <div style={{
              position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
              width: 420, height: 210, borderRadius: "50%", pointerEvents: "none",
              background: "radial-gradient(ellipse, rgba(255,255,255,0.10) 0%, transparent 70%)",
            }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <LogoMark size={24} color="white" />
                </div>
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 14px" }}>JOIN STARTGRID</p>
              <h2 style={{ fontSize: 30, fontWeight: 800, color: "white", letterSpacing: "-0.6px", margin: "0 0 14px", lineHeight: 1.2 }}>
                Ready to join StartGrid?
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.72, margin: "0 0 36px", maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
                Access is by invitation only. Submit your request and our team will review it personally within 48 hours.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/request-access?role=startup" style={{
                  display: "inline-flex", alignItems: "center",
                  backgroundColor: "white", color: "#1240A0",
                  fontSize: 13, fontWeight: 700, padding: "12px 24px",
                  borderRadius: 10, textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                }}>
                  Apply as a founder
                </Link>
                <Link href="/request-access?role=investor" style={{
                  display: "inline-flex", alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.14)", border: "1.5px solid rgba(255,255,255,0.38)",
                  color: "white", fontSize: 13, fontWeight: 600, padding: "12px 24px",
                  borderRadius: 10, textDecoration: "none",
                }}>
                  Apply as an investor
                </Link>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", margin: "24px 0 0" }}>
                Nordic &amp; European focus · GDPR compliant · No spam, ever
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="about" style={{
        backgroundColor: "#0C1E35",
        padding: "40px 24px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, #1B63D8, #0F3E9E)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(27,99,216,0.35)",
            }}>
              <LogoMark size={17} color="white" />
            </div>
            <div>
              <p style={{ margin: 0, color: "white", fontWeight: 700, fontSize: 13, letterSpacing: "-0.2px" }}>StartGrid</p>
              <p style={{ margin: 0, color: "#4C6072", fontSize: 11 }}>Nordic &amp; European startup-investor marketplace</p>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Contact", "GDPR"].map(l => (
              <a key={l} href="#" style={{ fontSize: 12, color: "#4C6072", textDecoration: "none", fontWeight: 500 }}>{l}</a>
            ))}
          </nav>
          <p style={{ fontSize: 12, color: "#3D5470", margin: 0 }}>© 2026 StartGrid. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
