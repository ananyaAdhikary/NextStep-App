"use client";

import { useEffect, useState } from "react";

interface RewardCode {
  code: string;
  percentOff: number;
  redeemed: boolean;
  createdAt: string;
}

interface ReferralData {
  referralCode: string;
  referredCount: number;
  referralConversions: number;
  rewardCodes: RewardCode[];
}

export default function ReferralPanel() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referrals/me")
      .then((res) => (res.ok ? res.json() : null))
      .then(setData);
  }, []);

  if (!data) {
    return <div className="card p-6 text-ink-soft text-sm">Loading your referral details…</div>;
  }

  const link = typeof window !== "undefined" ? `${window.location.origin}/signup?ref=${data.referralCode}` : "";

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="font-display text-lg mb-1.5">Your referral link</h2>
        <p className="text-ink-soft text-sm mb-4">
          Share it. When someone signs up and upgrades to Pro, you get a 20% off code.
        </p>
        <div className="flex flex-wrap gap-3">
          <input
            readOnly
            value={link}
            className="field-input flex-1 min-w-[240px] text-sm font-mono"
          />
          <button onClick={handleCopy} className="btn btn-primary px-4 py-2.5 text-sm">
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
        <p className="text-xs text-ink-soft mt-3 font-mono">Code: {data.referralCode}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-ink-soft text-xs font-mono uppercase tracking-wide mb-1.5">Referred sign-ups</p>
          <p className="font-display text-3xl">{data.referredCount}</p>
        </div>
        <div className="card p-5">
          <p className="text-ink-soft text-xs font-mono uppercase tracking-wide mb-1.5">Converted to Pro</p>
          <p className="font-display text-3xl">{data.referralConversions}</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-display text-lg mb-3">Your discount codes</h3>
        {data.rewardCodes.length === 0 ? (
          <p className="text-ink-soft text-sm">
            None yet. You&apos;ll get a 20% off code as soon as someone you referred upgrades to Pro.
          </p>
        ) : (
          <div className="space-y-2">
            {data.rewardCodes.map((c) => (
              <div key={c.code} className="flex items-center justify-between text-sm border-b border-surface-line last:border-b-0 py-2">
                <span className="font-mono">{c.code}</span>
                <span className="text-ink-soft">{c.percentOff}% off</span>
                <span className={c.redeemed ? "text-ink-soft" : "text-teal"}>
                  {c.redeemed ? "Used" : "Available"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
