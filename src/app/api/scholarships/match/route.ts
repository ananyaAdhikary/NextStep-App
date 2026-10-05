import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { matchScholarships } from "@/lib/matching";
import { generateNarrativeSummary } from "@/lib/aiEnrich";
import { trackSearchEvent } from "@/lib/analytics/track";

const schema = z.object({
  cgpa: z.coerce.number().min(0).max(4),
  fieldOfStudy: z.string().min(1),
  targetCountry: z.string().min(1),
  annualBudgetUSD: z.coerce.number().min(0),
  ielts: z.coerce.number().optional(),
  toefl: z.coerce.number().optional(),
  gre: z.coerce.number().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  const tier = session?.tier ?? "free";

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check your inputs — CGPA, field of study, target country, and budget are required." }, { status: 400 });
  }

  const { results, totalMatches } = matchScholarships(parsed.data, tier);

  trackSearchEvent({
    type: "scholarship_search",
    country: parsed.data.targetCountry,
    subject: parsed.data.fieldOfStudy,
    tier,
    userId: session?.id,
  });

  const summary = await generateNarrativeSummary(
    `A student with CGPA ${parsed.data.cgpa} in ${parsed.data.fieldOfStudy}, budget $${parsed.data.annualBudgetUSD}/yr, targeting ${parsed.data.targetCountry}, matched ${totalMatches} scholarships. Top pick: ${results[0]?.name ?? "none"}. Write one encouraging, specific tip for their application strategy.`
  );

  return NextResponse.json({
    results,
    totalMatches,
    tier,
    lockedCount: tier === "free" ? Math.max(0, totalMatches - results.length) : 0,
    summary,
  });
}
