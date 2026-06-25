// Client-side UTM capture. Stashes ad attribution params on first landing so the
// eventual lead carries them. Read at the email gate when POSTing /api/lead.

const KEY = "ssr_utm";
const FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type Utm = Partial<Record<(typeof FIELDS)[number], string>>;

export function captureUtm(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const utm: Utm = {};
    let found = false;
    for (const f of FIELDS) {
      const v = params.get(f);
      if (v) {
        utm[f] = v.slice(0, 200);
        found = true;
      }
    }
    // Only overwrite if this visit actually carried UTMs (don't clobber the
    // original attribution on later internal navigations).
    if (found && !sessionStorage.getItem(KEY)) {
      sessionStorage.setItem(KEY, JSON.stringify(utm));
    }
  } catch {
    // sessionStorage can throw in private modes — attribution is best-effort.
  }
}

export function getUtm(): Utm {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "{}") as Utm;
  } catch {
    return {};
  }
}
