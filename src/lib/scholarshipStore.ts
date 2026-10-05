import fs from "fs";
import path from "path";
import { Scholarship } from "@/types";
import seedData from "@/data/scholarships.json";

// File-backed scholarship "database" (same dev-only pattern as userStore.ts).
// Seeded once from the bundled src/data/scholarships.json, then lives at
// data/scholarships.json where refreshScholarships() can update it without a
// redeploy. Production swap-out: back this with Postgres and have
// refreshScholarships() upsert rows instead of rewriting a JSON file.

const DB_PATH = path.join(process.cwd(), "data", "scholarships.json");

function ensureSeeded() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(seedData, null, 2), "utf-8");
  }
}

export function getAllScholarships(): Scholarship[] {
  ensureSeeded();
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as Scholarship[];
  } catch {
    return seedData as Scholarship[];
  }
}

export function upsertScholarships(incoming: Scholarship[]): {
  added: number;
  updated: number;
  total: Scholarship[];
} {
  const existing = getAllScholarships();
  const byId = new Map(existing.map((s) => [s.id, s]));
  let added = 0;
  let updated = 0;

  for (const s of incoming) {
    if (byId.has(s.id)) {
      updated++;
    } else {
      added++;
    }
    byId.set(s.id, s);
  }

  const total = Array.from(byId.values());
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(total, null, 2), "utf-8");

  return { added, updated, total };
}

export function scholarshipsLastRefreshedAt(): string | null {
  ensureSeeded();
  try {
    return fs.statSync(DB_PATH).mtime.toISOString();
  } catch {
    return null;
  }
}
