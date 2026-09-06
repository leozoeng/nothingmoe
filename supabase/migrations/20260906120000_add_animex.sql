-- Add AnimeX at the top of the world ranking.

-- Free all sort slots without colliding on the unique sort_order constraint.
update public.nothingmoe_sites
set sort_order = -1000 - sort_order;

-- Shift every existing site down one place (1 -> 2, 2 -> 3, ...).
update public.nothingmoe_sites
set sort_order = abs(sort_order) - 1000 + 1
where sort_order < 0;

insert into public.nothingmoe_sites (
  domain, slug, name, href, discord, icon, category, reason, line, started,
  seed_ui, seed_ux, seed_catalog, seed_features, sort_order
)
values (
  'animex.one',
  'animex',
  'AnimeX',
  'https://animex.one',
  null,
  '/sites/animex.png',
  'japanese',
  'stream + discover',
  'HD anime with subs & dubs — watch together, AniList sync, and a huge catalog.',
  '2025',
  95,
  93,
  96,
  92,
  1
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
  seed_features = excluded.seed_features,
  sort_order = excluded.sort_order;
