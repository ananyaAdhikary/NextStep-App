import { upsertScholarships } from "@/lib/scholarshipStore";
import { jsonFeedSourcesFromEnv } from "./sources/jsonFeed";
import { IngestionSource } from "./types";
import { Scholarship } from "@/types";

export interface RefreshReport {
  sourcesRun: string[];
  sourcesFailed: { name: string; error: string }[];
  added: number;
  updated: number;
  totalAfter: number;
  ranAt: string;
}

export async function refreshScholarships(extraSources: IngestionSource[] = []): Promise<RefreshReport> {
  const sources = [...jsonFeedSourcesFromEnv(), ...extraSources];
  const sourcesRun: string[] = [];
  const sourcesFailed: { name: string; error: string }[] = [];
  let incoming: Scholarship[] = [];

  for (const source of sources) {
    try {
      const items = await source.fetch();
      incoming = incoming.concat(items);
      sourcesRun.push(source.name);
    } catch (err) {
      sourcesFailed.push({
        name: source.name,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const { added, updated, total } = upsertScholarships(incoming);

  return {
    sourcesRun,
    sourcesFailed,
    added,
    updated,
    totalAfter: total.length,
    ranAt: new Date().toISOString(),
  };
}
