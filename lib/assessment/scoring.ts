// Scoring for the Symptom Spiral Assessment. Implemented exactly per spec.
// Produces the user's Day-0 Spiral Score (0–100), band, dominant driver,
// and a safety flag for high-distress results.

export type Band = "occasional" | "active" | "strong" | "intense";
export type Driver = "searching" | "checking" | "reassurance";

export interface AssessmentResult {
  score: number; // 0–100
  band: Band;
  driver: Driver;
  safetyBranch: boolean;
}

export const BAND_LABEL: Record<Band, string> = {
  occasional: "Occasional Loop",
  active: "Active Loop",
  strong: "Strong Loop",
  intense: "Intense Loop",
};

export const DRIVER_LABEL: Record<Driver, string> = {
  searching: "searching",
  checking: "body-checking",
  reassurance: "reassurance-seeking",
};

export function scoreAssessment(answers: Record<string, number>): AssessmentResult {
  const q = (id: string) => answers[id] ?? 0;

  const raw =
    q("q1") + q("q2") + q("q3") + q("q4") + q("q5") +
    q("q6") + q("q7") + q("q8") + q("q9") + q("q10");

  const score = Math.round(raw * 2.5); // 0–40 -> 0–100

  const band: Band =
    score <= 25 ? "occasional" :
    score <= 50 ? "active" :
    score <= 75 ? "strong" : "intense";

  const searching = q("q1") + q("q4");
  const checking = q("q2");
  const reassurance = q("q3") + q("q5");
  const driver: Driver =
    searching >= checking && searching >= reassurance ? "searching" :
    checking >= reassurance ? "checking" : "reassurance";

  // High-distress branch: surface "consider a therapist" + crisis note.
  const safetyBranch =
    score >= 76 || q("q6") === 4 || q("q7") === 4 || q("q8") === 4;

  return { score, band, driver, safetyBranch };
}
