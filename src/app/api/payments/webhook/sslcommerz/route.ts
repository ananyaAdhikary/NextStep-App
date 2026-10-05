import { NextRequest, NextResponse } from "next/server";
import { validateSslcommerzTransaction } from "@/lib/payments/sslcommerz";
import { findTransaction } from "@/lib/paymentStore";
import { fulfillTransaction } from "@/lib/payments/fulfill";

// SSLCommerz posts form-encoded data to the IPN URL, including val_id and
// tran_id — but per their docs this payload can be spoofed, so it's only
// used to look up which transaction to check, never trusted directly. The
// actual confirmation is the separate validateSslcommerzTransaction() call.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const tranId = form.get("tran_id")?.toString();
  const valId = form.get("val_id")?.toString();

  if (!tranId || !valId) {
    return NextResponse.json({ error: "Missing tran_id/val_id." }, { status: 400 });
  }

  const txn = findTransaction(tranId);
  if (!txn) {
    return NextResponse.json({ error: "Unknown transaction." }, { status: 404 });
  }

  const validation = await validateSslcommerzTransaction(valId);
  if (!validation.valid) {
    return NextResponse.json({ error: "SSLCommerz validation failed." }, { status: 400 });
  }

  // Defense in depth: even a "valid" response must match what we actually
  // charged for, in case the amount was somehow tampered with in transit.
  if (validation.amount !== undefined && Math.abs(validation.amount - txn.amount) > 0.01) {
    return NextResponse.json({ error: "Amount mismatch — refusing to fulfill." }, { status: 400 });
  }

  fulfillTransaction(tranId, valId);
  return NextResponse.json({ received: true });
}
