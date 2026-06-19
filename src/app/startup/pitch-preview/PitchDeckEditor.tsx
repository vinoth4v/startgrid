"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { publishProfile, type PitchSlide } from "@/app/actions/generate-pitch";
import SlideshowModal from "@/components/SlideshowModal";

interface Props {
  slides: PitchSlide[];
  companyName: string;
  isPublished: boolean;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  city?: string | null;
  foundedYear?: string | null;
  employeeCount?: string | null;
  linkedinUrl?: string | null;
}

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%", padding: "9px 12px",
  border: "0.5px solid #E2E8F0", borderRadius: 8,
  fontSize: 13, color: "#0F172A", backgroundColor: "white",
  outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
  boxSizing: "border-box", fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, color: "#94A3B8",
  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5,
};

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function PitchDeckEditor({ slides: initial, companyName, isPublished, logoUrl, coverImageUrl, city, foundedYear, employeeCount, linkedinUrl }: Props) {
  const [slides, setSlides] = useState<PitchSlide[]>(initial);
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [slideshowIndex, setSlideshowIndex] = useState<number | null>(null);

  function startEdit(slide: PitchSlide) {
    setEditingSlide(slide.slideNumber);
    setDraftTitle(slide.title);
    setDraftContent(slide.content.join("\n"));
    setDraftNote(slide.speakerNote);
  }

  function saveEdit() {
    if (editingSlide === null) return;
    setSlides(prev => prev.map(s => s.slideNumber === editingSlide
      ? { ...s, title: draftTitle.trim(), content: draftContent.split("\n").map(l => l.trim()).filter(Boolean), speakerNote: draftNote.trim() }
      : s
    ));
    setEditingSlide(null);
  }

  function handlePublish() {
    setError(null);
    startTransition(async () => {
      const result = await publishProfile(slides);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <main style={{
      minHeight: "100vh", backgroundColor: "#F8FAFC",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      paddingBottom: 88,
    }}>

      {/* Header bar */}
      <div style={{
        backgroundColor: "white", borderBottom: "0.5px solid #E2E8F0",
        padding: "0 24px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 20,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/startup/dashboard" style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 700, fontSize: 10, textDecoration: "none",
          }}>SG</Link>
          <div style={{ width: 1, height: 20, backgroundColor: "#E2E8F0" }} />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
              {companyName} — AI Pitch Deck
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>Review and edit your slides</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isPublished && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              backgroundColor: "#ECFDF5", border: "0.5px solid #A7F3D0",
              borderRadius: 20, padding: "4px 10px",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#059669" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#059669" }}>Verified by StartGrid</span>
            </div>
          )}
          <button type="button" onClick={handlePublish}
            disabled={isPending || editingSlide !== null}
            style={{
              padding: "8px 20px", borderRadius: 9,
              background: (isPending || editingSlide !== null) ? "#A5B4FC" : "linear-gradient(135deg, #4F46E5, #7C3AED)",
              border: "none", color: "white", fontSize: 13, fontWeight: 600,
              cursor: (isPending || editingSlide !== null) ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px rgba(79,70,229,0.25)",
            }}>
            {isPending ? "Publishing…" : isPublished ? "Save changes" : "Publish my profile →"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "32px 24px" }}>

        {/* Profile preview card */}
        <div style={{
          borderRadius: 14, overflow: "hidden",
          border: "0.5px solid #E2E8F0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          marginBottom: 28,
        }}>
          {/* Cover */}
          <div style={{
            height: coverImageUrl ? 120 : 56,
            backgroundColor: "#0B1628",
            backgroundImage: coverImageUrl
              ? `url(${coverImageUrl})`
              : "radial-gradient(circle, rgba(79,70,229,0.2) 1px, transparent 1px)",
            backgroundSize: coverImageUrl ? "cover" : "24px 24px",
            backgroundPosition: "center",
            position: "relative",
          }} />
          {/* Company info bar */}
          <div style={{ backgroundColor: "white", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12, flexShrink: 0,
              border: "2px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              overflow: "hidden", marginTop: -28, position: "relative",
              backgroundColor: "#EEF2FF",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {logoUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={logoUrl} alt={companyName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontWeight: 700, fontSize: 16, color: "#4F46E5" }}>{initials(companyName)}</span>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.2px" }}>{companyName}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 5 }}>
                {city && <span style={{ fontSize: 10, fontWeight: 500, color: "#475569", backgroundColor: "#F8FAFC", border: "0.5px solid #E2E8F0", borderRadius: 20, padding: "2px 8px" }}>📍 {city}</span>}
                {foundedYear && <span style={{ fontSize: 10, fontWeight: 500, color: "#475569", backgroundColor: "#F8FAFC", border: "0.5px solid #E2E8F0", borderRadius: 20, padding: "2px 8px" }}>Est. {foundedYear}</span>}
                {employeeCount && <span style={{ fontSize: 10, fontWeight: 500, color: "#475569", backgroundColor: "#F8FAFC", border: "0.5px solid #E2E8F0", borderRadius: 20, padding: "2px 8px" }}>{employeeCount} people</span>}
                {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, fontWeight: 500, color: "#4F46E5", backgroundColor: "#EEF2FF", border: "0.5px solid #C7D2FE", borderRadius: 20, padding: "2px 8px", textDecoration: "none" }}>LinkedIn ↗</a>}
              </div>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div style={{
          backgroundColor: "#EEF2FF", border: "0.5px solid #C7D2FE",
          borderRadius: 10, padding: "14px 20px", marginBottom: 28,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <p style={{ margin: 0, fontSize: 13, color: "#4338CA", lineHeight: 1.55 }}>
            <strong>Review your AI-generated pitch deck.</strong>{" "}
            Hover over any slide and click "Edit" to make changes. When you're happy, hit Publish to become visible to investors.
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: "#FEF2F2", border: "0.5px solid #FECACA",
            borderRadius: 8, padding: "12px 16px", marginBottom: 24,
          }}>
            <p style={{ fontSize: 13, color: "#DC2626", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Slideshow button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button type="button" onClick={() => setSlideshowIndex(0)} style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "8px 16px", borderRadius: 9,
            border: "0.5px solid #C7D2FE", backgroundColor: "#EEF2FF",
            fontSize: 13, fontWeight: 600, color: "#4F46E5", cursor: "pointer",
            transition: "all 0.15s",
          }}>
            ⛶ View slideshow →
          </button>
        </div>

        {/* Slide grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {slides.map(slide => editingSlide === slide.slideNumber ? (
            /* EDIT MODE */
            <div key={slide.slideNumber} style={{
              backgroundColor: "white", borderRadius: 12,
              border: "1.5px solid #4F46E5",
              boxShadow: "0 0 0 3px rgba(79,70,229,0.08)",
              padding: "20px",
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#4F46E5", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>
                Editing slide {String(slide.slideNumber).padStart(2, "0")}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <p style={labelStyle}>Title</p>
                  <input value={draftTitle} onChange={e => setDraftTitle(e.target.value)} style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = "#4F46E5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                    onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }} />
                </div>
                <div>
                  <p style={labelStyle}>Bullet points (one per line)</p>
                  <textarea rows={5} value={draftContent} onChange={e => setDraftContent(e.target.value)}
                    style={{ ...inputStyle, resize: "vertical" as const, lineHeight: 1.6 }}
                    onFocus={e => { e.target.style.borderColor = "#4F46E5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                    onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }} />
                </div>
                <div>
                  <p style={labelStyle}>Speaker note</p>
                  <input value={draftNote} onChange={e => setDraftNote(e.target.value)} style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = "#4F46E5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                    onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }} />
                </div>
                <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
                  <button type="button" onClick={saveEdit}
                    style={{
                      padding: "8px 16px", borderRadius: 8,
                      background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                      border: "none", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}>Save</button>
                  <button type="button" onClick={() => setEditingSlide(null)}
                    style={{
                      padding: "8px 14px", borderRadius: 8,
                      border: "0.5px solid #E2E8F0", backgroundColor: "white",
                      fontSize: 12, fontWeight: 500, color: "#64748B", cursor: "pointer",
                    }}>Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            /* VIEW MODE */
            <div key={slide.slideNumber}
              className="group"
              style={{
                backgroundColor: "white", borderRadius: 12,
                border: "0.5px solid #E2E8F0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                overflow: "hidden", position: "relative",
                transition: "border-color 0.15s, box-shadow 0.15s",
                cursor: "default",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#C7D2FE";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(79,70,229,0.08)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#E2E8F0";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
              }}
            >
              {/* Indigo left-bottom accent bar */}
              <div style={{
                position: "absolute", bottom: 0, left: 0,
                width: 3, height: "40%",
                background: "linear-gradient(180deg, #4F46E5, #7C3AED)",
                borderRadius: "0 0 0 12px",
              }} />

              <div style={{ padding: "18px 18px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#4F46E5", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {String(slide.slideNumber).padStart(2, "0")}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }} className="group-hover:opacity-100" >
                    <button type="button" onClick={() => setSlideshowIndex(slide.slideNumber - 1)}
                      className="group-hover:opacity-100"
                      style={{
                        opacity: 0, display: "flex", alignItems: "center",
                        fontSize: 13, color: "#94A3B8",
                        backgroundColor: "transparent", border: "none",
                        padding: "4px 6px", borderRadius: 6, cursor: "pointer",
                        transition: "opacity 0.15s",
                      }}
                      title="Expand"
                    >
                      ⛶
                    </button>
                    <button type="button" onClick={() => startEdit(slide)}
                      className="group-hover:opacity-100"
                      style={{
                        opacity: 0, display: "flex", alignItems: "center", gap: 4,
                        fontSize: 11, fontWeight: 500, color: "#4F46E5",
                        backgroundColor: "#EEF2FF", border: "none",
                        padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                        transition: "opacity 0.15s",
                      }}>
                      ✎ Edit
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", margin: "0 0 12px", lineHeight: 1.3, letterSpacing: "-0.2px" }}>
                  {slide.title}
                </h3>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {slide.content.map((bullet, i) => (
                    <li key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#475569", lineHeight: 1.55 }}>
                      <span style={{ color: "#4F46E5", fontWeight: 700, flexShrink: 0 }}>›</span>
                      {bullet}
                    </li>
                  ))}
                </ul>

                <div style={{ borderTop: "0.5px solid #F1F5F9", paddingTop: 10 }}>
                  <p style={{ fontSize: 11, color: "#94A3B8", fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
                    {slide.speakerNote}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slideshow modal */}
      {slideshowIndex !== null && (
        <SlideshowModal
          slides={slides}
          initialIndex={slideshowIndex}
          onClose={() => setSlideshowIndex(null)}
        />
      )}

      {/* Bottom sticky bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        backgroundColor: "white", borderTop: "0.5px solid #E2E8F0",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
        padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        zIndex: 20,
      }}>
        <Link href="/startup/dashboard"
          style={{
            padding: "9px 18px", borderRadius: 9,
            border: "0.5px solid #E2E8F0", backgroundColor: "white",
            fontSize: 13, fontWeight: 600, color: "#475569",
            textDecoration: "none", transition: "all 0.15s",
          }}>
          ← Back to dashboard
        </Link>
        <button type="button" onClick={handlePublish}
          disabled={isPending || editingSlide !== null}
          style={{
            padding: "11px 28px", borderRadius: 9,
            background: (isPending || editingSlide !== null) ? "#A5B4FC" : "linear-gradient(135deg, #4F46E5, #7C3AED)",
            border: "none", color: "white", fontSize: 14, fontWeight: 600,
            cursor: (isPending || editingSlide !== null) ? "not-allowed" : "pointer",
            boxShadow: "0 4px 16px rgba(79,70,229,0.35)",
          }}>
          {isPending ? "Publishing…" : isPublished ? "Save changes" : "Publish my profile →"}
        </button>
      </div>
    </main>
  );
}
