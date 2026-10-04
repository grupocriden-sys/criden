-- Cuenta autorizada de Criden.
-- Solo los correos de esta tabla pueden usar /admin y /workspace.
-- Ejecutar una vez en Supabase → SQL Editor.

create table if not exists public.allowed_accounts (
  email text primary key check (email = lower(email)),
  role text not null default 'OWNER'
    check (role in ('OWNER', 'ADMIN', 'COLABORADOR', 'CLIENTE')),
  created_at timestamptz not null default now()
);

-- RLS activado y sin políticas: nadie puede leer ni escribir la tabla desde la API.
alter table public.allowed_accounts enable row level security;
revoke all on public.allowed_accounts from anon, authenticated;

-- ¿El usuario de la sesión actual es una cuenta autorizada?
-- Las políticas RLS de las próximas tablas privadas usarán esta función.
create or replace function public.is_allowed()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.allowed_accounts a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_allowed() from public, anon;
grant execute on function public.is_allowed() to authenticated;

insert into public.allowed_accounts (email, role)
values ('grupocriden@gmail.com', 'OWNER')
on conflict (email) do nothing;
