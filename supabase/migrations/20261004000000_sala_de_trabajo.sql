-- Sala de trabajo: etiquetas, proyectos, checklist, ideas y calendario.
-- Ejecutar una vez en Supabase → SQL Editor (después de 20261003000000_cuenta_criden.sql).
-- Todas las tablas usan RLS: solo las cuentas de public.allowed_accounts pueden leer o escribir.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Etiquetas: un nombre y un color de una paleta fija.
-- Cada color equivale a un color de evento de Google Calendar (ver lib/workspace/tags.ts).
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  color text not null default 'blue'
    check (color in ('blue', 'navy', 'teal', 'green', 'amber', 'coral', 'pink', 'purple')),
  created_at timestamptz not null default now()
);
create unique index if not exists tags_name_unique on public.tags (lower(name));

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  description text not null default '',
  client text not null default '',
  status text not null default 'planificacion'
    check (status in ('idea', 'planificacion', 'desarrollo', 'revision', 'pausado', 'terminado', 'archivado')),
  repo_url text not null default '',
  prod_url text not null default '',
  context text not null default '',
  start_date date,
  due_date date,
  tag_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  status text not null default 'pendiente'
    check (status in ('pendiente', 'por_revisar', 'hecha')),
  note text not null default '',
  due_date date,
  done_at timestamptz,
  tag_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_project_idx on public.tasks (project_id);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  owner text not null default 'ambos' check (owner in ('cristian', 'denis', 'ambos')),
  project_id uuid references public.projects (id) on delete set null,
  task_id uuid references public.tasks (id) on delete set null,
  notes text not null default '',
  tag_ids uuid[] not null default '{}',
  -- Preparado para sincronizar con Google Calendar.
  google_event_id text,
  google_calendar_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at >= starts_at)
);
create index if not exists events_starts_idx on public.events (starts_at);
create index if not exists events_project_idx on public.events (project_id);

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  body text not null default '',
  status text not null default 'idea'
    check (status in ('idea', 'investigando', 'validando', 'aprobada', 'descartada', 'convertida')),
  source text not null default 'texto' check (source in ('texto', 'voz')),
  project_id uuid references public.projects (id) on delete set null,
  -- Ideas relacionadas entre sí (base de la futura red de ideas).
  related_ids uuid[] not null default '{}',
  tag_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['projects', 'tasks', 'events', 'ideas'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;

  foreach t in array array['tags', 'projects', 'tasks', 'events', 'ideas'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('drop policy if exists "cuenta autorizada" on public.%I', t);
    execute format(
      'create policy "cuenta autorizada" on public.%I for all to authenticated using (public.is_allowed()) with check (public.is_allowed())', t);
  end loop;
end $$;
