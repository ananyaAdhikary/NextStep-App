import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createDiscountCode, listAllDiscountCodes } from "@/lib/discountStore";

function isAuthorized(req: NextRequest): boolean {
  if (!process.env.ADMIN_API_KEY) return false;
  return req.headers.get("x-admin-key") === process.env.ADMIN_API_KEY;
}

const schema = z.object({
  code: z.string().min(3).max(32),
  percentOff: z.number().min(1).max(100),
  singleUse: z.boolean().default(true),
  expiresAt: z.string().optional(),
});

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ codes: listAllDiscountCodes() });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "code, percentOff (1-100) are required." }, { status: 400 });
  }

  try {
    const created = createDiscountCode({
      code: parsed.data.code.toUpperCase(),
      percentOff: parsed.data.percentOff,
      source: "promo",
      singleUse: parsed.data.singleUse,
      expiresAt: parsed.data.expiresAt,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ created }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to create code." }, { status: 409 });
  }
}
