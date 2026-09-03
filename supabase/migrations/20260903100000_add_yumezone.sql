-- Add YumeZone directly below Anikura in the world ranking.

-- Free sort slots after Anikura without colliding on the unique sort_order constraint.
update public.nothingmoe_sites
set sort_order = -1000 - sort_order
where sort_order > (
  select sort_order from public.nothingmoe_sites where domain = 'anikura.club'
);

update public.nothingmoe_sites
set sort_order = abs(sort_order) - 1000 + 1
where sort_order < 0;

insert into public.nothingmoe_sites (
  domain, slug, name, href, discord, icon, category, reason, line, started,
  seed_ui, seed_ux, seed_catalog, seed_features, sort_order
)
values (
  'yumezone.live',
  'yumezone',
  'YumeZone',
  'https://yumezone.live/home',
  null,
  '/sites/yumezone.png',
  'japanese',
  'anime + manga',
  'Stream anime and read manga in one place — HD watches, seasonal picks, and ongoing series.',
  '2025',
  88,
  84,
  91,
  79,
  (
    select sort_order + 1
    from public.nothingmoe_sites
    where domain = 'anikura.club'
  )
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
