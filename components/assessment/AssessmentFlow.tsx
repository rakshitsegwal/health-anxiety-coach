"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/lib/assessment/questions";
import { getUtm } from "@/lib/utm";
import { MetaPixel } from "@/lib/metaPixel";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { EmailGate } from "./EmailGate";

type Step = "intro" | "gate" | number; // number = index into QUESTIONS

export function AssessmentFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = QUESTIONS.length;

  function goTo(next: Step) {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setStep(next);
  }

  function selectOption(index: number, value: number) {
    const q = QUESTIONS[index];
    setAnswers((a) => ({ ...a, [q.id]: value }));
    // Brief pause so the selection registers visually, then advance.
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      setStep(index + 1 < total ? index + 1 : "gate");
    }, 220);
  }

  async function submitLead(email: string) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, answers, utm: getUtm() }),
      });
      if (!res.ok) throw new Error("request failed");
      MetaPixel.lead();
      router.push("/results");
    } catch {
      setSubmitting(false);
      setError("Something went wrong saving your results. Please try again.");
    }
  }

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (step === "intro") {
    return (
      <Shell>
        <h1 className="text-3xl sm:text-4xl">Your Symptom Spiral Assessment</h1>
        <p className="mt-4 text-lg text-ink-soft">
          10 quick questions. About 2 minutes. There are no right answers — this is
          a mirror, not a test. It&apos;ll show you the shape of your loop and where
          it&apos;s strongest.
        </p>
        <p className="mt-4 text-sm text-ink-soft">
          This is a self-reflection tool, not a medical diagnosis.
        </p>
        <div className="mt-7">
          <Button size="lg" onClick={() => goTo(0)}>
            Begin →
          </Button>
        </div>
      </Shell>
    );
  }

  // ── Email gate ──────────────────────────────────────────────────────────────
  if (step === "gate") {
    return (
      <Shell onBack={() => goTo(total - 1)}>
        <EmailGate onSubmit={submitLead} submitting={submitting} error={error} />
      </Shell>
    );
  }

  // ── A question ──────────────────────────────────────────────────────────────
  const index = step;
  const question = QUESTIONS[index];
  return (
    <Shell onBack={() => goTo(index === 0 ? "intro" : index - 1)}>
      <div className="mb-8 flex items-center gap-3">
        <span className="text-sm tabular-nums text-ink-soft">
          {index + 1} / {total}
        </span>
        <ProgressBar current={index + 1} total={total} />
      </div>
      <QuestionCard
        question={question}
        selected={answers[question.id]}
        onSelect={(value) => selectOption(index, value)}
      />
    </Shell>
  );
}

function Shell({
  children,
  onBack,
}: {
  children: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-content flex-col px-5 py-8">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mb-6 self-start text-sm text-ink-soft hover:text-ink"
        >
          ← Back
        </button>
      ) : (
        <div className="mb-6 h-5" />
      )}
      <div className="flex flex-1 flex-col justify-center">{children}</div>
    </div>
  );
}
