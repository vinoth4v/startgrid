"use client";

import { useState } from "react";
import { addToPipeline } from "@/app/actions/pipeline";

export default function AddToPipelineButton({ startupId }: { startupId: string }) {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    await addToPipeline(startupId, "reviewing");
    setLoading(false);
    setDone(true);
  }

  return (
    <button type="button" onClick={handle} disabled={done || loading} style={{
      padding: "9px 18px", borderRadius: 9,
      border: "0.5px solid #E2E8F0", backgroundColor: done ? "#ECFDF5" : "white",
      fontSize: 13, fontWeight: 600, color: done ? "#059669" : "#475569",
      cursor: done ? "default" : "pointer", display: "flex", alignItems: "center", gap: 7,
      transition: "all 0.2s",
    }}>
      {done ? "✓ Added to Pipeline" : loading ? "Adding…" : "📋 Add to Pipeline"}
    </button>
  );
}
