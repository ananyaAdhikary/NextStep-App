import Link from "next/link";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export default function SignInPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex map-texture bg-navy text-white flex-col justify-center px-16 relative overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
          aria-hidden
        />
        <p className="font-display text-2xl mb-8 relative">NextStep</p>
        <h2 className="font-display text-4xl leading-tight mb-4 max-w-sm relative text-balance">
          Welcome back.
        </h2>
        <p className="text-white/70 max-w-xs relative leading-relaxed">
          Pick up right where you left off — your matches, your roadmap, your deadlines.
        </p>
      </div>

      <div className="flex items-center justify-center bg-paper px-6 py-16">
        <div className="w-full max-w-sm card p-8 rise-in">
          <Link href="/" className="font-display text-xl lg:hidden">
            NextStep
          </Link>
          <h1 className="font-display text-3xl mt-6 lg:mt-0 mb-1.5">Welcome back</h1>
          <p className="text-ink-soft text-sm mb-8">Pick up right where you left off.</p>
          <Suspense fallback={null}>
            <AuthForm mode="signin" />
          </Suspense>
          <p className="text-sm text-ink-soft mt-6">
            New here?{" "}
            <Link href="/signup" className="text-navy underline decoration-gold underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
