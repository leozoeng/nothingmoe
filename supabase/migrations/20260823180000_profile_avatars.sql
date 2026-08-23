-- Profile avatars for user accounts

alter table public.nothingmoe_profiles
  add column if not exists avatar_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists profile_avatars_public_read on storage.objects;
create policy profile_avatars_public_read on storage.objects
  for select
  using (bucket_id = 'profile-avatars');

drop policy if exists profile_avatars_self_insert on storage.objects;
create policy profile_avatars_self_insert on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'profile-avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists profile_avatars_self_update on storage.objects;
create policy profile_avatars_self_update on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'profile-avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'profile-avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists profile_avatars_self_delete on storage.objects;
create policy profile_avatars_self_delete on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'profile-avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );
