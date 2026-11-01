-- Remove Luna from world ranking
delete from public.nothingmoe_sites
where domain = 'luna-stream.me';

-- Ensure AnimeX exists with updated metadata description
insert into public.nothingmoe_sites (
  domain, slug, name, href, discord, icon, category, reason, line, started,
  seed_ui, seed_ux, seed_catalog, seed_features, sort_order
)
values (
  'animex.one', 'animex', 'AnimeX', 'https://animex.one', null,
  '/sites/animex.png', 'japanese', 'stream + discover',
  'Are you tired from 9anime, hianime, gogoanime, animepahe, animixplay, miruro, animekai and aniwave? Discover the best anime streaming experience on AnimeX. Watch free anime online in HD with English subtitles and dubs.',
  '2025', 95, 93, 96, 92, 2
)
on conflict (domain) do update set
  slug = excluded.slug,
  name = excluded.name,
  href = excluded.href,
  discord = excluded.discord,
  icon = excluded.icon,
  reason = excluded.reason,
  line = excluded.line,
  started = excluded.started,
  seed_ui = excluded.seed_ui,
  seed_ux = excluded.seed_ux,
  seed_catalog = excluded.seed_catalog,
  seed_features = excluded.seed_features;

-- Add ani.pm at the top (sort_order = 1) with metadata description
insert into public.nothingmoe_sites (
  domain, slug, name, href, discord, icon, category, reason, line, started,
  seed_ui, seed_ux, seed_catalog, seed_features, sort_order
)
values (
  'ani.pm', 'anipm', 'ani.pm', 'https://ani.pm', null,
  '/sites/anipm.png', 'japanese', 'stream + tracking',
  'Stream thousands of anime series and movies in HD — subbed & dubbed, always free. Resume anywhere and keep a list that follows you.',
  '2026', 97, 95, 97, 94, 1
)
on conflict (domain) do update set
  slug = excluded.slug,
  name = excluded.name,
  href = excluded.href,
  icon = excluded.icon,
  reason = excluded.reason,
  line = excluded.line,
  started = excluded.started,
  seed_ui = excluded.seed_ui,
  seed_ux = excluded.seed_ux,
  seed_catalog = excluded.seed_catalog,
  seed_features = excluded.seed_features;

-- Update other sites to their official metadata descriptions and clear discord links
update public.nothingmoe_sites
set discord = null;

update public.nothingmoe_sites
set line = 'A premium anime discovery platform. Browse trending, seasonal, and top-rated anime with cinematic visuals.'
where domain = 'anilight.live';

update public.nothingmoe_sites
set line = 'Every anime in one place, free. Search thousands of shows, catch this season''s simulcasts as they air, and keep your lists, schedule and history in My Anikura.'
where domain = 'anikura.club';

update public.nothingmoe_sites
set line = 'Watch anime online for free on YumeZone. Stream thousands of series in HD with sub & dub. Sync and track your watchlist with AniList & MAL.'
where domain = 'yumezone.live';

update public.nothingmoe_sites
set line = 'Track and discover anime on NekoWatch.'
where domain = 'nekowatch.xyz';

-- Re-index sort orders to ensure clean sequence without colliding on unique sort_order constraint:
-- 1: ani.pm
-- 2: animex.one
-- 3: anilight.live
-- 4: anikura.club
-- 5: yumezone.live
-- 6: nekowatch.xyz
update public.nothingmoe_sites
set sort_order = case domain
  when 'ani.pm' then -1
  when 'animex.one' then -2
  when 'anilight.live' then -3
  when 'anikura.club' then -4
  when 'yumezone.live' then -5
  when 'nekowatch.xyz' then -6
  else -100 - sort_order
end;

update public.nothingmoe_sites
set sort_order = abs(sort_order);
