"use client";

import type { Question } from "@/lib/assessment/questions";

// One question per screen, tap-only, thumb-zone option buttons. Selecting an
// option both records the answer and advances (handled by the parent flow).
export function QuestionCard({
  question,
  selected,
  onSelect,
}: {
  question: Question;
  selected: number | undefined;
  onSelect: (value: number) => void;
}) {
  return (
    <div>
      <h1 className="text-2xl leading-snug sm:text-3xl">{question.text}</h1>
      <div className="mt-7 space-y-3">
        {question.options.map((opt) => {
          const isSel = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              aria-pressed={isSel}
              className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left text-lg transition-colors ${
                isSel
                  ? "border-primary bg-primary/10 text-ink"
                  : "border-line bg-surface text-ink hover:border-primary"
              }`}
            >
              <span>{opt.label}</span>
              <span
                className={`ml-3 h-5 w-5 shrink-0 rounded-full border ${
                  isSel ? "border-primary bg-primary" : "border-line"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
