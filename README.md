# The Symptom Spiral Reset

A premium 14-day SaaS program that helps people break the compulsive
**symptom-Google → body-check → reassurance-seek** loop. Built on CBT & ERP
methods. Front-end offer: **₹999**, one-time, founding price.

> Psychoeducational self-help — **not** medical advice, diagnosis, or treatment,
> and not a replacement for professional care.

## Stack
Next.js (App Router) · TypeScript · Tailwind · Supabase (Postgres + Auth + RLS)
· Razorpay · Resend · Vercel.

## Goal
**Meta Ad → purchase in under 5 minutes**, fully in-product (no PDFs/app).

---

## Launch flags
- `DRIP_ENABLED = false` (in `lib/drip.ts`) — **all 14 days unlock immediately on
  purchase.** Flip to `true` to drip one day per calendar day.
- Analytics events: `Lead`, `InitiateCheckout`, `Purchase`, **`day_1_started`**,
  **`day_1_completed`** (activation/PMF indicators), **`refund_requested`**
  (dissatisfaction indicator). All neutral-named (Meta sensitive-trait rule).

---

## Setup
1. `npm install`
2. Copy `.env.example` → `.env.local` and fill in Supabase, Razorpay, Resend,
   and Meta Pixel values.
3. Create a Supabase project; run `supabase/migrations/0001_init.sql` in the SQL
   editor. In **Auth → Providers**, enable **Email OTP** and **disable** social
   providers and magic links. In **Auth → SMTP**, point email at Resend.
4. In Razorpay, create test keys and a webhook (events:
   `payment.captured`, `order.paid`, `payment.failed`, `refund.processed`)
   pointing at `/api/razorpay/webhook`; set `RAZORPAY_WEBHOOK_SECRET`.
5. `npm run dev`.

---

## Build phases
- **Phase 0 — Foundation (DONE):** scaffold, design tokens, `app/layout` + Pixel
  base, `middleware`, full `lib/*`, and `0001_init.sql` (all tables + RLS).
- **Phase 1 — Public funnel:** LP (incl. **FounderVideo** above social proof) →
  Assessment → Results (incl. **ExitIntentModal** "Get Day 1 free"). Routes:
  `/api/lead`, `/api/free-day1`. Tables: `leads`. Pixel: PageView/ViewContent/Lead.
- **Phase 2 — Payment & access (critical):** Checkout → `/api/razorpay/order` →
  `/verify` (signature → idempotent paid → provision → session) → `/webhook`
  (idempotent reconcile via `processed_webhooks`) → `/api/order-status` poll →
  thank-you (no upsell). Tables: `orders`, `profiles`, `processed_webhooks`.
- **Phase 3 — Auth & dashboard:** OTP login + in-app-browser banner; simplified
  dashboard (content + completion only); day pages; `/api/progress`; drip util
  (off). Events: `day_1_started`, `day_1_completed`.
- **Phase 4 — Content:** Days 1–14 as MDX in `content/program/`.
- **Phase 5 — Compliance, refund & polish:** privacy/terms; "Request a refund"
  action → `refund_requested` + access-revoke; perf/copy polish.
- **Phase 6 — QA & launch:** full <5-min path on a phone via the Instagram
  in-app browser; payment edge cases (lost callback, duplicate webhook, failed,
  refund→revoke); RLS verification; switch Razorpay to live.

---

## Hard rules (do not regress)
- Server-side Razorpay signature verification; never grant access from the client.
- Idempotent provisioning (a paid user is created exactly once across the
  verify/webhook race).
- Email OTP only — no OAuth, no magic links (in-app-browser safe).
- RLS on every table; service-role key server-only.
- Meta personal-attributes-safe copy on LP + results; "not medical advice"
  disclaimers; crisis line in footer + high-band results; hopeful (never fear)
  results framing; no fabricated social proof; one-time billing stated plainly;
  honest 30-day guarantee, one email to claim.
- Get privacy policy + terms professionally reviewed (DPDP). This repo is not
  legal advice.
