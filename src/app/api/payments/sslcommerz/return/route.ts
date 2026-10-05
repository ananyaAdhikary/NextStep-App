import { NextRequest, NextResponse } from "next/server";
import { validateSslcommerzTransaction } from "@/lib/payments/sslcommerz";
import { findTransaction } from "@/lib/paymentStore";
import { fulfillTransaction } from "@/lib/payments/fulfill";

// SSLCommerz redirects the customer's browser here via POST after payment.
// The real, trusted fulfillment path is the IPN webhook
// (/api/payments/webhook/sslcommerz), which SSLCommerz calls
// server-to-server — but IPN needs a publicly reachable URL, which
// localhost isn't. So this handler also validates+fulfills opportunistically
// (fulfillTransaction() is idempotent, so it's safe if both fire) purely so
// the flow is testable in local dev. In production, keep both: IPN is the
// one that can't be skipped by an interrupted redirect.
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const tranId = form?.get("tran_id")?.toString();
  const valId = form?.get("val_id")?.toString();

  if (tranId && valId && findTransaction(tranId)) {
    const validation = await validateSslcommerzTransaction(valId);
    if (validation.valid) {
      fulfillTransaction(tranId, valId);
    }
  }

  return NextResponse.redirect(new URL("/dashboard?upgrade=success", req.nextUrl.origin), 303);
}

export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/dashboard?upgrade=success", req.nextUrl.origin), 303);
}
