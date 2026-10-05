import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { listForUser, addTracked } from "@/lib/trackerStore";

const schema = z.object({
  scholarshipId: z.string().min(1),
  scholarshipName: z.string().min(1),
  country: z.string().min(1),
  deadline: z.string().min(1),
  applyUrl: z.string().url(),
});

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  return NextResponse.json({ items: listForUser(session.id) });
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  if (session.tier !== "pro") {
    return NextResponse.json({ error: "Application tracking is a Pro feature." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing or invalid scholarship details." }, { status: 400 });
  }

  const item = addTracked({
    id: crypto.randomUUID(),
    userId: session.id,
    ...parsed.data,
    notifiedThresholds: [],
    createdAt: new Date().toISOString(),
  });

  if (!item) {
    return NextResponse.json({ error: "You're already tracking this scholarship." }, { status: 409 });
  }

  return NextResponse.json({ item });
}
