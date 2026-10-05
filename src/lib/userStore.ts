import fs from "fs";
import path from "path";
import { User } from "@/types";

// NOTE (MVP scaffold): this reads/writes a JSON file on disk so the app is
// runnable with zero external services. It is NOT safe for production or for
// multi-instance deployments (no locking, no concurrency control, and most
// serverless hosts have a read-only filesystem outside /tmp).
//
// Swap-out path for production: replace every function in this file with
// calls to Postgres (e.g. via Prisma or Drizzle) per the schema in
// prisma/schema.prisma.example — the function signatures below are already
// shaped like a repository layer so callers won't need to change.

const DB_PATH = path.join(process.cwd(), "data", "users.json");

function readAll(): User[] {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

function writeAll(users: User[]) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), "utf-8");
}

export function findUserByEmail(email: string): User | undefined {
  return readAll().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  return readAll().find((u) => u.id === id);
}

export function findUserByReferralCode(code: string): User | undefined {
  return readAll().find((u) => u.referralCode.toLowerCase() === code.toLowerCase());
}

export function countReferredUsers(referrerId: string): number {
  return readAll().filter((u) => u.referredBy === referrerId).length;
}

export function createUser(user: User): User {
  const users = readAll();
  users.push(user);
  writeAll(users);
  return user;
}

export function updateUser(id: string, patch: Partial<User>): User | undefined {
  const users = readAll();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return undefined;
  users[idx] = { ...users[idx], ...patch };
  writeAll(users);
  return users[idx];
}
