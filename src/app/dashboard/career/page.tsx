import { Globe2 } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import SiteNav from "@/components/SiteNav";
import CareerTool from "@/components/CareerTool";

export default async function CareerPage() {
  const session = await getSessionUser();

  return (
    <div className="flex-1 flex flex-col">
      <SiteNav session={session} />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12 w-full">
        <div className="flex items-center gap-4 mb-2">
          <span className="icon-tile-teal icon-tile"><Globe2 size={22} strokeWidth={1.75} /></span>
          <div>
            <p className="eyebrow">02 · Compare</p>
            <h1 className="font-display text-3xl">Global Career Advisor</h1>
          </div>
        </div>
        <p className="text-ink-soft mb-8 max-w-xl">
          See which countries are hiring for your target role, and how fast that demand is growing.
        </p>
        <CareerTool tier={session?.tier ?? "free"} />
      </main>
    </div>
  );
}
