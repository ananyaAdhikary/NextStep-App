import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createUser, findUserByEmail } from "@/lib/userStore";
import { setSessionCookie } from "@/lib/auth";
import { generateReferralCode, resolveReferrer } from "@/lib/referrals";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid name, email, and an 8+ character password." }, { status: 400 });
  }

  const { name, email, password, referralCode } = parsed.data;

  if (findUserByEmail(email)) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const referrer = resolveReferrer(referralCode);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = createUser({
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash,
    tier: "free",
    referralCode: generateReferralCode(name),
    referredBy: referrer?.id,
    referralConversions: 0,
    createdAt: new Date().toISOString(),
  });

  await setSessionCookie({ id: user.id, name: user.name, email: user.email, tier: user.tier });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, tier: user.tier });
}
