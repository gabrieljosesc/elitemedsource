-- ============================================================
-- Elite MedSource — Supabase Database Schema (complete)
--
-- One file, run top to bottom in the Supabase SQL Editor on a fresh
-- project (or apply it as a single migration). It creates every
-- table, function, trigger, policy, and storage bucket the storefront
-- and admin panel use, and seeds the category list.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  first_name  text,
  last_name   text,
  company     text,
  phone       text,
  license_number text,
  role        text not null default 'customer', -- 'customer' | 'admin'
  -- Contact
  prefix          text,
  middle_name     text,
  -- Medical license
  license_holder_name text,
  profession      text,
  specialty       text,
  license_expiry  date,
  license_state   text,
  license_country text,
  -- Business
  business_phone  text,
  website         text,
  -- Delivery address
  address_line1   text,
  city            text,
  state           text,
  postal_code     text,
  country         text,
  -- Account area
  avatar_url      text,
  notification_preferences jsonb not null default '{}',
  privacy_preferences      jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create a profile row on signup from the registration metadata
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id, email, first_name, last_name, company, phone, license_number,
    prefix, middle_name, license_holder_name, profession, specialty, license_expiry, license_state, license_country,
    business_phone, website, address_line1, city, state, postal_code, country
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'license_number',
    new.raw_user_meta_data->>'prefix',
    new.raw_user_meta_data->>'middle_name',
    new.raw_user_meta_data->>'license_holder_name',
    new.raw_user_meta_data->>'profession',
    new.raw_user_meta_data->>'specialty',
    nullif(new.raw_user_meta_data->>'license_expiry', '')::date,
    new.raw_user_meta_data->>'license_state',
    new.raw_user_meta_data->>'license_country',
    new.raw_user_meta_data->>'business_phone',
    new.raw_user_meta_data->>'website',
    new.raw_user_meta_data->>'address_line1',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'state',
    new.raw_user_meta_data->>'postal_code',
    new.raw_user_meta_data->>'country'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- CATALOG: categories, brands, products, extra COAs
-- ============================================================
create table if not exists public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  parent_id   uuid references public.categories(id) on delete set null,
  description text,
  image_url   text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.brands (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  slug              text not null unique,
  description       text,
  short_description text,
  price             numeric(12,2) not null default 0,
  -- Quantity-tier pricing, e.g. [{"minQ":1,"maxQ":3,"price":599}]
  price_tiers       jsonb not null default '[]',
  sale_price        numeric(12,2),
  sku               text,
  stock_quantity    int,
  is_in_stock       boolean not null default true,
  -- Complimentary item (shows "FREE" instead of a price)
  is_free           boolean not null default false,
  category_id       uuid references public.categories(id) on delete set null,
  brand_id          uuid references public.brands(id) on delete set null,
  images            text[] not null default '{}',
  -- Primary Certificate of Analysis PDF (public URL in the product-coas bucket)
  coa_url           text,
  -- Ordered [{label, value}] spec pairs shown on the product card
  specs             jsonb not null default '[]',
  featured          boolean not null default false,
  rating            numeric,
  review_count      int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_brand_id_idx on public.products(brand_id);
create index if not exists products_featured_idx on public.products(featured);
create index if not exists products_name_idx on public.products using gin(to_tsvector('english', name));

-- Additional labeled COAs per product (separate lab batches / lots).
-- products.coa_url stays the primary certificate.
create table if not exists public.product_coas (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  label       text not null,
  file_url    text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists product_coas_product_id_idx on public.product_coas (product_id);

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists public.orders (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete set null,
  reference_number text not null unique,
  status           text not null default 'pending',
  subtotal         numeric(12,2) not null,
  shipping_amount  numeric(12,2) not null default 0,
  discount_amount  numeric(12,2) not null default 0,
  coupon_code      text,
  total            numeric(12,2) not null,
  shipping_address jsonb not null default '{}',
  billing_address  jsonb,
  customer_name    text,
  customer_email   text,
  notes            text,
  -- Encrypted card-on-file snapshot for manual/admin processing — never a live charge.
  -- Shape: {brand, last4, exp_month, exp_year, name_on_card, pan_encrypted, cvv_encrypted}
  payment_card_snapshot jsonb,
  policy_acknowledged_at timestamptz,
  -- Admin order management
  admin_notes            text,
  customer_visible_note  text,
  payment_update_requested_at timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_reference_idx on public.orders(reference_number);

create table if not exists public.order_items (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  product_name  text not null,
  product_image text,
  quantity      int not null,
  unit_price    numeric(12,2) not null,
  total_price   numeric(12,2) not null
);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- ============================================================
-- WISHLIST, CONTACT, TRADE APPLICATIONS
-- ============================================================
create table if not exists public.wishlist_items (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create table if not exists public.contact_messages (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null,
  phone      text,
  subject    text not null,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.trade_applications (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete set null,
  practice_name   text not null,
  license_number  text not null,
  license_file_url text,
  status          text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
  created_at      timestamptz not null default now(),
  reviewed_at     timestamptz
);

-- ============================================================
-- ACCOUNT AREA: saved addresses + saved cards
-- ============================================================
create table if not exists public.user_addresses (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  label          text,
  recipient_name text not null,
  phone          text,
  line1          text not null,
  line2          text,
  city           text,
  state          text,
  postal_code    text,
  country        text,
  is_default     boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists user_addresses_user_id_idx on public.user_addresses(user_id);

create table if not exists public.user_saved_cards (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name_on_card  text not null,
  brand         text,
  last4         text not null,
  exp_month     int not null,
  exp_year      int not null,
  pan_encrypted text not null, -- AES-256-GCM via PAYMENT_CARD_SECRET
  is_default    boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists user_saved_cards_user_id_idx on public.user_saved_cards(user_id);

-- ============================================================
-- COUPONS
-- ============================================================
create table if not exists public.coupons (
  id            uuid primary key default gen_random_uuid(),
  code          text not null,
  kind          text not null default 'percent', -- 'percent' | 'fixed'
  value         numeric(12,2) not null,
  min_subtotal  numeric(12,2) not null default 0,
  max_uses      int,
  used_count    int not null default 0,
  expires_at    timestamptz,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);
create unique index if not exists coupons_code_upper_idx on public.coupons (upper(code));

create or replace function public.increment_coupon_use(p_code text)
returns void language sql security definer set search_path = public as $$
  update public.coupons set used_count = used_count + 1 where upper(code) = upper(p_code);
$$;

-- ============================================================
-- PRODUCT REVIEWS (one per user per product; keeps rating in sync)
-- ============================================================
create table if not exists public.product_reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  rating      int not null check (rating between 1 and 5),
  title       text,
  body        text not null,
  is_verified boolean not null default false,
  is_approved boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (product_id, user_id)
);
create index if not exists product_reviews_product_id_idx on public.product_reviews (product_id);

create or replace function public.refresh_product_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  pid := coalesce(new.product_id, old.product_id);
  update public.products p set
    rating = (select round(avg(r.rating)::numeric, 2) from public.product_reviews r
      where r.product_id = pid and r.is_approved),
    review_count = (select count(*) from public.product_reviews r
      where r.product_id = pid and r.is_approved)
  where p.id = pid;
  return null;
end;
$$;

drop trigger if exists product_reviews_refresh on public.product_reviews;
create trigger product_reviews_refresh
  after insert or update or delete on public.product_reviews
  for each row execute function public.refresh_product_rating();

-- ============================================================
-- BLOG
-- ============================================================
create table if not exists public.blog_posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  excerpt         text,
  body            text not null,
  cover_image_url text,
  is_published    boolean not null default false,
  published_at    timestamptz,
  author_id       uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists blog_posts_published_idx on public.blog_posts (is_published, published_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- is_admin() is SECURITY DEFINER so policies on profiles don't recurse
-- into themselves (error 42P17).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles for select using (public.is_admin());

alter table public.products enable row level security;
drop policy if exists "Anyone can view products" on public.products;
create policy "Anyone can view products" on public.products for select using (true);
drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products" on public.products for all using (public.is_admin());

alter table public.categories enable row level security;
drop policy if exists "Anyone can view categories" on public.categories;
create policy "Anyone can view categories" on public.categories for select using (true);
drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories" on public.categories for all using (public.is_admin());

alter table public.brands enable row level security;
drop policy if exists "Anyone can view brands" on public.brands;
create policy "Anyone can view brands" on public.brands for select using (true);
drop policy if exists "Admins can manage brands" on public.brands;
create policy "Admins can manage brands" on public.brands for all using (public.is_admin());

alter table public.product_coas enable row level security;
drop policy if exists "product_coas_select" on public.product_coas;
create policy "product_coas_select" on public.product_coas for select using (true);
drop policy if exists "product_coas_admin_write" on public.product_coas;
create policy "product_coas_admin_write" on public.product_coas
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.orders enable row level security;
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
drop policy if exists "Anyone can insert order" on public.orders;
create policy "Anyone can insert order" on public.orders for insert with check (true);
drop policy if exists "Admins can manage orders" on public.orders;
create policy "Admins can manage orders" on public.orders for all using (public.is_admin());

alter table public.order_items enable row level security;
drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items" on public.order_items for select using (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);
drop policy if exists "Anyone can insert order items" on public.order_items;
create policy "Anyone can insert order items" on public.order_items for insert with check (true);
drop policy if exists "Admins can manage order items" on public.order_items;
create policy "Admins can manage order items" on public.order_items for all using (public.is_admin());

alter table public.wishlist_items enable row level security;
drop policy if exists "Users manage own wishlist" on public.wishlist_items;
create policy "Users manage own wishlist" on public.wishlist_items for all using (auth.uid() = user_id);

alter table public.contact_messages enable row level security;
drop policy if exists "Anyone can submit contact" on public.contact_messages;
create policy "Anyone can submit contact" on public.contact_messages for insert with check (true);
drop policy if exists "Admins can read messages" on public.contact_messages;
create policy "Admins can read messages" on public.contact_messages for select using (public.is_admin());

alter table public.trade_applications enable row level security;
drop policy if exists "Users can view own application" on public.trade_applications;
create policy "Users can view own application" on public.trade_applications for select using (auth.uid() = user_id);
drop policy if exists "Users can submit application" on public.trade_applications;
create policy "Users can submit application" on public.trade_applications for insert with check (true);
drop policy if exists "Admins can manage applications" on public.trade_applications;
create policy "Admins can manage applications" on public.trade_applications for all using (public.is_admin());

alter table public.user_addresses enable row level security;
drop policy if exists "Users manage own addresses" on public.user_addresses;
create policy "Users manage own addresses" on public.user_addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.user_saved_cards enable row level security;
drop policy if exists "Users manage own cards" on public.user_saved_cards;
create policy "Users manage own cards" on public.user_saved_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Coupons are admin-only; customers validate through a service-role server action.
alter table public.coupons enable row level security;
drop policy if exists "Admins manage coupons" on public.coupons;
create policy "Admins manage coupons" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.product_reviews enable row level security;
drop policy if exists "reviews_select" on public.product_reviews;
create policy "reviews_select" on public.product_reviews
  for select using (is_approved = true or user_id = auth.uid() or public.is_admin());
drop policy if exists "reviews_insert_own" on public.product_reviews;
create policy "reviews_insert_own" on public.product_reviews
  for insert with check (user_id = auth.uid());
drop policy if exists "reviews_update_own" on public.product_reviews;
create policy "reviews_update_own" on public.product_reviews
  for update using (user_id = auth.uid() or public.is_admin());
drop policy if exists "reviews_delete_own" on public.product_reviews;
create policy "reviews_delete_own" on public.product_reviews
  for delete using (user_id = auth.uid() or public.is_admin());

alter table public.blog_posts enable row level security;
drop policy if exists "blog_select_published" on public.blog_posts;
create policy "blog_select_published" on public.blog_posts
  for select using (is_published = true or public.is_admin());
drop policy if exists "blog_admin_manage" on public.blog_posts;
create policy "blog_admin_manage" on public.blog_posts for all using (public.is_admin());

-- ============================================================
-- STORAGE BUCKETS (all public-read; writes scoped below)
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', true),
  ('product-images', 'product-images', true),
  ('product-coas', 'product-coas', true),
  ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');
drop policy if exists "avatars_owner_write" on storage.objects;
create policy "avatars_owner_write" on storage.objects
  for all using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');
drop policy if exists "product_images_admin_write" on storage.objects;
create policy "product_images_admin_write" on storage.objects
  for all using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_coas_public_read" on storage.objects;
create policy "product_coas_public_read" on storage.objects
  for select using (bucket_id = 'product-coas');
drop policy if exists "product_coas_admin_write" on storage.objects;
create policy "product_coas_admin_write" on storage.objects
  for all using (bucket_id = 'product-coas' and public.is_admin())
  with check (bucket_id = 'product-coas' and public.is_admin());

drop policy if exists "blog_images_public_read" on storage.objects;
create policy "blog_images_public_read" on storage.objects
  for select using (bucket_id = 'blog-images');
drop policy if exists "blog_images_admin_write" on storage.objects;
create policy "blog_images_admin_write" on storage.objects
  for all using (bucket_id = 'blog-images' and public.is_admin())
  with check (bucket_id = 'blog-images' and public.is_admin());

-- ============================================================
-- SEED: Categories
-- ============================================================
insert into public.categories (name, slug, sort_order) values
  ('Rheumatology',           'rheumatology',           10),
  ('Ophthalmology',          'ophthalmology',          20),
  ('Skincare',               'skincare',                30),
  ('Peels and Masks',        'peels-and-masks',        40),
  ('Dermal Fillers',         'dermal-fillers',          50),
  ('Botulinum Toxins',       'botulinum-toxins',        60),
  ('Gynecology',             'gynecology',              70),
  ('Body Sculpting',         'body-sculpting',          80),
  ('Osteoporosis',           'osteoporosis',            90),
  ('Fat Removal',            'fat-removal',            100),
  ('Mesotherapy',            'mesotherapy',            110),
  ('Orthopedic Injections',  'orthopedic-injections',  120),
  ('Peptides',               'peptides',               125),
  ('Dermal Filler Removal',  'dermal-filler-removal',  130),
  ('Anaesthetics',           'anaesthetics',           140),
  ('Weight Loss',            'weight-loss',            150),
  ('Cannulas and Needles',   'cannulas-and-needles',   160),
  ('Asthma',                 'asthma',                 170),
  ('Threads',                'threads',                180),
  ('Eyelash Enhancers',      'eyelash-enhancers',      190),
  ('PRP Kits',               'prp-kits',               200),
  ('Other',                  'other',                  999)
on conflict (slug) do nothing;
