-- ============================================================
-- EcoRed — Security Fixes
-- Orden de ejecución: schema.sql → best_practices_fixes.sql → security_fixes.sql
-- ============================================================

-- ============================================================
-- FIX 1: Trigger — solo citizen y school_admin desde registro
-- Bloquea que un atacante envíe role:"platform_admin" en la API de Supabase
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta_role text;
  safe_role user_role;
begin
  meta_role := new.raw_user_meta_data->>'role';

  safe_role := case
    when meta_role = 'school_admin' then 'school_admin'::user_role
    else 'citizen'::user_role  -- cualquier otro valor (incluyendo platform_admin) → citizen
  end;

  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, new.raw_user_meta_data->>'email', ''),
    new.raw_user_meta_data->>'full_name',
    safe_role
  );
  return new;
end;
$$;

-- ============================================================
-- FIX 2: profiles — restricción de columnas actualizables
-- Reemplaza la política recursiva por grants de columna (sin recursión RLS)
-- Solo full_name y avatar_url son modificables por el propio usuario
-- ============================================================
drop policy if exists "profiles: own update" on public.profiles;

create policy "profiles: own update"
  on public.profiles for update
  using  ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Revoca UPDATE completo y lo re-otorga solo para columnas seguras
revoke update on public.profiles from anon, authenticated;
grant  update (full_name, avatar_url) on public.profiles to authenticated;

-- ============================================================
-- FIX 3: profiles — limitar columnas expuestas al leer filas ajenas
-- email no debe ser visible para otros miembros de la organización
-- ============================================================
revoke select on public.profiles from anon, authenticated;
grant  select (id, full_name, avatar_url, role, org_id, classroom_id, points, created_at)
  on public.profiles to authenticated;

-- ============================================================
-- FIX 4: profiles: org read — excluir propia fila (ya cubierta por own read)
-- ============================================================
drop policy if exists "profiles: org read" on profiles;

create policy "profiles: org read"
  on profiles for select
  using (
    org_id is not null
    and org_id = get_my_org_id()
    and (select auth.uid()) <> id
  );

-- ============================================================
-- FIX 5: Eliminar INSERT directo — scans/impact_logs/completions
-- Todas las escrituras van por API Routes con service_role (bypass RLS)
-- ============================================================
drop policy if exists "scans: own insert"      on scans;
drop policy if exists "impact: own insert"      on impact_logs;
drop policy if exists "completions: own insert" on challenge_completions;

-- ============================================================
-- FIX 6: increment_points — revocar ejecución pública
-- ============================================================
revoke execute on function increment_points(uuid, integer) from public;
grant  execute on function increment_points(uuid, integer) to service_role;

-- ============================================================
-- FIX 7: search_path fijo en funciones helper (evita search_path injection)
-- ============================================================
create or replace function get_my_org_id()
returns uuid language sql stable security definer set search_path = public as $$
  select org_id from profiles where id = (select auth.uid())
$$;

create or replace function get_my_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = (select auth.uid())
$$;
