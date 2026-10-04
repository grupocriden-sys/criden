-- Conexiones a calendarios externos (hoy Google; otros proveedores después, sin cambiar tablas).
-- Ejecutar una vez en Supabase → SQL Editor (después de 20261004000000_sala_de_trabajo.sql).

create table if not exists public.calendar_connections (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (length(provider) > 0),
  owner text not null check (owner in ('cristian', 'denis')),
  account_email text not null,
  -- Token de renovación cifrado en el servidor (AES-256-GCM). Sin la clave del servidor no sirve.
  refresh_token_enc text not null,
  scope text not null default '',
  created_at timestamptz not null default now(),
  unique (provider, owner)
);

alter table public.calendar_connections enable row level security;
revoke all on public.calendar_connections from anon;
grant select, insert, update, delete on public.calendar_connections to authenticated;
drop policy if exists "cuenta autorizada" on public.calendar_connections;
create policy "cuenta autorizada" on public.calendar_connections
  for all to authenticated
  using (public.is_allowed()) with check (public.is_allowed());

-- Los eventos recuerdan de qué calendario externo vienen o a cuál se enviaron.
alter table public.events drop column if exists google_event_id;
alter table public.events drop column if exists google_calendar_id;
alter table public.events add column if not exists source text not null default 'criden';
alter table public.events add column if not exists external_id text;
alter table public.events
  add column if not exists connection_id uuid references public.calendar_connections (id) on delete set null;
create unique index if not exists events_external_unique
  on public.events (connection_id, external_id) where external_id is not null;
