-- Aayush Computers: storage for product photos.
-- Run this once in Supabase > SQL Editor, after 002_app_access.sql. Safe to run again.
--
-- Creates a public "product-photos" bucket: anyone can view the photos (they appear in the shop),
-- but only the owner can upload, replace or delete them. Photos are limited to 5 MB
-- (the website shrinks phone photos to about 200-400 KB before uploading).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-photos', 'product-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product photos: owner uploads" on storage.objects;
drop policy if exists "product photos: owner updates" on storage.objects;
drop policy if exists "product photos: owner deletes" on storage.objects;

create policy "product photos: owner uploads" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-photos' and public.is_owner());
create policy "product photos: owner updates" on storage.objects for update to authenticated
  using (bucket_id = 'product-photos' and public.is_owner());
create policy "product photos: owner deletes" on storage.objects for delete to authenticated
  using (bucket_id = 'product-photos' and public.is_owner());
