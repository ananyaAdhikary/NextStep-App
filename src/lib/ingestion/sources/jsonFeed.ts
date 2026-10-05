import { Scholarship } from "@/types";
import { IngestionSource } from "../types";

// Pulls scholarships from any externally-hosted JSON feed that already
// matches our Scholarship shape -- e.g. an export from your own scraper, a
// partner data-sharing agreement, or a spreadsheet published as JSON.
//
// Deliberately NOT included: a hardcoded scraper for a specific third-party
// site. Scraping arbitrary scholarship databases without checking their
// robots.txt / terms of service is a real legal and reputational risk, and a
// scraper written against one site's HTML breaks the moment that site
// redesigns. This feed-based approach is the same integration point a real
// scraper *would* write into -- run your scraper as its own job (cron,
// GitHub Action, whatever), have it emit JSON in this shape, publish it
// somewhere reachable, and point SCHOLARSHIP_FEED_URLS at it.
export function jsonFeedSource(url: string): IngestionSource {
  return {
    name: `json-feed:${url}`,
    async fetch() {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        throw new Error(`Feed ${url} responded with ${res.status}`);
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error(`Feed ${url} did not return a JSON array`);
      }
      return data as Scholarship[];
    },
  };
}

export function jsonFeedSourcesFromEnv(): IngestionSource[] {
  const raw = process.env.SCHOLARSHIP_FEED_URLS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean)
    .map(jsonFeedSource);
}
