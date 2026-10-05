import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { generateSkillRoadmap } from "@/lib/matching";
import { generateNarrativeSummary } from "@/lib/aiEnrich";

const schema = z.object({
  fieldOfStudy: z.string().min(1),
  targetRole: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  const tier = session?.tier ?? "free";

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check your inputs — field of study and target role are required." }, { status: 400 });
  }

  const { roadmap, locked } = generateSkillRoadmap(parsed.data, tier);

  if (!roadmap) {
    return NextResponse.json({ roadmap: null, locked: false, summary: null, tier });
  }

  const summary = await generateNarrativeSummary(
    `A ${parsed.data.fieldOfStudy} student targeting a ${parsed.data.targetRole} role wants a skill roadmap. Core skills: ${roadmap.coreSkills.join(", ")}. Write one encouraging, specific tip on where to start this week.`
  );

  return NextResponse.json({ roadmap, locked, tier, summary });
}
