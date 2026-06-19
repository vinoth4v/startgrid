"use client";

import { useState, useTransition } from "react";
import { BroadcastMessage, BroadcastSegment, sendBroadcast, getSegmentPreview, TEMPLATES } from "@/app/actions/broadcast";

const SEGMENTS: { value: BroadcastSegment; label: string; desc: string }[] = [
  { value: "all", label: "Everyone", desc: "All registered users" },
  { value: "startups", label: "All Startups", desc: "Users with startup profiles" },
  { value: "investors", label: "All Investors", desc: "Users with investor profiles" },
  { value: "unconnected_startups", label: "Unconnected Startups", desc: "Startups with 0 accepted connections" },
  { value: "unpublished_startups", label: "Unpublished Startups", desc: "Startups not yet published" },
];

interface Props { history: BroadcastMessage[] }

export default function BroadcastClient({ history: initial }: Props) {
  const [tab, setTab] = useState<"compose" | "templates" | "history">("compose");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [segment, setSegment] = useState<BroadcastSegment>("all");
  const [preview, setPreview] = useState<{ count: number; emails: string[] } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ sent?: number; error?: string } | null>(null);
  const [history, setHistory] = useState(initial);

  async function handlePreview() {
    setPreviewLoading(true);
    const p = await getSegmentPreview(segment);
    setPreview(p);
    setPreviewLoading(false);
  }

  function handleSend() {
    if (!subject.trim() || !body.trim()) return;
    startTransition(async () => {
      const r = await sendBroadcast(subject, body, segment);
      setResult(r);
      if (!r.error) {
        setHistory(prev => [{
          id: Date.now().toString(),
          subject, body,
          segment: [segment], channels: ["email"],
          status: "sent",
          scheduled_for: null,
          sent_at: new Date().toISOString(),
          sent_count: r.sent ?? 0,
          created_at: new Date().toISOString(),
        }, ...prev]);
        setSubject("");
        setBody("");
        setPreview(null);
      }
    });
  }

  function loadTemplate(t: typeof TEMPLATES[0]) {
    setSubject(t.subject);
    setBody(t.body);
    setSegment(t.segment as BroadcastSegment);
    setTab("compose");
  }

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{
        backgroundColor: "white", borderBottom: "0.5px solid #E2E8F0",
        padding: "0 32px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>Platform Broadcast Hub</p>
          <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>Reach users by segment with targeted messages</p>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {(["compose", "templates", "history"] as const).map(t => (
            <button key={t} type="button" onClick={() => setTab(t)} style={{
              padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer",
              backgroundColor: tab === t ? "#4F46E5" : "transparent",
              color: tab === t ? "white" : "#64748B",
              fontSize: 12, fontWeight: 600, textTransform: "capitalize",
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 800 }}>
        {/* Compose tab */}
        {tab === "compose" && (
          <div>
            {result && (
              <div style={{
                padding: "12px 16px", borderRadius: 8, marginBottom: 20,
                backgroundColor: result.error ? "#FEE2E2" : "#DCFCE7",
                border: `0.5px solid ${result.error ? "#FCA5A5" : "#86EFAC"}`,
              }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: result.error ? "#991B1B" : "#166534" }}>
                  {result.error ? `Error: ${result.error}` : `✓ Broadcast sent to ${result.sent} recipients`}
                </p>
              </div>
            )}

            {/* Segment */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Audience Segment</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {SEGMENTS.map(s => (
                  <button key={s.value} type="button" onClick={() => { setSegment(s.value); setPreview(null); }} style={{
                    padding: "10px 12px", borderRadius: 8, textAlign: "left",
                    border: `1.5px solid ${segment === s.value ? "#4F46E5" : "#E2E8F0"}`,
                    backgroundColor: segment === s.value ? "#EEF2FF" : "white",
                    cursor: "pointer",
                  }}>
                    <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: segment === s.value ? "#4F46E5" : "#374151" }}>{s.label}</p>
                    <p style={{ margin: 0, fontSize: 10, color: "#94A3B8" }}>{s.desc}</p>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
                <button type="button" onClick={handlePreview} disabled={previewLoading} style={{
                  padding: "6px 14px", borderRadius: 6, border: "0.5px solid #E2E8F0",
                  backgroundColor: "white", color: "#374151", fontSize: 11, fontWeight: 600, cursor: "pointer",
                }}>
                  {previewLoading ? "Loading…" : "Preview audience"}
                </button>
                {preview && (
                  <span style={{ fontSize: 11, color: "#64748B" }}>
                    <strong>{preview.count}</strong> recipients · e.g. {preview.emails.filter(Boolean).slice(0, 3).join(", ")}
                    {preview.count > 3 ? ` +${preview.count - 3} more` : ""}
                  </span>
                )}
              </div>
            </div>

            {/* Subject */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject Line</label>
              <input
                type="text" value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Important update from StartGrid"
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 7, border: "0.5px solid #E2E8F0",
                  fontSize: 13, outline: "none", boxSizing: "border-box",
                }}
              />
            </div>

            {/* Body */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Message Body
                <span style={{ marginLeft: 8, fontWeight: 400, color: "#94A3B8", textTransform: "none" }}>
                  Use {"{{name}}"}, {"{{link}}"} for personalisation
                </span>
              </label>
              <textarea
                value={body} onChange={e => setBody(e.target.value)}
                rows={12}
                placeholder="Hi {{name}},&#10;&#10;Your message here..."
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 7, border: "0.5px solid #E2E8F0",
                  fontSize: 13, outline: "none", lineHeight: 1.7, boxSizing: "border-box",
                  fontFamily: "inherit", resize: "vertical",
                }}
              />
            </div>

            {/* Send */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                type="button" onClick={handleSend}
                disabled={isPending || !subject.trim() || !body.trim()}
                style={{
                  padding: "10px 24px", borderRadius: 8, border: "none",
                  backgroundColor: isPending || !subject.trim() || !body.trim() ? "#E2E8F0" : "#4F46E5",
                  color: isPending || !subject.trim() || !body.trim() ? "#94A3B8" : "white",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                {isPending ? "Sending…" : `✉ Send to ${preview ? preview.count : "?"} recipients`}
              </button>
              <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>Emails sent via Resend from noreply@startgrid.co</p>
            </div>
          </div>
        )}

        {/* Templates tab */}
        {tab === "templates" && (
          <div>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748B" }}>Click a template to load it into the composer.</p>
            <div style={{ display: "grid", gap: 12 }}>
              {TEMPLATES.map(t => (
                <div key={t.id} style={{
                  backgroundColor: "white", border: "0.5px solid #E2E8F0", borderRadius: 10,
                  padding: "16px 20px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{t.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>Segment: {t.segment} · Subject: {t.subject}</p>
                    </div>
                    <button type="button" onClick={() => loadTemplate(t)} style={{
                      padding: "6px 14px", borderRadius: 7, border: "0.5px solid #4F46E5",
                      backgroundColor: "white", color: "#4F46E5", fontSize: 11, fontWeight: 600,
                      cursor: "pointer", flexShrink: 0,
                    }}>Use template</button>
                  </div>
                  <pre style={{ margin: 0, fontSize: 11, color: "#64748B", whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 80, overflow: "hidden" }}>
                    {t.body}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History tab */}
        {tab === "history" && (
          <div>
            {history.length === 0 ? (
              <p style={{ color: "#94A3B8", fontSize: 13 }}>No broadcasts sent yet</p>
            ) : history.map(msg => (
              <div key={msg.id} style={{
                backgroundColor: "white", border: "0.5px solid #E2E8F0", borderRadius: 10,
                padding: "16px 20px", marginBottom: 10,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{msg.subject}</p>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 3,
                    backgroundColor: "#DCFCE7", color: "#166534",
                    textTransform: "uppercase", letterSpacing: "0.04em",
                  }}>{msg.status}</span>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <span style={{ fontSize: 11, color: "#64748B" }}>Segment: {msg.segment?.join(", ")}</span>
                  <span style={{ fontSize: 11, color: "#64748B" }}>Sent to: <strong>{msg.sent_count}</strong></span>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>
                    {msg.sent_at ? new Date(msg.sent_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
