import Link from "next/link";
import { PROGRAM } from "@/content/program";

// The day list: completed ✓ / current / available. With DRIP_ENABLED=false every
// day is available, so there's no locked state at launch (the unlock prop is wired
// for when drip is turned on later).
export function DayList({
  completed,
  currentDay,
  isAvailable,
  scores,
}: {
  completed: Set<number>;
  currentDay: number;
  isAvailable: (day: number) => boolean;
  scores: Map<number, number>;
}) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
      {PROGRAM.map((d) => {
        const done = completed.has(d.day);
        const available = isAvailable(d.day);
        const current = d.day === currentDay && !done;

        const inner = (
          <div className="flex items-center gap-4 px-5 py-4">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                done
                  ? "bg-primary text-white"
                  : current
                    ? "bg-primary/10 text-primary"
                    : "bg-bg text-ink-soft"
              }`}
            >
              {done ? "✓" : d.day}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-ink">
                Day {d.day} — {d.title}
              </p>
              <p className="truncate text-xs text-ink-soft">
                {d.phase}
                {scores.has(d.day) ? ` · Spiral Score ${scores.get(d.day)}` : ""}
              </p>
            </div>
            {current ? (
              <span className="shrink-0 text-xs font-medium text-primary">Today</span>
            ) : !available ? (
              <span className="shrink-0 text-xs text-ink-soft">Locked</span>
            ) : null}
          </div>
        );

        return (
          <li key={d.day}>
            {available ? (
              <Link href={`/dashboard/day/${d.day}`} className="block hover:bg-bg">
                {inner}
              </Link>
            ) : (
              <div className="opacity-60">{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
