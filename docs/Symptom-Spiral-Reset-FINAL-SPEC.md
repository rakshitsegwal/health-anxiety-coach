# The Symptom Spiral Reset — FINAL BUILD SPECIFICATION
### 14-Day Reset · ₹999 · Premium SaaS · Next.js · The last doc before implementation

**Status:** Approved + modified. This supersedes the prior PRD. Build from this.
**Stack:** Next.js (App Router) · TypeScript · Tailwind · Supabase (Postgres + Auth + RLS) · Razorpay · Resend · Vercel.
**Content source:** Days 1–14 from the frozen program library. Screen copy from the funnel copy deck.

---

## A. Modifications applied (changelog)

1. **42-day upsell removed entirely.** No upsell on thank-you or anywhere. Single focus: validate the ₹999 offer. (`R-UPSELL-1` deleted.)
2. **Founder story video** added to the landing page, **positioned above the social-proof section.**
3. **Exit-intent capture on the results page** — "Get Day 1 free by email" — for users about to leave without buying.
4. **Dashboard simplified** to content consumption + completion. **No charts, no score trend, no gamification.** (The in-app Spiral-Score trend is deferred — see honesty note below.)
5. **Two analytics events added:** `day_1_started`, `day_1_completed` — primary activation / PMF leading indicators.

> **Honesty note (mod #4):** with the in-app score trend deferred, soften any funnel copy implying users "watch their number fall *inside the app* day-by-day." The assessment still delivers the **Day-0 baseline on the results page** (that promise holds); just don't promise an in-app trend the MVP won't ship.

---

## B. Updated PRD (current, complete)

### B.1 Objective & success metrics
**Objective:** Meta Ad → purchase in **< 5 minutes**, premium in-product experience (no PDFs/app).

| Metric | Healthy signal |
|---|---|
| Ad → LP CTR | 1%+ (2%+ strong) |
| Assessment completion | 60%+ |
| LP → email (Lead) | track |
| Checkout → purchase | track |
| **Visitor → purchase** (north star) | cold paid 1–3% ok, >3% strong |
| Revenue, first 30 days | track |
| **Time-to-purchase** | < 5 min median |
| **`day_1_started` / `day_1_completed`** | **activation / PMF leading indicators** |
| Post-payment access success (guardrail) | ~100% |
| Refund rate (guardrail) | < ~10% |

### B.2 Scope
**In:** Landing Page · Assessment · Results · Razorpay Checkout · Auth · Dashboard · Day 1–14 content · email capture · post-payment provisioning · thank-you · abandoned-checkout email · exit-intent free-Day-1 · Meta Pixel · guarantee/refund.
**Out (do NOT build):** AI chat · community · mobile app · social · complex analytics · gamification · **42-day upsell**.

### B.3 Screen specs (functional; copy = deck)

**Landing `/`** — message-match the ad; one CTA (start assessment); price NOT shown. Order: hero → loop → how-it-works → why-it-works → **FounderVideo (NEW)** → social proof → FAQ → guarantee → safety footer; sticky CTA. LCP < 2.5s mobile (lazy-load video). Capture UTM into the eventual lead.

**Assessment `/assessment`** — intro ("not a diagnosis") → 10 scored questions (one per screen, tap-only, progress bar, back) → optional context Q. No typing except email. Compute score/band/driver client-side.

**Email gate** (between assessment and results) — one email field → `POST /api/lead` (server, service role) → set short-lived signed `lead_id` cookie → fire Pixel `Lead` → route to results → send results email (Resend). Honest framing.

**Results `/results`** — score gauge + band + "Day-0 baseline" + dominant driver + validating copy + **high-band safety branch** + bridge → one-tap CTA to checkout. **Exit-intent modal (NEW):** on exit-intent, offer "Get Day 1 free by email." (Details B.4.)

**Checkout `/checkout`** — order summary, **UPI/wallet express first**, card fallback, email **prefilled** from lead, guarantee inline, "one-time, no subscription," trust badges. ₹999 = 99900 paise INR. Pixel `InitiateCheckout`.

**Thank-you `/thank-you`** — confirm, "Day-0 saved," "Week 1 unlocks today, one day at a time," "15 min/day," **CTA: Start Day 1**, account note (signed in / OTP), guarantee reminder, safety note. **No upsell.** Polls order status if client callback was lost.

**Dashboard `/dashboard` (SIMPLIFIED)** — progress as a **simple count/ring (X/14 completed — not a chart)**, **today's session prominent**, day list (completed ✓ / current / locked "unlocks in Xh"). **No score trend, no streaks/badges/points.**

**Day page `/dashboard/day/[n]`** — renders the day's MDX content (Idea + Practice + the day's check-in *as on-page instructions the user does in their own journal*, not a built logging UI) + **"Mark day complete"** → `POST /api/progress`. Day 1 fires `day_1_started` on open and `day_1_completed` on completion.

**Login `/login`** — email → 6-digit OTP → session → dashboard. No OAuth, no magic links. In-app-browser banner + escape.

### B.4 Exit-intent free-Day-1 (mod #3) — reconciliation
Email is already captured at the gate (before results), so the exit-intent is a **conversion-recovery offer**, not first capture:
- **Trigger (mobile-first):** back-button/history interception + inactivity timer + scroll-up velocity (true mouse-leave only on desktop). Show **once per session**.
- **Suppress** if the user has clicked checkout or already purchased, or already received free Day 1 (`leads.got_free_day1 = true`).
- **Modal:** "Not ready yet? Get Day 1 free." Email **pre-filled** from the lead (editable). CTA: "Email me Day 1 free." If no lead email exists (direct nav), collect it.
- **Action:** `POST /api/free-day1` → send Day 1 content via Resend → set `got_free_day1 = true` → start light nurture → fire Pixel `Lead` (if not already) / custom event. Day 1 ("map your spiral") is the intended free sample.

### B.5 Assessment scoring (implement exactly — from deck §3)
Sum Q1–Q10 (0–4) → raw 0–40; **Spiral Score = raw × 2.5** (0–100). Bands: 0–25 Occasional · 26–50 Active · 51–75 Strong · 76–100 Intense. Driver = max(Searching=Q1+Q4, Checking=Q2, Reassurance=Q3+Q5). Safety branch: score ≥ 76 OR Q6/Q7/Q8 maxed. Persist on `leads`; copy to `profiles.baseline_*` at provisioning.

### B.6 Drip logic
`unlocked_through_day = min(14, floor((now − enrollment_date)/1d) + 1)`; day N available ⇔ N ≤ unlocked_through_day. Locked day shows "Unlocks in Xh". `DRIP_ENABLED` default **true**; fallback `false` (unlock all 14) if time-constrained.

### B.7 Compliance & safety (non-negotiable, encoded)
Meta personal-attributes-safe LP+results (first-person/educational; **LP is reviewed by Meta**) · "not medical advice / not a diagnosis" on assessment/results/footer · crisis line in footer + high-band results · **hopeful (never fear) results framing** · **no fabricated social proof** (real or honest pre-launch alt) · one-time payment, no subscription, stated at checkout · honest 30-day guarantee, one email to claim · assessment data stored under RLS, minimal retention, privacy policy + terms published, DPDP-aware consent at capture (**get legal review**).

### B.8 Analytics & Pixel (minimal, compliant)
Pixel: `PageView`, `ViewContent` (lp/results), `Lead` (gate + free-day1), `InitiateCheckout`, `Purchase` (value 999, INR). **NEW product+Pixel events:** `day_1_started`, `day_1_completed`. **Neutral names only** (no sensitive traits in event/audience names); no health data in params. Funnel diagnosis comes from `leads` vs `orders` rows.

### B.9 Guarantee & refund
30-day money-back, no questions, one email to claim, stated identically on checkout/thank-you. Refund: Razorpay refund → `orders.status=refunded` → **revoke dashboard access** → confirmation email. Never a medical/cure guarantee.

---

## C. ARCHITECTURE (final)

## C.1 Database schema (Supabase Postgres)

> Text columns with CHECK constraints over enum types for MVP flexibility. RLS enabled on **every** table. Server uses the service-role client (bypasses RLS) for all writes that grant access; browser uses the anon client (RLS-enforced, reads own rows).

**`leads`** — captured at the email gate (pre-purchase)
| column | type | constraints |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| email | text | NOT NULL |
| assessment_score | int | NOT NULL (0–100) |
| band | text | NOT NULL, CHECK in (occasional, active, strong, intense) |
| dominant_driver | text | NOT NULL, CHECK in (searching, checking, reassurance) |
| answers | jsonb | NULL (sensitive; server-write only) |
| utm | jsonb | NULL ({source,medium,campaign,content,term}) |
| got_free_day1 | bool | NOT NULL default false |
| created_at | timestamptz | default now() |

Indexes: `email`, `created_at`. **RLS:** no client access; service-role only.

**`orders`**
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| email | text | NOT NULL |
| user_id | uuid | NULL, FK → auth.users(id) |
| razorpay_order_id | text | UNIQUE NOT NULL |
| razorpay_payment_id | text | NULL |
| amount | int | NOT NULL (paise; 99900) |
| currency | text | NOT NULL default 'INR' |
| status | text | NOT NULL default 'created', CHECK in (created, paid, failed, refunded) |
| plan | text | NOT NULL default '14day' |
| created_at | timestamptz | default now() |
| paid_at | timestamptz | NULL |
| refunded_at | timestamptz | NULL |

Indexes: UNIQUE `razorpay_order_id`, `email`, `user_id`, `status`. **RLS:** authed user may SELECT own rows (`user_id = auth.uid()`); the pre-auth thank-you status check goes through a **server endpoint keyed on `razorpay_order_id`**; all writes service-role only.

**`profiles`** — 1:1 with auth.users
| column | type | constraints |
|---|---|---|
| user_id | uuid | PK, FK → auth.users(id) ON DELETE CASCADE |
| email | text | NOT NULL |
| full_name | text | NULL |
| enrollment_date | timestamptz | NOT NULL default now() (drives drip) |
| baseline_score | int | NULL |
| baseline_band | text | NULL |
| plan | text | NOT NULL default '14day' |
| created_at | timestamptz | default now() |

**RLS:** user may SELECT/UPDATE own row; INSERT is server-side at provisioning (service role).

**`daily_progress`** — completion-focused (simplified per mod #4)
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | NOT NULL, FK → auth.users(id) |
| day_number | int | NOT NULL, CHECK between 1 and 14 |
| completed_at | timestamptz | NULL (presence ⇒ completed) |
| reflection | jsonb | NULL (optional future check-in; **no MVP UI**) |
| created_at | timestamptz | default now() |

Constraints: UNIQUE(user_id, day_number). Index: `user_id`. **RLS:** user CRUD own rows.

**`processed_webhooks`** — Razorpay webhook idempotency
| column | type | constraints |
|---|---|---|
| razorpay_event_id | text | PK |
| type | text | NOT NULL |
| processed_at | timestamptz | default now() |

Insert-on-process; conflict ⇒ already handled ⇒ skip. **RLS:** service-role only.

**No `program_content` table** — Days 1–14 are content-as-code (MDX in repo). No DB triggers; provisioning is explicit in server code for full control.

## C.2 Folder structure

```
symptom-spiral-reset/
├── app/
│   ├── (marketing)/                 # public funnel, no auth
│   │   ├── page.tsx                 # /  Landing
│   │   ├── assessment/page.tsx      # /assessment
│   │   ├── results/page.tsx         # /results
│   │   ├── checkout/page.tsx        # /checkout
│   │   └── thank-you/page.tsx       # /thank-you
│   ├── (app)/                       # authed
│   │   ├── layout.tsx               # auth guard
│   │   └── dashboard/
│   │       ├── page.tsx             # /dashboard
│   │       └── day/[n]/page.tsx     # /dashboard/day/[n]
│   ├── login/page.tsx               # /login (OTP)
│   ├── legal/{privacy,terms}/page.tsx
│   ├── api/
│   │   ├── lead/route.ts            # create lead
│   │   ├── free-day1/route.ts       # exit-intent free Day 1
│   │   ├── razorpay/
│   │   │   ├── order/route.ts       # create order
│   │   │   ├── verify/route.ts      # verify sig → provision → session
│   │   │   └── webhook/route.ts     # idempotent reconcile
│   │   ├── order-status/route.ts    # poll status by order_id
│   │   └── progress/route.ts        # mark day complete
│   ├── layout.tsx                   # root: Pixel, fonts, providers
│   └── globals.css
├── components/
│   ├── marketing/  (Hero, FounderVideo, SocialProof, HowItWorks,
│   │               WhyItWorks, FAQ, GuaranteeBadge, SafetyFooter, StickyCTA)
│   ├── assessment/ (AssessmentFlow, QuestionCard, ProgressBar, EmailGate)
│   ├── results/    (ScoreGauge, ResultBand, SafetyBranch, ExitIntentModal)
│   ├── checkout/   (CheckoutSummary, RazorpayButton)
│   ├── dashboard/  (ProgressRing, DayList, DayCard, MarkCompleteButton)
│   ├── auth/       (OtpForm, InAppBrowserBanner)
│   └── ui/         (Button, Modal, Input, … shared primitives)
├── content/program/  (day-01.mdx … day-14.mdx, index.ts registry)
├── lib/
│   ├── supabase/   (client.ts [anon], server.ts [ssr], admin.ts [service role])
│   ├── razorpay/   (client.ts, verify.ts)
│   ├── assessment/ (questions.ts, scoring.ts)
│   ├── email/send.ts            # Resend senders
│   ├── drip.ts, analytics.ts, inAppBrowser.ts
├── middleware.ts                # session refresh + route protection
├── public/                      # static assets (+ founder video if self-hosted)
├── .env.local                   # secrets (gitignored)
└── tailwind/next/tsconfig/package configs
```

## C.3 Component architecture

> Marketing = mostly **Server Components** (fast/SEO) with small **Client islands**. Authed area uses server reads (RLS) + client actions.

| Component | Type | Responsibility | Data / calls |
|---|---|---|---|
| Landing `page` | Server | Compose LP sections; fast LCP | static; UTM via client island |
| FounderVideo | Client | Lazy video w/ poster, `playsinline`, click-to-play | external/Storage URL |
| StickyCTA | Client | Sticky "start assessment" on scroll | router push |
| AssessmentFlow | Client | Question state machine, progress, back | holds answers; on finish → scoring.ts |
| QuestionCard / ProgressBar | Client | Render one Q; tap options | props from flow |
| EmailGate | Client | Capture email → create lead | `POST /api/lead`; Pixel `Lead`; redirect |
| Results `page` | Server | Read `lead_id` cookie → fetch minimal result (score/band/driver) via admin; render band + safety branch | admin read (no raw answers) |
| ScoreGauge / ResultBand / SafetyBranch | Server | Visualize score + band + high-band safety | props |
| ExitIntentModal | Client | Mobile-aware exit trigger; free-Day-1 offer; suppression | `POST /api/free-day1` |
| Checkout `page` | Server shell | Layout + summary | reads lead email (cookie) for prefill |
| RazorpayButton | Client | Create order, open checkout (UPI-first, prefill), handle callback | `POST /api/razorpay/order` → checkout.js → `POST /api/razorpay/verify`; Pixel `InitiateCheckout`/`Purchase` |
| Thank-you `page` | Server + client poll | Confirm; poll if callback lost; CTA Start Day 1 | `GET /api/order-status` |
| (app) layout | Server | Auth guard (redirect to /login) | server session |
| Dashboard `page` | Server | Fetch profile + progress; compute unlock; render list | RLS reads + drip.ts |
| ProgressRing / DayList / DayCard | Server | Simple X/14 + day states (✓/current/locked) | props |
| Day `page` | Server | Render day MDX + unlock check | content registry + progress |
| MarkCompleteButton | Client | Mark complete; fire Day-1 events | `POST /api/progress`; `day_1_started`/`day_1_completed` |
| OtpForm | Client | Email → OTP → verify → session | Supabase auth (anon) |
| InAppBrowserBanner | Client | Detect IG/FB browser; "open in browser" | inAppBrowser.ts |

## C.4 Supabase architecture

**Three access roles:**
- **Browser (anon key):** RLS-enforced; reads user's own `profiles`/`daily_progress`/`orders`; runs OTP auth.
- **Server SSR client (`@supabase/ssr`, cookies):** server components + route handlers acting *as the user* (RLS-enforced) for authed reads/writes.
- **Service-role client (`admin.ts`, server-only):** bypasses RLS for lead writes, order writes, **post-payment provisioning**, and webhook reconciliation. **Key never reaches the browser.**

**Auth:** email **OTP** (6-digit, passwordless). Social providers disabled. **No magic links.** Configure **custom SMTP → Resend** so OTP emails are branded/deliverable (Supabase default email is rate-limited). `middleware.ts` refreshes the session cookie on each request; the `(app)` layout guards routes.

**Post-payment provisioning + seamless session (critical):** on verified payment, the **service-role** client (1) upserts the auth user for the email (idempotent — create if absent), (2) inserts `profiles` (enrollment_date = now, baseline from lead), then (3) **establishes the session server-side and sets the auth cookies on the response**, so the buyer lands in `/dashboard` already signed in. **Fallback:** if session minting fails, redirect to `/login` (account exists → OTP). Finalize the exact admin/session API at implementation; the principle is fixed.

**Storage / video (mod #2):** recommend a **short (~30–60s) compressed MP4** hosted on **Supabase Storage** (public bucket) or **Cloudflare Stream/Mux** for a clean, brandless premium feel; lazy-load below the fold with a poster image and `playsinline` (no heavy autoplay on the LP — protect LCP). YouTube/Vimeo unlisted is the zero-effort fallback.

**Email (Resend) — two uses:** (a) Supabase Auth SMTP provider (OTP delivery), (b) transactional senders in `lib/email`: results email, free-Day-1, purchase confirmation/login-help, abandoned-checkout.

## C.5 Razorpay integration architecture

**Keys/config:** `key_id` (public, client), `key_secret` (server only), `webhook_secret` (server only). **Amounts in paise** (99900), INR. Build in **test mode**, switch to **live** at launch.

**Flow (server is the source of truth — never trust the client for payment status):**
1. **Create order** — `POST /api/razorpay/order`: server creates a Razorpay Order (amount 99900, INR, notes={lead_id,email}) → insert `orders` (status `created`) → return `order_id`, `key_id`, prefill (email/contact) to client.
2. **Checkout** — `RazorpayButton` loads checkout.js, opens with `order_id` + UPI-first config + prefill; callback returns `{razorpay_payment_id, razorpay_order_id, razorpay_signature}`.
3. **Verify** — `POST /api/razorpay/verify`: server verifies **HMAC-SHA256(order_id|payment_id, key_secret) === signature** → if valid: **idempotently** set order `paid` (`UPDATE … WHERE razorpay_order_id AND status <> 'paid'`) → provision user + profile (idempotent) → mint session + cookies → return success. Client fires Pixel `Purchase` → redirect `/thank-you`. Invalid signature → reject.
4. **Webhook** — `POST /api/razorpay/webhook`: verify webhook signature (`webhook_secret`) → **dedupe** via `processed_webhooks` (insert event id; conflict ⇒ skip) → reconcile: `payment.captured`/`order.paid` ⇒ ensure order paid + user provisioned (covers a lost client callback); `payment.failed` ⇒ mark `failed`; `refund.processed` ⇒ mark `refunded` + **revoke access**. Return **200 fast**; all work **idempotent**.
5. **Status poll** — `GET /api/order-status?order_id=`: thank-you page polls when the client callback may have been lost (in-app browser closed mid-redirect); once `paid`, sign in / OTP and proceed.

**Idempotency:** both `verify` and `webhook` can provision; guarded by the order status check + `processed_webhooks` + create-user-if-absent. A paid user is provisioned **exactly once** regardless of which path wins the race.

**Orders state machine:** `created → paid → (refunded)`; `created → failed` (retry creates a fresh order). 

**Refund:** trigger Razorpay refund (manual/admin) → webhook `refund.processed` → `refunded` + revoke dashboard access for that order's user → confirmation email.

**Security checklist:** server-side signature verification (payment + webhook) · service-role key server-only · idempotent writes · HTTPS · never grant access from client state · webhook returns 200 quickly with idempotent processing.

## C.6 Build order

> **Critical-path-first:** make it *payable and accessible* before making it pretty. The payment→provision→session path (Phase 2) gets the most care and the most tests.

**Phase 0 — Setup (½–1 day):** repo + Next.js/TS/Tailwind + design tokens; Supabase project; create schema + RLS (C.1); Resend + Supabase SMTP; Razorpay **test** keys; Meta Pixel base install; `.env.local`.

**Phase 1 — Public funnel (1–1.5 days):** LP sections + **FounderVideo (above social proof)** + SocialProof + StickyCTA (LCP budget, lazy video). Assessment flow + `scoring.ts` + EmailGate → `/api/lead` (signed `lead_id` cookie). Results (gauge/band/**safety branch**) + **ExitIntentModal** → `/api/free-day1`. Pixel `PageView/ViewContent/Lead`. Results + free-Day-1 emails (Resend).

**Phase 2 — Payment + access [CRITICAL] (1.5–2 days):** `/api/razorpay/order`; `RazorpayButton` (UPI-first, prefill); `/api/razorpay/verify` (signature → idempotent paid → provision → session); `/api/razorpay/webhook` (verify → `processed_webhooks` dedupe → reconcile); `/api/order-status` poll; thank-you page (**no upsell**); purchase confirmation email; Pixel `InitiateCheckout/Purchase`.

**Phase 3 — Auth + dashboard (1 day):** OtpForm (OTP, no OAuth/magic-link) + InAppBrowserBanner; `middleware.ts` session; `(app)` guard; **simplified** dashboard (ProgressRing X/14, DayList, DayCard); day page (MDX render + unlock); MarkCompleteButton → `/api/progress`; drip logic; **`day_1_started` / `day_1_completed`** events.

**Phase 4 — Content (½–1 day):** author/import Days 1–14 MDX from the program library + registry.

**Phase 5 — Compliance/polish (½–1 day):** privacy + terms pages; guarantee/refund path + access revoke; **soften over-promise copy** (in-app trend); premium polish + perf budget; no-fabricated-proof check.

**Phase 6 — QA + launch (½–1 day):** full **< 5-min path on a real phone through the Instagram in-app browser**; payment edge cases (lost callback, duplicate webhook, failed payment, refund→revoke); RLS verification (can't read others' data); switch Razorpay to **live** + real webhook URL; go live.

**Cut-line if the clock is tight (drop in this order):** remaining nurture emails → exit-intent niceties → drip (fall back to unlock-all). **Never cut:** server-side payment verification, idempotent provisioning, OTP + in-app-browser handling, and every item in B.7.

---

## D. Definition of Done (acceptance criteria)
- [ ] Cold visitor completes Ad→LP→Assessment→Results→Checkout→Dashboard on a phone **in < 5 min**, including via the Instagram in-app browser.
- [ ] Founder video renders above social proof, lazy-loaded, LCP < 2.5s mobile.
- [ ] Exit-intent free-Day-1 fires (mobile triggers), suppresses for purchasers/already-sent, sends Day 1 via Resend, sets `got_free_day1`.
- [ ] Payment verified server-side; a paying user **always** reaches the dashboard (test lost-callback + duplicate-webhook).
- [ ] Auth via OTP only (no OAuth/magic-link); in-app-browser banner appears appropriately.
- [ ] RLS enforced: a user cannot read another user's data.
- [ ] Dashboard is content + completion only (no charts/streaks/badges). Day 1 available immediately on purchase.
- [ ] Pixel fires `PageView/ViewContent/Lead/InitiateCheckout/Purchase` + **`day_1_started`/`day_1_completed`**, neutral names, Purchase value 999 INR.
- [ ] Results never use fear framing; high-band safety branch + crisis/footer + "not medical advice" present.
- [ ] Guarantee stated consistently; refund path revokes access. No fabricated social proof. Privacy + terms published; assessment data under RLS with stated consent.
- [ ] **No 42-day upsell anywhere.**

---

## E. Open config to confirm
- Price **₹999** (99900 paise, INR); founding framing only with a real trigger.
- `DRIP_ENABLED` default **true**.
- Founder video host: Supabase Storage / Cloudflare Stream (recommended) vs YouTube unlisted (fallback).
- Get **privacy policy + terms professionally reviewed** (DPDP) — this spec is not legal advice.
