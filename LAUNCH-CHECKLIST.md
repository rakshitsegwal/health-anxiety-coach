# Phase 6 — QA & Launch Checklist

**Principle: a green build is NOT launch-ready.** Every item below only counts when it
runs on a **real device** with **live keys/ops**. Don't check a box from a `npm run build`
or the simulated e2e — those got us this far, but Phase 6 is about the real thing.

Phases 1–5 are built and verified end-to-end against real Supabase + real Razorpay secrets
(simulated payment callbacks/webhooks). What's left is everything that can only be proven
with a real captured payment, a real inbox, a real phone, and live keys.

---

## HARD LAUNCH GATES (blocking — cannot ship without these)

### GATE 1 — Real test-mode purchase → real refund, end to end
The refund auto-initiate has only ever been verified **in code** (the simulated test used a
synthetic `payment_id`, so `refundInitiated` came back `false` and fell back to manual). It
has **never reversed real money**. Before launch, run a genuine captured payment through it:

1. Razorpay in **test mode**, test webhook live → open `/checkout`, pay with a real Razorpay
   **test card / test UPI** (a genuinely captured payment, not the simulated callback).
2. Verify: lands signed-in on `/dashboard` (seamless session) **or** thank-you → OTP;
   `orders.status=paid`; user + profile provisioned; `Purchase` pixel fires.
3. Dashboard → **Request a refund** → confirm.
4. Verify **all of**:
   - `/api/refund-request` returns `refundInitiated: **true**` (real captured payment IS refundable),
   - the **refund shows in the Razorpay dashboard** (money actually reversed),
   - `refund.processed` webhook arrives → `orders.status=refunded`,
   - next `/dashboard` load → **307 → `/login?revoked=1`** (access revoked),
   - refund-confirmation email received.
5. **Repeat once on LIVE keys** with a small real payment before going fully live (then refund it).

> This is the gate the whole guarantee depends on. If `refundInitiated` is `false` on a real
> captured payment, stop and fix before launch.

### GATE 2 — Legal pages finalized + lawyer/DPDP review
We collect **sensitive health-related data** (assessment answers, daily check-ins) under
**DPDP**. The legal pages currently ship with **bracketed placeholders** and a "Draft for
review" banner. They **cannot go live as-is**. Before launch:

- [ ] Fill `[legal entity name]`, `[address]`, `[privacy@…]`, `[support@…]` across
      `app/legal/privacy/page.tsx` and `app/legal/terms/page.tsx`.
- [ ] Name a **Grievance Officer** + contact (DPDP requirement) — replace `[name]`,
      `[grievance@…]`.
- [ ] Have both pages **reviewed by a qualified professional** for DPDP + consumer/health
      compliance; remove the "Draft for review" banners only after sign-off.
- [ ] Confirm consent capture wording at the email gate matches the final policy.

> (Claude can do the find-and-replace the moment you provide the real values; the legal
> **review** itself is on you.)

---

## (a) What Claude Code can do now (no phone / live keys needed)

- [x] **Strengthen score-tracking copy** (done this turn) — LP "How it works" step 3, results
      bridge, and checkout stack now surface the in-app Spiral Score ("watch the number move"),
      staying inside the honest-language rules. Build rerun.
- [ ] **Fill legal placeholders** once you give me entity / grievance / contact values (Gate 2).
- [ ] **SEO/share polish**: `openGraph`/`twitter` meta + an OG image on the LP; favicon/app
      icons; `robots`/`sitemap`; a friendly `not-found.tsx`. (Say the word.)
- [ ] **Error resilience**: an `(app)/error.tsx` + funnel `error.tsx` so a transient DB/API
      hiccup shows a recover-able state, not a raw crash.
- [ ] **Env completeness lint**: a tiny boot check that fails fast if a required env var is
      missing in production.
- [ ] **Re-run the simulated e2e** after any change as a regression net (currently 45/45).
- [x] **Done this turn:** env-completeness boot check (fail-fast in prod via `instrumentation.ts`
      + `lib/env.ts`, incl. a guard against the `/rest/v1` URL bug); error boundaries
      (`app/error.tsx` + `app/global-error.tsx`); friendly `app/not-found.tsx`; favicon
      (`app/icon.svg`); dynamic share image (`app/opengraph-image.tsx`) + OpenGraph/Twitter meta.
- [ ] **Abandoned-checkout email — DEFERRED for v1 (decision).** The sender
      (`sendAbandonedCheckout`) exists but is intentionally **not wired**: it needs a scheduler
      (Vercel Cron or pg_cron) to run ~1h after `InitiateCheckout` without `Purchase`, plus a
      dedup flag to avoid re-sends — infra not yet in place, and it's on the spec's cut-line.
      **Post-launch wire-up:** add `orders.abandoned_email_sent_at` (migration 0004); a
      `CRON_SECRET`-protected `GET /api/cron/abandoned-checkout` that selects orders with
      `status='created'` and `created_at` between ~1h and ~24h ago and no
      `abandoned_email_sent_at`, sends + stamps them; and a Vercel Cron entry (`vercel.json`)
      to hit it hourly. (Claude can build all of this in ~one pass when you want it.)

## (b) What needs your real phone

- [ ] **Real OTP delivery + sign-in**: request a code to a **real inbox**, confirm the email
      arrives (template emits the 6-digit `{{ .Token }}`, not a magic link) and the code signs
      you in. (Never tested — the simulated run used an undeliverable test domain.)
- [ ] **Day-page UX on device**: confirm the lesson reads as the hero and the check-in is a
      quiet, collapsed step; slider/steppers/segmented buttons are thumb-friendly; the live
      Spiral Score updates.
- [ ] **Full funnel feel** on a mid-range phone over cellular: LP LCP < 2.5s, lazy founder
      video, no layout shift, tap targets ≥ 44px.
- [ ] **In-app-browser banner**: appears in IG/FB webview with a working "open in browser"
      escape (see (d)).
- [ ] **Hopeful, never-fear** results framing reads right on a small screen; high-band safety
      branch + crisis line visible.

## (c) What needs live keys / ops

- [ ] **Razorpay → LIVE**: live `key_id`/`key_secret`; create the **live webhook** → your prod
      `/api/razorpay/webhook` with the 4 events (`payment.captured`, `order.paid`,
      `payment.failed`, `refund.processed`); set `RAZORPAY_WEBHOOK_SECRET` to the **live**
      signing secret (single value — re-confirm the earlier duplicate stays resolved).
- [ ] **Supabase (prod project)**: migrations **0001 + 0002 + 0003** applied; **Email OTP on**,
      social + magic links **off**; **SMTP → Resend**; OTP email template emits `{{ .Token }}`.
- [ ] **Resend**: verified sending **domain** (SPF/DKIM) so OTP + transactional emails land;
      set `EMAIL_FROM` to that domain.
- [ ] **Meta Pixel**: real `NEXT_PUBLIC_FB_PIXEL_ID`; verify events land in Events Manager.
- [ ] **Vercel deploy**: all env vars set in the project (not `.env.local`);
      `NEXT_PUBLIC_SITE_URL` = prod URL; strong random `LEAD_COOKIE_SECRET`; HTTPS + domain.
- [ ] **Founder video** hosted (`NEXT_PUBLIC_FOUNDER_VIDEO_URL`) or the graceful fallback is
      acceptable for launch.
- [ ] Run **GATE 1** again against live keys with a small real payment, then refund it.

## (d) The Instagram in-app-browser < 5-min run

Cold-traffic reality check — the funnel must survive Meta's in-app browser.

1. Put the prod LP URL in an **Instagram** DM/story link (or tap an ad) on a **real phone** so
   it opens in **IG's in-app browser** (not Safari/Chrome).
2. Time it. Walk the whole path: **LP → "take the assessment" → 10 Qs (one per screen,
   tap-only, Back works) → email gate → results (gauge + band + safety branch) → checkout
   (UPI/wallet express first, email prefilled) → pay (test/live) → thank-you/dashboard → open
   Day 1.**
3. Verify in the IG browser specifically:
   - **In-app-browser banner** shows with a working "open in your browser" escape.
   - Auth is **OTP only** — no OAuth/magic-link dead ends.
   - If the in-app browser drops the payment callback, the **thank-you poll → OTP** path still
     lands the buyer in the program (the lost-callback case).
   - **Total time < 5 minutes**, no broken redirects, no blank screens.
4. **Repeat in the Facebook in-app browser.**

## (e) Final pre-launch GO / NO-GO

Ship only when **every** box is checked **on real device + live keys** (not from a build):

- [ ] **GATE 1**: real captured payment → refund **reverses money** + **revokes access** (incl. one live-key run).
- [ ] **GATE 2**: legal pages finalized, placeholders gone, lawyer/DPDP sign-off.
- [ ] **< 5-min funnel** verified on a real phone via the **IG in-app browser** (and FB).
- [ ] **OTP** email delivers to a real inbox + sign-in works; in-app-browser banner appears.
- [ ] **Live Razorpay** keys + live webhook (4 events) verified; webhook secret matches dashboard.
- [ ] **Supabase prod**: 0001–0003 applied; RLS holds (a user can't read another's
      orders/profiles/daily_progress); OTP-only auth.
- [ ] **Pixel** fires `PageView/ViewContent/Lead/InitiateCheckout/Purchase` +
      `day_1_started`/`day_1_completed` + `refund_requested`; `Purchase` value **999 INR**;
      neutral event names.
- [ ] **Meta personal-attributes** review: ad **and** LP read supportive/educational, never
      "you have/suffer from…"; no fear framing; **no fabricated social proof**.
- [ ] **Guarantee** stated identically on checkout / thank-you / terms; crisis line +
      "not medical advice / not a diagnosis" in the global footer and high-band results.
- [ ] **Payment edge cases** on live infra: duplicate webhook (no double-provision), lost
      callback (poll → OTP), failed payment (no access), refund (revoke).
- [ ] **Perf**: LP LCP < 2.5s on a mid-range phone.

> **Never cut** (per FINAL-SPEC): server-side payment verification, idempotent provisioning,
> OTP + in-app-browser handling, and every compliance item in B.7. If the clock is tight, the
> only safe drops are remaining nurture emails → exit-intent niceties → drip (already off).
