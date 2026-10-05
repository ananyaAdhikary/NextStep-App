import fs from "fs";
import path from "path";
import { DiscountCode } from "@/types";

// Same dev-only file-backed pattern as userStore.ts. Production swap-out: a
// `discount_codes` table with a unique constraint on `code`.

const DB_PATH = path.join(process.cwd(), "data", "discount-codes.json");

function readAll(): DiscountCode[] {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as DiscountCode[];
  } catch {
    return [];
  }
}

function writeAll(codes: DiscountCode[]) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(codes, null, 2), "utf-8");
}

export function findDiscountCode(code: string): DiscountCode | undefined {
  return readAll().find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
}

export function listDiscountCodesForOwner(ownerUserId: string): DiscountCode[] {
  return readAll()
    .filter((c) => c.ownerUserId === ownerUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createDiscountCode(code: DiscountCode): DiscountCode {
  const codes = readAll();
  if (codes.some((c) => c.code.toLowerCase() === code.code.toLowerCase())) {
    throw new Error(`Discount code "${code.code}" already exists.`);
  }
  codes.push(code);
  writeAll(codes);
  return code;
}

export function markDiscountCodeRedeemed(code: string, userId: string) {
  const codes = readAll();
  const found = codes.find((c) => c.code.toLowerCase() === code.toLowerCase());
  if (!found) return;
  found.redeemedByUserId = userId;
  found.redeemedAt = new Date().toISOString();
  writeAll(codes);
}

export function listAllDiscountCodes(): DiscountCode[] {
  return readAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
