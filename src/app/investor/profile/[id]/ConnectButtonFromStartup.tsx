"use client";

import { useState, useTransition } from "react";
import { sendConnectionRequest } from "@/app/actions/investor";

interface Props {
  investorId: string;
  connectionStatus: string | null;
}

export default function ConnectButtonFromStartup({ investorId, connectionStatus }: Props) {
  const [status, setStatus] = useState(connectionStatus);
  const [isPending, startTransition] = useTransition();

  function handleConnect() {
    startTransition(async () => {
      const result = await sendConnectionRequest(investorId);
      if (!result.error) setStatus("pending");
    });
  }

  if (status === "accepted") {
    return (
      <span style={{
        padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700,
        backgroundColor: "#DCFCE7", color: "#166534",
      }}>✓ Connected</span>
    );
  }

  if (status === "pending") {
    return (
      <span style={{
        padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
        backgroundColor: "#FEF3C7", color: "#92400E",
      }}>Request sent</span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={isPending}
      style={{
        padding: "9px 20px", borderRadius: 8, border: "none",
        backgroundColor: isPending ? "#94A3B8" : "#4F46E5",
        color: "white", fontSize: 13, fontWeight: 700,
        cursor: isPending ? "not-allowed" : "pointer",
        flexShrink: 0,
      }}
    >
      {isPending ? "Sending…" : "Connect"}
    </button>
  );
}
