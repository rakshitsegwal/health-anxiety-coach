import "server-only";
import crypto from "crypto";

// Short-lived, signed cookie that links a browser to its `leads` row between the
// email gate and the results/checkout pages — without exposing the lead id to
// tampering. Value format: `<uuid>.<base64url-hmac>`. httpOnly; the server reads
// it to fetch ONLY score/band/driver for that lead (never the raw answers).

export const LEAD_COOKIE = "ssr_lead";
export const LEAD_COOKIE_MAX_AGE = 60 * 60 * 24; // 24h

function secret(): string {
  const s = process.env.LEAD_COOKIE_SECRET;
  if (!s) throw new Error("LEAD_COOKIE_SECRET is not set");
  return s;
}

function sign(id: string): string {
  return crypto.createHmac("sha256", secret()).update(id).digest("base64url");
}

export function signLeadId(id: string): string {
  return `${id}.${sign(id)}`;
}

export function verifyLeadCookie(value: string | undefined | null): string | null {
  if (!value) return null;
  const i = value.lastIndexOf(".");
  if (i <= 0) return null;
  const id = value.slice(0, i);
  const sig = value.slice(i + 1);
  const expected = sign(id);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return id;
}
