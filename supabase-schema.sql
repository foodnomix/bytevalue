-- ByteValue Dashboard — Supabase Schema
-- Run this in your Supabase SQL Editor (Project → SQL Editor → New query)

create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,          -- short unique code, e.g. MIL1980HYD — used in the URL
  name text not null,
  location text not null default '',
  city text not null default '',
  created_at timestamptz default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  platform text not null check (platform in ('swiggy','zomato')),
  month int not null,
  year int not null,
  date_from date not null,
  date_to date not null,
  created_at timestamptz default now()
);

create table if not exists payout_periods (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade,
  period_label text not null,
  sort_order int not null default 0,
  customer_paid numeric not null default 0,
  platform_fee numeric not null default 0,
  platform_fee_pct numeric not null default 0,
  govt_tax numeric not null default 0,
  govt_tax_pct numeric not null default 0,
  ads_spend numeric not null default 0,
  ads_spend_pct numeric not null default 0,
  net_payout numeric not null default 0,
  net_payout_pct numeric not null default 0
);

create table if not exists performance_periods (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade,
  period_label text not null,
  sort_order int not null default 0,
  total_orders int not null default 0,
  delivered int not null default 0,
  cancelled int not null default 0,
  gross_subtotal numeric not null default 0,
  discounts numeric not null default 0,
  packaging numeric not null default 0,
  cust_gst numeric not null default 0,
  aov numeric not null default 0
);

create table if not exists top_items (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade,
  fortnight int not null check (fortnight in (1,2)),
  rank int not null,
  item_name text not null,
  units int not null default 0
);

create table if not exists item_ledger (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade,
  item_name text not null,
  units_sold int not null default 0,
  net_per_unit numeric not null default 0,
  total_net_payout numeric not null default 0,
  margin_pct numeric not null default 0
);

-- Row Level Security — public read (lock down further with auth if needed)
alter table restaurants enable row level security;
alter table reports enable row level security;
alter table payout_periods enable row level security;
alter table performance_periods enable row level security;
alter table top_items enable row level security;
alter table item_ledger enable row level security;

create policy "public read restaurants" on restaurants for select using (true);
create policy "public read reports" on reports for select using (true);
create policy "public read payout_periods" on payout_periods for select using (true);
create policy "public read performance_periods" on performance_periods for select using (true);
create policy "public read top_items" on top_items for select using (true);
create policy "public read item_ledger" on item_ledger for select using (true);

-- Index on code for fast lookup
create index if not exists restaurants_code_idx on restaurants(lower(code));
