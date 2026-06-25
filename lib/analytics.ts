// Meta Pixel event wrappers. NEUTRAL event names only (Meta disables custom
// conversions/audiences whose names imply sensitive traits). No health data in
// params. Standard events use track(); custom activation events use trackCustom().

type StandardEvent =
  | "PageView"
  | "ViewContent"
  | "Lead"
  | "InitiateCheckout"
  | "Purchase";

type CustomEvent = "day_1_started" | "day_1_completed" | "refund_requested";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function trackStandard(event: StandardEvent, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, params);
  }
}

function trackCustom(event: CustomEvent, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", event, params);
  }
}

export const Analytics = {
  viewContent: (name: string) => trackStandard("ViewContent", { content_name: name }),
  lead: () => trackStandard("Lead"),
  initiateCheckout: () => trackStandard("InitiateCheckout", { value: 999, currency: "INR" }),
  purchase: () => trackStandard("Purchase", { value: 999, currency: "INR" }),
  // Activation / PMF leading indicators:
  day1Started: () => trackCustom("day_1_started"),
  day1Completed: () => trackCustom("day_1_completed"),
  // Dissatisfaction leading indicator:
  refundRequested: () => trackCustom("refund_requested"),
};
