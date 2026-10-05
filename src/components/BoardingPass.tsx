export default function BoardingPass() {
  return (
    <div className="relative rise-in max-w-md w-full" style={{ animationDelay: "0.1s" }}>
      <div
        className="glow-blob -inset-6 opacity-30"
        style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 65%)" }}
        aria-hidden
      />
      <div className="ticket shine-sweep transform rotate-1 relative" style={{ boxShadow: "var(--shadow-lg)" }}>
      <div className="p-6 pb-5">
        <div className="flex items-center justify-between mb-6">
          <span className="font-display text-lg text-navy tracking-tight">NextStep</span>
          <span className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">
            Boarding Pass · No. 001
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.15em] text-ink-soft uppercase mb-1">Field of study</p>
            <p className="font-display text-2xl leading-tight">Computer Science</p>
          </div>
          <svg width="28" height="16" viewBox="0 0 28 16" fill="none" aria-hidden className="text-gold shrink-0">
            <path d="M1 8H26M26 8L19 1M26 8L19 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="text-right">
            <p className="font-mono text-[10px] tracking-[0.15em] text-ink-soft uppercase mb-1">Destination</p>
            <p className="font-display text-2xl leading-tight">Germany</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div>
            <p className="font-mono text-[10px] tracking-[0.15em] text-ink-soft uppercase mb-1">Role</p>
            <p className="font-mono text-sm">Software Eng.</p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.15em] text-ink-soft uppercase mb-1">Match</p>
            <p className="font-mono text-sm text-teal">94%</p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.15em] text-ink-soft uppercase mb-1">Status</p>
            <p className="font-mono text-sm text-gold">Eligible</p>
          </div>
        </div>
      </div>

      <div className="ticket-perforation flex items-center justify-between px-6 py-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.15em] text-ink-soft uppercase mb-1">Scholarship</p>
          <p className="font-display text-base">DAAD EPOS</p>
        </div>
        <div className="ticket-barcode w-20 h-8" aria-hidden />
      </div>
      </div>
      <div
        className="stamp absolute -bottom-5 -right-4 bg-surface text-teal rotate-[-10deg]"
        style={{ boxShadow: "var(--shadow-md)" }}
      >
        Matched ✓
      </div>
    </div>
  );
}
