-- ============================================================
-- EcoRed — Fixes de buenas prácticas Supabase/Postgres
-- Ejecutar en Supabase → SQL Editor (después del schema.sql)
-- ============================================================

-- ============================================================
-- FIX 1 (CRÍTICO): Índices en foreign keys faltantes
-- Postgres NO crea índices en FK automáticamente.
-- Sin índices: JOINs y ON DELETE CASCADE hacen full table scan.
-- ============================================================

-- classrooms
create index if not exists classrooms_org_id_idx     on classrooms (org_id);
create index if not exists classrooms_teacher_id_idx  on classrooms (teacher_id);

-- profiles
create index if not exists profiles_org_id_idx        on profiles (org_id);
create index if not exists profiles_classroom_id_idx  on profiles (classroom_id);

-- scans
create index if not exists scans_user_id_idx          on scans (user_id);
create index if not exists scans_org_id_idx           on scans (org_id);
create index if not exists scans_classroom_id_idx     on scans (classroom_id);

-- impact_logs
create index if not exists impact_user_id_idx         on impact_logs (user_id);
create index if not exists impact_org_id_idx          on impact_logs (org_id);
create index if not exists impact_scan_id_idx         on impact_logs (scan_id);

-- recycling_points
create index if not exists rpoints_org_id_idx         on recycling_points (org_id);

-- challenges
create index if not exists challenges_org_id_idx      on challenges (org_id);
create index if not exists challenges_classroom_id_idx on challenges (classroom_id);

-- challenge_completions (challenge_id ya cubierto por el UNIQUE, falta user_id)
create index if not exists completions_user_id_idx    on challenge_completions (user_id);

-- ============================================================
-- FIX 2 (CRÍTICO): RLS — envolver funciones helper en (SELECT ...)
-- Sin SELECT: get_my_org_id() y get_my_role() se evalúan por cada
-- fila escaneada, no una vez. En tablas grandes: 100-1000x más lento.
-- ============================================================

-- Recrea las políticas críticas con (SELECT ...) cacheado

-- PROFILES
drop policy if exists "profiles: org read"     on profiles;
drop policy if exists "profiles: own update"   on profiles;

create policy "profiles: org read"
  on profiles for select
  using (org_id = (select get_my_org_id()));

create policy "profiles: own update"
  on profiles for update
  using (auth.uid() = id);  -- auth.uid() es barato, no necesita SELECT

-- ORGANIZATIONS
drop policy if exists "orgs: member read"   on organizations;
drop policy if exists "orgs: admin insert"  on organizations;
drop policy if exists "orgs: admin update"  on organizations;

create policy "orgs: member read"
  on organizations for select
  using (id = (select get_my_org_id()));

create policy "orgs: admin insert"
  on organizations for insert
  with check ((select get_my_role()) in ('school_admin', 'municipal_admin', 'platform_admin'));

create policy "orgs: admin update"
  on organizations for update
  using (id = (select get_my_org_id())
    and (select get_my_role()) in ('school_admin', 'municipal_admin'));

-- CLASSROOMS
drop policy if exists "classrooms: org read"    on classrooms;
drop policy if exists "classrooms: admin insert" on classrooms;
drop policy if exists "classrooms: admin update" on classrooms;

create policy "classrooms: org read"
  on classrooms for select
  using (org_id = (select get_my_org_id()));

create policy "classrooms: admin insert"
  on classrooms for insert
  with check (org_id = (select get_my_org_id())
    and (select get_my_role()) in ('school_admin', 'platform_admin'));

create policy "classrooms: admin update"
  on classrooms for update
  using (org_id = (select get_my_org_id())
    and (select get_my_role()) in ('school_admin', 'platform_admin'));

-- SCANS
drop policy if exists "scans: org read" on scans;

create policy "scans: org read"
  on scans for select
  using (org_id = (select get_my_org_id()));

-- IMPACT LOGS
drop policy if exists "impact: org read" on impact_logs;

create policy "impact: org read"
  on impact_logs for select
  using (org_id = (select get_my_org_id()));

-- RECYCLING POINTS
drop policy if exists "rpoints: admin write"  on recycling_points;
drop policy if exists "rpoints: admin update" on recycling_points;

create policy "rpoints: admin write"
  on recycling_points for insert
  with check (org_id = (select get_my_org_id())
    and (select get_my_role()) in ('municipal_admin', 'platform_admin'));

create policy "rpoints: admin update"
  on recycling_points for update
  using (org_id = (select get_my_org_id())
    and (select get_my_role()) in ('municipal_admin', 'platform_admin'));

-- CHALLENGES
drop policy if exists "challenges: org read"    on challenges;
drop policy if exists "challenges: admin insert" on challenges;
drop policy if exists "challenges: admin update" on challenges;

create policy "challenges: org read"
  on challenges for select
  using (org_id = (select get_my_org_id()));

create policy "challenges: admin insert"
  on challenges for insert
  with check (org_id = (select get_my_org_id())
    and (select get_my_role()) in ('school_admin', 'municipal_admin', 'platform_admin'));

create policy "challenges: admin update"
  on challenges for update
  using (org_id = (select get_my_org_id())
    and (select get_my_role()) in ('school_admin', 'municipal_admin', 'platform_admin'));

-- CHALLENGE COMPLETIONS (subquery → EXISTS para mejor plan de ejecución)
drop policy if exists "completions: org read" on challenge_completions;

create policy "completions: org read"
  on challenge_completions for select
  using (
    exists (
      select 1 from challenges
      where challenges.id = challenge_id
        and challenges.org_id = (select get_my_org_id())
    )
  );

-- ============================================================
-- FIX 3 (ALTO): Índices compuestos para queries frecuentes
-- ============================================================

-- Dashboard: historial del usuario ordenado por fecha
create index if not exists scans_user_created_idx
  on scans (user_id, created_at desc);

-- Dashboard institución: actividad reciente por org
create index if not exists scans_org_created_idx
  on scans (org_id, created_at desc);

-- Impact: totales por usuario (SUM queries)
create index if not exists impact_user_org_idx
  on impact_logs (user_id, org_id);

-- ============================================================
-- FIX 4 (ALTO): Índice parcial en challenges activos
-- Las queries siempre filtran active=true AND deadline > now()
-- ============================================================

create index if not exists challenges_active_deadline_idx
  on challenges (org_id, deadline)
  where active = true;

-- ============================================================
-- ============================================================
-- FIX 5 (CRÍTICO): Incremento atómico de puntos
-- Evita race condition cuando dos escaneos llegan simultáneamente.
-- Sin esto: ambos leen points=100, ambos escriben 100+pts → se pierde un escaneo.
-- ============================================================

create or replace function increment_points(uid uuid, delta integer)
returns void language sql security definer
set search_path = public as $$
  update profiles set points = points + delta where id = uid;
$$;

-- Habilitar Realtime para actualizaciones de puntos en tiempo real en el sidebar
alter publication supabase_realtime add table profiles;

-- ============================================================
-- VERIFICACIÓN: ejecuta esto para confirmar todos los índices
-- ============================================================
-- select schemaname, tablename, indexname
-- from pg_indexes
-- where schemaname = 'public'
-- order by tablename, indexname;
