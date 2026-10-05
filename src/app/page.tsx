import Link from "next/link";
import { GraduationCap, Globe2, TrendingUp, ArrowRight, Check, MapPin, Banknote, ShieldCheck, Quote, ChevronDown, Sparkles } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import SiteNav from "@/components/SiteNav";
import BoardingPass from "@/components/BoardingPass";
import FlightPath from "@/components/FlightPath";

export default async function Home() {
  const session = await getSessionUser();

  const waypoints = [
    {
      n: "01",
      title: "Discover",
      body: "Enter your CGPA, field, and budget. We rank real scholarships by how well you actually qualify.",
      Icon: GraduationCap,
      accent: "var(--gold)",
    },
    {
      n: "02",
      title: "Compare",
      body: "See which countries are hiring for your role right now — pay, cost of living, and visa route, side by side.",
      Icon: Globe2,
      accent: "var(--teal)",
    },
    {
      n: "03",
      title: "Plan",
      body: "Get a step-by-step skill roadmap to close the gap, with free and paid resources at every step.",
      Icon: TrendingUp,
      accent: "var(--plum)",
    },
  ];

  const stats = [
    { value: "18", label: "Active scholarships", Icon: GraduationCap, accent: "var(--gold)" },
    { value: "12", label: "Countries covered", Icon: Globe2, accent: "var(--teal)" },
    { value: "6", label: "Career roadmaps", Icon: TrendingUp, accent: "var(--plum)" },
    { value: "94%", label: "Avg. match confidence", Icon: ShieldCheck, accent: "var(--coral)" },
  ];

  const destinations = [
    { country: "Germany", role: "Software Engineering", pay: "€58k avg", visa: "Job Seeker Visa", accent: "var(--gold)", gradient: "linear-gradient(140deg, #0ea975, #0a5c40)" },
    { country: "Canada", role: "Data & Analytics", pay: "CA$72k avg", visa: "Express Entry", accent: "var(--coral)", gradient: "linear-gradient(140deg, #ea6a2e, #7a2f0e)" },
    { country: "Singapore", role: "Product & Design", pay: "S$68k avg", visa: "Employment Pass", accent: "var(--teal)", gradient: "linear-gradient(140deg, #0d9c94, #063f3c)" },
    { country: "Netherlands", role: "Research & AI", pay: "€54k avg", visa: "Highly Skilled Migrant", accent: "var(--plum)", gradient: "linear-gradient(140deg, #6a5bd8, #2c2264)" },
  ];

  const faqs = [
    {
      q: "Is NextStep free to start?",
      a: "Yes — the Free plan gives you real scholarship and career matches, no card required. Pro unlocks the full ranked list, deadline tracking, and complete skill roadmaps.",
    },
    {
      q: "How are scholarship matches scored?",
      a: "We weigh your CGPA, field of study, budget, and target country against each scholarship's real eligibility criteria — not just keyword matching — so the ranking reflects your actual odds.",
    },
    {
      q: "Which countries and roles are covered?",
      a: "We currently track hiring demand, pay bands, and visa routes across 12 countries and a growing set of in-demand roles, refreshed as market data changes.",
    },
    {
      q: "Can I track multiple applications at once?",
      a: "Yes — the Application Tracker holds every scholarship and job application in one place, with email reminders before each deadline hits.",
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <SiteNav session={session} />

      <main className="flex-1">
        <section className="map-texture bg-navy text-white relative overflow-hidden">
          <div className="grain-overlay" aria-hidden />
          <div
            className="glow-blob -top-40 -right-24 w-[36rem] h-[36rem] opacity-25"
            style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
            aria-hidden
          />
          <div
            className="glow-blob -bottom-48 -left-32 w-[30rem] h-[30rem] opacity-20"
            style={{ background: "radial-gradient(circle, var(--plum) 0%, transparent 70%)" }}
            aria-hidden
          />
          <div
            className="glow-blob top-1/3 left-1/2 w-[22rem] h-[22rem] opacity-10"
            style={{ background: "radial-gradient(circle, var(--teal) 0%, transparent 70%)" }}
            aria-hidden
          />
          <div className="mx-auto max-w-6xl px-6 pt-28 pb-24 grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div className="rise-in">
              <p className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-gold-soft uppercase mb-7 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                Scholarships · Careers abroad · Skill plans
              </p>
              <h1 className="font-display text-5xl sm:text-[3.75rem] leading-[1.03] mb-8 text-balance">
                One clear route to <span className="text-gradient-gold">study or work abroad.</span>
              </h1>
              <p className="text-white/65 text-xl mb-10 max-w-md leading-relaxed">
                Tell us your profile. We match you to real scholarships and real job demand
                abroad — then give you one plan to follow, not fifty tabs to sort through.
              </p>
              <div className="flex items-center gap-7 flex-wrap">
                <Link
                  href={session ? "/dashboard" : "/signup"}
                  className="btn btn-gold px-8 py-4 text-base font-semibold"
                >
                  {session ? "Go to your dashboard" : "Start free"}
                  <ArrowRight size={18} strokeWidth={2.25} />
                </Link>
                <Link href="#how-it-works" className="text-white/60 hover:text-white text-sm transition-colors">
                  See how it works ↓
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-12 text-white/50 text-sm font-mono">
                <span>18 scholarships</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>12 countries</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>6 career roadmaps</span>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <BoardingPass />
            </div>
          </div>
        </section>

        <section className="bg-navy-deep text-white relative overflow-hidden">
          <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-3.5">
                <span
                  className="icon-tile shrink-0"
                  style={{ background: `color-mix(in srgb, ${s.accent} 22%, var(--navy))`, color: s.accent, boxShadow: "none" }}
                >
                  <s.Icon size={20} strokeWidth={1.75} />
                </span>
                <div>
                  <p className="font-display text-2xl leading-none mb-1">{s.value}</p>
                  <p className="text-white/50 text-xs uppercase tracking-wide">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-28">
          <p className="eyebrow mb-3">The route</p>
          <h2 className="font-display text-4xl sm:text-5xl mb-4 text-balance">Three steps, one plan</h2>
          <p className="text-ink-soft mb-12 max-w-xl text-lg leading-relaxed">
            Each step builds on the last: your profile finds your scholarships, your target
            role finds your countries, and the gap between the two builds your skill plan.
          </p>

          <div className="hidden md:block mb-16 max-w-3xl">
            <FlightPath />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {waypoints.map((w, i) => (
              <div
                key={w.n}
                className="card card-interactive card-accent p-7 rise-in"
                style={{ ["--accent" as string]: w.accent, animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="icon-tile" style={{ background: `color-mix(in srgb, ${w.accent} 14%, var(--surface))`, color: w.accent }}>
                    <w.Icon size={22} strokeWidth={1.75} />
                  </span>
                  <span className="ring-badge" style={{ ["--accent" as string]: w.accent }}>{w.n}</span>
                </div>
                <h3 className="font-display text-2xl mb-2.5">{w.title}</h3>
                <p className="text-ink-soft leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-28">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <p className="eyebrow mb-3">Live demand</p>
              <h2 className="font-display text-4xl sm:text-5xl mb-4 text-balance">Where your field is hiring right now</h2>
              <p className="text-ink-soft max-w-xl text-lg leading-relaxed">
                A slice of what the Global Career Advisor tracks — real pay bands and the visa route that goes with each.
              </p>
            </div>
            <Link href="#how-it-works" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-navy shrink-0">
              See full comparison <ArrowRight size={15} strokeWidth={2.25} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((d, i) => (
              <div
                key={d.country}
                className="card card-interactive overflow-hidden rise-in"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div
                  className="h-24 relative flex items-end p-4"
                  style={{ background: d.gradient }}
                >
                  <MapPin size={16} className="absolute top-4 right-4 text-white/70" strokeWidth={2} />
                  <p className="font-display text-xl text-white">{d.country}</p>
                </div>
                <div className="p-5">
                  <p className="text-sm text-ink-soft mb-4">{d.role}</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-sm">
                      <Banknote size={15} style={{ color: d.accent }} strokeWidth={2} />
                      <span className="font-mono">{d.pay}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ShieldCheck size={15} style={{ color: d.accent }} strokeWidth={2} />
                      <span className="text-ink-soft">{d.visa}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="map-texture bg-navy text-white relative overflow-hidden">
          <div className="grain-overlay" aria-hidden />
          <div
            className="glow-blob top-0 left-1/4 w-[28rem] h-[28rem] opacity-15"
            style={{ background: "radial-gradient(circle, var(--teal) 0%, transparent 70%)" }}
            aria-hidden
          />
          <div className="mx-auto max-w-4xl px-6 py-24 relative z-10 text-center">
            <Quote size={36} className="mx-auto mb-6 text-gold" strokeWidth={1.5} />
            <p className="font-display text-2xl sm:text-3xl leading-relaxed text-balance mb-8">
              I had eleven browser tabs open comparing scholarships by hand. NextStep ranked
              everything I actually qualified for in one pass — and the skill roadmap told me
              exactly what to fix before applying.
            </p>
            <div className="flex items-center justify-center gap-3">
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm"
                style={{ background: "color-mix(in srgb, var(--gold) 25%, var(--navy))", color: "var(--gold)" }}
              >
                RA
              </span>
              <div className="text-left">
                <p className="text-sm font-semibold">Rafiul Ahmed</p>
                <p className="text-xs text-white/50">CSE student, matched to a DAAD scholarship</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface border-y border-surface-line relative overflow-hidden">
          <div
            className="glow-blob top-0 right-0 w-[26rem] h-[26rem] opacity-[0.07] -translate-y-1/2"
            style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
            aria-hidden
          />
          <div className="mx-auto max-w-6xl px-6 py-28 relative">
            <p className="eyebrow mb-3">Plans</p>
            <h2 className="font-display text-4xl sm:text-5xl mb-14 text-balance">Start free, upgrade when it counts</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card card-interactive p-9">
                <p className="font-mono text-xs tracking-[0.2em] text-teal uppercase mb-4">Free</p>
                <h3 className="font-display text-3xl mb-6">Get oriented</h3>
                <ul className="space-y-3.5 text-ink-soft">
                  <li className="flex gap-3 items-start">
                    <Check size={18} strokeWidth={2.5} className="text-teal shrink-0 mt-0.5" /> 3 scholarship matches per search
                  </li>
                  <li className="flex gap-3 items-start">
                    <Check size={18} strokeWidth={2.5} className="text-teal shrink-0 mt-0.5" /> Top 3 skills for your target role
                  </li>
                  <li className="flex gap-3 items-start">
                    <Check size={18} strokeWidth={2.5} className="text-teal shrink-0 mt-0.5" /> A quick look at your best-fit countries
                  </li>
                </ul>
              </div>
              <div
                className="card p-9 relative"
                style={{ boxShadow: "var(--shadow-glow-gold)", borderColor: "color-mix(in srgb, var(--gold) 55%, var(--surface-line))" }}
              >
                <span className="stamp absolute -top-4 right-8 bg-surface text-gold" style={{ boxShadow: "var(--shadow-sm)" }}>
                  Most popular
                </span>
                <p className="font-mono text-xs tracking-[0.2em] text-gold uppercase mb-4">Pro</p>
                <h3 className="font-display text-3xl mb-6">Plan the whole route</h3>
                <ul className="space-y-3.5 text-ink-soft">
                  <li className="flex gap-3 items-start">
                    <Check size={18} strokeWidth={2.5} className="text-gold shrink-0 mt-0.5" /> Every scholarship match, fully scored
                  </li>
                  <li className="flex gap-3 items-start">
                    <Check size={18} strokeWidth={2.5} className="text-gold shrink-0 mt-0.5" /> Pay, cost of living, and visa detail for every country
                  </li>
                  <li className="flex gap-3 items-start">
                    <Check size={18} strokeWidth={2.5} className="text-gold shrink-0 mt-0.5" /> Your complete skill roadmap, with resources
                  </li>
                  <li className="flex gap-3 items-start">
                    <Check size={18} strokeWidth={2.5} className="text-gold shrink-0 mt-0.5" /> Deadline tracking with email reminders
                  </li>
                </ul>
                <Link
                  href={session ? "/dashboard" : "/signup"}
                  className="btn btn-primary mt-8 px-6 py-3 text-sm font-semibold w-fit"
                >
                  Start free, upgrade anytime <ArrowRight size={16} strokeWidth={2.25} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-28">
          <p className="eyebrow mb-3 text-center">Questions</p>
          <h2 className="font-display text-4xl sm:text-5xl mb-14 text-balance text-center">Before you start</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="card group">
                <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none font-display text-lg">
                  {f.q}
                  <ChevronDown size={18} className="shrink-0 text-ink-soft transition-transform duration-300 group-open:rotate-180" strokeWidth={2} />
                </summary>
                <p className="px-5 pb-5 text-ink-soft leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-28">
          <div className="card map-texture bg-navy text-white relative overflow-hidden p-12 sm:p-16 text-center">
            <div className="grain-overlay" aria-hidden />
            <div
              className="glow-blob top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] opacity-20"
              style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
              aria-hidden
            />
            <div className="relative z-10">
              <Sparkles size={28} className="mx-auto mb-5 text-gold" strokeWidth={1.5} />
              <h2 className="font-display text-3xl sm:text-4xl mb-5 text-balance max-w-xl mx-auto">
                Your next step is one profile away.
              </h2>
              <p className="text-white/65 text-lg mb-9 max-w-md mx-auto leading-relaxed">
                Free to start, no card needed. See your matches in under two minutes.
              </p>
              <Link
                href={session ? "/dashboard" : "/signup"}
                className="btn btn-gold px-8 py-4 text-base font-semibold"
              >
                {session ? "Go to your dashboard" : "Start free"}
                <ArrowRight size={18} strokeWidth={2.25} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-10 w-full">
        <div className="divider-ornament mb-8"><span className="dot" /></div>
        <div className="flex items-center justify-between flex-wrap gap-3 text-sm text-ink-soft">
          <span className="font-display text-base text-ink">NextStep</span>
          <span>MVP scaffold · Built for the road ahead</span>
        </div>
      </footer>
    </div>
  );
}
