-- 0003_progress_score.sql — store each day's computed Spiral Score.
--
-- The in-app evening check-in (saved to daily_progress.reflection) is scored with
-- the exact formula in PROGRAM-14DAY.md; we persist the result here so the
-- dashboard can show "Day 0: 72 → Day 3: 58" without recomputing. RLS unchanged
-- (policies are table-level and already cover this column).

alter table public.daily_progress
  add column if not exists spiral_score int;
