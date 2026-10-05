"use client";

import { useState } from "react";
import { Tier } from "@/types";

export default function TrackerButton({
  scholarshipId,
  scholarshipName,
  country,
  deadline,
  applyUrl,
  tier,
}: {
  scholarshipId: string;
  scholarshipName: string;
  country: string;
  deadline: string;
  applyUrl: string;
  tier: Tier;
}) {
  const [status, setStatus] = useState<"idle" | "tracking" | "already" | "loading">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    if (tier !== "pro") {
      setMessage("Upgrade to Pro to track deadlines and get reminder emails.");
      return;
    }
    setStatus("loading");
    setMessage(null);

    const res = await fetch("/api/tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scholarshipId, scholarshipName, country, deadline, applyUrl }),
    });

    if (res.ok) {
      setStatus("tracking");
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (res.status === 409) {
      setStatus("already");
      return;
    }
    setStatus("idle");
    setMessage(data.error ?? "Couldn't track this deadline.");
  }

  return (
    <div className="mt-3">
      <button
        onClick={handleClick}
        disabled={status === "loading" || status === "tracking" || status === "already"}
        className="pill hover:border-gold hover:text-gold transition-colors disabled:hover:border-surface-line disabled:hover:text-inherit"
      >
        {status === "tracking" || status === "already" ? "Tracking ✓" : status === "loading" ? "Adding…" : "Track deadline"}
      </button>
      {message && <p className="text-xs text-ink-soft mt-1.5">{message}</p>}
      {status === "tracking" && (
        <p className="text-xs text-ink-soft mt-1.5">
          Added to your <a href="/dashboard/tracker" className="underline decoration-gold underline-offset-2">Application Tracker</a> — you&apos;ll get email reminders.
        </p>
      )}
    </div>
  );
}
