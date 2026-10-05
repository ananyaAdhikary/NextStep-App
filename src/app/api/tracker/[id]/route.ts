import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { removeTracked } from "@/lib/trackerStore";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  const { id } = await params;
  const ok = removeTracked(id, session.id);
  if (!ok) {
    return NextResponse.json({ error: "Tracked application not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
