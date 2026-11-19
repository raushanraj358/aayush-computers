-- Aayush Computer: database schema for Supabase (Postgres)
-- Run this whole file once in Supabase > SQL Editor.

-- ---------- Profiles (one per signed-in user) ----------
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'customer' check (role in ('customer','owner')),
  full_name text,
  phone text,
  email text,
  push_token text,
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Works for all sign-up methods: Google (name comes as full_name or name), email + password, mobile + password.
  -- Supabase stores phone numbers without '+', so add it back (+919006434998).
  insert into public.profiles (id, email, phone, full_name)
  values (
    new.id,
    nullif(new.email, ''),
    case when coalesce(new.phone, '') <> '' then '+' || ltrim(new.phone, '+') end,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_user();

create function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'owner');
$$;

-- ---------- Products ----------
create table public.products (
  id bigint generated always as identity primary key,
  name text not null,
  price integer not null check (price > 0),
  category text not null check (category in ('Laptops','Printers','CCTV','Accessories','Networking')),
  brand text,
  second_hand boolean not null default false,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Requests (repair, order, enquiry) ----------
create type public.request_kind as enum ('service','order','enquiry');
create type public.device_kind as enum ('computer','printer','cctv','networking','other');

create function public.flow_for(k public.request_kind) returns text[]
language sql immutable as $$
  select case k
    when 'service' then array['Received','Diagnosed','In repair','Ready for pickup','Delivered']
    when 'order'   then array['Placed','Confirmed','Packed','Out for delivery','Delivered']
    else array['New','Quote sent','Closed']
  end;
$$;

create table public.requests (
  id bigint generated always as identity primary key,
  customer_id uuid not null default auth.uid() references public.profiles(id),
  kind public.request_kind not null,
  device public.device_kind,
  title text not null,
  details text,
  contact_phone text,
  status text not null default 'new',
  owner_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.status_history (
  id bigint generated always as identity primary key,
  request_id bigint not null references public.requests(id) on delete cascade,
  status text not null,
  note text,
  changed_by uuid references public.profiles(id),
  changed_at timestamptz not null default now()
);

-- ---------- Notifications (in-app now; an Edge Function sends SMS and push) ----------
create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  request_id bigint references public.requests(id) on delete cascade,
  message text not null,
  read boolean not null default false,
  sms_status text not null default 'pending' check (sms_status in ('pending','sent','failed')),
  created_at timestamptz not null default now()
);

-- ---------- Triggers: status rules and notifications ----------
create function public.requests_before_insert() returns trigger
language plpgsql as $$
begin
  new.status := (public.flow_for(new.kind))[1];  -- always starts at the first step
  return new;
end $$;

create trigger trg_requests_before_insert
before insert on public.requests for each row execute function public.requests_before_insert();

create function public.requests_after_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into status_history (request_id, status, changed_by) values (new.id, new.status, new.customer_id);

  -- tell the owner(s)
  insert into notifications (user_id, request_id, message)
  select id, new.id,
    'New ' || new.kind || ' #' || new.id || coalesce(' (' || new.device || ')', '') || ': ' || new.title
  from profiles where role = 'owner';

  -- confirm to the customer
  insert into notifications (user_id, request_id, message)
  values (new.customer_id, new.id, 'Request #' || new.id || ' received. We will keep you updated.');
  return new;
end $$;

create trigger trg_requests_after_insert
after insert on public.requests for each row execute function public.requests_after_insert();

create function public.requests_before_update() returns trigger
language plpgsql as $$
begin
  if not (new.status = any (public.flow_for(new.kind))) then
    raise exception 'Invalid status % for a % request', new.status, new.kind;
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger trg_requests_before_update
before update on public.requests for each row execute function public.requests_before_update();

create function public.requests_after_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into status_history (request_id, status, note, changed_by)
    values (new.id, new.status, new.owner_note, auth.uid());

    insert into notifications (user_id, request_id, message)
    values (new.customer_id, new.id,
      'Request #' || new.id || coalesce(' (' || new.device || ')', '') || ' is now: ' || new.status ||
      case when coalesce(new.owner_note, '') <> '' then '. ' || new.owner_note else '' end);
  end if;
  return new;
end $$;

create trigger trg_requests_after_update
after update on public.requests for each row execute function public.requests_after_update();

-- ---------- Security: row level security ----------
alter table public.profiles       enable row level security;
alter table public.products       enable row level security;
alter table public.requests       enable row level security;
alter table public.status_history enable row level security;
alter table public.notifications  enable row level security;

-- profiles: see your own (owner sees all); users may edit only name, phone, push token
create policy "profiles read"   on public.profiles for select to authenticated using (id = auth.uid() or public.is_owner());
create policy "profiles update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated;
grant update (full_name, phone, push_token) on public.profiles to authenticated;

-- products: everyone signed in sees active items; only the owner changes them
create policy "products read"  on public.products for select to authenticated using (active or public.is_owner());
create policy "products write" on public.products for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- requests: customers create and see their own; only the owner updates status
create policy "requests read"   on public.requests for select to authenticated using (customer_id = auth.uid() or public.is_owner());
create policy "requests insert" on public.requests for insert to authenticated with check (customer_id = auth.uid());
create policy "requests update" on public.requests for update to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "history read" on public.status_history for select to authenticated
using (exists (select 1 from public.requests r where r.id = request_id and (r.customer_id = auth.uid() or public.is_owner())));

-- notifications: you see your own and can only mark them read
create policy "notifications read"   on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notifications update" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke update on public.notifications from authenticated;
grant update (read) on public.notifications to authenticated;

-- live updates in the app
alter publication supabase_realtime add table public.notifications, public.requests;

-- ---------- Starter products (placeholders: replace with real stock) ----------
insert into public.products (name, price, category, brand, second_hand) values
 ('Dell Latitude 5490, Core i5, 8 GB, 256 GB SSD', 18999, 'Laptops', 'Dell', true),
 ('HP EliteBook 840 G3, Core i5, 8 GB, 256 GB SSD', 17499, 'Laptops', 'HP', true),
 ('Acer Aspire E15, Core i3, 4 GB, 500 GB HDD', 15000, 'Laptops', 'Acer', true),
 ('Lenovo ThinkPad T470, Core i5, 8 GB, 256 GB SSD', 19999, 'Laptops', 'Lenovo', true),
 ('2MP HD bullet CCTV camera, night vision', 1199, 'CCTV', null, false),
 ('2MP dome CCTV camera, night vision, audio', 1599, 'CCTV', null, false),
 ('Inkjet all-in-one printer (print, scan, copy)', 4999, 'Printers', null, false),
 ('Mono laser printer, fast print', 8499, 'Printers', null, false);
