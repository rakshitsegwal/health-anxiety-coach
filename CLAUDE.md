# Build Prompt — The Symptom Spiral Reset (MVP)

> Save this as **`CLAUDE.md`** in the repo root (Claude Code auto-loads it), then
> your first message can be: *"Read CLAUDE.md and the /docs specs, then build
> Phase 1."* Or paste this whole thing as your first message.

You are the engineer building the MVP described below. A **Phase 0 foundation
scaffold already exists in this repo** — build on it, do not rebuild it.

## What we're building
A premium 14-day SaaS program that helps people break the compulsive
**symptom-Google → body-check → reassurance-seek** loop, using CBT & ERP methods.
Front-end offer: **₹999, one-time** (founding price). The complete 42-day program
exists as content and is unlocked later — **out of scope for this MVP.**

**The one goal:** a cold visitor goes **Meta Ad → purchase in under 5 minutes**,
fully in-product (no PDFs, no native app). Optimized for cold traffic, impulse,
and mobile.

## Read these first (in /docs — add them to the repo)
- `docs/FINAL-SPEC.md` — the authoritative spec (screens, schema, payment/auth
  flow, edge cases). **This wins on any conflict.**
- `docs/FUNNEL-COPY.md` — the exact copy for every screen. **Use it verbatim;
  do not invent new marketing copy.**
- `docs/PROGRAM.md` — the frozen program. **Days 1–14 content comes from here.**

## Stack
Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v3 · Supabase
(Postgres + Auth + RLS) · Razorpay · Resend · Vercel.

## What Phase 0 already provides — reuse it, don't duplicate
- Project scaffold + Tailwind design tokens (sage paper bg, healing-teal primary,
  Fraunces + Hanken Grotesk). `app/layout.tsx` wires fonts + the Meta Pixel base.
- `supabase/migrations/0001_init.sql` — all 5 tables with RLS: `leads`,
  `orders`, `profiles`, `daily_progress`, `processed_webhooks`.
- `middleware.ts` — session refresh + `/dashboard` guard.
- `lib/`:
  - `supabase/{client,server,admin}.ts` (anon / SSR / **service-role, server-only**)
  - `razorpay/{client,verify}.ts` (timing-safe HMAC for payment + webhook)
  - `assessment/{questions,scoring}.ts` (the 10 Qs + score→band→driver→safety)
  - `drip.ts` (`DRIP_ENABLED = false`), `analytics.ts`, `inAppBrowser.ts`,
    `email/send.ts`, `types.ts`

---

## HARD RULES — do not regress any of these

**Payment & access (critical):**
- Verify the Razorpay signature **server-side**; **never** grant access from the
  client. Use `lib/razorpay/verify.ts`.
- **Idempotent provisioning:** a paid user is created **exactly once** across the
  `/verify` (client callback) and `/webhook` (async) race. Guard with the order
  status check + the `processed_webhooks` table + create-user-if-absent.
- **Buy first, register after** — no account creation before payment. The email
  captured at the assessment gate becomes the login identity post-purchase.
- **Seamless post-payment session:** on confirmed payment, establish the session
  server-side and land the buyer in `/dashboard` with no re-entry. OTP is the
  fallback. If the client callback is lost, the thank-you page polls
  `/api/order-status` and signs in once the webhook marks the order paid.

**Auth:**
- **Email OTP only (6-digit). No social OAuth, no magic links** — they break in
  the Instagram/Facebook in-app browser. Detect in-app browser
  (`lib/inAppBrowser.ts`) and show an "open in your browser" banner.

**Data:**
- RLS on every table; the **service-role key is server-only** (never bundled to
  the client — it's already marked `server-only`).

**Flags & events (already wired — use them):**
- `DRIP_ENABLED = false` → **all 14 days unlock immediately** on purchase.
- Pixel events, **neutral names only**, no health data in params:
  `PageView, ViewContent, Lead, InitiateCheckout, Purchase`,
  **`day_1_started`, `day_1_completed`** (activation/PMF), **`refund_requested`**
  (dissatisfaction). Price: **₹999 = 99900 paise, INR**.

**Compliance & safety (encode in the UI):**
- LP + results are **Meta personal-attributes-safe** (first-person/educational,
  never "you have/suffer from [condition]"). The **landing page is reviewed by
  Meta**, not just the ad.
- **Hopeful results framing — never fear.** A high score reads "this is the
  pattern this program breaks," not "you're in danger."
- High-band **safety branch** (score ≥ 76 or Q6/Q7/Q8 maxed): show "consider a
  therapist alongside this" + a crisis line.
- "**Not medical advice / not a diagnosis**" disclaimers on assessment + results;
  crisis line in the global footer.
- **No fabricated social proof** — every testimonial/number slot is real or uses
  the honest pre-launch placeholder from the copy deck.
- **One-time payment, no subscription**, stated plainly at checkout.
- **30-day money-back guarantee**, claimable in one email; stated identically on
  checkout + thank-you. A refund **revokes access** and fires `refund_requested`.

**Out of scope — do NOT build:** AI chat, community, native app, social features,
complex analytics dashboards, gamification (no points/badges/streaks/charts),
and **no 42-day upsell anywhere**.

---

## Build order (do these in sequence; run the app after each)

**Phase 1 — Public funnel** (`leads`; routes `/api/lead`, `/api/free-day1`):
LP route with sections in this order — hero → the-loop → how-it-works →
why-it-works → **FounderVideo (above social proof)** → social proof → FAQ →
guarantee → safety footer, single CTA + sticky CTA, LCP < 2.5s (lazy-load video).
Assessment (`lib/assessment` — one Q per screen, tap-only, progress bar, back).
Email gate → `POST /api/lead` (writes `leads` via service role, sets a
short-lived signed `lead_id` cookie, fires `Lead`) → results email (Resend).
Results page: read `lead_id` cookie → fetch **only** score/band/driver (never raw
answers) → ScoreGauge + band copy + **safety branch** + one-tap CTA to checkout.
**ExitIntentModal** "Get Day 1 free" — mobile triggers (back-button/history +
inactivity + scroll-up), pre-fills the known email, suppresses for
purchasers/already-sent, `POST /api/free-day1` → Day 1 email + set `got_free_day1`.

**Phase 2 — Payment & access [MOST CRITICAL]** (`orders`, `profiles`,
`processed_webhooks`): checkout page (UPI/wallet express first, email prefilled,
guarantee inline, "one-time, no subscription"). Routes:
- `POST /api/razorpay/order` — create order (99900, INR) + `orders` row (`created`)
- `POST /api/razorpay/verify` — verify signature → idempotent `paid` → provision
  user + `profiles` (baseline from lead) → establish session → client fires
  `Purchase` → redirect `/thank-you`
- `POST /api/razorpay/webhook` — verify webhook sig → dedupe via
  `processed_webhooks` → reconcile (`payment.captured`/`order.paid` ⇒ ensure paid
  + provisioned; `payment.failed` ⇒ failed; `refund.processed` ⇒ refunded +
  revoke access). Return 200 fast; all work idempotent.
- `GET /api/order-status?order_id=` — thank-you polling for lost callbacks.
Thank-you page: confirm, "Day-0 saved, all 14 days unlocked," CTA **Start Day 1**,
guarantee + safety note, **no upsell**.

**Phase 3 — Auth & dashboard** (`profiles`, `daily_progress`; route
`/api/progress`): `/login` (OTP + InAppBrowserBanner). `(app)` layout auth guard.
Dashboard — **content + completion only**: simple X/14 progress, today's session
prominent, day list (all available since drip is off). Day page renders the day's
MDX + "Mark day complete" → `POST /api/progress`. Day 1 fires `day_1_started` on
open and `day_1_completed` on completion.

**Phase 4 — Content:** Days 1–14 as MDX in `content/program/` (from
`docs/PROGRAM.md`) + a registry/loader.

**Phase 5 — Compliance, refund & polish:** `/legal/privacy` + `/legal/terms`
pages; a "Request a refund" action in the account/dashboard that fires
`refund_requested` and triggers the refund→revoke path; premium polish + perf
budget; soften any copy implying an in-app score trend (the MVP doesn't ship one
— the Day-0 baseline on results still holds).

**Phase 6 — QA & launch:** test the full **< 5-min path on a real phone via the
Instagram in-app browser**; the payment edge cases below; RLS; switch Razorpay to
live keys + real webhook URL.

---

## Testing you must actually run (don't just assume it works)
- `npm install`, run `0001_init.sql` in Supabase, enable **Email OTP** (disable
  social + magic links), point Supabase Auth SMTP at Resend, set Razorpay **test**
  keys + a webhook → `/api/razorpay/webhook`. `npm run dev`.
- **Payment path:** order creation; valid signature grants access and lands in
  dashboard; **duplicate webhook does NOT double-provision**; **lost client
  callback** → webhook still provisions → `/api/order-status` poll signs the user
  in; failed payment handled gracefully; **refund revokes access** + fires
  `refund_requested`.
- **RLS:** a logged-in user cannot read another user's `profiles`/`orders`/
  `daily_progress`.
- **Funnel:** cold → LP → assessment → results → checkout → dashboard in **< 5
  min** on mobile, including the in-app-browser banner path.

## Working style
- Build phase by phase; run the app and verify before moving on.
- Match the existing design tokens and reuse `lib/*` — don't duplicate logic.
- Follow `docs/FINAL-SPEC.md` and use `docs/FUNNEL-COPY.md` copy verbatim.
- Ask before deleting or overwriting any Phase 0 file.
- Flag (don't silently skip) anything in the hard rules you can't satisfy.
- Note: privacy policy + terms need professional/DPDP review — generate sensible
  drafts and clearly mark them as drafts to be reviewed.
