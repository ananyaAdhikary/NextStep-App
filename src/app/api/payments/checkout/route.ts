import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { getPaymentProvider } from "@/lib/payments";
import { priceFor, applyDiscount } from "@/lib/pricing";
import { validateDiscountCode } from "@/lib/discounts";
import { createTransaction } from "@/lib/paymentStore";

const schema = z.object({
  provider: z.enum(["stripe", "sslcommerz"]),
  discountCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a payment method." }, { status: 400 });
  }

  const { provider: providerId, discountCode } = parsed.data;
  const provider = getPaymentProvider(providerId);

  if (!provider.configured()) {
    return NextResponse.json(
      {
        error: `${provider.label} isn't configured on this server yet. See README "Payments" for the required environment variables.`,
      },
      { status: 503 }
    );
  }

  // Price is always looked up server-side from pricing.ts, never taken from
  // the request — the client only ever chooses *which* provider/discount,
  // never *how much*.
  const { amount: listedAmount, currency } = priceFor(providerId);
  const discount = validateDiscountCode(discountCode, session.id);
  if (discountCode && !discount.valid) {
    return NextResponse.json({ error: discount.reason ?? "Invalid discount code." }, { status: 400 });
  }
  const amount = discount.valid ? applyDiscount(listedAmount, discount.percentOff) : listedAmount;

  const transactionId = `txn_${crypto.randomUUID()}`;
  createTransaction({
    id: transactionId,
    userId: session.id,
    provider: providerId,
    currency,
    listedAmount,
    discountCode: discount.valid ? discountCode : undefined,
    discountPct: discount.valid ? discount.percentOff : undefined,
    amount,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  const origin = req.nextUrl.origin;
  const result = await provider.createCheckout({
    transactionId,
    amount,
    currency,
    customerName: session.name,
    customerEmail: session.email,
    successUrl:
      providerId === "sslcommerz"
        ? `${origin}/api/payments/sslcommerz/return`
        : `${origin}/dashboard?upgrade=success`,
    cancelUrl: `${origin}/dashboard?upgrade=cancelled`,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ redirectUrl: result.redirectUrl, transactionId, amount, currency });
}
