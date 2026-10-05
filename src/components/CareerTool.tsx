"use client";

import { useState } from "react";
import { CareerAdvisorResult, Tier } from "@/types";

const DEGREES = ["Computer Science", "Engineering", "Business", "Data Science", "Public Health", "Environmental Science", "Design"];
const ROLES = ["Software Engineer", "Data Analyst", "Business Analyst", "Environmental Consultant", "Product Designer", "Public Health Specialist"];
const REGIONS = ["Any", "Europe", "North America", "Asia", "Oceania", "Middle East"];

export default function CareerTool({ tier }: { tier: Tier }) {
  const [form, setForm] = useState({ degree: "Computer Science", targetRole: "Software Engineer", preferredRegion: "Any" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    results: CareerAdvisorResult[];
    totalMatches: number;
    lockedCount: number;
    summary: string | null;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/career/advisor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Something went wrong.");
      return;
    }
    setData(await res.json());
  }

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
      <form onSubmit={handleSubmit} className="card p-6 space-y-4 h-fit lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
        <div>
          <label className="field-label">Your degree</label>
          <select value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} className="field-input bg-surface">
            {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Target job role</label>
          <select value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} className="field-input bg-surface">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Preferred region</label>
          <select value={form.preferredRegion} onChange={(e) => setForm({ ...form, preferredRegion: e.target.value })} className="field-input bg-surface">
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        {error && <p className="text-coral text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 disabled:opacity-60">
          {loading ? "Searching…" : "Find countries"}
        </button>
      </form>

      <div>
        {!data && (
          <div className="empty-state">
            Pick your target role to see which countries are hiring for it.
          </div>
        )}
        {data && (
          <div className="space-y-4">
            <p className="text-ink-soft text-sm">
              {data.totalMatches} countr{data.totalMatches === 1 ? "y" : "ies"} found
              {tier === "free" && data.lockedCount > 0 && (
                <> — showing top {data.results.length}. <span className="text-coral">{data.lockedCount} more with Pro.</span></>
              )}
            </p>
            {data.summary && (
              <div className="note-panel text-sm text-ink">
                <span className="eyebrow block mb-1">Advisor note</span>
                {data.summary}
              </div>
            )}
            <div className="waypoint-line space-y-6 pl-2">
              {data.results.map((r, i) => (
                <div key={r.id} className="flex gap-6 pl-6">
                  <div className="waypoint-dot w-4 h-4 rounded-full bg-surface border-2 border-gold -ml-8 mt-1 shrink-0" />
                  <CareerCard r={r} rank={i + 1} tier={tier} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CareerCard({ r, rank, tier }: { r: CareerAdvisorResult; rank: number; tier: Tier }) {
  return (
    <div className="card card-interactive p-5 flex-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-gold mb-1">#{rank} match</p>
          <h3 className="font-display text-lg">{r.country}</h3>
          <p className="text-ink-soft text-sm">{r.jobRole} · Demand {r.demandScore}/10 · +{r.growthTrendPct}% a year</p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-xl text-teal">{r.matchScore}%</div>
          <div className="text-xs text-ink-soft">match</div>
        </div>
      </div>

      {tier === "pro" ? (
        <>
          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            <Stat label="Avg starting pay" value={`$${r.avgStartingSalaryUSD.toLocaleString()}/yr`} />
            <Stat label="Cost of living (mo.)" value={`$${r.costOfLivingIndexUSD.toLocaleString()}`} />
            <Stat label="Pay vs. cost of living" value={`${r.salaryToColRatio}x`} />
            <Stat label="Visa route" value={r.visaProgram} />
          </div>
          <p className="text-sm text-ink-soft mt-3">{r.notes}</p>
          {r.liveSignal ? (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-mono text-teal">
                <span className="w-1.5 h-1.5 rounded-full bg-teal inline-block" aria-hidden />
                LIVE
              </span>
              <span className="text-ink-soft">
                {r.liveSignal.vacancyCount !== null && <>{r.liveSignal.vacancyCount.toLocaleString()} open roles</>}
                {r.liveSignal.vacancyCount !== null && r.liveSignal.avgSalaryLocal !== null && " · "}
                {r.liveSignal.avgSalaryLocal !== null && <>avg {r.liveSignal.avgSalaryLocal.toLocaleString()} (local currency)</>}
                {" "}via Adzuna
              </span>
            </div>
          ) : (
            <p className="text-xs text-ink-soft/60 mt-3">
              No live job data for this search yet (needs an Adzuna API key, or this market isn&apos;t covered).
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-ink-soft mt-4">
          Upgrade to Pro to see pay, cost of living, visa route, and growth for this country.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-ink-soft">{label}</div>
      <div className="font-mono">{value}</div>
    </div>
  );
}
