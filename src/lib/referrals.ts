import { findUserByReferralCode, findUserById, updateUser } from "@/lib/userStore";
import { createDiscountCode } from "@/lib/discountStore";
import { completedTransactionCountForUser } from "@/lib/paymentStore";

const REFERRAL_REWARD_PCT = 20; // % off, single-use, awarded to the referrer

/**
 * Generates a short, shareable, human-typeable referral code from the
 * user's name (e.g. "Ananya Adhikary" -> "ANANYA4F2K"), retrying with a new
 * random suffix on the rare collision. Not cryptographically meaningful —
 * it's an invite handle, not a secret.
 */
export function generateReferralCode(name: string): string {
  const base = name
    .trim()
    .split(/\s+/)[0]
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 8) || "USER";

  for (let attempt = 0; attempt < 20; attempt++) {
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const candidate = `${base}${suffix}`;
    if (!findUserByReferralCode(candidate)) return candidate;
  }
  // Astronomically unlikely fallback.
  return `${base}${Date.now().toString(36).toUpperCase()}`;
}

export function resolveReferrer(code: string | undefined | null) {
  if (!code) return undefined;
  return findUserByReferralCode(code.trim());
}

/**
 * Called from the payment webhook right after a transaction is marked
 * completed. Rewards the referrer with a one-time discount code, but only
 * the *first* time their referral converts — checked by counting the paid
 * user's completed transactions (call this after marking the current one
 * completed, so a count of exactly 1 means "this was their first payment").
 * A second or later payment from the same referred user won't re-trigger
 * the reward.
 */
export function rewardReferrerOnFirstConversion(paidUserId: string) {
  const paidUser = findUserById(paidUserId);
  if (!paidUser?.referredBy) return;

  const isFirstConversion = completedTransactionCountForUser(paidUserId) === 1;
  if (!isFirstConversion) return;

  const referrer = findUserById(paidUser.referredBy);
  if (!referrer) return;

  // Known gap: this doesn't detect self-referral via a second account/email
  // (sign up as "self", refer "self" from a throwaway address, pay once).
  // A production version would want some fraud signal here — same device
  // fingerprint, same payment method, same IP at signup — before paying out.
  updateUser(referrer.id, { referralConversions: referrer.referralConversions + 1 });

  createDiscountCode({
    code: `REF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    percentOff: REFERRAL_REWARD_PCT,
    source: "referral",
    ownerUserId: referrer.id,
    singleUse: true,
    createdAt: new Date().toISOString(),
  });
}
