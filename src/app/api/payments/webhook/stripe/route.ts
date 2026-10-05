import { NextRequest, NextResponse } from "next/server";
import { verifyStripeSignature } from "@/lib/payments/stripe";
import { fulfillTransaction } from "@/lib/payments/fulfill";

// Stripe requires the *raw* request body for signature verification, so
// this reads req.text() rather than req.json() before parsing.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  const isValid = await verifyStripeSignature(rawBody, signature);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const transactionId = session.client_reference_id as string | undefined;
    if (transactionId) {
      fulfillTransaction(transactionId, session.id);
    }
  }

  return NextResponse.json({ received: true });
}
