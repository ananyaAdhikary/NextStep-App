"use client";

import { useState } from "react";
import { ScholarshipMatchResult, Tier } from "@/types";
import TrackerButton from "./TrackerButton";

const FIELDS = ["Computer Science", "Engineering", "Business", "Data Science", "Public Health", "Environmental Science", "Design", "Law", "Any"];
const COUNTRIES = ["Any", "United States", "United Kingdom", "Germany", "Canada", "Australia", "Netherlands", "Japan", "Sweden", "Switzerland", "New Zealand"];

export default function ScholarshipTool({ tier }: { tier: Tier }) {
  const [form, setForm] = useState({
    cgpa: "3.4",
    fieldOfStudy: "Computer Science",
    targetCountry: "Any",
    annualBudgetUSD: "15000",
    ielts: "6.5",
    toefl: "",
    gre: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    results: ScholarshipMatchResult[];
    totalMatches: number;
    lockedCount: number;
    summary: string | null;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/scholarships/match", {
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
          <label className="field-label">CGPA (out of 4.0)</label>
          <input
            type="number" step="0.01" min="0" max="4" required
            value={form.cgpa}
            onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">Field of study</label>
          <select
            value={form.fieldOfStudy}
            onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })}
            className="field-input bg-surface"
          >
            {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Target country</label>
          <select
            value={form.targetCountry}
            onChange={(e) => setForm({ ...form, targetCountry: e.target.value })}
            className="field-input bg-surface"
          >
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Yearly budget (USD)</label>
          <input
            type="number" min="0" required
            value={form.annualBudgetUSD}
            onChange={(e) => setForm({ ...form, annualBudgetUSD: e.target.value })}
            className="field-input"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="field-label text-xs">IELTS</label>
            <input type="number" step="0.5" value={form.ielts} onChange={(e) => setForm({ ...form, ielts: e.target.value })} className="field-input text-sm py-2" />
          </div>
          <div>
            <label className="field-label text-xs">TOEFL</label>
            <input type="number" value={form.toefl} onChange={(e) => setForm({ ...form, toefl: e.target.value })} className="field-input text-sm py-2" />
          </div>
          <div>
            <label className="field-label text-xs">GRE</label>
            <input type="number" value={form.gre} onChange={(e) => setForm({ ...form, gre: e.target.value })} className="field-input text-sm py-2" />
          </div>
        </div>
        {error && <p className="text-coral text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 disabled:opacity-60">
          {loading ? "Matching…" : "Find scholarships"}
        </button>
      </form>

      <div>
        {!data && <EmptyState />}
        {data && (
          <div className="space-y-4">
            <p className="text-ink-soft text-sm">
              {data.totalMatches} match{data.totalMatches === 1 ? "" : "es"} found
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
            {data.results.map((r) => <ScholarshipCard key={r.id} r={r} tier={tier} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function ScholarshipCard({ r, tier }: { r: ScholarshipMatchResult; tier: Tier }) {
  return (
    <div className="card card-interactive p-5">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h3 className="font-display text-lg">{r.name}</h3>
          <p className="text-ink-soft text-sm">{r.country} · {r.degreeLevel} · {r.fullyFunded ? "Fully funded" : "Partially funded"}</p>
        </div>
        <ScoreBadge score={r.eligibilityScore} />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-mono text-ink-soft mt-3">
        <span>Award: ${r.amountUSD.toLocaleString()}</span>
        <span>Deadline: {r.deadline}</span>
        <span>Min CGPA: {r.minCGPA}</span>
      </div>
      <p className="text-sm text-ink-soft mt-3">{r.notes}</p>
      <a
        href={r.applyUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 mt-3 text-sm text-navy underline decoration-gold underline-offset-4"
      >
        Apply on official site
        <span aria-hidden className="text-ink-soft/60 no-underline">↗</span>
      </a>
      <p className="text-xs text-ink-soft/70 mt-1">Opens the scholarship&apos;s real application page in a new tab.</p>
      <TrackerButton
        scholarshipId={r.id}
        scholarshipName={r.name}
        country={r.country}
        deadline={r.deadline}
        applyUrl={r.applyUrl}
        tier={tier}
      />
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "var(--teal)" : score >= 40 ? "var(--gold)" : "var(--coral)";
  return (
    <div className="text-right shrink-0">
      <div className="font-mono text-xl" style={{ color }}>{score}%</div>
      <div className="text-xs text-ink-soft">match</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      Fill in your profile to see your best-fit scholarships.
    </div>
  );
}
