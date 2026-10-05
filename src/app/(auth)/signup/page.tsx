import Link from "next/link";
import { Suspense } from "react";
import { GraduationCap, Globe2, TrendingUp } from "lucide-react";
import AuthForm from "@/components/AuthForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex map-texture bg-navy text-white flex-col justify-center px-16 relative overflow-hidden">
        <div
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--teal) 0%, transparent 70%)" }}
          aria-hidden
        />
        <p className="font-display text-2xl mb-8 relative">NextStep</p>
        <h2 className="font-display text-4xl leading-tight mb-6 max-w-sm relative text-balance">
          Your route abroad starts with one profile.
        </h2>
        <ul className="space-y-4 text-white/70 relative">
          <li className="flex items-center gap-3"><GraduationCap size={18} className="text-gold-soft shrink-0" /> Real scholarships, ranked for you</li>
          <li className="flex items-center gap-3"><Globe2 size={18} className="text-gold-soft shrink-0" /> Countries hiring for your role</li>
          <li className="flex items-center gap-3"><TrendingUp size={18} className="text-gold-soft shrink-0" /> A skill plan to close the gap</li>
        </ul>
      </div>

      <div className="flex items-center justify-center bg-paper px-6 py-16">
        <div className="w-full max-w-sm card p-8 rise-in">
          <Link href="/" className="font-display text-xl lg:hidden">
            NextStep
          </Link>
          <h1 className="font-display text-3xl mt-6 lg:mt-0 mb-1.5">Create your account</h1>
          <p className="text-ink-soft text-sm mb-8">Free to start. Upgrade to Pro whenever you&apos;re ready.</p>
          <Suspense fallback={null}>
            <AuthForm mode="signup" />
          </Suspense>
          <p className="text-sm text-ink-soft mt-6">
            Already have an account?{" "}
            <Link href="/signin" className="text-navy underline decoration-gold underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
