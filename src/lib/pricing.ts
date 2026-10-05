// Server-side prices. The client never sends an amount — it sends a
// provider + optional discount code, and the checkout route looks up these
// constants and recomputes the final charge itself. This is the one rule
// that actually matters for payment security in this whole feature: a
// tampered client request can pick a bad discount code, never a bad price.

export const PRO_PRICE_USD = 9; // Stripe (international) — monthly, USD
export const PRO_PRICE_BDT = 950; // SSLCommerz (local, Bangladesh) — monthly, BDT

export function priceFor(provider: "stripe" | "sslcommerz"): { amount: number; currency: "USD" | "BDT" } {
  return provider === "stripe" ? { amount: PRO_PRICE_USD, currency: "USD" } : { amount: PRO_PRICE_BDT, currency: "BDT" };
}

export function applyDiscount(amount: number, percentOff: number): number {
  const discounted = amount * (1 - percentOff / 100);
  // Round to 2 decimals; SSLCommerz/Stripe both accept fractional units.
  return Math.round(discounted * 100) / 100;
}
