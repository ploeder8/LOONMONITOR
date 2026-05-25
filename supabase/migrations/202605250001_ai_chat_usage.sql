create table if not exists public.ai_chat_usage (
  ip_hash text not null,
  usage_date date not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (ip_hash, usage_date)
);

create table if not exists public.ai_chat_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  ip_hash text,
  status text not null,
  model text,
  tokens_in integer,
  tokens_out integer,
  error_code text
);

create index if not exists ai_chat_events_created_at_idx on public.ai_chat_events (created_at desc);
create index if not exists ai_chat_events_ip_hash_idx on public.ai_chat_events (ip_hash);

alter table public.ai_chat_usage enable row level security;
alter table public.ai_chat_events enable row level security;

revoke all on table public.ai_chat_usage from anon, authenticated;
revoke all on table public.ai_chat_events from anon, authenticated;

create or replace function public.increment_ai_chat_usage(
  p_ip_hash text,
  p_usage_date date,
  p_limit integer
)
returns table(allowed boolean, usage_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.ai_chat_usage (ip_hash, usage_date, count, updated_at)
  values (p_ip_hash, p_usage_date, 1, now())
  on conflict (ip_hash, usage_date)
  do update
    set count = public.ai_chat_usage.count + 1,
        updated_at = now()
  returning count into v_count;

  return query select v_count <= p_limit, v_count;
end;
$$;

revoke all on function public.increment_ai_chat_usage(text, date, integer) from public, anon, authenticated;
grant execute on function public.increment_ai_chat_usage(text, date, integer) to service_role;
