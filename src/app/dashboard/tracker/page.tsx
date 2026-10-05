import { CalendarClock } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import SiteNav from "@/components/SiteNav";
import TrackerList from "@/components/TrackerList";

export default async function TrackerPage() {
  const session = await getSessionUser();

  return (
    <div className="flex-1 flex flex-col">
      <SiteNav session={session} />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12 w-full">
        <div className="flex items-center gap-4 mb-2">
          <span className="icon-tile-coral icon-tile"><CalendarClock size={22} strokeWidth={1.75} /></span>
          <div>
            <p className="eyebrow">04 · Track</p>
            <h1 className="font-display text-3xl">Application Tracker</h1>
          </div>
        </div>
        <p className="text-ink-soft mb-8 max-w-xl">
          Every deadline you&apos;re tracking, soonest first. We&apos;ll email you at 30, 7, and 1 day before each one.
        </p>
        {session?.tier === "free" ? (
          <div className="empty-state">
            <p className="text-ink-soft mb-2">Deadline tracking and reminders are a Pro feature.</p>
            <a href="/dashboard" className="text-navy underline decoration-gold underline-offset-4 text-sm">
              Back to dashboard to upgrade →
            </a>
          </div>
        ) : (
          <TrackerList />
        )}
      </main>
    </div>
  );
}
