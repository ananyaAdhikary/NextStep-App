import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, setSessionCookie } from "@/lib/auth";
import { findUserById } from "@/lib/userStore";
import { createTransaction } from "@/lib/paymentStore";
import { fulfillTransaction } from "@/lib/payments/fulfill";
import { validateDiscountCode } from "@/lib/discounts";
import { priceFor, applyDiscount } from "@/lib/pricing";

// Dev-only convenience: simulates a completed payment without a real
// charge, so the rest of the app (tier gating, referral rewards, discount
// redemption) can be built and demoed without Stripe/SSLCommerz keys
// configured. Deliberately routed through the *same* fulfillTransaction()
// used by the real webhooks — not a separate "just set tier=pro" shortcut —
// so referral rewards and discount-code redemption actually fire the same
// way here as they would from a real payment. Disabled once a real
// provider is configured in production, so it can't be used to skip an
// actual charge.
export async function POST(req: NextRequest) {
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  const sslcommerzConfigured = Boolean(process.env.SSLCOMMERZ_STORE_ID);
  if (process.env.NODE_ENV === "production" && (stripeConfigured || sslcommerzConfigured)) {
    return NextResponse.json(
      { error: "A real payment provider is configured — use /api/payments/checkout instead." },
      { status: 403 }
    );
  }

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const discountCode: string | undefined = body?.discountCode;

  const { amount: listedAmount, currency } = priceFor("stripe");
  const discount = validateDiscountCode(discountCode, session.id);
  const amount = discount.valid ? applyDiscount(listedAmount, discount.percentOff) : listedAmount;

  const transactionId = `txn_dev_${crypto.randomUUID()}`;
  createTransaction({
    id: transactionId,
    userId: session.id,
    provider: "stripe",
    currency,
    listedAmount,
    discountCode: discount.valid ? discountCode : undefined,
    discountPct: discount.valid ? discount.percentOff : undefined,
    amount,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  const result = fulfillTransaction(transactionId, "dev-simulated");
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 404 });
  }

  const updated = findUserById(session.id);
  if (!updated) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  await setSessionCookie({ id: updated.id, name: updated.name, email: updated.email, tier: updated.tier });

  return NextResponse.json({ tier: updated.tier });
}
