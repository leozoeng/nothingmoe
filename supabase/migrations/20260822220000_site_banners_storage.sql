insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-banners',
  'site-banners',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists site_banners_public_read on storage.objects;
create policy site_banners_public_read on storage.objects
  for select
  using (bucket_id = 'site-banners');

drop policy if exists site_banners_owner_insert on storage.objects;
create policy site_banners_owner_insert on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'site-banners'
    and exists (
      select 1 from public.nothingmoe_site_owners o
      where o.user_id = auth.uid()
        and o.site_domain = split_part(name, '/', 1)
    )
  );

drop policy if exists site_banners_owner_update on storage.objects;
create policy site_banners_owner_update on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'site-banners'
    and exists (
      select 1 from public.nothingmoe_site_owners o
      where o.user_id = auth.uid()
        and o.site_domain = split_part(name, '/', 1)
    )
  )
  with check (
    bucket_id = 'site-banners'
    and exists (
      select 1 from public.nothingmoe_site_owners o
      where o.user_id = auth.uid()
        and o.site_domain = split_part(name, '/', 1)
    )
  );

drop policy if exists site_banners_owner_delete on storage.objects;
create policy site_banners_owner_delete on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'site-banners'
    and exists (
      select 1 from public.nothingmoe_site_owners o
      where o.user_id = auth.uid()
        and o.site_domain = split_part(name, '/', 1)
    )
  );
