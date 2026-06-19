"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { saveInvestorProfile, type InvestorCriteria } from "@/app/actions/investor";

const STAGES = ["Pre-seed", "Seed", "Series A"];
const SECTORS = ["Climate Tech", "B2B SaaS", "Fintech", "Health Tech", "Deep Tech", "Marketplace"];
const REVENUE_OPTIONS = ["Pre-revenue only", "Post-revenue only", "Both"];
const EU_COUNTRIES = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus",
  "Czech Republic", "Denmark", "Estonia", "Finland", "France",
  "Germany", "Greece", "Hungary", "Ireland", "Italy",
  "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands",
  "Norway", "Poland", "Portugal", "Romania", "Slovakia",
  "Slovenia", "Spain", "Sweden", "Switzerland", "United Kingdom",
];

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-600 text-white border-indigo-600"
          : "border-input bg-background hover:bg-muted text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

const inputClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function InvestorOnboardPage() {
  const [name, setName] = useState("");
  const [firm, setFirm] = useState("");
  const [criteria, setCriteria] = useState<InvestorCriteria>({
    role: "",
    stages: [],
    sectors: [],
    revenuePreference: "Both",
    geographies: [],
    minTicket: "",
    maxTicket: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof InvestorCriteria>(
    key: K,
    value: InvestorCriteria[K]
  ) {
    setCriteria((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!firm.trim()) { setError("Please enter your fund or firm name."); return; }
    if (!criteria.role.trim()) { setError("Please enter your role."); return; }
    if (criteria.stages.length === 0) { setError("Select at least one investment stage."); return; }
    if (criteria.sectors.length === 0) { setError("Select at least one sector."); return; }
    if (criteria.geographies.length === 0) { setError("Select at least one geography."); return; }
    if (!criteria.minTicket.trim() || !criteria.maxTicket.trim()) {
      setError("Please enter your ticket size range."); return;
    }
    setError(null);
    startTransition(async () => {
      const result = await saveInvestorProfile(name, firm, criteria);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            StartGrid
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Set up your investor profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your criteria help us surface the most relevant startups for you.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">About you</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name *</Label>
                <Input id="name" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="firm">Fund / firm name *</Label>
                <Input id="firm" placeholder="Nordic Ventures" value={firm} onChange={(e) => setFirm(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Your role *</Label>
              <Input id="role" placeholder="e.g. Partner, Principal, Angel Investor" value={criteria.role} onChange={(e) => update("role", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Investment criteria</CardTitle>
            <CardDescription>We'll pre-filter your startup discovery feed based on these.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stages */}
            <div className="space-y-2">
              <Label>Investment stages *</Label>
              <div className="flex flex-wrap gap-2">
                {STAGES.map((s) => (
                  <Chip key={s} label={s} active={criteria.stages.includes(s)} onClick={() => update("stages", toggle(criteria.stages, s))} />
                ))}
              </div>
            </div>

            <Separator />

            {/* Sectors */}
            <div className="space-y-2">
              <Label>Sectors of interest *</Label>
              <div className="flex flex-wrap gap-2">
                {SECTORS.map((s) => (
                  <Chip key={s} label={s} active={criteria.sectors.includes(s)} onClick={() => update("sectors", toggle(criteria.sectors, s))} />
                ))}
              </div>
            </div>

            <Separator />

            {/* Revenue */}
            <div className="space-y-2">
              <Label>Revenue preference</Label>
              <div className="flex flex-wrap gap-2">
                {REVENUE_OPTIONS.map((r) => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="revenue"
                      value={r}
                      checked={criteria.revenuePreference === r}
                      onChange={() => update("revenuePreference", r)}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* Geographies */}
            <div className="space-y-2">
              <Label>Preferred geographies *</Label>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 max-h-52 overflow-y-auto pr-1">
                {EU_COUNTRIES.map((c) => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={criteria.geographies.includes(c)}
                      onChange={() => update("geographies", toggle(criteria.geographies, c))}
                      className="accent-indigo-600 rounded"
                    />
                    <span className="text-sm">{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* Ticket size */}
            <div className="space-y-2">
              <Label>Ticket size *</Label>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Minimum</span>
                  <Input placeholder="e.g. €100k" value={criteria.minTicket} onChange={(e) => update("minTicket", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Maximum</span>
                  <Input placeholder="e.g. €2M" value={criteria.maxTicket} onChange={(e) => update("maxTicket", e.target.value)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? "Saving…" : "Save my criteria →"}
          </Button>
        </div>
      </div>
    </main>
  );
}
