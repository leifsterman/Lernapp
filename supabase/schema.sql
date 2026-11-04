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

-- Karten, die für alle ausgeblendet sind (soft delete, wiederherstellbar). Nur mit gültigem Lerncode änderbar.
create table public.lern_global (
  card_id text primary key check (char_length(card_id) between 1 and 80),
  hidden boolean not null default true,
  by_name text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.lern_global enable row level security;

create function public.lern_global_list() returns jsonb
language sql security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', card_id, 'hidden', hidden, 'by', by_name, 't', updated_at)), '[]'::jsonb)
  from public.lern_global;
$$;

create function public.lern_global_set(p_code text, p_id text, p_hidden boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare v_name text;
begin
  select name into v_name from public.lern_profile where code = p_code;
  if not found then raise exception 'not signed in'; end if;
  if p_id is null or char_length(p_id) < 1 or char_length(p_id) > 80 then raise exception 'invalid id'; end if;
  insert into public.lern_global (card_id, hidden, by_name, updated_at)
  values (p_id, coalesce(p_hidden, true), left(coalesce(v_name, ''), 40), now())
  on conflict (card_id) do update set hidden = excluded.hidden, by_name = excluded.by_name, updated_at = now();
end; $$;

revoke all on function public.lern_global_list() from public;
revoke all on function public.lern_global_set(text, text, boolean) from public;
grant execute on function public.lern_global_list() to anon, authenticated;
grant execute on function public.lern_global_set(text, text, boolean) to anon, authenticated;

-- Einladungscode: neue Profile dürfen nur mit dem Code angelegt werden. Den echten Code NICHT ins Repo schreiben.
create table public.lern_config (k text primary key, v text not null);
alter table public.lern_config enable row level security;
-- insert into public.lern_config (k, v) values ('invite', 'DEINCODE');   -- 8 Zeichen, nur Großbuchstaben und Ziffern
-- Ändern: update public.lern_config set v = 'NEUERCODE' where k = 'invite';

create or replace function public.lern_save(p_code text, p_name text, p_data jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare v_exists boolean;
begin
  if p_code is null or char_length(p_code) < 8 or char_length(p_code) > 40 then raise exception 'invalid code'; end if;
  if pg_column_size(p_data) > 200000 then raise exception 'data too large'; end if;
  select exists (select 1 from public.lern_profile where code = p_code) into v_exists;
  if not v_exists then
    if upper(regexp_replace(coalesce(p_data->>'_invite', ''), '[^A-Za-z0-9]', '', 'g')) is distinct from
       (select v from public.lern_config where k = 'invite') then
      raise exception 'invite required';
    end if;
  end if;
  insert into public.lern_profile (code, name, data, updated_at)
  values (p_code, left(coalesce(p_name, ''), 40), coalesce(p_data, '{}'::jsonb) - '_invite', now())
  on conflict (code) do update set name = excluded.name, data = excluded.data, updated_at = now();
end; $$;
