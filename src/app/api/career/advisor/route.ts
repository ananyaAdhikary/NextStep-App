import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { advisorCareerMarkets } from "@/lib/matching";
import { generateNarrativeSummary } from "@/lib/aiEnrich";
import { trackSearchEvent } from "@/lib/analytics/track";

const schema = z.object({
  degree: z.string().min(1),
  targetRole: z.string().min(1),
  preferredRegion: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  const tier = session?.tier ?? "free";

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check your inputs — degree, target role, and preferred region are required." }, { status: 400 });
  }

  const { results, totalMatches } = await advisorCareerMarkets(parsed.data, tier);

  trackSearchEvent({
    type: "career_search",
    country: parsed.data.preferredRegion,
    subject: parsed.data.degree,
    role: parsed.data.targetRole,
    tier,
    userId: session?.id,
  });

  const summary = await generateNarrativeSummary(
    `A ${parsed.data.degree} graduate targeting a ${parsed.data.targetRole} role, preferring ${parsed.data.preferredRegion}, matched ${totalMatches} countries. Top pick: ${results[0]?.country ?? "none"}. Write one encouraging, specific tip about positioning for that market.`
  );

  return NextResponse.json({
    results,
    totalMatches,
    tier,
    lockedCount: tier === "free" ? Math.max(0, totalMatches - results.length) : 0,
    summary,
  });
}
