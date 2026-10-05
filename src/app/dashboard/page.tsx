import Link from "next/link";
import { GraduationCap, Globe2, TrendingUp, CalendarClock, ArrowRight } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import SiteNav from "@/components/SiteNav";
import UpgradeBanner from "@/components/UpgradeBanner";

const tools = [
  {
    href: "/dashboard/scholarships",
    n: "01",
    title: "Scholarship Matchmaker",
    body: "Enter your CGPA, field, and budget — get ranked scholarship matches.",
    Icon: GraduationCap,
    accent: "var(--gold)",
    tileClass: "icon-tile",
  },
  {
    href: "/dashboard/career",
    n: "02",
    title: "Global Career Advisor",
    body: "See which countries want your role, with pay and visa detail.",
    Icon: Globe2,
    accent: "var(--teal)",
    tileClass: "icon-tile-teal",
  },
  {
    href: "/dashboard/skills",
    n: "03",
    title: "Skill Roadmap Generator",
    body: "A step-by-step learning path to your target role, with resources.",
    Icon: TrendingUp,
    accent: "var(--plum)",
    tileClass: "icon-tile-plum",
  },
  {
    href: "/dashboard/tracker",
    n: "04",
    title: "Application Tracker",
    body: "All your deadlines in one place, with reminders before they hit.",
    Icon: CalendarClock,
    accent: "var(--coral)",
    tileClass: "icon-tile-coral",
  },
];

export default async function DashboardPage() {
  const session = await getSessionUser();

  return (
    <div className="flex-1 flex flex-col">
      <SiteNav session={session} />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-14 w-full relative">
        <div
          className="glow-blob -top-10 left-1/3 w-[24rem] h-[24rem] opacity-[0.06] -z-10"
          style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
          aria-hidden
        />
        <p className="eyebrow mb-2">Dashboard</p>
        <h1 className="font-display text-4xl mb-2 text-balance">
          Welcome back, <span className="text-gradient-gold">{session?.name?.split(" ")[0] ?? "there"}</span>
        </h1>
        <p className="text-ink-soft text-lg mb-10">Pick a tool below to keep planning your route.</p>

        {session?.tier === "free" && <div className="mb-10"><UpgradeBanner /></div>}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((t, i) => (
            <Link
              key={t.href}
              href={t.href}
              className="card card-interactive card-accent block p-7 rise-in"
              style={{ ["--accent" as string]: t.accent, animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-center justify-between mb-5">
                <span className={t.tileClass}>
                  <t.Icon size={22} strokeWidth={1.75} />
                </span>
                <p className="font-mono text-xs text-ink-soft/50 tracking-[0.1em]">{t.n}</p>
              </div>
              <h2 className="font-display text-xl mb-2.5">{t.title}</h2>
              <p className="text-ink-soft text-sm leading-relaxed mb-4">{t.body}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: t.accent }}>
                Open <ArrowRight size={14} strokeWidth={2.25} />
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
