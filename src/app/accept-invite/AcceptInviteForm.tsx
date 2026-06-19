"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  token: string;
  email: string;
  role: string;
}

const DASHBOARD: Record<string, string> = {
  startup: "/startup/dashboard",
  investor: "/investor/dashboard",
  admin: "/admin/dashboard",
};

export default function AcceptInviteForm({ token, email, role }: Props) {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the user + profile server-side
      const res = await fetch("/api/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, fullName: fullName.trim(), password }),
      });

      let data: { error?: string; email?: string; role?: string } = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("Server returned an unexpected response. Please try again.");
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      // 2. Sign in with the newly created credentials
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error(
          `Account created but sign-in failed: ${signInError.message}. Please go to /login.`
        );
      }

      // 3. Hard-navigate so the new session cookie is picked up by the middleware
      window.location.href = DASHBOARD[data.role ?? role] ?? "/login";
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      setLoading(false);
    }
  }

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">StartGrid</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The European startup-investor platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Create your account</CardTitle>
              <Badge variant="secondary">{roleLabel}</Badge>
            </div>
            <CardDescription>
              Joining as{" "}
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="button"
                className="w-full"
                disabled={loading}
                onClick={() => handleSubmit()}
              >
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
