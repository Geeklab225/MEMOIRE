-- ============================================================
-- Abengourou Express — Schéma de base de données Supabase
-- ============================================================

-- Extension UUID
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- Tables principales
-- ──────────────────────────────────────────────────────────────

create table if not exists shops (
  id           text primary key,
  name         text not null,
  category     text not null check (category in ('restaurant','pharmacy','supermarket','bakery','drinks')),
  description  text,
  address      text,
  neighborhood text,
  rating       numeric(3,2) default 5.0,
  review_count int default 0,
  delivery_time text,
  delivery_fee  int default 500,
  min_order     int default 0,
  is_open       boolean default true,
  emoji         text,
  featured      boolean default false,
  cover_color   text,
  created_at    timestamptz default now()
);

create table if not exists products (
  id          text primary key,
  shop_id     text references shops(id) on delete cascade,
  name        text not null,
  description text,
  price       int not null,
  category    text,
  emoji       text,
  available   boolean default true,
  popular     boolean default false,
  created_at  timestamptz default now()
);

create table if not exists delivery_persons (
  id                text primary key,
  name              text not null,
  phone             text,
  vehicle           text check (vehicle in ('moto','velo','voiture')),
  rating            numeric(3,2) default 5.0,
  total_deliveries  int default 0,
  is_available      boolean default true,
  current_order_id  text,
  avatar            text,
  user_id           uuid references auth.users(id) on delete set null,
  created_at        timestamptz default now()
);

create table if not exists supplier_accounts (
  id              text primary key,
  shop_id         text references shops(id) on delete cascade,
  shop_name       text not null,
  owner_name      text not null,
  email           text,
  phone           text,
  status          text check (status in ('active','pending','suspended')) default 'pending',
  joined_date     date default current_date,
  commission_rate int default 12,
  access_code     text unique not null,
  user_id         uuid references auth.users(id) on delete set null,
  created_at      timestamptz default now()
);

create table if not exists orders (
  id                    text primary key,
  order_type            text check (order_type in ('delivery','shopping')) not null,
  customer_name         text not null,
  customer_phone        text,
  shop_id               text references shops(id) on delete set null,
  shop_name             text,
  status                text check (status in ('pending','confirmed','preparing','ready','picked_up','delivering','delivered','cancelled')) default 'pending',
  payment_method        text check (payment_method in ('cash','orange_money','mtn_money')),
  delivery_address      text,
  delivery_neighborhood text,
  delivery_person_id    text references delivery_persons(id) on delete set null,
  delivery_person_name  text,
  deposit_amount        int,
  subtotal              int default 0,
  delivery_fee          int default 500,
  shopping_fee          int,
  total                 int not null,
  estimated_delivery    text,
  notes                 text,
  customer_user_id      uuid references auth.users(id) on delete set null,
  created_at            timestamptz default now()
);

create table if not exists order_items (
  id             uuid default uuid_generate_v4() primary key,
  order_id       text references orders(id) on delete cascade,
  product_id     text references products(id) on delete set null,
  product_name   text not null,
  product_price  int not null,
  product_emoji  text,
  quantity       int not null,
  created_at     timestamptz default now()
);

create table if not exists shopping_list_items (
  id              text primary key,
  order_id        text references orders(id) on delete cascade,
  name            text not null,
  quantity        text,
  estimated_price int,
  created_at      timestamptz default now()
);

-- Profils utilisateurs (étend auth.users)
create table if not exists user_profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  role                 text check (role in ('customer','delivery','supplier','admin')) not null,
  name                 text,
  phone                text,
  supplier_id          text references supplier_accounts(id) on delete set null,
  delivery_person_id   text references delivery_persons(id) on delete set null,
  created_at           timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- Row Level Security (RLS)
-- ──────────────────────────────────────────────────────────────

alter table shops              enable row level security;
alter table products           enable row level security;
alter table delivery_persons   enable row level security;
alter table supplier_accounts  enable row level security;
alter table orders             enable row level security;
alter table order_items        enable row level security;
alter table shopping_list_items enable row level security;
alter table user_profiles      enable row level security;

-- Helper: obtenir le rôle de l'utilisateur courant
create or replace function get_user_role()
returns text as $$
  select role from user_profiles where id = auth.uid()
$$ language sql security definer stable;

-- Helper: obtenir le supplier_id de l'utilisateur courant
create or replace function get_supplier_id()
returns text as $$
  select supplier_id from user_profiles where id = auth.uid()
$$ language sql security definer stable;

-- SHOPS — lecture publique
create policy "shops_read_all" on shops for select using (true);
create policy "shops_admin_write" on shops for all using (get_user_role() = 'admin');

-- PRODUCTS — lecture publique, modification admin/supplier
create policy "products_read_all" on products for select using (true);
create policy "products_admin_write" on products for all using (get_user_role() = 'admin');
create policy "products_supplier_update" on products for update
  using (shop_id in (select shop_id from supplier_accounts where id = get_supplier_id()));

-- DELIVERY PERSONS — lecture publique, modification admin
create policy "dp_read_all" on delivery_persons for select using (true);
create policy "dp_admin_write" on delivery_persons for all using (get_user_role() = 'admin');
create policy "dp_self_update" on delivery_persons for update
  using (user_id = auth.uid());

-- SUPPLIER ACCOUNTS — lecture restreinte
create policy "sup_admin_all" on supplier_accounts for all using (get_user_role() = 'admin');
create policy "sup_self_read" on supplier_accounts for select
  using (id = get_supplier_id() or get_user_role() = 'admin');

-- ORDERS — multi-rôles
create policy "orders_admin_all" on orders for all using (get_user_role() = 'admin');
create policy "orders_customer_own" on orders for select
  using (customer_user_id = auth.uid());
create policy "orders_customer_insert" on orders for insert
  with check (customer_user_id = auth.uid() or customer_user_id is null);
create policy "orders_delivery_read" on orders for select
  using (get_user_role() = 'delivery');
create policy "orders_delivery_update" on orders for update
  using (get_user_role() = 'delivery');
create policy "orders_supplier_read" on orders for select
  using (shop_id in (select shop_id from supplier_accounts where id = get_supplier_id()));
create policy "orders_supplier_update" on orders for update
  using (shop_id in (select shop_id from supplier_accounts where id = get_supplier_id()));

-- ORDER ITEMS
create policy "items_read" on order_items for select using (true);
create policy "items_insert" on order_items for insert with check (true);
create policy "items_admin" on order_items for all using (get_user_role() = 'admin');

-- SHOPPING LIST
create policy "shopping_read" on shopping_list_items for select using (true);
create policy "shopping_insert" on shopping_list_items for insert with check (true);
create policy "shopping_admin" on shopping_list_items for all using (get_user_role() = 'admin');

-- USER PROFILES
create policy "profiles_self" on user_profiles for all using (id = auth.uid());
create policy "profiles_admin" on user_profiles for all using (get_user_role() = 'admin');

-- ──────────────────────────────────────────────────────────────
-- Realtime — activer les publications
-- ──────────────────────────────────────────────────────────────
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table order_items;
alter publication supabase_realtime add table shopping_list_items;
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table delivery_persons;
