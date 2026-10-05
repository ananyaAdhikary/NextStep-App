# NextStep — MVP Scaffold

A working scaffold for the NextStep spec: scholarship matching, a global
career advisor, and a skill roadmap generator, behind a free/Pro tier wall.

This is a **Phase 1 MVP scaffold** — it runs end-to-end with zero external
services, so you can see and click through the whole product today. A few
pieces are deliberately simplified stand-ins for production infrastructure;
each one is called out below with the exact swap-out path.

## Quick start

```bash
npm install
npm run dev
```

Visit http://localhost:3000. Sign up (any email/password, 8+ char password),
then explore the three tools from the dashboard. Use the "Upgrade to Pro"
banner to pay with a real gateway (once configured — see "Payments" below)
or use the "Skip payment (dev demo)" link to instantly flip your account to
Pro without a real charge.

No environment variables are required to run it. One optional variable:

```bash
# .env.local
OPENAI_API_KEY=sk-...   # optional -- enables the "Advisor note" AI summary

# Live market data (Feature: career advisor enrichment)
ADZUNA_APP_ID=...       # optional -- free at developer.adzuna.com
ADZUNA_APP_KEY=...      # optional -- required together with ADZUNA_APP_ID

# Deadline reminder emails (Feature: application tracker)
RESEND_API_KEY=...      # optional -- free at resend.com; without it, reminders log to the server console instead of sending
NOTIFY_FROM_EMAIL="NextStep <notifications@yourdomain.com>"  # optional, defaults to a Resend sandbox address
CRON_SECRET=...         # optional but recommended -- protects /api/cron/check-deadlines

# Scholarship data ingestion (Feature: automated scholarship updates)
SCHOLARSHIP_FEED_URLS=https://example.com/feed.json  # optional, comma-separated
ADMIN_API_KEY=...       # required to call /api/admin/scholarships/refresh, /api/admin/analytics, /api/admin/discounts

# Payments (Feature: local + international gateways)
STRIPE_SECRET_KEY=sk_test_...            # optional -- international card payments
STRIPE_WEBHOOK_SECRET=whsec_...          # required alongside the above, to verify webhook calls
SSLCOMMERZ_STORE_ID=...                  # optional -- local Bangladesh gateway (bKash/Nagad/Rocket/cards)
SSLCOMMERZ_STORE_PASSWORD=...            # required alongside the above
SSLCOMMERZ_IS_LIVE=false                 # optional, defaults to sandbox
SSLCOMMERZ_IPN_URL=https://yourdomain.com/api/payments/webhook/sslcommerz  # required in production (must be publicly reachable)

JWT_SECRET=some-long-random-string   # optional in dev, required in production
```

Every one of the above is optional except `ADMIN_API_KEY` (only needed if you
actually call the refresh/analytics/discounts endpoints) and the payment
provider pairs (only needed once you want a *real* charge instead of the
dev "Skip payment" button). The app runs fully without any of them — it
just skips the AI summary, live market badges, real email delivery, and
real charges, falling back to static data / console logging / the dev
payment simulator.

## What's real vs. what's a stand-in

| Area | This scaffold | Production swap-out |
|---|---|---|
| Database | JSON file at `data/users.json`, read/written by `src/lib/userStore.ts` | Postgres via Prisma or Drizzle. `userStore.ts` is already shaped like a repository (`findUserByEmail`, `createUser`, `updateUser`) so callers don't change — only the internals of that one file do. |
| Scholarship / career / skill data | Static JSON seed files in `src/data/` (18 scholarships, 12 country-role markets, 6 role roadmaps) | Replace the JSON imports in `src/lib/matching.ts` with real queries — either your own curated dataset in Postgres, or a scraped/licensed source, or a vector search (Pinecone/pgvector) if you want semantic matching instead of exact field/country filters. |
| Matching logic | Deterministic, explainable scoring (see `src/lib/matching.ts`) | Keep this. It's the right foundation — deterministic scoring is auditable and fast. Layer the LLM on top for narrative explanation only (already wired in `src/lib/aiEnrich.ts`), not for the ranking itself. |
| Auth | Cookie-signed JWT, bcrypt password hashing, no email verification | Fine for MVP demo; add email verification, password reset, and rate limiting before real users. Consider NextAuth/Auth.js if you want OAuth (Google sign-in etc.) instead of building it by hand. |
| Payments | Stripe (international) + SSLCommerz (local — bKash/Nagad/Rocket/cards) Checkout, real REST integrations in `src/lib/payments/`. `/api/upgrade` remains as a dev-only "skip payment" shortcut that auto-disables once a real provider is configured in production. | Get real Stripe + SSLCommerz merchant accounts, set the env vars, and make `SSLCOMMERZ_IPN_URL`/webhook URLs publicly reachable. The webhook signature verification and server-side pricing are already production-shaped — see "Payments: local + international gateways" below. |
| Analytics | File-backed event log (`data/analytics-events.json`), capped at 20k rows, aggregated on read | A real pipeline (PostHog, Mixpanel, or a Postgres table + nightly rollup) once volume matters — `trackSearchEvent()`/`summarizeAnalytics()` in `src/lib/analytics/track.ts` are the two functions to swap. |
| Referrals & discounts | File-backed (`data/discount-codes.json`), one single-use 20%-off code issued per referred user's *first* completed payment | A real system would also want fraud checks (self-referral via a second email, etc.) and a proper join table — see the note in `src/lib/referrals.ts`. |
| AI personalization | Optional OpenAI call for a short summary sentence, gracefully skipped if no key | Add Gemini as an alternate provider if you want the two-provider setup from the original spec; same pattern in `src/lib/aiEnrich.ts`. |

## Project structure

```
src/
  app/
    page.tsx                    Landing page
    (auth)/signin, signup        Auth pages
    dashboard/                  Overview + 3 tool pages + referrals page
    admin/analytics/            Admin-only demand analytics dashboard
    api/                        Auth, scholarships, career, skills, upgrade,
                                 payments/*, referrals/*, admin/* routes
  components/                   UI: forms, result cards, nav, upgrade banner,
                                 referral panel, analytics dashboard
  lib/
    auth.ts                     JWT session helpers
    userStore.ts                File-backed user repository (swap for Postgres)
    matching.ts                 Deterministic scoring for all 3 features + tier gating
    aiEnrich.ts                 Optional OpenAI narrative layer
    payments/                   Stripe + SSLCommerz providers, checkout fulfillment
    paymentStore.ts             File-backed transaction ledger
    pricing.ts                  Server-side price truth (never trust the client)
    referrals.ts                Referral code generation + conversion reward
    discounts.ts, discountStore.ts   Discount code validation + storage
    analytics/                  Search-event tracking + aggregation
  data/                         Seed datasets (scholarships, career markets, roadmaps)
  types/                        Shared TypeScript types
  proxy.ts                      Route protection for /dashboard/*
data/*.json                     Dev-only file "database" (git-ignore in real use)
```

## Payments: local + international gateways

Two providers, one checkout flow (`src/lib/payments/`):

- **Stripe** (`stripe.ts`) — international cards, via direct REST calls to
  the Checkout Sessions API (no SDK dependency). Webhook signature
  verification is implemented by hand per Stripe's documented algorithm.
- **SSLCommerz** (`sslcommerz.ts`) — the dominant local payment aggregator
  in Bangladesh; one integration covers bKash, Nagad, Rocket, and local
  bank cards. Every IPN callback is independently re-validated
  server-to-server before being trusted, per SSLCommerz's own guidance —
  never act on the callback payload alone.

**Honesty note**: this environment's network egress is restricted (no
access to `api.stripe.com` or `sslcommerz.com` domains), so neither
integration could be exercised against a live account from here. Both match
their provider's documented request/response shape exactly, but test them
against real sandbox credentials before going live.

Both providers share one checkout route (`POST /api/payments/checkout`):
the client picks a provider and optionally a discount code; the server
looks up the price from `pricing.ts`, validates the discount, creates a
`pending` transaction, and only then calls the provider. Fulfillment
(`src/lib/payments/fulfill.ts`) — flipping `tier` to `"pro"`, marking the
discount redeemed, rewarding the referrer — happens in exactly one place,
called only from verified webhooks (or the dev-only `/api/upgrade`
shortcut, which routes through the same function so the whole flow is
demoable without real gateway keys). It's idempotent, so a retried webhook
can't double-charge the effects.

## Analytics: high-demand countries & subjects

Every scholarship and career-advisor search is logged
(`src/lib/analytics/track.ts`) with the requested country/region and
subject/field — that's the direct "what are students actually searching
for" signal, not just what they end up matching into. View the aggregate
at `/admin/analytics`, gated by `ADMIN_API_KEY` (same convention as the
scholarship refresh endpoint — there's no separate admin role on `User`
yet). `GET /api/admin/analytics?days=30` returns the same data as JSON
(`x-admin-key` header or `?key=` query param) if you want to pull it into
another dashboard.

## Referrals & discounts

Every user gets a referral code at signup (`src/lib/referrals.ts`),
shareable as `/signup?ref=CODE`. When someone signs up through that link
and later completes their *first* payment, the referrer automatically
earns a single-use 20%-off code (`src/lib/discountStore.ts`) — view yours,
and your referral stats, at `/dashboard/referrals`. General promo codes
(not tied to a referral) can be created via
`POST /api/admin/discounts` with the same `ADMIN_API_KEY` header, e.g.:

```bash
curl -X POST http://localhost:3000/api/admin/discounts \
  -H "x-admin-key: $ADMIN_API_KEY" -H "Content-Type: application/json" \
  -d '{"code": "WELCOME10", "percentOff": 10, "singleUse": false}'
```

Known gap: referral fraud prevention (e.g. someone referring themselves
with a second email) isn't implemented — the dedup only guards against a
single user being credited twice for the same conversion, not against
fake accounts. See the comment in `referrals.ts`.

## Three new features: how they actually work

### 1. Automated scholarship data updates

`src/lib/ingestion/` is a pluggable pipeline, not a scraper aimed at a
specific site. Deliberately so: scraping arbitrary scholarship databases
without checking each site's `robots.txt` / terms of service is a real legal
and reputational risk, and a scraper hand-built against one site's HTML
breaks the moment that site redesigns.

Instead, `jsonFeedSource()` pulls from any URL that returns JSON already
shaped like our `Scholarship` type — an export from your own scraper (run as
its own job, wherever you're comfortable running it), a partner
data-sharing feed, or a spreadsheet published as JSON. Set
`SCHOLARSHIP_FEED_URLS` (comma-separated) and call:

```
POST /api/admin/scholarships/refresh
Header: x-admin-key: <ADMIN_API_KEY>
```

on a schedule (Vercel Cron, a GitHub Action, a crontab hitting `curl` —
whatever your host supports). It upserts by scholarship `id` and writes to
`data/scholarships.json`, which `src/lib/scholarshipStore.ts` reads from at
request time — so a refresh takes effect without a redeploy.

**Real limitation, tested honestly:** this sandbox's network egress is
restricted, so I could exercise the endpoint and its auth/error-handling
(confirmed working — bad key → 401, unreachable feed → reported failure with
no crash, dataset unchanged), but couldn't hit a real external feed from
here. Point `SCHOLARSHIP_FEED_URLS` at an actual reachable feed to see the
happy path.

### 2. Live market trend data

**LinkedIn and Glassdoor do not have public, self-serve APIs for this** —
LinkedIn Talent Insights is enterprise/partner-gated and Glassdoor
discontinued its public developer API. Rather than fake this, `src/lib/marketData/`
integrates **Adzuna**, the one major jobs-data provider with a real, free,
documented API (~1,000 calls/month at developer.adzuna.com).

Set `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` and the Career Advisor's Pro results
get a "LIVE" badge with current vacancy counts and average advertised salary
for that role/country, pulled at request time (capped to the top 5 results
per search to protect the free-tier call budget). Without those env vars, or
for a country Adzuna doesn't cover, it silently falls back to the static
dataset — verified in testing (`liveSignal: null`, no error).

The provider lives behind `fetchLiveMarketSignal()` in
`src/lib/marketData/index.ts` specifically so that if you get approved
LinkedIn or Glassdoor partner access later, adding it is a new file in that
folder plus one line in `index.ts` — nothing else in the app changes.

### 3. Application deadline tracker with notifications

Fully built and tested, including the notification logic:

- "Track deadline" button on every Pro-tier scholarship match
  (`src/components/TrackerButton.tsx`) → `POST /api/tracker`
- `/dashboard/tracker` lists everything tracked, soonest deadline first,
  color-coded by urgency (`src/components/TrackerList.tsx`)
- `src/lib/deadlineCheck.ts` scans tracked applications and emails a
  reminder at 30, 7, and 1 day(s) out via `src/lib/notify.ts` (Resend if
  `RESEND_API_KEY` is set, otherwise logs to the server console)
- `POST /api/cron/check-deadlines` (optionally protected by `CRON_SECRET`)
  runs that scan — point a daily cron job at it

**Bug found and fixed during testing:** the first version only marked the
threshold it had just used for the email subject line as "notified," so a
user tracking a scholarship 5 days out would get a "5 days left" email, then
get *another* email on the next cron run once the unrelated 30-day threshold
was (re-)evaluated against a `notifiedThresholds` array that didn't include
it yet. Fixed by marking every threshold the current days-left already
satisfies in one pass — verified with a live test: first cron run notifies
once, two immediate subsequent runs correctly notify zero times.

- **Bookmarking** (saving a scholarship without full deadline tracking) isn't
  a separate feature yet — right now "track" and "bookmark" are the same
  action. Splitting them just means adding a `status` field to
  `TrackedApplication`.
- **Direct application link integration** is present as a static URL per
  scholarship; a "click to prefill application" flow would need per-provider
  integration work.
- **Cost-of-living vs. budget gap analysis** is implemented for scholarships
  (`budgetGapUSD`) but could be deepened with real, live cost-of-living APIs
  instead of the static seed estimate.
- **Real datasets**: the 18 scholarships / 12 markets / 6 roadmaps here are
  representative, hand-curated examples to prove the matching logic — not
  the "top 100 global scholarships" the spec calls for. Swapping in a larger
  dataset doesn't require code changes, just more rows in the same shape.
- No test suite yet.

## Design notes

The visual identity uses a recurring "waypoint" motif (a dotted connecting
line with stops) for the hero, the career-market results, and the
skill-roadmap phases — deliberate, since all three are genuinely sequential
journeys, not decoration. Palette: deep navy (`#0f1b33`) + muted gold
(`#c98a2e`) + teal (`#257c78`), serif display type over a system sans body.
Adjust tokens in `src/app/globals.css`.
