-- EcoMuro / Comunidad
-- Ejecutar en Supabase SQL Editor para habilitar persistencia real del muro.

create table if not exists community_posts (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  org_id     uuid references organizations(id) on delete set null,
  message    text not null check (char_length(message) between 4 and 500),
  image_url  text,
  created_at timestamptz default now()
);

create table if not exists community_post_likes (
  post_id    uuid not null references community_posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

create table if not exists community_post_comments (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid not null references community_posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 240),
  created_at timestamptz default now()
);

create index if not exists community_posts_org_created_idx
  on community_posts (org_id, created_at desc);

create index if not exists community_posts_user_created_idx
  on community_posts (user_id, created_at desc);

create index if not exists community_comments_post_created_idx
  on community_post_comments (post_id, created_at asc);

create index if not exists community_likes_post_idx
  on community_post_likes (post_id);

alter table community_posts enable row level security;
alter table community_post_likes enable row level security;
alter table community_post_comments enable row level security;

drop policy if exists "community posts: read org" on community_posts;
drop policy if exists "community posts: own insert" on community_posts;
drop policy if exists "community posts: own update" on community_posts;
drop policy if exists "community posts: own delete" on community_posts;

create policy "community posts: read org"
  on community_posts for select
  using (org_id is null or org_id = get_my_org_id() or user_id = auth.uid());

create policy "community posts: own insert"
  on community_posts for insert
  with check (user_id = auth.uid() and (org_id is null or org_id = get_my_org_id()));

create policy "community posts: own update"
  on community_posts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "community posts: own delete"
  on community_posts for delete
  using (user_id = auth.uid());

drop policy if exists "community likes: read accessible posts" on community_post_likes;
drop policy if exists "community likes: own insert" on community_post_likes;
drop policy if exists "community likes: own delete" on community_post_likes;

create policy "community likes: read accessible posts"
  on community_post_likes for select
  using (
    exists (
      select 1 from community_posts p
      where p.id = post_id
        and (p.org_id is null or p.org_id = get_my_org_id() or p.user_id = auth.uid())
    )
  );

create policy "community likes: own insert"
  on community_post_likes for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from community_posts p
      where p.id = post_id
        and (p.org_id is null or p.org_id = get_my_org_id() or p.user_id = auth.uid())
    )
  );

create policy "community likes: own delete"
  on community_post_likes for delete
  using (user_id = auth.uid());

drop policy if exists "community comments: read accessible posts" on community_post_comments;
drop policy if exists "community comments: own insert" on community_post_comments;
drop policy if exists "community comments: own delete" on community_post_comments;

create policy "community comments: read accessible posts"
  on community_post_comments for select
  using (
    exists (
      select 1 from community_posts p
      where p.id = post_id
        and (p.org_id is null or p.org_id = get_my_org_id() or p.user_id = auth.uid())
    )
  );

create policy "community comments: own insert"
  on community_post_comments for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from community_posts p
      where p.id = post_id
        and (p.org_id is null or p.org_id = get_my_org_id() or p.user_id = auth.uid())
    )
  );

create policy "community comments: own delete"
  on community_post_comments for delete
  using (user_id = auth.uid());

grant select, insert, update, delete on community_posts to authenticated;
grant select, insert, delete on community_post_likes to authenticated;
grant select, insert, delete on community_post_comments to authenticated;
