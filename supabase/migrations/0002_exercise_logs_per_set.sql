-- p-fit · exercise logs per-set + ISO week range
-- Adds set_number to p_exercise_logs and widens week range to support ISO weeks (1..53).

-- 1. Widen week constraint to ISO week range
alter table public.p_exercise_logs drop constraint if exists p_exercise_logs_week_check;
alter table public.p_exercise_logs add constraint p_exercise_logs_week_check check (week between 1 and 53);

alter table public.p_weekly_logs drop constraint if exists p_weekly_logs_week_check;
alter table public.p_weekly_logs add constraint p_weekly_logs_week_check check (week between 1 and 53);

-- 2. Add set_number column (0 = notes record, 1..N = individual sets)
alter table public.p_exercise_logs add column if not exists set_number int not null default 0;

-- 3. Rebuild primary key to include set_number
alter table public.p_exercise_logs drop constraint if exists p_exercise_logs_pkey;
alter table public.p_exercise_logs add primary key (user_id, session_key, exercise_key, week, set_number);
