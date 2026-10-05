import { AnalyticsEvent, AnalyticsEventType, Tier } from "@/types";
import { recordEvent, readEvents } from "./store";

function normalizeLabel(s: string): string {
  return s.trim();
}

/**
 * Fire-and-forget: called from the scholarship/career search API routes
 * right after a match is computed. Tracks what students are *searching
 * for* (target country + field/role) as the demand signal — not just what
 * they end up matching into — since that's the direct answer to "which
 * countries and subjects are in high demand."
 */
export function trackSearchEvent(params: {
  type: AnalyticsEventType;
  country: string;
  subject: string;
  role?: string;
  tier: Tier;
  userId?: string;
}) {
  // "Any" is a real, meaningful search choice (unfiltered), so it's kept
  // as-is rather than dropped — the analytics view can filter it out
  // itself if a specific-countries-only view is wanted.
  const event: AnalyticsEvent = {
    type: params.type,
    country: normalizeLabel(params.country),
    subject: normalizeLabel(params.subject),
    role: params.role ? normalizeLabel(params.role) : undefined,
    tier: params.tier,
    userId: params.userId,
    createdAt: new Date().toISOString(),
  };
  try {
    recordEvent(event);
  } catch {
    // Analytics is best-effort — a write failure here must never break the
    // actual search response the user is waiting on.
  }
}

export interface RankedCount {
  label: string;
  count: number;
}

export interface AnalyticsSummary {
  totalSearches: number;
  scholarshipSearches: number;
  careerSearches: number;
  topCountries: RankedCount[];
  topSubjects: RankedCount[];
  topRoles: RankedCount[];
  windowDays: number | "all-time";
}

function rank(values: string[], limit: number): RankedCount[] {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Aggregates raw events into the top countries/subjects/roles, optionally windowed to the last `sinceDays` days. */
export function summarizeAnalytics(sinceDays?: number, limit = 10): AnalyticsSummary {
  const events = readEvents(sinceDays);
  const countries = events.map((e) => e.country).filter((c) => c.toLowerCase() !== "any");
  const subjects = events.map((e) => e.subject);
  const roles = events.filter((e) => e.role).map((e) => e.role as string);

  return {
    totalSearches: events.length,
    scholarshipSearches: events.filter((e) => e.type === "scholarship_search").length,
    careerSearches: events.filter((e) => e.type === "career_search").length,
    topCountries: rank(countries, limit),
    topSubjects: rank(subjects, limit),
    topRoles: rank(roles, limit),
    windowDays: sinceDays ?? "all-time",
  };
}
