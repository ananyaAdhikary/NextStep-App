import Link from "next/link";
import { SessionUser } from "@/types";
import SignOutButton from "./SignOutButton";

export default function SiteNav({ session }: { session: SessionUser | null }) {
  return (
    <header className="border-b border-surface-line glass-surface sticky top-0 z-20">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="9.5" stroke="var(--gold)" strokeWidth="1.5" />
            <path d="M11 3.5C11 3.5 14.5 7 14.5 11C14.5 15 11 18.5 11 18.5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="11" cy="11" r="1.75" fill="var(--gold)" />
          </svg>
          <span className="font-display text-xl tracking-tight">NextStep</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {session ? (
            <>
              <Link href="/dashboard" className="text-ink-soft hover:text-ink transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/referrals" className="text-ink-soft hover:text-ink transition-colors">
                Referrals
              </Link>
              <span
                className="pill font-semibold"
                style={
                  session.tier === "pro"
                    ? { color: "var(--gold)", borderColor: "color-mix(in srgb, var(--gold) 55%, var(--surface-line))", background: "color-mix(in srgb, var(--gold) 8%, var(--surface))" }
                    : undefined
                }
              >
                {session.tier === "pro" ? "PRO" : "FREE"}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/signin" className="text-ink-soft hover:text-ink transition-colors">
                Sign in
              </Link>
              <Link href="/signup" className="btn btn-primary px-4 py-2 text-sm">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
