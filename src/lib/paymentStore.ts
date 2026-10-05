import fs from "fs";
import path from "path";
import { Transaction } from "@/types";

// Same dev-only file-backed pattern as userStore.ts. Production swap-out: a
// `transactions` table; the shape here already matches what you'd want as
// columns, including the provider reference for reconciliation.

const DB_PATH = path.join(process.cwd(), "data", "transactions.json");

function readAll(): Transaction[] {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as Transaction[];
  } catch {
    return [];
  }
}

function writeAll(rows: Transaction[]) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(rows, null, 2), "utf-8");
}

export function createTransaction(t: Transaction): Transaction {
  const rows = readAll();
  rows.push(t);
  writeAll(rows);
  return t;
}

export function findTransaction(id: string): Transaction | undefined {
  return readAll().find((t) => t.id === id);
}

export function updateTransaction(id: string, patch: Partial<Transaction>): Transaction | undefined {
  const rows = readAll();
  const idx = rows.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  rows[idx] = { ...rows[idx], ...patch };
  writeAll(rows);
  return rows[idx];
}

export function completedTransactionCountForUser(userId: string): number {
  return readAll().filter((t) => t.userId === userId && t.status === "completed").length;
}

export function listTransactionsForUser(userId: string): Transaction[] {
  return readAll()
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
