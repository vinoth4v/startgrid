"use client";

import { useState, useTransition } from "react";
import { regenerateShareToken } from "@/app/actions/share-token";

interface Props {
  initialToken: string | null;
  baseUrl: string;
}

export default function ShareCard({ initialToken, baseUrl }: Props) {
  const [token, setToken] = useState(initialToken);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const shareUrl = token ? `${baseUrl}/p/${token}` : null;

  function handleCopy() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleRegenerate() {
    setError(null);
    startTransition(async () => {
      const result = await regenerateShareToken();
      if (result.error) setError(result.error);
      else if (result.token) setToken(result.token);
    });
  }

  if (!token) return null;

  return (
    <div style={{
      backgroundColor: "white", borderRadius: 12,
      border: "0.5px solid #E2E8F0",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      padding: "20px",
      marginTop: 16,
    }}>
      <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Share your pitch
      </p>
      <p style={{ margin: "0 0 14px", fontSize: 12, color: "#64748B" }}>
        Share this link with anyone — no StartGrid account needed to view your pitch.
      </p>

      {/* URL + copy */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        backgroundColor: "#F8FAFC", border: "0.5px solid #E2E8F0",
        borderRadius: 8, padding: "8px 12px",
        marginBottom: 10,
      }}>
        <span style={{
          flex: 1, fontSize: 12, color: "#475569",
          fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {shareUrl}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            flexShrink: 0, padding: "5px 12px", borderRadius: 6,
            border: "0.5px solid #C7D2FE",
            backgroundColor: copied ? "#ECFDF5" : "#EEF2FF",
            fontSize: 11, fontWeight: 600,
            color: copied ? "#059669" : "#4F46E5",
            cursor: "pointer", transition: "all 0.15s",
          }}
        >
          {copied ? "Copied! ✓" : "Copy link"}
        </button>
      </div>

      {/* Regenerate */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isPending}
          style={{
            background: "none", border: "none", padding: 0,
            fontSize: 11, color: "#94A3B8", cursor: isPending ? "not-allowed" : "pointer",
            textDecoration: "underline",
          }}
        >
          {isPending ? "Regenerating…" : "↺ Regenerate link (invalidates old URL)"}
        </button>
        {error && <span style={{ fontSize: 11, color: "#EF4444" }}>{error}</span>}
      </div>
    </div>
  );
}
