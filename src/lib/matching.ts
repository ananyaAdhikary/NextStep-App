import careerMarkets from "@/data/career-markets.json";
import skillRoadmaps from "@/data/skill-roadmaps.json";
import { getAllScholarships } from "@/lib/scholarshipStore";
import { fetchLiveMarketSignal } from "@/lib/marketData";
import {
  ScholarshipMatchInput,
  ScholarshipMatchResult,
  CareerMarket,
  CareerAdvisorInput,
  CareerAdvisorResult,
  SkillRoadmap,
  SkillRoadmapInput,
  Tier,
} from "@/types";

const FREE_SCHOLARSHIP_LIMIT = 3;
const FREE_CAREER_LIMIT = 3;
const FREE_SKILL_LIMIT = 3;

function norm(s: string) {
  return s.trim().toLowerCase();
}

// ---------- Feature 1: Scholarship Matchmaker ----------

export function matchScholarships(
  input: ScholarshipMatchInput,
  tier: Tier
): { results: ScholarshipMatchResult[]; totalMatches: number } {
  const all = getAllScholarships();

  const candidates = all.filter((s) => {
    const fieldOk =
      norm(input.fieldOfStudy) === "" ||
      s.fields.some((f) => norm(f) === "any" || norm(f) === norm(input.fieldOfStudy));
    const countryOk =
      !input.targetCountry ||
      norm(input.targetCountry) === "any" ||
      norm(s.country) === norm(input.targetCountry) ||
      norm(s.region) === norm(input.targetCountry);
    return fieldOk && countryOk;
  });

  const scored: ScholarshipMatchResult[] = candidates.map((s) => {
    let score = 40; // base score for matching field/country/deadline validity

    // CGPA fit: full credit if user exceeds requirement, tapering penalty if below.
    const cgpaDelta = input.cgpa - s.minCGPA;
    score += cgpaDelta >= 0 ? Math.min(20, 10 + cgpaDelta * 10) : Math.max(-25, cgpaDelta * 25);

    // Test score fit
    if (s.requiredTests.length === 0) {
      score += 10;
    } else {
      const testsSatisfied = s.requiredTests.every((rt) => {
        if (rt.test === "IELTS") return (input.ielts ?? 0) >= rt.minScore;
        if (rt.test === "TOEFL") return (input.toefl ?? 0) >= rt.minScore;
        if (rt.test === "GRE") return (input.gre ?? 0) >= rt.minScore;
        return true;
      });
      score += testsSatisfied ? 15 : -10;
    }

    // Budget fit
    const annualCostGap = input.annualBudgetUSD - s.monthlyCostOfLivingUSD * 12;
    const budgetGapUSD = s.fullyFunded ? input.annualBudgetUSD : annualCostGap;
    score += s.fullyFunded ? 15 : budgetGapUSD >= 0 ? 10 : -15;

    // Deadline sanity: down-weight scholarships whose deadline has passed.
    const deadlinePassed = new Date(s.deadline).getTime() < Date.now();
    if (deadlinePassed) score -= 30;

    const eligibilityScore = Math.max(0, Math.min(100, Math.round(score)));

    return { ...s, eligibilityScore, budgetGapUSD };
  });

  scored.sort((a, b) => b.eligibilityScore - a.eligibilityScore);

  const limit = tier === "pro" ? scored.length : FREE_SCHOLARSHIP_LIMIT;
  const results = scored.slice(0, limit).map((r) => ({ ...r, locked: false }));

  return { results, totalMatches: scored.length };
}

// ---------- Feature 2: Global Career Advisor ----------

export async function advisorCareerMarkets(
  input: CareerAdvisorInput,
  tier: Tier
): Promise<{ results: CareerAdvisorResult[]; totalMatches: number }> {
  const all = careerMarkets as CareerMarket[];

  const candidates = all.filter((c) => {
    const roleOk =
      norm(c.jobRole) === norm(input.targetRole) ||
      c.relatedFields.some((f) => norm(f) === norm(input.degree));
    const regionOk =
      !input.preferredRegion ||
      norm(input.preferredRegion) === "any" ||
      norm(c.region) === norm(input.preferredRegion) ||
      norm(c.country) === norm(input.preferredRegion);
    return roleOk && regionOk;
  });

  const scored: CareerAdvisorResult[] = candidates.map((c) => {
    let score = c.demandScore * 8; // 0-72
    if (norm(c.jobRole) === norm(input.targetRole)) score += 15;
    if (c.relatedFields.some((f) => norm(f) === norm(input.degree))) score += 10;
    score += Math.min(10, c.growthTrendPct);

    const matchScore = Math.max(0, Math.min(100, Math.round(score)));
    const salaryToColRatio = Math.round((c.avgStartingSalaryUSD / 12 / c.costOfLivingIndexUSD) * 100) / 100;

    return { ...c, matchScore, salaryToColRatio };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);

  const limit = tier === "pro" ? scored.length : FREE_CAREER_LIMIT;
  const results = scored.slice(0, limit).map((r) => ({ ...r, locked: false }));

  // Live enrichment is Pro-only and capped to the top few results so a
  // single search doesn't burn through Adzuna's free-tier call budget
  // (~1,000/month). Silently no-ops if ADZUNA_APP_ID/APP_KEY aren't set.
  if (tier === "pro") {
    const LIVE_ENRICH_LIMIT = 5;
    await Promise.all(
      results.slice(0, LIVE_ENRICH_LIMIT).map(async (r) => {
        r.liveSignal = await fetchLiveMarketSignal(input.targetRole, r.country);
      })
    );
  }

  return { results, totalMatches: scored.length };
}

// ---------- Feature 3: Skill Roadmap Generator ----------

export function generateSkillRoadmap(
  input: SkillRoadmapInput,
  tier: Tier
): { roadmap: SkillRoadmap | null; locked: boolean } {
  const all = skillRoadmaps as SkillRoadmap[];

  let match = all.find((r) => norm(r.role) === norm(input.targetRole));
  if (!match) {
    match = all.find((r) => r.relatedDegrees.some((d) => norm(d) === norm(input.fieldOfStudy)));
  }
  if (!match) return { roadmap: null, locked: false };

  if (tier === "pro") {
    return { roadmap: match, locked: false };
  }

  // Free tier: top 3 core skills only, and only Phase 1 of the learning path.
  const limited: SkillRoadmap = {
    ...match,
    coreSkills: match.coreSkills.slice(0, FREE_SKILL_LIMIT),
    recommendedSkills: [],
    niceToHaveSkills: [],
    phases: match.phases.slice(0, 1),
  };

  return { roadmap: limited, locked: true };
}
