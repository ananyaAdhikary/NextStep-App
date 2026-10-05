import { findTransaction, updateTransaction } from "@/lib/paymentStore";
import { findUserById, updateUser } from "@/lib/userStore";
import { markDiscountCodeRedeemed } from "@/lib/discountStore";
import { rewardReferrerOnFirstConversion } from "@/lib/referrals";

/**
 * The one place a user actually gets flipped to Pro. Called only from
 * verified webhook handlers (Stripe signature check, SSLCommerz server-side
 * validation call) — never from a client-facing route — per the payments
 * rule in the README: never trust the client's word that it paid.
 *
 * Idempotent: if the transaction is already completed (e.g. a webhook
 * retried by the provider), this is a no-op so a user can't be
 * double-rewarded or a referral double-counted.
 */
export function fulfillTransaction(transactionId: string, providerRef?: string) {
  const txn = findTransaction(transactionId);
  if (!txn) return { ok: false as const, reason: "Unknown transaction id." };
  if (txn.status === "completed") return { ok: true as const, alreadyProcessed: true };

  const user = findUserById(txn.userId);
  if (!user) return { ok: false as const, reason: "Transaction references a user that no longer exists." };

  updateTransaction(transactionId, {
    status: "completed",
    completedAt: new Date().toISOString(),
    providerRef,
  });

  updateUser(user.id, { tier: "pro" });

  if (txn.discountCode) {
    markDiscountCodeRedeemed(txn.discountCode, user.id);
  }

  rewardReferrerOnFirstConversion(user.id);

  return { ok: true as const, alreadyProcessed: false };
}
