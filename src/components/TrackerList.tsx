"use client";

import { useEffect, useState } from "react";
import { TrackedApplication } from "@/types";

function daysUntil(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
}

function urgencyColor(days: number): string {
  if (days <= 7) return "var(--coral)";
  if (days <= 30) return "var(--gold)";
  return "var(--teal)";
}

export default function TrackerList() {
  const [items, setItems] = useState<TrackedApplication[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tracker")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed to load.");
        return res.json();
      })
      .then((data) => setItems(data.items))
      .catch((e) => setError(e.message));
  }, []);

  async function handleRemove(id: string) {
    setItems((prev) => prev?.filter((i) => i.id !== id) ?? prev);
    await fetch(`/api/tracker/${id}`, { method: "DELETE" });
  }

  if (error) {
    return <p className="text-coral text-sm">{error}</p>;
  }

  if (!items) {
    return <p className="text-ink-soft text-sm">Loading your tracked applications…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        Nothing tracked yet. Go to the{" "}
        <a href="/dashboard/scholarships" className="underline decoration-gold underline-offset-4">
          Scholarship Matchmaker
        </a>{" "}
        and tap &ldquo;Track deadline&rdquo; on any match.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const days = daysUntil(item.deadline);
        const color = urgencyColor(days);
        return (
          <div key={item.id} className="card card-interactive p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-display text-lg">{item.scholarshipName}</h3>
              <p className="text-ink-soft text-sm">{item.country} · Deadline {item.deadline}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-mono text-lg" style={{ color }}>
                  {days < 0 ? "Closed" : days === 0 ? "Today" : `${days}d left`}
                </div>
                <a
                  href={item.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-navy underline decoration-gold underline-offset-4"
                >
                  Apply ↗
                </a>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="pill hover:border-coral hover:text-coral transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
