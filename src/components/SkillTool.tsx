"use client";

import { useState } from "react";
import { SkillRoadmap, Tier } from "@/types";

const FIELDS = ["Computer Science", "Engineering", "Business", "Data Science", "Public Health", "Environmental Science", "Design"];
const ROLES = ["Software Engineer", "Data Analyst", "Business Analyst", "Environmental Consultant", "Product Designer", "Public Health Specialist"];

export default function SkillTool({ tier }: { tier: Tier }) {
  const [form, setForm] = useState({ fieldOfStudy: "Computer Science", targetRole: "Software Engineer" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ roadmap: SkillRoadmap | null; locked: boolean; summary: string | null } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/skills/roadmap", {
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
          <label className="field-label">Field of study</label>
          <select value={form.fieldOfStudy} onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })} className="field-input bg-surface">
            {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Target job role</label>
          <select value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} className="field-input bg-surface">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        {error && <p className="text-coral text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 disabled:opacity-60">
          {loading ? "Building…" : "Build my roadmap"}
        </button>
      </form>

      <div>
        {!data && (
          <div className="empty-state">
            Pick a target role to get a step-by-step skill roadmap.
          </div>
        )}
        {data && !data.roadmap && (
          <div className="empty-state">
            No roadmap for that combination yet — try a different role.
          </div>
        )}
        {data?.roadmap && <RoadmapView roadmap={data.roadmap} locked={data.locked} summary={data.summary} tier={tier} />}
      </div>
    </div>
  );
}

function RoadmapView({ roadmap, locked, summary, tier }: { roadmap: SkillRoadmap; locked: boolean; summary: string | null; tier: Tier }) {
  return (
    <div className="space-y-6">
      {summary && (
        <div className="note-panel text-sm text-ink">
          <span className="eyebrow block mb-1">Advisor note</span>
          {summary}
        </div>
      )}

      <div className="card p-6">
        <h3 className="font-display text-xl mb-4">{roadmap.role}</h3>
        <SkillGroup label="Core" skills={roadmap.coreSkills} color="var(--navy)" />
        {roadmap.recommendedSkills.length > 0 && <SkillGroup label="Recommended" skills={roadmap.recommendedSkills} color="var(--teal)" />}
        {roadmap.niceToHaveSkills.length > 0 && <SkillGroup label="Nice to have" skills={roadmap.niceToHaveSkills} color="var(--gold)" />}
        {locked && tier === "free" && (
          <p className="text-sm text-coral mt-4">Upgrade to Pro to see Recommended and Nice-to-have skills.</p>
        )}
      </div>

      <div>
        <h3 className="font-display text-xl mb-4">Learning path</h3>
        <div className="waypoint-line space-y-8 pl-2">
          {roadmap.phases.map((p) => (
            <div key={p.phase} className="flex gap-6 pl-6">
              <div className="waypoint-dot w-4 h-4 rounded-full bg-surface border-2 border-gold -ml-8 mt-1 shrink-0" />
              <div className="flex-1 card p-5">
                <p className="font-mono text-xs text-gold mb-1">Phase {p.phase} · {p.durationWeeks} weeks</p>
                <h4 className="font-display text-lg mb-3">{p.title}</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {p.skills.map((s) => (
                    <span key={s} className="text-xs bg-paper border border-surface-line rounded-full px-3 py-1 text-ink-soft">{s}</span>
                  ))}
                </div>
                <ul className="space-y-1">
                  {p.resources.map((r) => (
                    <li key={r.name} className="text-sm text-ink-soft flex items-center gap-2">
                      <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${r.free ? "bg-teal-soft text-teal" : "bg-gold-soft text-gold"}`}>
                        {r.free ? "FREE" : "PAID"}
                      </span>
                      {r.name} <span className="text-ink-soft/60">— {r.provider}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          {locked && tier === "free" && (
            <div className="flex gap-6 pl-6">
              <div className="waypoint-dot w-4 h-4 rounded-full bg-paper border-2 border-surface-line -ml-8 mt-1 shrink-0" />
              <div className="flex-1 empty-state text-sm py-5">
                Phase 2 and beyond are on the Pro plan.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkillGroup({ label, skills, color }: { label: string; skills: string[]; color: string }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color }}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span key={s} className="text-sm bg-paper border border-surface-line rounded-full px-3 py-1">{s}</span>
        ))}
      </div>
    </div>
  );
}
