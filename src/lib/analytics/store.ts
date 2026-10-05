import fs from "fs";
import path from "path";
import { AnalyticsEvent } from "@/types";

// Same dev-only file-backed pattern as userStore.ts. Deliberately capped
// (MAX_EVENTS) rather than growing forever — a real analytics pipeline
// (PostHog, Mixpanel, or a Postgres table with a nightly rollup job) is the
// production swap-out; this file just needs to survive an MVP demo without
// silently filling the disk.

const DB_PATH = path.join(process.cwd(), "data", "analytics-events.json");
const MAX_EVENTS = 20_000;

function readAll(): AnalyticsEvent[] {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as AnalyticsEvent[];
  } catch {
    return [];
  }
}

function writeAll(events: AnalyticsEvent[]) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(events, null, 2), "utf-8");
}

export function recordEvent(event: AnalyticsEvent) {
  const events = readAll();
  events.push(event);
  // Trim oldest first — keep the most recent MAX_EVENTS.
  const trimmed = events.length > MAX_EVENTS ? events.slice(events.length - MAX_EVENTS) : events;
  writeAll(trimmed);
}

export function readEvents(sinceDays?: number): AnalyticsEvent[] {
  const events = readAll();
  if (!sinceDays) return events;
  const cutoff = Date.now() - sinceDays * 86_400_000;
  return events.filter((e) => new Date(e.createdAt).getTime() >= cutoff);
}
