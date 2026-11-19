-- Aayush Computers: let signed-in users reach the tables.
-- Run this once in Supabase > SQL Editor, after schema.sql. Safe to run again.
--
-- Newer Supabase projects do not give app users access to tables automatically.
-- Without these grants the app cannot read a user's role, products, requests or alerts.
-- Row level security (set up in schema.sql) still decides WHICH rows each person sees or changes:
-- customers only their own requests and alerts, and only the owner can change statuses and products.

grant usage on schema public to authenticated;
grant usage on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;

-- profiles: read (own row, owner reads all); edit only name, phone, push token
grant select on public.profiles to authenticated;
grant update (full_name, phone, push_token) on public.profiles to authenticated;

-- products: everyone signed in reads; only the owner changes them (policy "products write")
grant select, insert, update, delete on public.products to authenticated;

-- requests: customers create and read their own; only the owner changes status and note
grant select on public.requests to authenticated;
grant insert (kind, device, title, details, contact_phone) on public.requests to authenticated;
grant update (status, owner_note) on public.requests to authenticated;

-- status history: read only (written by database triggers)
grant select on public.status_history to authenticated;

-- notifications: read your own and mark them read (written by database triggers)
grant select on public.notifications to authenticated;
grant update (read) on public.notifications to authenticated;
