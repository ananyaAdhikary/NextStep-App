"use client";

import { useState } from "react";

interface RankedCount {
  label: string;
  count: number;
}

interface AnalyticsSummary {
  totalSearches: number;
  scholarshipSearches: number;
  careerSearches: number;
  topCountries: RankedCount[];
  topSubjects: RankedCount[];
  topRoles: RankedCount[];
  windowDays: number | "all-time";
}

export default function AnalyticsDashboard() {
  const [key, setKey] = useState("");
  const [days, setDays] = useState("30");
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/analytics?days=${encodeURIComponent(days)}`, {
      headers: { "x-admin-key": key },
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't load analytics.");
      setData(null);
      return;
    }
    setData(await res.json());
  }

  return (
    <div className="space-y-8">
      <div className="card p-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="field-label" htmlFor="admin-key">
            Admin key
          </label>
          <input
            id="admin-key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="field-input w-64"
            placeholder="ADMIN_API_KEY"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="window-days">
            Window (days)
          </label>
          <input
            id="window-days"
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="field-input w-28"
          />
        </div>
        <button onClick={load} disabled={loading || !key} className="btn btn-primary px-5 py-2.5 disabled:opacity-60">
          {loading ? "Loading…" : "Load"}
        </button>
        {error && (
          <p className="text-coral text-sm" role="alert">
            {error}
          </p>
        )}
      </div>

      {data && (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard label="Total searches" value={data.totalSearches} />
            <StatCard label="Scholarship searches" value={data.scholarshipSearches} />
            <StatCard label="Career searches" value={data.careerSearches} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <RankedBarCard title="Top countries / regions" items={data.topCountries} accent="var(--teal)" />
            <RankedBarCard title="Top subjects / fields" items={data.topSubjects} accent="var(--gold)" />
          </div>

          {data.topRoles.length > 0 && (
            <RankedBarCard title="Top target roles" items={data.topRoles} accent="var(--plum)" />
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="text-ink-soft text-xs font-mono uppercase tracking-wide mb-1.5">{label}</p>
      <p className="font-display text-3xl">{value}</p>
    </div>
  );
}

function RankedBarCard({ title, items, accent = "var(--gold)" }: { title: string; items: RankedCount[]; accent?: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="card p-6">
      <h3 className="font-display text-lg mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-ink-soft text-sm">No searches recorded yet in this window.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-ink">{item.label}</span>
                <span className="text-ink-soft font-mono">{item.count}</span>
              </div>
              <div className="h-2 rounded-full bg-paper overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(4, (item.count / max) * 100)}%`, background: accent }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
