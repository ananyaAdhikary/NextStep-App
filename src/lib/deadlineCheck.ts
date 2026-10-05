import { allTracked, markNotified } from "@/lib/trackerStore";
import { findUserById } from "@/lib/userStore";
import { sendDeadlineReminder } from "@/lib/notify";

// Alert thresholds, checked from tightest to loosest so a user who is 2 days
// out (having missed the 7-day and 30-day windows, e.g. because they tracked
// it late) still gets exactly one email, not three.
const THRESHOLDS = [1, 7, 30];

export interface DeadlineCheckReport {
  checked: number;
  notified: number;
  skippedNoUser: number;
  ranAt: string;
}

export async function runDeadlineCheck(): Promise<DeadlineCheckReport> {
  const items = allTracked();
  const now = Date.now();
  let notified = 0;
  let skippedNoUser = 0;

  for (const item of items) {
    const daysLeft = Math.ceil((new Date(item.deadline).getTime() - now) / 86_400_000);
    if (daysLeft < 0) continue;

    const applicable = THRESHOLDS.filter((t) => daysLeft <= t);
    const unnotified = applicable.filter((t) => !item.notifiedThresholds.includes(t));
    if (unnotified.length === 0) continue;

    const user = findUserById(item.userId);
    if (!user) {
      skippedNoUser++;
      continue;
    }

    // Send once per run, worded around the tightest (smallest) threshold
    // that applies -- e.g. someone who starts tracking with 5 days left
    // gets a single "5 days left" email, not three separate 30/7/1 emails.
    await sendDeadlineReminder(user.email, user.name, item.scholarshipName, item.deadline, daysLeft, item.applyUrl);

    // Mark every threshold the current days-left already satisfies, not
    // just the tightest one -- otherwise a coarser threshold (e.g. 30) that
    // was never individually "crossed" stays unmet and fires again later.
    for (const t of applicable) markNotified(item.id, t);
    notified++;
  }

  return { checked: items.length, notified, skippedNoUser, ranAt: new Date().toISOString() };
}
