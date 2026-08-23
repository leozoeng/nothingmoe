-- Moderator bans: blocked from posting/updating reviews.
alter table public.nothingmoe_profiles
  add column if not exists banned_at timestamptz,
  add column if not exists banned_reason text;

comment on column public.nothingmoe_profiles.banned_at is
  'When set, the account cannot post or update reviews';
