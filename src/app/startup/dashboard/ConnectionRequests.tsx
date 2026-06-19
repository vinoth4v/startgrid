"use client";

import { useState, useTransition } from "react";
import { acceptConnection, declineConnection } from "@/app/actions/connections";

interface Request {
  connectionId: string;
  investorName: string;
  firm: string;
}

export default function ConnectionRequests({ requests }: { requests: Request[] }) {
  const [list, setList] = useState(requests);
  const [busy, setBusy] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDecline(connectionId: string) {
    setBusy(connectionId);
    startTransition(async () => {
      await declineConnection(connectionId);
      setList(prev => prev.filter(r => r.connectionId !== connectionId));
      setBusy(null);
    });
  }

  function handleAccept(connectionId: string) {
    setBusy(connectionId);
    startTransition(async () => {
      await acceptConnection(connectionId);
    });
  }

  if (list.length === 0) return null;

  return (
    <div style={{
      backgroundColor: "#EEF2FF", border: "0.5px solid #C7D2FE",
      borderRadius: 12, padding: "20px 24px", marginBottom: 24,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", margin: 0, letterSpacing: "-0.2px" }}>
          Connection requests
        </h2>
        <div style={{
          width: 20, height: 20, borderRadius: "50%",
          background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 10, fontWeight: 700,
        }}>
          {list.length}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map(req => (
          <div key={req.connectionId} style={{
            backgroundColor: "white", borderRadius: 10,
            border: "0.5px solid #C7D2FE",
            padding: "14px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
            boxShadow: "0 1px 3px rgba(79,70,229,0.06)",
          }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 700, fontSize: 11,
                }}>
                  {req.investorName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.1px" }}>
                    {req.investorName}{req.firm ? ` · ${req.firm}` : ""}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#6366F1" }}>wants to connect with you</p>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button type="button"
                disabled={busy === req.connectionId || isPending}
                onClick={() => handleDecline(req.connectionId)}
                style={{
                  padding: "7px 14px", borderRadius: 8,
                  border: "0.5px solid #E2E8F0", backgroundColor: "white",
                  fontSize: 12, fontWeight: 600, color: "#64748B",
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                {busy === req.connectionId ? "…" : "Decline"}
              </button>
              <button type="button"
                disabled={busy === req.connectionId || isPending}
                onClick={() => handleAccept(req.connectionId)}
                style={{
                  padding: "7px 16px", borderRadius: 8,
                  background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  border: "none", color: "white",
                  fontSize: 12, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s",
                  boxShadow: "0 2px 6px rgba(79,70,229,0.3)",
                }}>
                {busy === req.connectionId ? "…" : "Accept"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
