"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";

export default function UpgradeBanner() {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<"stripe" | "sslcommerz" | "dev" | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handlePay(provider: "stripe" | "sslcommerz") {
    setError(null);
    setLoadingProvider(provider);

    const res = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, discountCode: discountCode.trim() || undefined }),
    });
    const data = await res.json();
    setLoadingProvider(null);

    if (!res.ok) {
      setError(data.error ?? "Couldn't start checkout. Try again.");
      return;
    }
    window.location.href = data.redirectUrl;
  }

  async function handleSimulate() {
    setLoadingProvider("dev");
    const res = await fetch("/api/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discountCode: discountCode.trim() || undefined }),
    });
    setLoadingProvider(null);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't simulate upgrade.");
    }
  }

  return (
    <div className="map-texture bg-navy text-white rounded-2xl p-7" style={{ boxShadow: "var(--shadow-md)" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <Crown size={16} className="text-gold-soft" strokeWidth={2} />
        <p className="font-mono text-xs uppercase tracking-[0.15em]" style={{ color: "var(--gold-soft)" }}>Free plan</p>
      </div>
      <p className="text-white/75 text-sm max-w-md leading-relaxed mb-5">
        You&apos;re on the free plan — 3 scholarship matches, top 3 skills, and headline country picks.
        Upgrade to unlock full results, salary and visa detail, and complete roadmaps.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <input
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          placeholder="Discount or referral code (optional)"
          className="rounded-lg bg-white/10 border border-white/20 px-3.5 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-gold-soft w-64"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => handlePay("stripe")}
          disabled={loadingProvider !== null}
          className="btn btn-gold px-4 py-2.5 text-sm disabled:opacity-60"
          title="International cards, via Stripe"
        >
          {loadingProvider === "stripe" ? "Redirecting…" : "Pay with card"}
        </button>
        <button
          onClick={() => handlePay("sslcommerz")}
          disabled={loadingProvider !== null}
          className="btn px-4 py-2.5 text-sm border border-white/25 text-white hover:bg-white/10 disabled:opacity-60"
        >
          {loadingProvider === "sslcommerz" ? "Redirecting…" : "Pay with bKash / Nagad / Rocket"}
        </button>
        <button
          onClick={handleSimulate}
          disabled={loadingProvider !== null}
          className="text-xs text-white/50 hover:text-white/80 underline decoration-dotted underline-offset-4 disabled:opacity-60"
          title="Dev only — flips your account to Pro without a real charge. Turns off once a real gateway is set up in production."
        >
          {loadingProvider === "dev" ? "Simulating…" : "Skip payment (dev demo)"}
        </button>
      </div>

      {error && (
        <p className="text-coral text-sm mt-3" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
