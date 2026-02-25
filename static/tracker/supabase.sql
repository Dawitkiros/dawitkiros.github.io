create table if not exists public.tracker_kv (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.tracker_kv enable row level security;

drop policy if exists tracker_select_own on public.tracker_kv;
create policy tracker_select_own
  on public.tracker_kv
  for select
  using (auth.uid() = user_id);

drop policy if exists tracker_insert_own on public.tracker_kv;
create policy tracker_insert_own
  on public.tracker_kv
  for insert
  with check (auth.uid() = user_id);

drop policy if exists tracker_update_own on public.tracker_kv;
create policy tracker_update_own
  on public.tracker_kv
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists tracker_delete_own on public.tracker_kv;
create policy tracker_delete_own
  on public.tracker_kv
  for delete
  using (auth.uid() = user_id);
