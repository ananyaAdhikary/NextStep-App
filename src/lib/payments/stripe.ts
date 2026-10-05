import { CheckoutError, CheckoutParams, CheckoutResult, PaymentProvider } from "./types";

// Direct REST calls rather than the `stripe` npm package — same
// dependency-light pattern as notify.ts (Resend) and marketData/adzuna.ts:
// one `fetch` call, no SDK to keep in sync with API version changes.
//
// Real limitation, disclosed honestly: this sandbox's network egress is
// restricted to a small domain allowlist (npm/github/pypi, no api.stripe.com),
// so createCheckout() below could not be exercised against the live API from
// here. The request shape matches Stripe's documented Checkout Sessions API
// (https://docs.stripe.com/api/checkout/sessions/create) — verify with a
// real test-mode secret key before relying on it.

const STRIPE_API = "https://api.stripe.com/v1/checkout/sessions";

export const stripeProvider: PaymentProvider = {
  id: "stripe",
  label: "Card (Stripe — international)",
  currency: "USD",

  configured() {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  },

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult | CheckoutError> {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return { ok: false, error: "Stripe is not configured (STRIPE_SECRET_KEY missing)." };
    }

    const body = new URLSearchParams();
    body.set("mode", "payment");
    body.set("success_url", `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}`);
    body.set("cancel_url", params.cancelUrl);
    body.set("client_reference_id", params.transactionId);
    body.set("customer_email", params.customerEmail);
    body.set("line_items[0][quantity]", "1");
    body.set("line_items[0][price_data][currency]", params.currency.toLowerCase());
    body.set("line_items[0][price_data][unit_amount]", String(Math.round(params.amount * 100)));
    body.set("line_items[0][price_data][product_data][name]", "NextStep Pro — monthly");

    try {
      const res = await fetch(STRIPE_API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data?.error?.message ?? `Stripe responded with ${res.status}.` };
      }
      return { ok: true, redirectUrl: data.url };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Stripe request failed." };
    }
  },
};

/**
 * Verifies a Stripe webhook signature (the `Stripe-Signature` header) by
 * hand — Stripe signs `${timestamp}.${rawBody}` with HMAC-SHA256 using the
 * webhook signing secret. Implemented without the SDK for the same reason
 * as above; matches Stripe's documented verification algorithm
 * (https://docs.stripe.com/webhooks#verify-manually).
 */
export async function verifyStripeSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((kv) => {
      const [k, v] = kv.split("=");
      return [k, v];
    })
  );
  const timestamp = parts.t;
  const expectedSig = parts.v1;
  if (!timestamp || !expectedSig) return false;

  const crypto = await import("crypto");
  const signedPayload = `${timestamp}.${rawBody}`;
  const computed = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

  // Constant-time comparison to avoid a timing side-channel.
  const a = Buffer.from(computed);
  const b = Buffer.from(expectedSig);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
