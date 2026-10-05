import { GraduationCap } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import SiteNav from "@/components/SiteNav";
import ScholarshipTool from "@/components/ScholarshipTool";

export default async function ScholarshipsPage() {
  const session = await getSessionUser();

  return (
    <div className="flex-1 flex flex-col">
      <SiteNav session={session} />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12 w-full">
        <div className="flex items-center gap-4 mb-2">
          <span className="icon-tile"><GraduationCap size={22} strokeWidth={1.75} /></span>
          <div>
            <p className="eyebrow">01 · Discover</p>
            <h1 className="font-display text-3xl">Scholarship Matchmaker</h1>
          </div>
        </div>
        <p className="text-ink-soft mb-8 max-w-xl">
          Add your CGPA, budget, and test scores. We score each scholarship by how well you match it.
        </p>
        <ScholarshipTool tier={session?.tier ?? "free"} />
      </main>
    </div>
  );
}
