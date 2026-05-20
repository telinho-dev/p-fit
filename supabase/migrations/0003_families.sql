create table public.p_families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  invite_code text not null unique default substr(md5(random()::text), 1, 8),
  created_at timestamptz not null default now()
);

create table public.p_family_members (
  family_id uuid not null references public.p_families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null default '',
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

-- RLS
alter table public.p_families enable row level security;
alter table public.p_family_members enable row level security;

-- families: owner pode tudo; membros podem ler
create policy "family_owner_all" on public.p_families
  for all using (auth.uid() = owner_id);
create policy "family_member_read" on public.p_families
  for select using (
    exists (select 1 from public.p_family_members m where m.family_id = id and m.user_id = auth.uid())
  );

-- family_members: membros podem ler todos da mesma família; owner pode inserir/deletar
create policy "family_members_read" on public.p_family_members
  for select using (
    family_id in (select family_id from public.p_family_members where user_id = auth.uid())
  );
create policy "family_members_owner_write" on public.p_family_members
  for all using (
    family_id in (select id from public.p_families where owner_id = auth.uid())
  );
create policy "family_members_self_insert" on public.p_family_members
  for insert with check (user_id = auth.uid());
create policy "family_members_self_delete" on public.p_family_members
  for delete using (user_id = auth.uid());

-- Leitura cruzada de logs entre membros da mesma família
create policy "exercise_logs_family_read" on public.p_exercise_logs
  for select using (
    user_id = auth.uid() or
    user_id in (
      select fm2.user_id from public.p_family_members fm1
      join public.p_family_members fm2 on fm1.family_id = fm2.family_id
      where fm1.user_id = auth.uid()
    )
  );

create policy "weekly_logs_family_read" on public.p_weekly_logs
  for select using (
    user_id = auth.uid() or
    user_id in (
      select fm2.user_id from public.p_family_members fm1
      join public.p_family_members fm2 on fm1.family_id = fm2.family_id
      where fm1.user_id = auth.uid()
    )
  );
