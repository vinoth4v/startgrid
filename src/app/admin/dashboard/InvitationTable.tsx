"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Invitation {
  id: string;
  email: string;
  role: string | null;
  used_at: string | null;
  created_at: string;
}

function roleColor(role: string | null) {
  if (role === "startup") return "secondary";
  if (role === "investor") return "default";
  if (role === "admin") return "outline";
  return "secondary";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function InvitationTable({ initial }: { initial: Invitation[] }) {
  const [invitations, setInvitations] = useState(initial);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setConfirming(null);
    setDeleting(id);
    const res = await fetch(`/api/invite/${id}`, { method: "DELETE" });
    if (res.ok) {
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    }
    setDeleting(null);
  }

  if (invitations.length === 0) {
    return <p className="text-sm text-muted-foreground">No invitations yet.</p>;
  }

  return (
    <>
      {/* Confirmation overlay for accepted invitations */}
      {confirming && (() => {
        const inv = invitations.find((i) => i.id === confirming);
        if (!inv) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl border shadow-xl p-6 max-w-sm mx-4 space-y-4">
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">Permanently delete this account?</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-slate-700">{inv.email}</span> has already accepted
                  their invitation. Deleting this will permanently remove their account, profile,
                  connections, and all messages. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirming(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleDelete(confirming)}
                >
                  Yes, delete permanently
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Invited</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((inv, i) => (
              <tr key={inv.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                <td className="px-4 py-3 font-medium">{inv.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={roleColor(inv.role) as "default" | "secondary" | "outline"}>
                    {inv.role ?? "—"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {inv.used_at ? (
                    <span className="inline-flex items-center gap-1.5 text-green-600">
                      <span className="size-1.5 rounded-full bg-green-500" />
                      Accepted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-amber-400" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={deleting === inv.id}
                    onClick={() => inv.used_at ? setConfirming(inv.id) : handleDelete(inv.id)}
                  >
                    {deleting === inv.id ? "Deleting…" : "Delete"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
