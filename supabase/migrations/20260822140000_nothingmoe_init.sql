-- NothingMoe standalone schema (for NothingMoe Supabase org)

create table if not exists public.nothingmoe_reviews (
  id uuid primary key default gen_random_uuid(),
  site_domain text not null,
  user_id uuid references auth.users(id) on delete set null,
  stars smallint not null check (stars between 1 and 5),
  score_ui smallint not null check (score_ui between 1 and 100),
  score_ux smallint not null check (score_ux between 1 and 100),
  score_catalog smallint not null check (score_catalog between 1 and 100),
  score_features smallint not null check (score_features between 1 and 100),
  body text not null check (char_length(body) between 10 and 2000),
  created_at timestamptz not null default now(),
  constraint nothingmoe_reviews_domain_check check (
    site_domain = any (array['anilight.live','luna-stream.me','anikura.club','nekowatch.xyz'])
  )
);

create index if not exists nothingmoe_reviews_site_domain_idx
  on public.nothingmoe_reviews (site_domain);
create index if not exists nothingmoe_reviews_created_at_idx
  on public.nothingmoe_reviews (created_at desc);
create unique index if not exists nothingmoe_reviews_one_per_user
  on public.nothingmoe_reviews (site_domain, user_id)
  where user_id is not null;

create table if not exists public.nothingmoe_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text not null,
  created_at timestamptz not null default now(),
  constraint nothingmoe_profiles_username_len check (char_length(username) between 3 and 24),
  constraint nothingmoe_profiles_username_format check (username ~ '^[a-zA-Z0-9_]+$')
);

create unique index if not exists nothingmoe_profiles_username_key
  on public.nothingmoe_profiles (lower(username));

alter table public.nothingmoe_reviews
  drop constraint if exists nothingmoe_reviews_profile_fkey;
alter table public.nothingmoe_reviews
  add constraint nothingmoe_reviews_profile_fkey
  foreign key (user_id) references public.nothingmoe_profiles(id) on delete set null;

create table if not exists public.nothingmoe_site_owners (
  user_id uuid not null references auth.users(id) on delete cascade,
  site_domain text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, site_domain),
  constraint nothingmoe_site_owners_domain_check check (
    site_domain = any (array['anilight.live','luna-stream.me','anikura.club','nekowatch.xyz'])
  )
);

create table if not exists public.nothingmoe_site_pages (
  site_domain text primary key,
  line text,
  started text,
  pros text[],
  cons text[],
  banner_url text,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint nothingmoe_site_pages_domain_check check (
    site_domain = any (array['anilight.live','luna-stream.me','anikura.club','nekowatch.xyz'])
  )
);

create table if not exists public.nothingmoe_review_responses (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null unique references public.nothingmoe_reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nothingmoe_review_responses_body_len check (char_length(body) between 1 and 2000)
);

-- RLS
alter table public.nothingmoe_reviews enable row level security;
alter table public.nothingmoe_profiles enable row level security;
alter table public.nothingmoe_site_owners enable row level security;
alter table public.nothingmoe_site_pages enable row level security;
alter table public.nothingmoe_review_responses enable row level security;

drop policy if exists nothingmoe_reviews_select on public.nothingmoe_reviews;
create policy nothingmoe_reviews_select on public.nothingmoe_reviews for select using (true);

drop policy if exists nothingmoe_reviews_insert on public.nothingmoe_reviews;
create policy nothingmoe_reviews_insert on public.nothingmoe_reviews
  for insert with check (
    auth.uid() is not null
    and auth.uid() = user_id
    and char_length(body) between 10 and 2000
    and stars between 1 and 5
    and score_ui between 1 and 100
    and score_ux between 1 and 100
    and score_catalog between 1 and 100
    and score_features between 1 and 100
    and site_domain = any (array['anilight.live','luna-stream.me','anikura.club','nekowatch.xyz'])
  );

drop policy if exists nothingmoe_reviews_update on public.nothingmoe_reviews;
create policy nothingmoe_reviews_update on public.nothingmoe_reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists nothingmoe_reviews_delete on public.nothingmoe_reviews;
create policy nothingmoe_reviews_delete on public.nothingmoe_reviews
  for delete using (auth.uid() = user_id);

drop policy if exists nothingmoe_profiles_select on public.nothingmoe_profiles;
create policy nothingmoe_profiles_select on public.nothingmoe_profiles for select using (true);

drop policy if exists nothingmoe_profiles_insert on public.nothingmoe_profiles;
create policy nothingmoe_profiles_insert on public.nothingmoe_profiles
  for insert with check (auth.uid() = id);

drop policy if exists nothingmoe_profiles_update on public.nothingmoe_profiles;
create policy nothingmoe_profiles_update on public.nothingmoe_profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists nothingmoe_site_owners_select on public.nothingmoe_site_owners;
create policy nothingmoe_site_owners_select on public.nothingmoe_site_owners
  for select using (auth.uid() = user_id);

drop policy if exists nothingmoe_site_pages_select on public.nothingmoe_site_pages;
create policy nothingmoe_site_pages_select on public.nothingmoe_site_pages for select using (true);

drop policy if exists nothingmoe_site_pages_insert on public.nothingmoe_site_pages;
create policy nothingmoe_site_pages_insert on public.nothingmoe_site_pages
  for insert with check (
    exists (
      select 1 from public.nothingmoe_site_owners o
      where o.user_id = auth.uid()
        and o.site_domain = nothingmoe_site_pages.site_domain
    )
  );

drop policy if exists nothingmoe_site_pages_update on public.nothingmoe_site_pages;
create policy nothingmoe_site_pages_update on public.nothingmoe_site_pages
  for update using (
    exists (
      select 1 from public.nothingmoe_site_owners o
      where o.user_id = auth.uid()
        and o.site_domain = nothingmoe_site_pages.site_domain
    )
  )
  with check (
    exists (
      select 1 from public.nothingmoe_site_owners o
      where o.user_id = auth.uid()
        and o.site_domain = nothingmoe_site_pages.site_domain
    )
  );

drop policy if exists nothingmoe_review_responses_select on public.nothingmoe_review_responses;
create policy nothingmoe_review_responses_select on public.nothingmoe_review_responses for select using (true);

drop policy if exists nothingmoe_review_responses_insert on public.nothingmoe_review_responses;
create policy nothingmoe_review_responses_insert on public.nothingmoe_review_responses
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.nothingmoe_reviews r
      join public.nothingmoe_site_owners o on o.site_domain = r.site_domain
      where r.id = nothingmoe_review_responses.review_id
        and o.user_id = auth.uid()
    )
  );

drop policy if exists nothingmoe_review_responses_update on public.nothingmoe_review_responses;
create policy nothingmoe_review_responses_update on public.nothingmoe_review_responses
  for update using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.nothingmoe_reviews r
      join public.nothingmoe_site_owners o on o.site_domain = r.site_domain
      where r.id = nothingmoe_review_responses.review_id
        and o.user_id = auth.uid()
    )
  )
  with check (auth.uid() = user_id);

-- Signup trigger
create or replace function public.nothingmoe_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to public
as $$
declare
  base_name text;
begin
  base_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    split_part(new.email, '@', 1)
  );
  insert into public.nothingmoe_profiles (id, username, display_name)
  values (
    new.id,
    regexp_replace(lower(base_name), '[^a-z0-9_]', '_', 'g'),
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), base_name)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists nothingmoe_on_auth_user_created on auth.users;
create trigger nothingmoe_on_auth_user_created
  after insert on auth.users
  for each row execute function public.nothingmoe_handle_new_user();
