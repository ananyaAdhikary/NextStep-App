import { findDiscountCode } from "@/lib/discountStore";

export interface DiscountValidation {
  valid: boolean;
  percentOff: number;
  reason?: string;
}

/**
 * Validates a discount code against expiry, single-use, and
 * cannot-redeem-your-own-referral-code rules. Server-side only — never
 * trust a percentOff the client sends, always recompute from this.
 */
export function validateDiscountCode(code: string | undefined, userId: string): DiscountValidation {
  if (!code) return { valid: false, percentOff: 0 };

  const found = findDiscountCode(code);
  if (!found) return { valid: false, percentOff: 0, reason: "That code doesn't exist." };

  if (found.singleUse && found.redeemedByUserId) {
    return { valid: false, percentOff: 0, reason: "That code has already been used." };
  }

  if (found.expiresAt && new Date(found.expiresAt).getTime() < Date.now()) {
    return { valid: false, percentOff: 0, reason: "That code has expired." };
  }

  if (found.source === "referral" && found.ownerUserId === userId) {
    return { valid: false, percentOff: 0, reason: "You can't redeem your own referral reward." };
  }

  return { valid: true, percentOff: found.percentOff };
}
