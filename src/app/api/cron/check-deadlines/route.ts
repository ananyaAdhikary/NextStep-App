import { NextRequest, NextResponse } from "next/server";
import { runDeadlineCheck } from "@/lib/deadlineCheck";

// Trigger this on a schedule (Vercel Cron, GitHub Actions cron, a plain
// server crontab hitting curl -- whatever your host supports). Protected by
// a shared secret rather than a user session since it's meant to be called
// by infrastructure, not a browser. See README for exact setup.
async function handle(req: NextRequest) {
  if (process.env.CRON_SECRET) {
    const provided = req.headers.get("x-cron-secret");
    if (provided !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  const report = await runDeadlineCheck();
  return NextResponse.json(report);
}

export const POST = handle;
export const GET = handle;
