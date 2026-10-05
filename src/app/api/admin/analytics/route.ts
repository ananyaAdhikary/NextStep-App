import { NextRequest, NextResponse } from "next/server";
import { summarizeAnalytics } from "@/lib/analytics/track";

// Same x-admin-key convention as /api/admin/scholarships/refresh — no
// separate admin role on User yet (see README), so this reuses
// ADMIN_API_KEY rather than adding a second auth mechanism.
export async function GET(req: NextRequest) {
  if (!process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "ADMIN_API_KEY is not configured on the server." }, { status: 500 });
  }
  const provided = req.headers.get("x-admin-key") ?? req.nextUrl.searchParams.get("key");
  if (provided !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const windowParam = req.nextUrl.searchParams.get("days");
  const sinceDays = windowParam ? Number(windowParam) : 30;

  const summary = summarizeAnalytics(Number.isFinite(sinceDays) && sinceDays > 0 ? sinceDays : undefined);
  return NextResponse.json(summary);
}
