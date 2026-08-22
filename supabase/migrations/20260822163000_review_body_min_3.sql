-- Allow short punchy reviews (e.g. "S tier")
alter table public.nothingmoe_reviews
  drop constraint if exists nothingmoe_reviews_body_check;

alter table public.nothingmoe_reviews
  add constraint nothingmoe_reviews_body_check
  check (char_length(body) between 3 and 2000);

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
    and site_domain = any (array['anilight.live','luna-stream.me','anikura.club','nekowatch.xyz'])
  );
