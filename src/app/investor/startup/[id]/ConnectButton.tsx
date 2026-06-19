"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { sendConnectionRequest } from "@/app/actions/investor";

interface Props {
  startupId: string;
  initialStatus: string | null;
}

export default function ConnectButton({ startupId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConnect() {
    setError(null);
    startTransition(async () => {
      const result = await sendConnectionRequest(startupId);
      if (result.error) setError(result.error);
      else setStatus("pending");
    });
  }

  if (status === "accepted") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          backgroundColor: "#ECFDF5", border: "0.5px solid #A7F3D0",
          borderRadius: 10, padding: "12px 16px",
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#059669" }} />
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#065F46" }}>Connected</p>
            <p style={{ margin: 0, fontSize: 11, color: "#059669" }}>Your connection was accepted — you can now message this startup</p>
          </div>
        </div>
        <Link href="/messages" style={{
          display: "inline-flex", alignItems: "center",
          background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
          color: "white", fontSize: 13, fontWeight: 600, padding: "10px 20px",
          borderRadius: 9, textDecoration: "none",
          boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
        }}>
          Go to messages →
        </Link>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        backgroundColor: "#FFFBEB", border: "0.5px solid #FDE68A",
        borderRadius: 10, padding: "12px 16px",
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#D97706" }} />
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#92400E" }}>Request sent</p>
          <p style={{ margin: 0, fontSize: 11, color: "#B45309" }}>Waiting for the startup to accept your request</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
      <button type="button" onClick={handleConnect} disabled={isPending}
        style={{
          padding: "11px 28px", borderRadius: 9,
          background: isPending ? "#A5B4FC" : "linear-gradient(135deg, #4F46E5, #7C3AED)",
          border: "none", color: "white", fontSize: 14, fontWeight: 600,
          cursor: isPending ? "not-allowed" : "pointer",
          boxShadow: isPending ? "none" : "0 4px 16px rgba(79,70,229,0.35)",
          transition: "all 0.15s",
        }}>
        {isPending ? "Sending…" : "Request to connect"}
      </button>
      {error && <p style={{ margin: 0, fontSize: 13, color: "#DC2626" }}>{error}</p>}
      <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>
        The startup will be notified and can accept or decline.
      </p>
    </div>
  );
}
