import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { findUserByEmail } from "@/lib/userStore";
import { setSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = findUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "No account matches that email and password." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "No account matches that email and password." }, { status: 401 });
  }

  await setSessionCookie({ id: user.id, name: user.name, email: user.email, tier: user.tier });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, tier: user.tier });
}
