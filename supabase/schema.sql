-- Schema für die Synchronisation (bereits im Projekt "lernapp-physik" angewendet).
-- Der Lerncode ist das Geheimnis. Die Tabelle ist per RLS gesperrt, Zugriff nur über die Funktionen.
create table public.lern_profile (
  code text primary key check (char_length(code) between 8 and 40),
  name text not null default '' check (char_length(name) <= 40),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.lern_profile enable row level security;

create function public.lern_load(p_code text) returns jsonb
language sql security definer set search_path = '' as $$
  select jsonb_build_object('name', name, 'data', data, 'updated_at', updated_at)
  from public.lern_profile where code = p_code;
$$;

create function public.lern_save(p_code text, p_name text, p_data jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_code is null or char_length(p_code) < 8 or char_length(p_code) > 40 then raise exception 'invalid code'; end if;
  if pg_column_size(p_data) > 200000 then raise exception 'data too large'; end if;
  insert into public.lern_profile (code, name, data, updated_at)
  values (p_code, left(coalesce(p_name, ''), 40), coalesce(p_data, '{}'::jsonb), now())
  on conflict (code) do update set name = excluded.name, data = excluded.data, updated_at = now();
end; $$;

revoke all on function public.lern_load(text) from public;
revoke all on function public.lern_save(text, text, jsonb) from public;
grant execute on function public.lern_load(text) to anon, authenticated;
grant execute on function public.lern_save(text, text, jsonb) to anon, authenticated;
