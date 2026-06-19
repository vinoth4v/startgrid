"use client";

import { useEffect, useCallback, useState } from "react";

interface Slide {
  slideNumber: number;
  title: string;
  content: string[];
  speakerNote: string;
}

interface Props {
  slides: Slide[];
  initialIndex: number;
  onClose: () => void;
}

export default function SlideshowModal({ slides, initialIndex, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const goTo = useCallback((i: number) => {
    setVisible(false);
    setTimeout(() => { setIndex(i); setVisible(true); }, 160);
  }, []);

  const prev = useCallback(() => { if (index > 0) goTo(index - 1); }, [index, goTo]);
  const next = useCallback(() => { if (index < slides.length - 1) goTo(index + 1); }, [index, slides.length, goTo]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  const slide = slides[index];
  const total = slides.length;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        style={{
          position: "absolute", top: 20, right: 20,
          width: 40, height: 40, borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
          color: "white", fontSize: 18, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.15s",
        }}
        aria-label="Close"
      >
        ✕
      </button>

      {/* Prev arrow */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); prev(); }}
        disabled={index === 0}
        style={{
          position: "absolute", left: 24,
          width: 48, height: 48, borderRadius: "50%",
          backgroundColor: index === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.14)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: index === 0 ? "rgba(255,255,255,0.3)" : "white",
          fontSize: 20, cursor: index === 0 ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.15s",
        }}
        aria-label="Previous slide"
      >
        ‹
      </button>

      {/* Next arrow */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); next(); }}
        disabled={index === total - 1}
        style={{
          position: "absolute", right: 24,
          width: 48, height: 48, borderRadius: "50%",
          backgroundColor: index === total - 1 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.14)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: index === total - 1 ? "rgba(255,255,255,0.3)" : "white",
          fontSize: 20, cursor: index === total - 1 ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.15s",
        }}
        aria-label="Next slide"
      >
        ›
      </button>

      {/* Slide card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: "white", borderRadius: 16,
          width: "100%", maxWidth: "80vw", maxHeight: "70vh",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          position: "relative", overflow: "hidden",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.2s ease",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Left indigo accent bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0,
          width: 3, background: "linear-gradient(180deg, #4F46E5, #7C3AED)",
        }} />

        <div style={{ padding: "36px 44px 36px 52px", flex: 1, overflowY: "auto" }}>
          <p style={{
            margin: "0 0 20px", fontSize: 11, fontWeight: 700,
            color: "#4F46E5", letterSpacing: "0.12em", textTransform: "uppercase",
          }}>
            SLIDE {String(slide.slideNumber).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>

          <h2 style={{
            fontSize: 24, fontWeight: 700, color: "#0B1628",
            letterSpacing: "-0.5px", lineHeight: 1.2, margin: "0 0 24px",
          }}>
            {slide.title}
          </h2>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 12 }}>
            {slide.content.map((bullet, i) => (
              <li key={i} style={{ display: "flex", gap: 12, fontSize: 15, color: "#334155", lineHeight: 1.8 }}>
                <span style={{ color: "#4F46E5", fontWeight: 700, flexShrink: 0, fontSize: 18, lineHeight: 1.5 }}>›</span>
                {bullet}
              </li>
            ))}
          </ul>

          <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 16 }}>
            <p style={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic", margin: 0, lineHeight: 1.65 }}>
              {slide.speakerNote}
            </p>
          </div>
        </div>
      </div>

      {/* Slide counter */}
      <div style={{
        position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={e => { e.stopPropagation(); goTo(i); }}
            style={{
              width: i === index ? 24 : 8, height: 8, borderRadius: 4,
              backgroundColor: i === index ? "#4F46E5" : "rgba(255,255,255,0.35)",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.2s ease",
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
        <span style={{ marginLeft: 8, fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
          {index + 1} of {total}
        </span>
      </div>
    </div>
  );
}
