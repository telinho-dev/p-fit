create table public.p_daily_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  date text not null,
  hydration_ml int not null default 0,
  creatine_done boolean not null default false,
  protein_on_target boolean not null default false,
  sleep_ok boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

alter table public.p_daily_logs enable row level security;
create policy "daily_logs_owner" on public.p_daily_logs
  for all using (auth.uid() = user_id);
