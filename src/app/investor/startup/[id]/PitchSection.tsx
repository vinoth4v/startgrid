"use client";

import { useState } from "react";
import SlideshowModal from "@/components/SlideshowModal";

interface Slide {
  slideNumber: number;
  title: string;
  content: string[];
  speakerNote: string;
}

export default function PitchSection({ slides }: { slides: Slide[] }) {
  const [slideshowIndex, setSlideshowIndex] = useState<number | null>(null);

  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>Pitch deck</h2>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            backgroundColor: "#ECFDF5", border: "0.5px solid #A7F3D0",
            borderRadius: 20, padding: "3px 10px",
          }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#059669" }}>Verified by StartGrid</span>
          </div>
        </div>
        <button type="button" onClick={() => setSlideshowIndex(0)} style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "7px 14px", borderRadius: 9,
          border: "0.5px solid #C7D2FE", backgroundColor: "#EEF2FF",
          fontSize: 12, fontWeight: 600, color: "#4F46E5", cursor: "pointer",
          transition: "all 0.15s",
        }}>
          ⛶ View slideshow →
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {slides.map((slide, i) => (
          <div
            key={slide.slideNumber}
            className="group"
            style={{
              backgroundColor: "white", borderRadius: 12,
              border: "0.5px solid #E2E8F0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              overflow: "hidden", position: "relative",
              transition: "border-color 0.15s, box-shadow 0.15s",
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
            <div style={{
              position: "absolute", bottom: 0, left: 0,
              width: 3, height: "35%",
              background: "linear-gradient(180deg, #4F46E5, #7C3AED)",
            }} />
            <div style={{ padding: "16px 16px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#4F46E5", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {String(slide.slideNumber).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => setSlideshowIndex(i)}
                  className="group-hover:opacity-100"
                  style={{
                    opacity: 0, fontSize: 13, color: "#94A3B8",
                    background: "none", border: "none", cursor: "pointer",
                    padding: "2px 6px", borderRadius: 5,
                    transition: "opacity 0.15s",
                  }}
                  title="Fullscreen"
                >
                  ⛶
                </button>
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", margin: "0 0 10px", lineHeight: 1.3, letterSpacing: "-0.2px" }}>
                {slide.title}
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 10px", display: "flex", flexDirection: "column", gap: 5 }}>
                {slide.content.map((bullet, j) => (
                  <li key={j} style={{ display: "flex", gap: 7, fontSize: 11, color: "#475569", lineHeight: 1.55 }}>
                    <span style={{ color: "#4F46E5", fontWeight: 700, flexShrink: 0 }}>›</span>
                    {bullet}
                  </li>
                ))}
              </ul>
              <div style={{ borderTop: "0.5px solid #F1F5F9", paddingTop: 8 }}>
                <p style={{ fontSize: 10, color: "#94A3B8", fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>{slide.speakerNote}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slideshowIndex !== null && (
        <SlideshowModal
          slides={slides}
          initialIndex={slideshowIndex}
          onClose={() => setSlideshowIndex(null)}
        />
      )}
    </section>
  );
}
