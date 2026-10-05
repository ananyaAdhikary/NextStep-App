import { MarketSignal } from "@/types";

// Adzuna is the live data source here because it's the one major job-market
// provider with a genuinely public, self-serve, documented API (free tier,
// ~1,000 calls/month, https://developer.adzuna.com). LinkedIn Talent
// Insights and Glassdoor do NOT offer a comparable public API -- LinkedIn's
// is enterprise/partner-gated and Glassdoor discontinued its public
// developer API. If your org gets approved partner access to either, add a
// sibling file here implementing the same fetchMarketSignal() shape and
// register it in ./index.ts -- nothing else in the app needs to change.

const ADZUNA_COUNTRY_CODES: Record<string, string> = {
  "United States": "us",
  "United Kingdom": "gb",
  Germany: "de",
  Canada: "ca",
  Australia: "au",
  Netherlands: "nl",
  Ireland: "ie",
  France: "fr",
  Italy: "it",
  Spain: "es",
  Poland: "pl",
  India: "in",
  Brazil: "br",
  "New Zealand": "nz",
};

export function adzunaCountryCode(country: string): string | null {
  return ADZUNA_COUNTRY_CODES[country] ?? null;
}

export async function fetchAdzunaSignal(role: string, country: string): Promise<MarketSignal | null> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return null;

  const code = adzunaCountryCode(country);
  if (!code) return null;

  try {
    const [salaryRes, searchRes] = await Promise.all([
      fetch(
        `https://api.adzuna.com/v1/api/salary/${code}/history?app_id=${appId}&app_key=${appKey}&title_only=${encodeURIComponent(role)}`
      ),
      fetch(
        `https://api.adzuna.com/v1/api/jobs/${code}/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(role)}&results_per_page=1`
      ),
    ]);

    let avgSalaryLocal: number | null = null;
    if (salaryRes.ok) {
      const salaryData = await salaryRes.json();
      const months = salaryData?.month ? (Object.values(salaryData.month) as number[]) : [];
      if (months.length) avgSalaryLocal = Math.round(months[months.length - 1]);
    }

    let vacancyCount: number | null = null;
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      vacancyCount = typeof searchData?.count === "number" ? searchData.count : null;
    }

    if (avgSalaryLocal === null && vacancyCount === null) return null;

    return { source: "adzuna", avgSalaryLocal, vacancyCount, asOf: new Date().toISOString() };
  } catch {
    return null;
  }
}
