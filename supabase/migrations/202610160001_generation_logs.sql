-- Capplay: auditable status for real provider generations.
-- Apply this migration in Lovable Cloud / Supabase SQL Editor.
create table if not exists public.generation_logs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'text')),
  status text not null check (status in ('pending', 'succeeded', 'failed')),
  provider text not null default 'openai',
  model text,
  duration_ms integer,
  error_code text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists generation_logs_created_at_idx
  on public.generation_logs (created_at desc);
create index if not exists generation_logs_status_idx
  on public.generation_logs (status, created_at desc);

alter table public.generation_logs enable row level security;
-- No client policies: only trusted server-side code using the service-role key
-- may read/write this operational log. Never expose that key in the browser.
