import { TrendingUp } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import SiteNav from "@/components/SiteNav";
import SkillTool from "@/components/SkillTool";

export default async function SkillsPage() {
  const session = await getSessionUser();

  return (
    <div className="flex-1 flex flex-col">
      <SiteNav session={session} />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12 w-full">
        <div className="flex items-center gap-4 mb-2">
          <span className="icon-tile-plum icon-tile"><TrendingUp size={22} strokeWidth={1.75} /></span>
          <div>
            <p className="eyebrow">03 · Plan</p>
            <h1 className="font-display text-3xl">Skill Roadmap Generator</h1>
          </div>
        </div>
        <p className="text-ink-soft mb-8 max-w-xl">
          A step-by-step path from your field to your target role, with free and paid resources.
        </p>
        <SkillTool tier={session?.tier ?? "free"} />
      </main>
    </div>
  );
}
