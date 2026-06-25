// The 14-day program content, sourced verbatim from docs PROGRAM-14DAY.md (the
// source of truth). Each day = Idea + Practice (+ an optional safety note). The
// Daily Check-In is the same every evening and is completed IN-APP on the day page
// (the form + scoring live in lib/checkin.ts). Phase 4 may move this to MDX; the
// content here is already complete and faithful.

export interface ProgramDay {
  day: number;
  phase: string;
  title: string;
  idea: string;
  practice: string;
  safety?: string;
}

export const TOTAL_DAYS = 14;

export const PROGRAM: ProgramDay[] = [
  {
    day: 1,
    phase: "Phase 1 · See it & make it safe",
    title: "Map your spiral (and notice the noise)",
    idea: `Every spiral has the same five links — trigger → catastrophic thought → anxiety → safety behavior → brief relief → rebound. And a healthy body makes dozens of harmless sensations an hour; anxiety doesn't invent them so much as spotlight them. Naming both takes away their automatic power.`,
    practice: `Write out your most recent spiral, link by link (what triggered it, the exact catastrophic thought, what you did, how long the relief lasted). Then record yesterday's baseline counts: how many times did you Google a symptom, check your body, and ask for reassurance? Begin the Daily Check-In tonight.`,
  },
  {
    day: 2,
    phase: "Phase 1 · See it & make it safe",
    title: "The four-minute fix + your safety behaviors",
    idea: `Reassurance works — for about four minutes. Then relief decays and doubt returns, usually stronger. This is negative reinforcement: the brief relief trains your brain to seek the behavior again, harder. Checking, Googling, reassurance-seeking, and avoidance are all "safety behaviors" — they feel protective, they're the fuel.`,
    practice: `Next time you check or Google today, time how long the relief lasts before the first new doubt — note the "relief half-life." Then make a complete inventory of your safety behaviors under four headings: Googling/searching, body-checking, reassurance-seeking, avoidance. Be exhaustive — you can't dismantle what you can't see.`,
  },
  {
    day: 3,
    phase: "Phase 1 · See it & make it safe",
    title: "Theory A vs. B + your sensible health plan and red flags",
    idea: `The most important reframe in the program. Theory A: "Something is medically wrong that I keep needing to find." Theory B: "There's nothing dangerous wrong — I have a worry problem about my health that keeps me checking." And recovery is appropriate care minus compulsion — so we define "appropriate" once, and everything above that line is the compulsion we cut.`,
    practice: `For each theory, write what it predicts and which better explains your actual life (years of fears that didn't come true, normal results, the way worry jumps from illness to illness). Commit to living as if Theory B for the next 11 days. Then write your Sensible Health Plan (one regular doctor, genuinely scheduled check-ups, anything a real clinician actually told you to monitor) and your Red-Flag list (the symptoms that warrant prompt care regardless of anxiety; build it with your doctor if unsure). From now on: red flag → act on your plan; not a red flag → it's spiral, and you'll practice letting it pass.`,
    safety: `If you'll do the optional Day-11 interoceptive exercise, flag any heart, lung, neurological, balance, or pregnancy condition with your doctor now.`,
  },
  {
    day: 4,
    phase: "Phase 2 · Loosen the thoughts",
    title: "Catch the catastrophe",
    idea: `The catastrophe fires in a half-second, automatically. Slowing it onto paper breaks the autopilot. Health anxiety runs on predictable traps: catastrophizing ("headache = tumor"), jumping to conclusions, demand for certainty, "symptoms = serious illness," emotional reasoning ("I feel scared, so it's dangerous").`,
    practice: `For one health worry today, fill a thought record: the situation/sensation, the automatic thought, the emotion + intensity (0–100), the behavior urge. Then label which distortions are in it. Catch and label one more in real time today.`,
  },
  {
    day: 5,
    phase: "Phase 2 · Loosen the thoughts",
    title: "Decatastrophize (and see how Google lies)",
    idea: `The spiral lives entirely in the worst case. Widening the frame restores proportion — and builds coping confidence. Search engines make it worse: they surface the rarest, scariest explanations and strip out base rates (this has a name — cyberchondria).`,
    practice: `For your top fear, write the worst, best, and most likely case, then answer the question that actually disarms catastrophe: "If the worst did happen, how would I cope?" (coping-focus, not proving it won't happen). Then, without searching, notice: Google distorts probability, so it can never give you the certainty you're asking it for.`,
  },
  {
    day: 6,
    phase: "Phase 3 · Cut the checking (the core)",
    title: "Build your ladder + delay, don't obey",
    idea: `ERP works in graded steps. And urges are waves — they rise, crest, and fall on their own, usually within 10–30 minutes, whether or not you act. You can ride them by waiting instead of checking.`,
    practice: `Rate your safety behaviors (from Day 2) by how hard they'd be to resist, 0–100, and order them into a ladder. Then, every urge today: delay 10 minutes before doing anything; name it ("this is an urge; it will pass") and let it crest. Log every urge you sat through. Start your resist streak.`,
  },
  {
    day: 7,
    phase: "Phase 3 · Cut the checking (the core)",
    title: "The body-checking fast",
    idea: `Body-checking (pressing for lumps, taking your pulse, inspecting skin, testing your swallow) feels like gathering information. It's actually rehearsing the fear and irritating the body — creating more sensations to check.`,
    practice: `Pick your #1 body-checking compulsion from the ladder and don't perform it for the whole day. When the urge comes, delay and surf it. Notice that the catastrophe you "needed" to check for does not arrive.`,
  },
  {
    day: 8,
    phase: "Phase 3 · Cut the checking (the core)",
    title: "The Google fast",
    idea: `Searching is the single biggest accelerant for most people. Cutting it produces the fastest visible drop in spiral frequency.`,
    practice: `Commit to 24 hours of zero symptom-Googling. Make it easy to keep: log out, install a site/app blocker, put your phone across the room at night. When the urge spikes, use the delay + a pre-written line ("Google can't give me certainty; I'm choosing to let this pass").`,
  },
  {
    day: 9,
    phase: "Phase 3 · Cut the checking (the core)",
    title: "End reassurance-seeking (the people version)",
    idea: `Asking your partner, parent, or doctor "do you think this is serious?" — repeatedly — is reassurance-seeking. Their "you're fine" is the same four-minute fix as Google, and it trains the loop just as hard.`,
    practice: `Identify who you ask. Have a kind, direct conversation (or send the reassurance script) asking them to lovingly not answer when you ask whether a symptom is serious — and instead remind you you're doing your program. Then stop asking.`,
  },
  {
    day: 10,
    phase: "Phase 3 · Cut the checking (the core)",
    title: "Replace the ritual (and check your progress)",
    idea: `A resisted urge leaves a gap. Filling it with a chosen action makes resistance far easier than white-knuckling.`,
    practice: `Pick two response substitutions in advance — a brief grounding practice (slow breathing, 5-4-3-2-1 senses) for the spike, and a values action that pulls attention outward (text a friend back, step outside, do the next thing in your day). When an urge hits: delay → substitute → carry on. Tonight, total your resisted urges across Days 6–10 — that number is your recovery in motion.`,
  },
  {
    day: 11,
    phase: "Phase 4 · Face the fear & sit with uncertainty",
    title: "Approach the fear (situational, + optional interoceptive)",
    idea: `Avoiding hospitals, medical shows, health articles, or certain words keeps the fear oversized. Approaching them — without checking afterward — shrinks it.`,
    practice: `Pick a low-rung avoided situation (read a general health article, watch a medical scene, walk the pharmacy aisle you skip). Do it deliberately, then prevent the response — no Googling or checking after. Rate your anxiety every few minutes; watch it crest and fall. Optional: for sensation-focused fears, bring on a harmless sensation on purpose and let it pass without checking — e.g., breathe quickly for ~45 seconds (lightheadedness) or jog in place (faster heartbeat).`,
    safety: `Do only what's safe for your body; skip the optional sensation exercise if any heart, lung, neurological, balance, or pregnancy condition applies, or if your doctor advised against it. Stop if you feel genuinely unwell (versus anxious). The sensation is unpleasant, not dangerous, and it passes.`,
  },
  {
    day: 12,
    phase: "Phase 4 · Face the fear & sit with uncertainty",
    title: "Sit with uncertainty (live as if recovered)",
    idea: `Under every health fear is the same intolerable thing: not knowing for sure. You can practice tolerating it directly — and you've now built the skills to live from the recovered position.`,
    practice: `Write and slowly repeat honest "maybe" statements: "It's possible something is wrong with my health. I can't be completely certain. And I can carry that uncertainty and live my life anyway." Sit with the discomfort rather than resolving it. Then spend the rest of the day exactly as someone without health anxiety would — no checking, full engagement; each urge: delay → substitute → carry on.`,
  },
  {
    day: 13,
    phase: "Phase 5 · Make it stick",
    title: "Map your gains + your early-warning signs",
    idea: `Evidence beats willpower, and relapse rarely arrives all at once — it creeps (one "quick" Google, one extra check).`,
    practice: `Put your Day-1 baseline next to today's — Googles, reassurance requests, body-checks, peak anxiety, time lost — and write the change in plain language. Then list your personal relapse triggers (a news story, a scan, a season, a stressor) and your earliest tell-tale signs that the loop is restarting.`,
  },
  {
    day: 14,
    phase: "Phase 5 · Make it stick",
    title: "Your flare-up plan + maintenance + graduate",
    idea: `In a flare you won't want to reinvent the wheel, and recovery is maintained by a few small habits, not constant vigilance.`,
    practice: `Write your 5-step flare-up plan (e.g., 1. Name it as a spiral, not evidence. 2. Run the Theory A/B check. 3. Delay and surf the urge. 4. Do the response substitution. 5. If it persists past a set time or crosses your red-flag list, act on the Sensible Health Plan — once). Design a light maintenance routine (a brief weekly check-in, the occasional deliberate exposure, a commitment not to resume checking). Then see your final Spiral Score next to Day 0, read your gains, and name the real change — not "I proved I'm healthy," but "I can feel a sensation, not know for certain, and let it go."`,
  },
];

export function getDay(n: number): ProgramDay | undefined {
  return PROGRAM.find((d) => d.day === n);
}
