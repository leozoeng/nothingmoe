-- Ensure one review per signed-in user per site (already in init; idempotent).
create unique index if not exists nothingmoe_reviews_one_per_user
  on public.nothingmoe_reviews (site_domain, user_id)
  where user_id is not null;

-- Align update policy with insert checks so edits keep the same constraints.
drop policy if exists nothingmoe_reviews_update on public.nothingmoe_reviews;
create policy nothingmoe_reviews_update on public.nothingmoe_reviews
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and char_length(body) between 3 and 2000
    and stars between 1 and 5
    and score_ui between 1 and 100
    and score_ux between 1 and 100
    and score_catalog between 1 and 100
    and score_features between 1 and 100
    and site_domain = any (array['anilight.live','luna-stream.me','anikura.club','nekowatch.xyz'])
  );
