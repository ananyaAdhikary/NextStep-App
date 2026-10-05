export type Tier = "free" | "pro";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  tier: Tier;
  fieldOfStudy?: string;
  referralCode: string;
  referredBy?: string; // referrer's userId
  referralConversions: number; // count of referred users whose first payment completed
  createdAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  tier: Tier;
}

export interface Scholarship {
  id: string;
  name: string;
  country: string;
  region: string;
  fields: string[];
  degreeLevel: "Undergraduate" | "Graduate" | "PhD" | "Any";
  fullyFunded: boolean;
  amountUSD: number;
  minCGPA: number; // on a 4.0 scale
  requiredTests: { test: string; minScore: number }[];
  deadline: string;
  applyUrl: string;
  monthlyCostOfLivingUSD: number;
  notes: string;
}

export interface ScholarshipMatchInput {
  cgpa: number;
  fieldOfStudy: string;
  targetCountry: string; // "Any" allowed
  annualBudgetUSD: number;
  ielts?: number;
  toefl?: number;
  gre?: number;
}

export interface ScholarshipMatchResult extends Scholarship {
  eligibilityScore: number; // 0-100
  budgetGapUSD: number; // negative means shortfall
  locked?: boolean;
}

export interface CareerMarket {
  id: string;
  country: string;
  region: string;
  jobRole: string;
  relatedFields: string[];
  demandScore: number; // 1-10
  avgStartingSalaryUSD: number;
  costOfLivingIndexUSD: number; // monthly estimate
  visaProgram: string;
  visaDurationMonths: number;
  growthTrendPct: number; // yoy %
  notes: string;
}

export interface CareerAdvisorInput {
  degree: string;
  targetRole: string;
  preferredRegion: string; // "Any" allowed
}

export interface CareerAdvisorResult extends CareerMarket {
  matchScore: number;
  salaryToColRatio: number;
  locked?: boolean;
  liveSignal?: MarketSignal | null;
}

export interface RoadmapResource {
  name: string;
  type: "Course" | "Certification" | "Project" | "Book" | "Community";
  free: boolean;
  provider: string;
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  durationWeeks: number;
  skills: string[];
  resources: RoadmapResource[];
}

export interface SkillRoadmap {
  role: string;
  relatedDegrees: string[];
  coreSkills: string[];
  recommendedSkills: string[];
  niceToHaveSkills: string[];
  phases: RoadmapPhase[];
}

export interface SkillRoadmapInput {
  fieldOfStudy: string;
  targetRole: string;
}

// ---------- Live market data (Feature 2) ----------

export interface MarketSignal {
  source: "adzuna";
  avgSalaryLocal: number | null;
  vacancyCount: number | null;
  asOf: string;
}

// ---------- Deadline tracker (Feature 3) ----------

export interface TrackedApplication {
  id: string;
  userId: string;
  scholarshipId: string;
  scholarshipName: string;
  country: string;
  deadline: string;
  applyUrl: string;
  notifiedThresholds: number[];
  createdAt: string;
}

// ---------- Payments (Feature 4) ----------

export type PaymentProviderId = "stripe" | "sslcommerz";
export type TransactionStatus = "pending" | "completed" | "failed";

export interface Transaction {
  id: string; // our internal id, also used as the provider's tran_id/client_reference_id
  userId: string;
  provider: PaymentProviderId;
  currency: "USD" | "BDT";
  listedAmount: number; // before discount, in the provider's currency unit (dollars / taka, not cents)
  discountCode?: string;
  discountPct?: number;
  amount: number; // final charged amount, after discount
  status: TransactionStatus;
  providerRef?: string; // Stripe session id / SSLCommerz val_id, once known
  createdAt: string;
  completedAt?: string;
}

// ---------- Discounts & referrals (Feature 6) ----------

export interface DiscountCode {
  code: string; // uppercase, unique
  percentOff: number; // 1-100
  source: "promo" | "referral";
  ownerUserId?: string; // for referral-reward codes, the referrer who earned it
  singleUse: boolean;
  redeemedByUserId?: string;
  redeemedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

// ---------- Analytics (Feature 5) ----------

export type AnalyticsEventType = "scholarship_search" | "career_search";

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  country: string; // requested target country / preferred region, normalized
  subject: string; // field of study / degree
  role?: string; // target role, career_search only
  tier: Tier;
  userId?: string;
  createdAt: string;
}
