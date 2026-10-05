import fs from "fs";
import path from "path";
import { TrackedApplication } from "@/types";

// Same dev-only file-backed pattern as userStore.ts / scholarshipStore.ts.
// Production swap-out: a `tracked_applications` table keyed by (userId,
// scholarshipId), with a unique constraint to prevent duplicate tracking.

const DB_PATH = path.join(process.cwd(), "data", "tracked-applications.json");

function readAll(): TrackedApplication[] {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as TrackedApplication[];
  } catch {
    return [];
  }
}

function writeAll(items: TrackedApplication[]) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2), "utf-8");
}

export function listForUser(userId: string): TrackedApplication[] {
  return readAll()
    .filter((a) => a.userId === userId)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
}

export function addTracked(item: TrackedApplication): TrackedApplication | null {
  const items = readAll();
  const dup = items.some((i) => i.userId === item.userId && i.scholarshipId === item.scholarshipId);
  if (dup) return null;
  items.push(item);
  writeAll(items);
  return item;
}

export function removeTracked(id: string, userId: string): boolean {
  const items = readAll();
  const idx = items.findIndex((i) => i.id === id && i.userId === userId);
  if (idx === -1) return false;
  items.splice(idx, 1);
  writeAll(items);
  return true;
}

export function allTracked(): TrackedApplication[] {
  return readAll();
}

export function markNotified(id: string, threshold: number) {
  const items = readAll();
  const item = items.find((i) => i.id === id);
  if (!item) return;
  if (!item.notifiedThresholds.includes(threshold)) {
    item.notifiedThresholds.push(threshold);
    writeAll(items);
  }
}
