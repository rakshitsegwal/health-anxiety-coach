export type { Band, Driver, AssessmentResult } from "./assessment/scoring";

export type OrderStatus = "created" | "paid" | "failed" | "refunded";
export type Plan = "14day";

export const PRICE_PAISE = 99900; // ₹999
export const CURRENCY = "INR";
