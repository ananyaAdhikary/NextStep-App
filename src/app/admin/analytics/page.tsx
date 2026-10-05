import Link from "next/link";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Link href="/" className="font-display text-xl">
          NextStep
        </Link>
        <p className="eyebrow mt-6 mb-2">Admin</p>
        <h1 className="font-display text-3xl mb-1.5">Demand analytics</h1>
        <p className="text-ink-soft mb-8 max-w-xl">
          The countries and subjects students search for most, from every scholarship and career search.
          Private — needs the server&apos;s admin key.
        </p>
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
