-- p-fit · initial schema
-- Mirrors src/lib/storage/types.ts. Run via: supabase db push (or paste into the SQL editor).
-- RLS: every table is owner-scoped to auth.uid().

create table if not exists public.p_user_settings (
  user_id uuid primary key references auth.users on delete cascade,
  fc_max int,
  fc_rest int,
  current_weight_kg numeric,
  target_weight_kg numeric,
  start_date date,
  updated_at timestamptz not null default now()
);

create table if not exists public.p_exercise_logs (
  user_id uuid not null references auth.users on delete cascade,
  session_key text not null,
  exercise_key text not null,
  week int not null check (week between 1 and 12),
  load text not null default '',
  reps text not null default '',
  notes text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, session_key, exercise_key, week)
);

create table if not exists public.p_weekly_logs (
  user_id uuid not null references auth.users on delete cascade,
  week int not null check (week between 1 and 12),
  weight_kg numeric,
  waist_cm numeric,
  sessions_done int check (sessions_done between 0 and 7),
  cardios_done int check (cardios_done between 0 and 7),
  protein_avg numeric,
  sleep_avg numeric,
  notes text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, week)
);

-- bump updated_at on any update
create or replace function public.p_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_p_user_settings_touch on public.p_user_settings;
create trigger trg_p_user_settings_touch
  before update on public.p_user_settings
  for each row execute function public.p_touch_updated_at();

drop trigger if exists trg_p_exercise_logs_touch on public.p_exercise_logs;
create trigger trg_p_exercise_logs_touch
  before update on public.p_exercise_logs
  for each row execute function public.p_touch_updated_at();

drop trigger if exists trg_p_weekly_logs_touch on public.p_weekly_logs;
create trigger trg_p_weekly_logs_touch
  before update on public.p_weekly_logs
  for each row execute function public.p_touch_updated_at();

-- RLS: owner-only
alter table public.p_user_settings enable row level security;
alter table public.p_exercise_logs enable row level security;
alter table public.p_weekly_logs enable row level security;

drop policy if exists "settings: owner read"   on public.p_user_settings;
drop policy if exists "settings: owner write"  on public.p_user_settings;
create policy "settings: owner read"   on public.p_user_settings for select using (auth.uid() = user_id);
create policy "settings: owner write"  on public.p_user_settings for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "ex_logs: owner read"    on public.p_exercise_logs;
drop policy if exists "ex_logs: owner write"   on public.p_exercise_logs;
create policy "ex_logs: owner read"    on public.p_exercise_logs for select using (auth.uid() = user_id);
create policy "ex_logs: owner write"   on public.p_exercise_logs for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "wk_logs: owner read"    on public.p_weekly_logs;
drop policy if exists "wk_logs: owner write"   on public.p_weekly_logs;
create policy "wk_logs: owner read"    on public.p_weekly_logs for select using (auth.uid() = user_id);
create policy "wk_logs: owner write"   on public.p_weekly_logs for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);
