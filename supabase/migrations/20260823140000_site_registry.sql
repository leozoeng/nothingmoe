-- Site registry: dynamic rankings + moderator-managed site list

create table if not exists public.nothingmoe_sites (
  domain text primary key,
  slug text not null,
  name text not null,
  href text not null,
  discord text,
  icon text not null,
  category text not null default 'japanese',
  reason text not null,
  line text not null,
  started text not null,
  seed_ui smallint not null check (seed_ui between 1 and 100),
  seed_ux smallint not null check (seed_ux between 1 and 100),
  seed_catalog smallint not null check (seed_catalog between 1 and 100),
  seed_features smallint not null check (seed_features between 1 and 100),
  sort_order integer not null,
  created_at timestamptz not null default now(),
  constraint nothingmoe_sites_slug_key unique (slug),
  constraint nothingmoe_sites_sort_order_key unique (sort_order),
  constraint nothingmoe_sites_category_check check (category = 'japanese')
);

insert into public.nothingmoe_sites (
  domain, slug, name, href, discord, icon, category, reason, line, started,
  seed_ui, seed_ux, seed_catalog, seed_features, sort_order
) values
  (
    'anilight.live', 'anilight', 'AniLight', 'https://anilight.live',
    'https://discord.gg/RFN93sMwdW', '/sites/anilight.png', 'japanese',
    'cinematic discovery', 'Premium anime discovery — trending, seasonal, and top rated.',
    '2024', 96, 94, 82, 68, 1
  ),
  (
    'luna-stream.me', 'luna', 'Luna', 'https://luna-stream.me',
    null, '/sites/lunastream.png', 'japanese',
    'sync and stream', 'HD anime with subs, dubs, and AniList sync that follows you.',
    '2025', 89, 87, 93, 66, 2
  ),
  (
    'anikura.club', 'anikura', 'Anikura', 'https://anikura.club',
    'https://discord.gg/cm72gXTASn', '/sites/anikura.png', 'japanese',
    'shelves + social', 'Watch and discover anime — seasonal picks, catalogs, watch together.',
    '2026', 93, 78, 90, 95, 3
  ),
  (
    'nekowatch.xyz', 'nekowatch', 'NekoWatch', 'https://nekowatch.xyz',
    'https://discord.com/invite/6yeG3G654x', '/sites/nekowatch.png', 'japanese',
    'tracks your addiction', 'Track and discover anime on NekoWatch.',
    '2024', 91, 86, 74, 80, 4
  )
on conflict (domain) do nothing;

alter table public.nothingmoe_sites enable row level security;

drop policy if exists nothingmoe_sites_select on public.nothingmoe_sites;
create policy nothingmoe_sites_select on public.nothingmoe_sites
  for select using (true);

-- Drop hardcoded domain allowlists
alter table public.nothingmoe_reviews
  drop constraint if exists nothingmoe_reviews_domain_check;
alter table public.nothingmoe_site_owners
  drop constraint if exists nothingmoe_site_owners_domain_check;
alter table public.nothingmoe_site_pages
  drop constraint if exists nothingmoe_site_pages_domain_check;

alter table public.nothingmoe_reviews
  drop constraint if exists nothingmoe_reviews_site_fkey;
alter table public.nothingmoe_site_owners
  drop constraint if exists nothingmoe_site_owners_site_fkey;
alter table public.nothingmoe_site_pages
  drop constraint if exists nothingmoe_site_pages_site_fkey;

alter table public.nothingmoe_reviews
  add constraint nothingmoe_reviews_site_fkey
  foreign key (site_domain) references public.nothingmoe_sites(domain) on delete cascade;

alter table public.nothingmoe_site_owners
  add constraint nothingmoe_site_owners_site_fkey
  foreign key (site_domain) references public.nothingmoe_sites(domain) on delete cascade;

alter table public.nothingmoe_site_pages
  add constraint nothingmoe_site_pages_site_fkey
  foreign key (site_domain) references public.nothingmoe_sites(domain) on delete cascade;

drop policy if exists nothingmoe_reviews_insert on public.nothingmoe_reviews;
create policy nothingmoe_reviews_insert on public.nothingmoe_reviews
  for insert with check (
    auth.uid() is not null
    and auth.uid() = user_id
    and char_length(body) between 3 and 2000
    and stars between 1 and 5
    and score_ui between 1 and 100
    and score_ux between 1 and 100
    and score_catalog between 1 and 100
    and score_features between 1 and 100
    and exists (
      select 1 from public.nothingmoe_sites s where s.domain = site_domain
    )
  );
