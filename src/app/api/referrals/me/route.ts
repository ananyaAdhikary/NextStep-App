import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { findUserById, countReferredUsers } from "@/lib/userStore";
import { listDiscountCodesForOwner } from "@/lib/discountStore";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const user = findUserById(session.id);
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const codes = listDiscountCodesForOwner(user.id).map((c) => ({
    code: c.code,
    percentOff: c.percentOff,
    redeemed: Boolean(c.redeemedByUserId),
    createdAt: c.createdAt,
  }));

  return NextResponse.json({
    referralCode: user.referralCode,
    referredCount: countReferredUsers(user.id),
    referralConversions: user.referralConversions,
    rewardCodes: codes,
  });
}
