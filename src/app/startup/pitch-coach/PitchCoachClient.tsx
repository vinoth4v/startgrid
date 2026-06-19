"use client";

import { useState } from "react";

interface Question {
  id: string;
  category: string;
  question: string;
  tip: string;
}

const QUESTIONS: Question[] = [
  // Problem & Solution
  { id: "p1", category: "Problem", question: "What is the core problem you're solving?", tip: "Be specific. State the pain clearly — who feels it, how often, and how acutely." },
  { id: "p2", category: "Problem", question: "Why does this problem exist today?", tip: "Explain root causes. Investor want to know why this hasn't been solved yet." },
  { id: "p3", category: "Solution", question: "How does your product solve this problem uniquely?", tip: "Contrast with alternatives. What's your 'secret sauce'?" },
  // Market
  { id: "m1", category: "Market", question: "What is your total addressable market (TAM)?", tip: "Be specific — bottom-up is better than top-down. Show your maths." },
  { id: "m2", category: "Market", question: "Who is your ideal customer and why do they buy?", tip: "Name the persona. What does their day look like? What's their budget?" },
  { id: "m3", category: "Market", question: "How big is the market in 5 years?", tip: "Show a trend. Is this market growing? What tailwinds support it?" },
  // Traction
  { id: "t1", category: "Traction", question: "What traction do you have so far?", tip: "Metrics beat narratives. Revenue, DAUs, NPS, letters of intent — all count." },
  { id: "t2", category: "Traction", question: "What does your growth curve look like?", tip: "If early, explain your hypothesis. If growing, show the slope." },
  { id: "t3", category: "Traction", question: "What is your customer acquisition strategy?", tip: "Free, paid, or viral? What does your CAC look like vs. LTV?" },
  // Team
  { id: "tm1", category: "Team", question: "Why is your team uniquely positioned to win this market?", tip: "Unfair advantages — domain expertise, prior exits, unique relationships." },
  { id: "tm2", category: "Team", question: "What key roles do you need to hire in the next 12 months?", tip: "Investors invest in execution. Show you know your gaps." },
  { id: "tm3", category: "Team", question: "Have you worked together before? What's your team dynamic?", tip: "Co-founder conflict is a top startup killer. Address this proactively." },
  // Funding
  { id: "f1", category: "Funding", question: "How much are you raising and what is it for?", tip: "Be specific about milestones this round achieves. Avoid vague 'growth' answers." },
  { id: "f2", category: "Funding", question: "What does your 18-month roadmap look like?", tip: "Show the milestones that will make your next round easier to raise." },
  { id: "f3", category: "Funding", question: "What are the biggest risks in your business?", tip: "Identifying your own risks builds trust. Show how you're mitigating them." },
];

const CATEGORIES = Array.from(new Set(QUESTIONS.map(q => q.category)));

type Mode = "list" | "flashcard";

export default function PitchCoachClient() {
  const [mode, setMode] = useState<Mode>("list");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flashIndex, setFlashIndex] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const visibleQs = activeCategory ? QUESTIONS.filter(q => q.category === activeCategory) : QUESTIONS;
  const answeredCount = Object.values(answers).filter(v => v.trim()).length;

  // Flashcard mode
  const currentQ = visibleQs[flashIndex % visibleQs.length];

  return (
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
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>Pitch Coach</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#94A3B8" }}>
            {answeredCount}/{QUESTIONS.length} answered
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {(["list", "flashcard"] as Mode[]).map(m => (
              <button key={m} type="button" onClick={() => { setMode(m); setFlashIndex(0); setShowTip(false); }} style={{
                padding: "6px 12px", borderRadius: 7, cursor: "pointer",
                fontSize: 11, fontWeight: 600, textTransform: "capitalize",
                border: mode === m ? "0.5px solid #4F46E5" : "0.5px solid #E2E8F0",
                backgroundColor: mode === m ? "#EEF2FF" : "white",
                color: mode === m ? "#4F46E5" : "#64748B",
              }}>
                {m === "list" ? "📝 Practice mode" : "🃏 Flashcard mode"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 32px" }}>

        {mode === "list" ? (
          <>
            {/* Category tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
              <button type="button" onClick={() => setActiveCategory(null)} style={{
                padding: "6px 12px", borderRadius: 20, cursor: "pointer",
                fontSize: 11, fontWeight: 600,
                border: !activeCategory ? "0.5px solid #4F46E5" : "0.5px solid #E2E8F0",
                backgroundColor: !activeCategory ? "#EEF2FF" : "white",
                color: !activeCategory ? "#4F46E5" : "#64748B",
              }}>
                All ({QUESTIONS.length})
              </button>
              {CATEGORIES.map(cat => {
                const count = QUESTIONS.filter(q => q.category === cat && answers[q.id]?.trim()).length;
                const total = QUESTIONS.filter(q => q.category === cat).length;
                return (
                  <button key={cat} type="button" onClick={() => setActiveCategory(cat)} style={{
                    padding: "6px 12px", borderRadius: 20, cursor: "pointer",
                    fontSize: 11, fontWeight: 600,
                    border: activeCategory === cat ? "0.5px solid #4F46E5" : "0.5px solid #E2E8F0",
                    backgroundColor: activeCategory === cat ? "#EEF2FF" : "white",
                    color: activeCategory === cat ? "#4F46E5" : "#64748B",
                  }}>
                    {cat} ({count}/{total})
                  </button>
                );
              })}
            </div>

            {/* Question cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {visibleQs.map(q => {
                const answered = !!answers[q.id]?.trim();
                return (
                  <div key={q.id} style={{
                    backgroundColor: "white", borderRadius: 12,
                    border: `0.5px solid ${answered ? "#A7F3D0" : "#E2E8F0"}`,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    padding: "18px 20px",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                        backgroundColor: "#EEF2FF", color: "#4F46E5", flexShrink: 0, marginTop: 2,
                        letterSpacing: "0.04em", textTransform: "uppercase",
                      }}>
                        {q.category}
                      </span>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A", lineHeight: 1.4 }}>
                        {q.question}
                      </p>
                      {answered && <span style={{ color: "#059669", fontSize: 14, flexShrink: 0 }}>✓</span>}
                    </div>

                    <p style={{ margin: "0 0 10px", fontSize: 11, color: "#94A3B8", fontStyle: "italic" }}>
                      💡 {q.tip}
                    </p>

                    <textarea
                      value={answers[q.id] ?? ""}
                      onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Type your answer here…"
                      rows={3}
                      style={{
                        width: "100%", borderRadius: 8, border: "0.5px solid #E2E8F0",
                        padding: "10px 12px", fontSize: 13, color: "#334155",
                        resize: "vertical", outline: "none", boxSizing: "border-box",
                        backgroundColor: "#F8FAFC", lineHeight: 1.5,
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          // Flashcard mode
          <div>
            {/* Progress */}
            <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => { setActiveCategory(cat); setFlashIndex(0); setShowTip(false); }} style={{
                  padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 600,
                  border: activeCategory === cat ? "0.5px solid #4F46E5" : "0.5px solid #E2E8F0",
                  backgroundColor: activeCategory === cat ? "#EEF2FF" : "white",
                  color: activeCategory === cat ? "#4F46E5" : "#64748B",
                }}>
                  {cat}
                </button>
              ))}
              <button key="all" type="button" onClick={() => { setActiveCategory(null); setFlashIndex(0); setShowTip(false); }} style={{
                padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 600,
                border: !activeCategory ? "0.5px solid #4F46E5" : "0.5px solid #E2E8F0",
                backgroundColor: !activeCategory ? "#EEF2FF" : "white",
                color: !activeCategory ? "#4F46E5" : "#64748B",
              }}>
                All
              </button>
            </div>

            {/* Card */}
            <div style={{
              backgroundColor: "white", borderRadius: 16,
              border: "0.5px solid #E2E8F0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              padding: "48px 40px",
              minHeight: 360, display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                    backgroundColor: "#EEF2FF", color: "#4F46E5", letterSpacing: "0.04em", textTransform: "uppercase",
                  }}>
                    {currentQ.category}
                  </span>
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>
                    {(flashIndex % visibleQs.length) + 1} / {visibleQs.length}
                  </span>
                </div>

                <p style={{ margin: "0 0 28px", fontSize: 20, fontWeight: 700, color: "#0F172A", lineHeight: 1.4, letterSpacing: "-0.3px" }}>
                  {currentQ.question}
                </p>

                {showTip && (
                  <div style={{
                    backgroundColor: "#EEF2FF", borderRadius: 10, padding: "14px 16px",
                    marginBottom: 20, border: "0.5px solid #C7D2FE",
                  }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#4338CA", lineHeight: 1.5 }}>
                      💡 {currentQ.tip}
                    </p>
                  </div>
                )}

                <textarea
                  value={answers[currentQ.id] ?? ""}
                  onChange={e => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                  placeholder="Say your answer out loud, then type it here to record it…"
                  rows={4}
                  style={{
                    width: "100%", borderRadius: 8, border: "0.5px solid #E2E8F0",
                    padding: "12px 14px", fontSize: 13, color: "#334155",
                    resize: "none", outline: "none", boxSizing: "border-box",
                    backgroundColor: "#F8FAFC", lineHeight: 1.6, fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24 }}>
                <button type="button" onClick={() => setShowTip(v => !v)} style={{
                  padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                  border: "0.5px solid #C7D2FE", backgroundColor: showTip ? "#EEF2FF" : "white",
                  fontSize: 12, fontWeight: 600, color: "#4F46E5",
                }}>
                  {showTip ? "Hide tip" : "Show tip"}
                </button>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" onClick={() => { setFlashIndex(i => (i - 1 + visibleQs.length) % visibleQs.length); setShowTip(false); }} style={{
                    padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                    border: "0.5px solid #E2E8F0", backgroundColor: "white",
                    fontSize: 12, fontWeight: 600, color: "#475569",
                  }}>
                    ← Previous
                  </button>
                  <button type="button" onClick={() => { setFlashIndex(i => (i + 1) % visibleQs.length); setShowTip(false); }} style={{
                    padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                    border: "none", color: "white", fontSize: 12, fontWeight: 600,
                  }}>
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
