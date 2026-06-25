// The 2-minute Symptom Spiral Assessment.
// 10 scored questions (q1–q10) + 1 unscored context question.
// Copy mirrors the funnel deck. Tap-only; one question per screen on mobile.

export interface Option {
  label: string;
  value: number; // 0–4
}
export interface Question {
  id: string;
  text: string;
  options: Option[];
  scored: boolean;
}

const FREQ: Option[] = [
  { label: "Never", value: 0 },
  { label: "Rarely", value: 1 },
  { label: "Sometimes", value: 2 },
  { label: "Often", value: 3 },
  { label: "Almost constantly", value: 4 },
];

const RELIEF: Option[] = [
  { label: "Months", value: 0 },
  { label: "Weeks", value: 1 },
  { label: "A few days", value: 2 },
  { label: "Hours", value: 3 },
  { label: "Minutes", value: 4 },
];

const TIME: Option[] = [
  { label: "Almost none", value: 0 },
  { label: "Under 15 min", value: 1 },
  { label: "15–60 min", value: 2 },
  { label: "1–3 hours", value: 3 },
  { label: "Over 3 hours", value: 4 },
];

const DURATION: Option[] = [
  { label: "Less than 6 months", value: 0 },
  { label: "6 months – 2 years", value: 1 },
  { label: "2 – 5 years", value: 2 },
  { label: "5+ years", value: 3 },
];

export const QUESTIONS: Question[] = [
  { id: "q1", scored: true, options: FREQ, text: "When you notice a new sensation in your body, how often do you search it online?" },
  { id: "q2", scored: true, options: FREQ, text: "How often do you check your body for signs that something's wrong (pulse, lumps, skin, breathing, swallowing)?" },
  { id: "q3", scored: true, options: FREQ, text: "How often do you ask other people — family, partner, doctors, forums — whether a symptom seems serious?" },
  { id: "q4", scored: true, options: FREQ, text: "How often do you re-check or re-search something you've already checked?" },
  { id: "q5", scored: true, options: RELIEF, text: "When a doctor or a test result tells you you're fine, how long does the relief last?" },
  { id: "q6", scored: true, options: FREQ, text: "How often do health worries interrupt your sleep?" },
  { id: "q7", scored: true, options: TIME, text: "On a typical day, how much time goes to health worry?" },
  { id: "q8", scored: true, options: FREQ, text: "How often does health anxiety stop you doing things you'd otherwise do (exercise, travel, plans, intimacy)?" },
  { id: "q9", scored: true, options: FREQ, text: "How often do you feel you need to be certain nothing is wrong before you can relax?" },
  { id: "q10", scored: true, options: FREQ, text: "How often do ordinary bodily sensations make you fear a serious illness?" },
  { id: "context_duration", scored: false, options: DURATION, text: "How long has this been part of your life?" },
];

export const SCORED_IDS = QUESTIONS.filter((q) => q.scored).map((q) => q.id);
