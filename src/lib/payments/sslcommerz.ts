import { CheckoutError, CheckoutParams, CheckoutResult, PaymentProvider } from "./types";

// SSLCommerz is the dominant local payment aggregator in Bangladesh — one
// integration covers bKash, Nagad, Rocket, and local bank cards, which is
// why it's the "local" gateway here rather than any single mobile-money
// provider directly. Direct REST calls (no SDK), same pattern as stripe.ts.
//
// Real limitation, disclosed honestly: this sandbox can't reach
// sslcommerz.com (network egress allowlist), so createCheckout() and
// validateTransaction() below match SSLCommerz's documented API
// (https://developer.sslcommerz.com/doc/v4/) but weren't exercised against
// a live sandbox account from here.

function apiBase() {
  return process.env.SSLCOMMERZ_IS_LIVE === "true"
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";
}

export const sslcommerzProvider: PaymentProvider = {
  id: "sslcommerz",
  label: "bKash / Nagad / Rocket / Local card (SSLCommerz)",
  currency: "BDT",

  configured() {
    return Boolean(process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWORD);
  },

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult | CheckoutError> {
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
    if (!storeId || !storePassword) {
      return { ok: false, error: "SSLCommerz is not configured (SSLCOMMERZ_STORE_ID/PASSWORD missing)." };
    }

    const body = new URLSearchParams({
      store_id: storeId,
      store_passwd: storePassword,
      total_amount: String(params.amount),
      currency: params.currency,
      tran_id: params.transactionId,
      success_url: params.successUrl,
      fail_url: params.cancelUrl,
      cancel_url: params.cancelUrl,
      ipn_url: process.env.SSLCOMMERZ_IPN_URL ?? params.successUrl,
      cus_name: params.customerName,
      cus_email: params.customerEmail,
      cus_add1: "N/A",
      cus_city: "N/A",
      cus_country: "Bangladesh",
      cus_phone: "N/A",
      shipping_method: "NO",
      product_name: "NextStep Pro subscription",
      product_category: "Digital Service",
      product_profile: "non-physical-goods",
    });

    try {
      const res = await fetch(`${apiBase()}/gwprocess/v4/api.php`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const data = await res.json();

      if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
        return { ok: false, error: data?.failedreason || "SSLCommerz session initiation failed." };
      }
      return { ok: true, redirectUrl: data.GatewayPageURL };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "SSLCommerz request failed." };
    }
  },
};

export interface SslcommerzValidation {
  valid: boolean;
  amount?: number;
  currency?: string;
  tranId?: string;
}

/**
 * SSLCommerz's IPN posts back can be spoofed, so per their docs the
 * transaction must always be independently re-verified via this
 * server-to-server validation call before trusting it — never act on the
 * IPN payload alone.
 */
export async function validateSslcommerzTransaction(valId: string): Promise<SslcommerzValidation> {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
  if (!storeId || !storePassword) return { valid: false };

  const url = new URL(`${apiBase()}/validator/api/validationserverAPI.php`);
  url.searchParams.set("val_id", valId);
  url.searchParams.set("store_id", storeId);
  url.searchParams.set("store_passwd", storePassword);
  url.searchParams.set("format", "json");

  try {
    const res = await fetch(url.toString());
    const data = await res.json();
    const ok = data.status === "VALID" || data.status === "VALIDATED";
    return {
      valid: ok,
      amount: ok ? Number(data.amount) : undefined,
      currency: ok ? data.currency : undefined,
      tranId: ok ? data.tran_id : undefined,
    };
  } catch {
    return { valid: false };
  }
}
