// Meta Pixel — single source of truth for client-side pixel events.
//
// PRIVACY (non-negotiable): never send health data — no symptom names, quiz
// answers, diagnoses, bands, or Spiral Score. Only neutral commerce params:
// value, currency, content_name ("Symptom Spiral Reset"), content_category
// ("Digital Program").
//
// CAPI-READY: every event carries an `eventID` (Meta's dedup key), which track()/
// trackCustom()/pageView() RETURN so a caller can thread it to the server. For
// PURCHASE (and InitiateCheckout) we use the Razorpay order id as the eventID — a
// server-knowable value — so a future Conversions API Purchase fired from the
// webhook with the same `event_id` deduplicates cleanly. Other events use a
// generated id; thread the returned id to your server if/when you add CAPI there.
//
// Logs only in development (`[Meta Pixel] <Event>`); silent in production.

export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "983903721133077";

const CONTENT_NAME = "Symptom Spiral Reset";
const CONTENT_CATEGORY = "Digital Program";
const PRICE = 999;
const CURRENCY = "INR";
const CONTENT = {
  content_name: CONTENT_NAME,
  content_category: CONTENT_CATEGORY,
} as const;

const isDev = process.env.NODE_ENV !== "production";

// ── fbq typing ───────────────────────────────────────────────────────────────
type Fbq = {
  (...args: unknown[]): void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  callMethod?: (...args: unknown[]) => void;
  push?: unknown;
};
declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

export type StandardEvent =
  | "PageView"
  | "ViewContent"
  | "Lead"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase";
export type EventParams = Record<string, string | number | boolean>;
export interface TrackOptions {
  /** Dedup key shared with a future Conversions API event. */
  eventID?: string;
}

let initialized = false;

function newEventId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `e_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function devLog(eventName: string): void {
  if (isDev) console.log(`[Meta Pixel] ${eventName}`);
}

// Loads the base library ONCE and runs fbq('init'). Idempotent and SSR-safe — the
// `initialized` flag + the `window.fbq` check survive React Strict Mode's
// double-invoke and any extra calls.
export function initMetaPixel(): void {
  if (typeof window === "undefined" || !META_PIXEL_ID || initialized) return;
  initialized = true;

  if (!window.fbq) {
    const fbq = function fbq(this: unknown, ...args: unknown[]): void {
      const self = fbq as Fbq;
      if (self.callMethod) self.callMethod.apply(self, args);
      else self.queue?.push(args);
    } as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    if (!window._fbq) window._fbq = fbq;

    const t = document.createElement("script");
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";
    const s = document.getElementsByTagName("script")[0];
    s?.parentNode?.insertBefore(t, s);
  }

  window.fbq("init", META_PIXEL_ID);
  devLog(`init ${META_PIXEL_ID}`);
}

function fire(
  method: "track" | "trackCustom",
  eventName: string,
  params: EventParams | undefined,
  eventID: string
): void {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq(method, eventName, params ?? {}, { eventID });
  devLog(eventName);
}

// ── Core API (the four required functions) ───────────────────────────────────
export function pageView(): string {
  const eventID = newEventId();
  fire("track", "PageView", undefined, eventID);
  return eventID;
}

export function track(
  eventName: StandardEvent,
  params?: EventParams,
  options?: TrackOptions
): string {
  const eventID = options?.eventID ?? newEventId();
  fire("track", eventName, params, eventID);
  return eventID;
}

export function trackCustom(
  eventName: string,
  params?: EventParams,
  options?: TrackOptions
): string {
  const eventID = options?.eventID ?? newEventId();
  fire("trackCustom", eventName, params, eventID);
  return eventID;
}

// ── Funnel helpers — privacy-safe params only ────────────────────────────────
export const MetaPixel = {
  /** Landing page / assessment / results / offer viewed. */
  viewContent: (): string => track("ViewContent", { ...CONTENT }),
  /** Email captured (assessment completed). */
  lead: (): string => track("Lead", { ...CONTENT }),
  /** Razorpay checkout opened. Pass the order id as eventID for CAPI dedup. */
  initiateCheckout: (orderId?: string): string =>
    track(
      "InitiateCheckout",
      { value: PRICE, currency: CURRENCY, ...CONTENT },
      orderId ? { eventID: orderId } : undefined
    ),
  /**
   * Successful, server-VERIFIED Razorpay payment. Pass the Razorpay order id so a
   * future server-side CAPI Purchase with the same event_id deduplicates.
   */
  purchase: (orderId?: string): string =>
    track(
      "Purchase",
      { value: PRICE, currency: CURRENCY, ...CONTENT },
      orderId ? { eventID: orderId } : undefined
    ),
  // Custom activation / dissatisfaction events (neutral names, no params).
  dayStarted: (): string => trackCustom("day_1_started"),
  dayCompleted: (): string => trackCustom("day_1_completed"),
  refundRequested: (): string => trackCustom("refund_requested"),
};
