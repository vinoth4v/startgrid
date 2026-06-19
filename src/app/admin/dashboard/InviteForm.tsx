"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InviteForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"startup" | "investor" | "admin">("startup");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    if (res.ok) {
      setStatus("success");
      setEmail("");
      setRole("startup");
    } else {
      const data = await res.json();
      setErrorMsg(data.error ?? "Failed to send invitation.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
        <div className="space-y-1.5">
          <Label htmlFor="invite-email">Email address</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="founder@acme.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="invite-role">Role</Label>
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="startup">Startup</option>
            <option value="investor">Investor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex items-end">
          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Sending…" : "Send invite"}
          </Button>
        </div>
      </div>

      {status === "success" && (
        <p className="text-sm text-green-600">Invitation sent successfully.</p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">{errorMsg}</p>
      )}
    </form>
  );
}
