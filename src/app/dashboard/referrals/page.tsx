import { Gift } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import SiteNav from "@/components/SiteNav";
import ReferralPanel from "@/components/ReferralPanel";

export default async function ReferralsPage() {
  const session = await getSessionUser();

  return (
    <div className="flex-1 flex flex-col">
      <SiteNav session={session} />
      <main className="flex-1 mx-auto max-w-3xl px-6 py-12 w-full">
        <div className="flex items-center gap-4 mb-2">
          <span className="icon-tile"><Gift size={22} strokeWidth={1.75} /></span>
          <div>
            <p className="eyebrow">Referrals</p>
            <h1 className="font-display text-3xl">Invite friends, earn discounts</h1>
          </div>
        </div>
        <p className="text-ink-soft mb-8 max-w-xl">
          When a friend signs up with your link and upgrades to Pro, you get 20% off your next payment.
        </p>
        <ReferralPanel />
      </main>
    </div>
  );
}
