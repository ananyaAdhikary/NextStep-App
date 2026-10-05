import { MarketSignal } from "@/types";
import { fetchAdzunaSignal } from "./adzuna";

// Orchestration point for live market data. Currently just Adzuna, but kept
// as its own module so adding a second provider (e.g. an approved LinkedIn
// or Glassdoor partner feed) is a one-line addition here rather than a
// change everywhere this gets called.
export async function fetchLiveMarketSignal(role: string, country: string): Promise<MarketSignal | null> {
  return fetchAdzunaSignal(role, country);
}
