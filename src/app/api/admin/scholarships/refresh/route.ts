import { NextRequest, NextResponse } from "next/server";
import { refreshScholarships } from "@/lib/ingestion/refresh";

// Triggers the scholarship ingestion pipeline (see lib/ingestion). Point
// this at a schedule the same way as /api/cron/check-deadlines. Protected
// by ADMIN_API_KEY since it writes to the scholarship dataset.
export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { error: "ADMIN_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }
  const provided = req.headers.get("x-admin-key");
  if (provided !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await refreshScholarships();
  return NextResponse.json(report);
}
