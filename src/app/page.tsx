import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#111827", backgroundColor: "#ffffff" }}>

      {/* ── NAVBAR ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        backgroundColor: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid #F0F2F5",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: 10,
              boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
            }}>SG</div>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#111827", letterSpacing: "-0.4px" }}>StartGrid</span>
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
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            color: "white", fontSize: 13, fontWeight: 600, padding: "8px 20px",
            borderRadius: 9, textDecoration: "none",
            boxShadow: "0 2px 10px rgba(79,70,229,0.35)",
          }}>
            Request access
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(170deg, #F5F3FF 0%, #FAFAFF 50%, #ffffff 100%)",
        padding: "96px 24px 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Soft decorative blobs */}
        <div style={{
          position: "absolute", top: -80, left: "10%", width: 500, height: 500,
          borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", top: -60, right: "5%", width: 360, height: 360,
          borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 740, margin: "0 auto" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            backgroundColor: "#EEF2FF", border: "1px solid #C7D2FE",
            borderRadius: 20, padding: "5px 14px", marginBottom: 28,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#4F46E5" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#4338CA", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Invitation only · European startups &amp; investors
            </span>
          </div>

          <h1 style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.2px", color: "#111827", margin: "0 0 22px" }}>
            Where Europe's best startups<br />meet the{" "}
            <span style={{
              background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>right capital</span>
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.75, color: "#4B5563", maxWidth: 560, margin: "0 auto 40px" }}>
            A structured, invitation-only platform connecting vetted European startups
            with serious investors — through standardised profiles, AI-generated pitch decks,
            and facilitated connections.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/request-access" style={{
              display: "inline-flex", alignItems: "center",
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              color: "white", fontSize: 14, fontWeight: 600, padding: "13px 28px",
              borderRadius: 10, textDecoration: "none",
              boxShadow: "0 4px 18px rgba(79,70,229,0.38)",
            }}>
              Request an invitation
            </Link>
            <a href="#how-it-works" style={{
              display: "inline-flex", alignItems: "center",
              backgroundColor: "white", border: "1.5px solid #E5E7EB",
              color: "#374151", fontSize: 14, fontWeight: 500, padding: "12px 24px",
              borderRadius: 10, textDecoration: "none",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              See how it works →
            </a>
          </div>

          {/* Stats row */}
          <div style={{
            display: "flex", justifyContent: "center", gap: 0, flexWrap: "wrap",
            marginTop: 56, paddingTop: 40, borderTop: "1px solid #E9ECEF",
          }}>
            {[
              { value: "€2.4B+", label: "Capital represented" },
              { value: "12", label: "Countries" },
              { value: "Invite only", label: "Access model" },
              { value: "AI-powered", label: "Pitch decks" },
            ].map(({ value, label }, i) => (
              <div key={label} style={{
                textAlign: "center", padding: "0 36px",
                borderRight: i < 3 ? "1px solid #E9ECEF" : "none",
              }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: "#4F46E5", letterSpacing: "-0.5px", margin: 0 }}>{value}</p>
                <p style={{ fontSize: 11, color: "#9CA3AF", margin: "4px 0 0", fontWeight: 500 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUSTED BAR ── */}
      <section style={{ backgroundColor: "#F9FAFB", padding: "18px 24px", borderTop: "1px solid #F0F2F5", borderBottom: "1px solid #F0F2F5" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Investors from</span>
          {["🇩🇪 Germany", "🇫🇷 France", "🇳🇱 Netherlands", "🇸🇪 Sweden", "🇩🇰 Denmark", "🇳🇴 Norway", "🇫🇮 Finland", "🇦🇹 Austria", "🇪🇸 Spain"].map(c => (
            <span key={c} style={{
              fontSize: 12, fontWeight: 500, color: "#374151",
              backgroundColor: "white", border: "1px solid #E9ECEF",
              borderRadius: 20, padding: "4px 12px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}>{c}</span>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: "88px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#4F46E5", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 10px" }}>HOW IT WORKS</p>
            <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.7px", margin: "0 0 14px", color: "#111827" }}>From invitation to investment conversation</h2>
            <p style={{ fontSize: 16, color: "#6B7280", margin: 0 }}>Three steps. No cold emails. No guesswork.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {[
              {
                emoji: "✉️", step: "01", title: "Get invited",
                sub: "Curated access only",
                desc: "Every founder and investor is personally invited — ensuring every interaction is with a serious counterpart. Quality over quantity, always.",
              },
              {
                emoji: "🤖", step: "02", title: "Build your profile",
                sub: "AI-powered pitch deck in minutes",
                desc: "Founders answer a structured form, our AI generates a standardised 10-slide pitch deck — editable and publishable in minutes.",
              },
              {
                emoji: "🤝", step: "03", title: "Connect with purpose",
                sub: "Investor-initiated, always",
                desc: "Investors set their criteria and browse matching startups. When they find a fit, they initiate the connection. We facilitate, never recommend.",
              },
            ].map(({ emoji, step, title, sub, desc }) => (
              <div key={step} style={{
                backgroundColor: "white", borderRadius: 14,
                border: "1px solid #E9ECEF",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                overflow: "hidden",
              }}>
                <div style={{ height: 3, background: "linear-gradient(90deg, #4F46E5, #7C3AED)" }} />
                <div style={{ padding: "26px 26px 30px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                    <span style={{ fontSize: 26 }}>{emoji}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "#4F46E5",
                      backgroundColor: "#EEF2FF", borderRadius: 20, padding: "3px 9px",
                    }}>STEP {step}</span>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px", margin: "0 0 5px", color: "#111827" }}>{title}</h3>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#4F46E5", margin: "0 0 12px" }}>{sub}</p>
                  <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "88px 24px", backgroundColor: "#F9FAFB" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#4F46E5", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 10px" }}>PLATFORM FEATURES</p>
            <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.7px", margin: "0 0 14px", color: "#111827" }}>Built for serious dealmaking</h2>
            <p style={{ fontSize: 16, color: "#6B7280", margin: 0 }}>Every feature exists to reduce friction and increase signal quality.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { icon: "🎯", bg: "#EEF2FF", iconColor: "#4F46E5", title: "Standardised pitch decks", desc: "AI generates consistent 10-slide decks so investors can compare across opportunities without formatting noise." },
              { icon: "🔍", bg: "#ECFDF5", iconColor: "#059669", title: "Criteria-driven discovery", desc: "Investors set their stage, sector, and geography filters — only the most relevant startups surface." },
              { icon: "💬", bg: "#FFF7ED", iconColor: "#EA580C", title: "Facilitated messaging", desc: "Every conversation is transparent and moderated, ensuring quality and integrity over volume." },
              { icon: "🇪🇺", bg: "#F5F3FF", iconColor: "#7C3AED", title: "European-first, GDPR-native", desc: "Built in Europe, for Europe — compliant with GDPR and data residency requirements from day one." },
            ].map(({ icon, bg, title, desc }) => (
              <div key={title} style={{
                backgroundColor: "white", borderRadius: 14,
                border: "1px solid #E9ECEF",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                padding: "26px",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  backgroundColor: bg, fontSize: 20,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 18,
                }}>{icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.2px", color: "#111827" }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "88px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#4F46E5", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 10px" }}>WHAT THEY SAY</p>
            <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.7px", margin: "0 0 14px", color: "#111827" }}>Trusted by founders and investors across Europe</h2>
            <p style={{ fontSize: 16, color: "#6B7280", margin: 0 }}>From pre-seed to Series A — across 12 countries.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              {
                quote: "StartGrid cut through the noise completely. Within two weeks of publishing our pitch deck, we had three serious investors reach out — all the right fit for our stage and sector.",
                name: "Sophie Laurent", role: "Co-founder & CEO", company: "Lumio Health",
                country: "🇫🇷 Paris", initials: "SL", color: "#4F46E5", bg: "#EEF2FF",
              },
              {
                quote: "The quality gap is significant. Every startup has a proper deck, clear stage, and real traction data. I spend far less time screening and far more time in conversations that go somewhere.",
                name: "Marcus Wieland", role: "Partner", company: "Nordvik Ventures",
                country: "🇸🇪 Stockholm", initials: "MW", color: "#7C3AED", bg: "#F5F3FF",
              },
              {
                quote: "The invitation-only model is what made us trust the platform. We knew every investor viewing our deck was serious. We closed our seed round six weeks after joining.",
                name: "Arjun Mehta", role: "Founder", company: "Fieldsense AI",
                country: "🇩🇪 Berlin", initials: "AM", color: "#059669", bg: "#ECFDF5",
              },
            ].map(({ quote, name, role, company, country, initials, color, bg }) => (
              <div key={name} style={{
                backgroundColor: "white", borderRadius: 14,
                border: "1px solid #E9ECEF",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                padding: "28px",
                display: "flex", flexDirection: "column",
              }}>
                <span style={{ fontSize: 42, lineHeight: 1, color: "#DDD6FE", fontFamily: "Georgia, serif", marginBottom: 14 }}>"</span>
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.8, margin: "0 0 22px", flex: 1 }}>{quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 18, borderTop: "1px solid #F3F4F6" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    backgroundColor: bg, color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 13, border: `1.5px solid ${color}22`,
                  }}>{initials}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827" }}>{name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>{role} · {company}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div style={{
            marginTop: 48,
            backgroundColor: "#F9FAFB", borderRadius: 14,
            border: "1px solid #E9ECEF",
            padding: "24px 40px",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 0, flexWrap: "wrap",
          }}>
            {[
              { value: "€2.4B+", label: "Capital represented by investors" },
              { value: "12", label: "European countries" },
              { value: "100%", label: "Invitation-only access" },
              { value: "48h", label: "Average response time" },
            ].map(({ value, label }, i) => (
              <div key={label} style={{
                textAlign: "center", padding: "8px 36px",
                borderRight: i < 3 ? "1px solid #E9ECEF" : "none",
              }}>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#4F46E5", letterSpacing: "-0.6px" }}>{value}</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IS IT FOR ── */}
      <section style={{ padding: "88px 24px", backgroundColor: "#F5F3FF" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#4F46E5", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 10px" }}>WHO IS IT FOR</p>
            <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.7px", color: "#111827", margin: "0 0 14px" }}>Built for two sides of the same table</h2>
            <p style={{ fontSize: 16, color: "#6B7280", margin: 0 }}>Whether you're raising or deploying capital, StartGrid was made for you.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {[
              {
                id: "for-founders",
                label: "FOR FOUNDERS",
                accent: "#4F46E5",
                accentBg: "#EEF2FF",
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
                accent: "#7C3AED",
                accentBg: "#F5F3FF",
                title: "Find startups that match your thesis",
                bullets: [
                  "Set your stage, sector, and geography criteria",
                  "Browse standardised pitch decks — no formatting noise",
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
                border: "1px solid #E9ECEF",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}>
                <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}99)` }} />
                <div style={{ padding: "30px 30px 28px" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: accent,
                    backgroundColor: accentBg, borderRadius: 20, padding: "3px 10px",
                    letterSpacing: "0.08em",
                  }}>{label}</span>
                  <h3 style={{ fontSize: 19, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px", margin: "14px 0 20px", lineHeight: 1.3 }}>{title}</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 11 }}>
                    {bullets.map(b => (
                      <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#4B5563", lineHeight: 1.55 }}>
                        <span style={{
                          width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                          backgroundColor: accentBg, color: accent,
                          fontSize: 11, fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          marginTop: 1,
                        }}>✓</span>
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
      <section style={{ padding: "88px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{
            borderRadius: 20,
            background: "linear-gradient(135deg, #4F46E5 0%, #6D28D9 60%, #7C3AED 100%)",
            padding: "56px 48px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Subtle dot pattern */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }} />
            {/* Top glow */}
            <div style={{
              position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
              width: 440, height: 220, borderRadius: "50%", pointerEvents: "none",
              background: "radial-gradient(ellipse, rgba(255,255,255,0.12) 0%, transparent 70%)",
            }} />
            <div style={{ position: "relative" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 16px" }}>JOIN STARTGRID</p>
              <h2 style={{ fontSize: 30, fontWeight: 800, color: "white", letterSpacing: "-0.6px", margin: "0 0 14px", lineHeight: 1.2 }}>
                Ready to join StartGrid?
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.7, margin: "0 0 36px", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
                Access is by invitation only. Submit your request and our team will review it personally within 48 hours.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/request-access?role=startup" style={{
                  display: "inline-flex", alignItems: "center",
                  backgroundColor: "white", color: "#4F46E5",
                  fontSize: 13, fontWeight: 700, padding: "12px 24px",
                  borderRadius: 10, textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                }}>
                  Apply as a founder
                </Link>
                <Link href="/request-access?role=investor" style={{
                  display: "inline-flex", alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.14)", border: "1.5px solid rgba(255,255,255,0.4)",
                  color: "white", fontSize: 13, fontWeight: 600, padding: "12px 24px",
                  borderRadius: 10, textDecoration: "none",
                }}>
                  Apply as an investor
                </Link>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "24px 0 0" }}>
                Operated by a European VC firm · GDPR compliant · No spam, ever
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="about" style={{
        backgroundColor: "#1E293B",
        padding: "40px 24px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: 9,
            }}>SG</div>
            <div>
              <p style={{ margin: 0, color: "white", fontWeight: 700, fontSize: 13, letterSpacing: "-0.2px" }}>StartGrid</p>
              <p style={{ margin: 0, color: "#64748B", fontSize: 11 }}>European startup-investor marketplace</p>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Contact", "GDPR"].map(l => (
              <a key={l} href="#" style={{ fontSize: 12, color: "#64748B", textDecoration: "none", fontWeight: 500 }}>{l}</a>
            ))}
          </nav>
          <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>© 2026 StartGrid. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
