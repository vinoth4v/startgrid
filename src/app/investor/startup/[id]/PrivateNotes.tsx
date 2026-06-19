"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { saveNote } from "@/app/actions/investor-notes";

interface Props {
  investorId: string;
  startupId: string;
  initialContent: string;
}

type SaveState = "idle" | "saving" | "saved";

export default function PrivateNotes({ investorId, startupId, initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  useEffect(() => { autoResize(); }, []);

  const persistNote = useCallback(async (value: string) => {
    setSaveState("saving");
    await saveNote(investorId, startupId, value);
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2000);
  }, [investorId, startupId]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setContent(val);
    setSaveState("idle");
    autoResize();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => persistNote(val), 1000);
  }

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  return (
    <section style={{
      backgroundColor: "white", borderRadius: 12,
      border: "0.5px solid #E2E8F0",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      marginBottom: 20,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px",
        borderBottom: "0.5px solid #F1F5F9",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15 }}>✏️</span>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Your private notes</p>
            <p style={{ margin: 0, fontSize: 11, color: "#94A3B8", marginTop: 1 }}>
              Only you can see these — not visible to the startup or StartGrid.
            </p>
          </div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 500, minWidth: 56, textAlign: "right" }}>
          {saveState === "saving" && <span style={{ color: "#94A3B8" }}>Saving…</span>}
          {saveState === "saved" && <span style={{ color: "#059669" }}>Saved ✓</span>}
        </div>
      </div>

      {/* Textarea */}
      <div style={{ padding: "12px 20px 16px" }}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          placeholder="Add your thoughts about this startup — their strengths, concerns, follow-up questions…"
          style={{
            width: "100%", minHeight: 90,
            border: "none", outline: "none",
            resize: "none", overflow: "hidden",
            fontSize: 13, color: "#334155", lineHeight: 1.65,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            backgroundColor: "transparent",
            padding: 0, margin: 0, display: "block",
          }}
        />
      </div>
    </section>
  );
}
