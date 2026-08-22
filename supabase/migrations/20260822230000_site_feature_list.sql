-- Feature list replaces pros/cons in the product UI.
-- Keep legacy `pros`/`cons` columns; app stores the feature list in `pros`
-- and clears `cons` on save. Rename when convenient:
--   alter table public.nothingmoe_site_pages rename column pros to feature_list;
--   alter table public.nothingmoe_site_pages drop column if exists cons;

comment on column public.nothingmoe_site_pages.pros is
  'Owner feature list (legacy column name; formerly pros)';
