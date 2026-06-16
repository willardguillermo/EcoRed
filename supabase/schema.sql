-- EcoRed — Schema completo v2
-- Ejecutar en el SQL Editor de Supabase

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- TYPES
-- ============================================================
create type org_type     as enum ('school', 'municipality');
create type user_role    as enum ('citizen', 'student', 'teacher', 'school_admin', 'municipal_admin', 'platform_admin');
create type waste_category as enum ('plastic', 'paper', 'glass', 'metal', 'organic', 'electronic', 'hazardous', 'other');

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
create table organizations (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  type          org_type not null,
  district      text not null,
  region        text not null default 'Lima',
  contact_email text not null,
  contact_phone text,
  created_at    timestamptz default now()
);

-- ============================================================
-- CLASSROOMS
-- ============================================================
create table classrooms (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid not null references organizations(id) on delete cascade,
  name       text not null,
  grade      text,
  teacher_id uuid references auth.users(id) on delete set null,
  code       text not null unique default upper(substring(md5(random()::text), 1, 8)),
  created_at timestamptz default now()
);

-- ============================================================
-- PROFILES (extiende auth.users)
-- ============================================================
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  avatar_url   text,
  role         user_role not null default 'citizen',
  org_id       uuid references organizations(id) on delete set null,
  classroom_id uuid references classrooms(id) on delete set null,
  points       integer not null default 0,
  created_at   timestamptz default now()
);

-- Trigger: crear profile al registrarse, tomando full_name y role del metadata
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta_role  text;
  valid_role user_role;
begin
  meta_role := new.raw_user_meta_data->>'role';

  valid_role := case
    when meta_role in ('citizen','student','teacher','school_admin','municipal_admin','platform_admin')
    then meta_role::user_role
    else 'citizen'::user_role
  end;

  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, new.raw_user_meta_data->>'email', ''),
    new.raw_user_meta_data->>'full_name',
    valid_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- SCANS
-- ============================================================
create table scans (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  org_id         uuid references organizations(id) on delete set null,
  classroom_id   uuid references classrooms(id) on delete set null,
  image_url      text,
  waste_category waste_category not null,
  waste_name     text not null,
  material       text not null,
  recyclable     boolean not null default true,
  instructions   text not null,
  confidence     numeric(4,3),           -- 0.000–1.000, null si no aplica
  points_earned  integer not null default 10,
  created_at     timestamptz default now()
);

-- ============================================================
-- IMPACT LOGS
-- ============================================================
create table impact_logs (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  org_id       uuid references organizations(id) on delete set null,
  scan_id      uuid references scans(id) on delete set null,
  co2_saved_kg numeric(8,4) not null default 0,
  waste_kg     numeric(8,4) not null default 0,
  created_at   timestamptz default now()
);

-- ============================================================
-- RECYCLING POINTS
-- ============================================================
create table recycling_points (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid not null references organizations(id) on delete cascade,
  name       text not null,
  address    text not null,
  lat        numeric(10,7) not null,
  lng        numeric(10,7) not null,
  materials  waste_category[] not null default '{}',
  schedule   text,
  created_at timestamptz default now()
);

-- ============================================================
-- CHALLENGES
-- ============================================================
create table challenges (
  id           uuid primary key default uuid_generate_v4(),
  org_id       uuid not null references organizations(id) on delete cascade,
  classroom_id uuid references classrooms(id) on delete set null,
  title        text not null,
  description  text not null,
  points       integer not null default 50,
  deadline     timestamptz not null,
  active       boolean not null default true,
  created_at   timestamptz default now()
);

-- ============================================================
-- CHALLENGE COMPLETIONS
-- ============================================================
create table challenge_completions (
  id           uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  completed_at timestamptz default now(),
  unique (challenge_id, user_id)
);

-- ============================================================
-- HELPER: evitar recursión en RLS de profiles
-- ============================================================
create or replace function get_my_org_id()
returns uuid language sql security definer stable as $$
  select org_id from public.profiles where id = auth.uid()
$$;

create or replace function get_my_role()
returns user_role language sql security definer stable as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ============================================================
-- VIEWS
-- ============================================================

-- Leaderboard por usuario dentro de una organización
create or replace view org_leaderboard with (security_invoker = true) as
select
  p.org_id,
  p.id           as user_id,
  p.full_name,
  p.avatar_url,
  p.points,
  p.classroom_id,
  c.name         as classroom_name,
  rank() over (partition by p.org_id order by p.points desc) as rank
from profiles p
left join classrooms c on c.id = p.classroom_id
where p.org_id is not null;

-- Leaderboard por aula dentro de una organización
create or replace view classroom_leaderboard with (security_invoker = true) as
select
  c.org_id,
  c.id           as classroom_id,
  c.name         as classroom_name,
  coalesce(sum(p.points), 0)   as total_points,
  count(p.id)                  as member_count,
  rank() over (partition by c.org_id order by sum(p.points) desc) as rank
from classrooms c
left join profiles p on p.classroom_id = c.id
group by c.org_id, c.id, c.name;

-- Impacto agregado por organización
create or replace view org_impact with (security_invoker = true) as
select
  org_id,
  count(*)                as total_scans,
  sum(co2_saved_kg)       as total_co2_kg,
  sum(waste_kg)           as total_waste_kg,
  count(distinct user_id) as active_users
from impact_logs
group by org_id;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table organizations         enable row level security;
alter table classrooms            enable row level security;
alter table profiles              enable row level security;
alter table scans                 enable row level security;
alter table impact_logs           enable row level security;
alter table recycling_points      enable row level security;
alter table challenges            enable row level security;
alter table challenge_completions enable row level security;

-- PROFILES
create policy "profiles: own read"
  on profiles for select using (auth.uid() = id);

create policy "profiles: org read"
  on profiles for select using (org_id = get_my_org_id());

create policy "profiles: own update"
  on profiles for update using (auth.uid() = id);

-- ORGANIZATIONS
create policy "orgs: member read"
  on organizations for select using (id = get_my_org_id());

create policy "orgs: admin insert"
  on organizations for insert
  with check (get_my_role() in ('school_admin', 'municipal_admin', 'platform_admin'));

create policy "orgs: admin update"
  on organizations for update
  using (id = get_my_org_id() and get_my_role() in ('school_admin', 'municipal_admin'));

-- CLASSROOMS
create policy "classrooms: org read"
  on classrooms for select using (org_id = get_my_org_id());

create policy "classrooms: admin insert"
  on classrooms for insert
  with check (org_id = get_my_org_id() and get_my_role() in ('school_admin', 'platform_admin'));

create policy "classrooms: admin update"
  on classrooms for update
  using (org_id = get_my_org_id() and get_my_role() in ('school_admin', 'platform_admin'));

-- SCANS
create policy "scans: own read"
  on scans for select using (auth.uid() = user_id);

create policy "scans: own insert"
  on scans for insert with check (auth.uid() = user_id);

create policy "scans: org read"
  on scans for select using (org_id = get_my_org_id());

-- IMPACT LOGS
create policy "impact: own read"
  on impact_logs for select using (auth.uid() = user_id);

create policy "impact: own insert"
  on impact_logs for insert with check (auth.uid() = user_id);

create policy "impact: org read"
  on impact_logs for select using (org_id = get_my_org_id());

-- RECYCLING POINTS
create policy "rpoints: public read"
  on recycling_points for select using (true);

create policy "rpoints: admin write"
  on recycling_points for insert
  with check (org_id = get_my_org_id() and get_my_role() in ('municipal_admin', 'platform_admin'));

create policy "rpoints: admin update"
  on recycling_points for update
  using (org_id = get_my_org_id() and get_my_role() in ('municipal_admin', 'platform_admin'));

-- CHALLENGES
create policy "challenges: org read"
  on challenges for select using (org_id = get_my_org_id());

create policy "challenges: admin insert"
  on challenges for insert
  with check (org_id = get_my_org_id() and get_my_role() in ('school_admin', 'municipal_admin', 'platform_admin'));

create policy "challenges: admin update"
  on challenges for update
  using (org_id = get_my_org_id() and get_my_role() in ('school_admin', 'municipal_admin', 'platform_admin'));

-- CHALLENGE COMPLETIONS
create policy "completions: own read"
  on challenge_completions for select using (auth.uid() = user_id);

create policy "completions: own insert"
  on challenge_completions for insert with check (auth.uid() = user_id);

create policy "completions: org read"
  on challenge_completions for select using (
    challenge_id in (
      select id from challenges where org_id = get_my_org_id()
    )
  );
