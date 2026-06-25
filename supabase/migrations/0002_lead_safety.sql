-- 0002_lead_safety.sql — persist the high-distress safety flag on the lead.
--
-- Why: the results page must show the safety branch (score >= 76 OR Q6/Q7/Q8
-- maxed) but is intentionally only allowed to read score/band/driver — never the
-- raw answers. The Q6/Q7/Q8-maxed condition can't be derived from the score
-- alone, so we compute the flag server-side at lead creation (from the full
-- answers) and store just the boolean. RLS unchanged: leads stay service-role only.

alter table public.leads
  add column if not exists safety_branch boolean not null default false;
