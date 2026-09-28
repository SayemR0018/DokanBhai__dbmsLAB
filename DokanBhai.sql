-- =====================================================================
-- DOKANBHAI CANONICAL POSTGRESQL SCHEMA, STORED PROCEDURES & POLICIES
-- =====================================================================

-- ---------- 1. CORE RELATIONAL TABLES (3NF) -------------------------

-- 1. businesses (Store metadata & vertical types)
create table if not exists businesses (
  id              text primary key,
  name            text not null,
  business_type   text not null default 'mudi'
                   check (business_type in ('mudi','electronics','hardware','general')),
  owner_user_id   text not null,
  invite_code     text unique,
  address         text,
  phone           text,
  created_at      timestamptz not null default now(),
  constraint businesses_phone_key unique (phone)
);
create index if not exists businesses_owner_idx on businesses(owner_user_id);

-- 2. categories (Product taxonomy with color tags, one set per shop)
create table if not exists categories (
  id          text primary key,
  name        text not null,
  color       text default '#0f9d58',
  business_id text references businesses(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- 3. vendors (Suppliers directory)
create table if not exists vendors (
  id          text primary key,
  name        text not null,
  phone       text,
  address     text,
  note        text,
  business_id text references businesses(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists vendors_name_idx on vendors(name);
create index if not exists vendors_business_idx on vendors(business_id);

-- 4. customers (Baki Khata directory & running credit balance)
create table if not exists customers (
  id          text primary key,
  name        text not null,
  phone       text,
  address     text,
  note        text,
  balance     numeric(12,2) not null default 0,
  business_id text references businesses(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists customers_phone_idx on customers(phone);
create index if not exists customers_business_idx on customers(business_id);
create index if not exists customers_balance_idx on customers(balance);

-- 5. products (Supports fractional quantities & serial/warranty metadata)
create table if not exists products (
  id              text primary key,
  name            text not null,
  category_id     text references categories(id) on delete set null,
  vendor_id       text references vendors(id)    on delete set null,
  cost_price      numeric(12,2) not null default 0,
  sale_price      numeric(12,2) not null default 0,
  stock           numeric(12,3) not null default 0,
  min_stock       numeric(12,3) not null default 0,
  unit            text not null default 'pcs'
                   check (unit in ('pcs','kg','litre','bag','feet','cft',
                                    'ton','gaj','box','pack','dozen','bundle')),
  serial_tracked  boolean     not null default false,
  warranty_months integer     not null default 0
                   check (warranty_months >= 0),
  note            text,
  business_id     text references businesses(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index if not exists products_category_idx on products(category_id);
create index if not exists products_business_idx on products(business_id);
create index if not exists products_vendor_idx   on products(vendor_id);
create index if not exists products_lowstock_idx on products(stock, min_stock);

-- 6. invoices (Sale headers)
create table if not exists invoices (
  id            text primary key,
  invoice_no    text unique not null,
  customer_id   text references customers(id) on delete restrict,
  business_id   text references businesses(id) on delete set null,
  subtotal      numeric(12,2) not null default 0,
  discount      numeric(12,2) not null default 0,
  total         numeric(12,2) not null default 0,
  paid_amount   numeric(12,2) not null default 0,
  due_amount    numeric(12,2) not null default 0,
  pay_type      text not null default 'cash'
                 check (pay_type in ('cash','credit','online')),
  note          text,
  date          timestamptz not null default now()
);
create index if not exists invoices_customer_idx on invoices(customer_id);
create index if not exists invoices_date_idx     on invoices(date desc);

-- 7. sale_items (Normalized invoice line items)
create table if not exists sale_items (
  id              text primary key,
  invoice_id      text not null references invoices(id) on delete cascade,
  product_id      text references products(id) on delete set null,
  product_name    text not null,
  qty             numeric(12,3) not null,
  unit_price      numeric(12,2) not null,
  unit            text not null default 'pcs',
  amount          numeric(12,2) not null,
  serial_number   text,
  warranty_note   text
);
create index if not exists sale_items_invoice_idx on sale_items(invoice_id);
create index if not exists sale_items_product_idx on sale_items(product_id);

-- 8. transactions (Flat single-line ledger for dashboard analytics)
create table if not exists transactions (
  id            text primary key,
  type          text not null check (type in ('sale','payment')),
  customer_id   text references customers(id) on delete restrict,
  product_id    text references products(id)  on delete set null,
  product_name  text,
  qty           numeric(12,3) default 0,
  unit_price    numeric(12,2) default 0,
  amount        numeric(12,2) not null default 0,
  discount      numeric(12,2) not null default 0,
  paid_amount   numeric(12,2) not null default 0,
  pay_type      text not null default 'cash'
                 check (pay_type in ('cash','credit','online')),
  note          text,
  business_id   text references businesses(id) on delete set null,
  date          timestamptz not null default now()
);
create index if not exists tx_customer_idx on transactions(customer_id);
create index if not exists tx_business_idx on transactions(business_id);
create index if not exists tx_product_idx  on transactions(product_id);
create index if not exists tx_type_date_idx on transactions(type, date desc);

-- 9. payments (Payment entries for Baki clearance)
create table if not exists payments (
  id            text primary key,
  customer_id   text not null references customers(id) on delete restrict,
  amount        numeric(12,2) not null,
  note          text,
  business_id   text references businesses(id) on delete set null,
  date          timestamptz not null default now()
);
create index if not exists payments_customer_idx on payments(customer_id);
create index if not exists payments_business_idx on payments(business_id);
create index if not exists payments_date_idx     on payments(date desc);

-- 10. dokan_profile (Trusted device configuration profile)
create table if not exists dokan_profile (
  id                text primary key,
  schema_version    integer not null default 1,
  store_name        text not null,
  owner_name        text not null,
  region            text,
  business_type     text not null
                    check (business_type in ('mudi','electronics','hardware','general')),
  business_label    text,
  currency          text not null default 'BDT',
  receipt_width     text not null default '80mm'
                    check (receipt_width in ('58mm','80mm')),
  locale            text not null default 'bn-BD',
  session_phone     text not null,
  created_at        timestamptz not null default now(),
  constraint dokan_profile_session_phone_key unique (session_phone)
);

alter table vendors add column if not exists business_id text references businesses(id) on delete set null;
alter table customers add column if not exists business_id text references businesses(id) on delete set null;
alter table products add column if not exists business_id text references businesses(id) on delete set null;
alter table transactions add column if not exists business_id text references businesses(id) on delete set null;
alter table payments add column if not exists business_id text references businesses(id) on delete set null;
alter table categories add column if not exists business_id text references businesses(id) on delete set null;

-- Category names are unique inside a shop, not across the whole database.
alter table categories drop constraint if exists categories_name_key;
create unique index if not exists categories_business_name_uidx on categories (business_id, name);
create index if not exists categories_business_idx on categories (business_id);

-- Text primary keys have no default. The app sends an id; this covers older clients.
alter table products alter column id set default ('p-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12));
alter table customers alter column id set default ('c-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12));
alter table vendors alter column id set default ('v-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12));
alter table categories alter column id set default ('cat-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12));

-- Existing databases already have these constraint names (Postgres error 42P07).
-- Skip the ALTER when the constraint is present.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'businesses_phone_key'
      and conrelid = 'public.businesses'::regclass
  ) then
    alter table public.businesses
      add constraint businesses_phone_key unique (phone);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'dokan_profile_session_phone_key'
      and conrelid = 'public.dokan_profile'::regclass
  ) then
    alter table public.dokan_profile
      add constraint dokan_profile_session_phone_key unique (session_phone);
  end if;
end $$;

-- ---------- 2. TRANSACTIONAL STORED PROCEDURES (RPC) ----------------

-- create_sale: Atomically creates invoice, writes line items, deducts stock, updates Baki.
-- search_path is pinned so the security-definer body cannot be hijacked.
create or replace function create_sale(payload jsonb)
returns invoices
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invoice        invoices;
  v_line           jsonb;
  v_subtotal       numeric(12,2) := 0;
  v_total          numeric(12,2);
  v_paid           numeric(12,2);
  v_due            numeric(12,2);
  v_pay_type       text;
  v_date           timestamptz := coalesce((payload->>'date')::timestamptz, now());
  v_discount       numeric(12,2) := coalesce((payload->>'discount')::numeric, 0);
  v_raw_cust       text := trim(coalesce(payload->>'customer_id', ''));
  v_customer_id    text := null;
  v_business_id    text := nullif(payload->>'business_id', '');
  v_item_price     numeric(12,2);
  v_item_qty       numeric(12,3);
  v_line_amount    numeric(12,2);
  v_line_paid      numeric(12,2);
  v_remaining_paid numeric(12,2);
  v_line_count     integer := 0;
  v_line_index     integer := 0;
  v_shop           text := public.shop_phone();
begin
  if v_shop is null then
    raise exception 'shop phone required';
  end if;
  if v_business_id is null then
    v_business_id := v_shop;
  elsif v_business_id <> v_shop then
    raise exception 'sale shop does not match the signed-in shop';
  end if;

  -- Walk-in aliases stay NULL. A real customer must belong to this shop.
  if v_raw_cust <> '' and lower(v_raw_cust) not in ('walkin', 'walk-in', 'guest', 'none', 'null', 'cu-walkin') then
    if exists (select 1 from customers where id = v_raw_cust and business_id = v_shop) then
      v_customer_id := v_raw_cust;
    else
      raise exception 'customer is not in this shop';
    end if;
  end if;

  if exists (
    select 1
    from jsonb_array_elements(coalesce(payload->'items', '[]'::jsonb)) l
    where coalesce(nullif(l->>'product_id', ''), nullif(l->>'id', '')) is not null
      and not exists (
        select 1 from products p
        where p.id = coalesce(nullif(l->>'product_id', ''), nullif(l->>'id', ''))
          and p.business_id = v_shop
      )
  ) then
    raise exception 'product is not in this shop';
  end if;

  v_pay_type := coalesce(payload->>'pay_type', 'cash');
  v_paid     := coalesce((payload->>'paid_amount')::numeric, (payload->>'paid')::numeric, 0);

  for v_line in select * from jsonb_array_elements(coalesce(payload->'items', '[]'::jsonb))
  loop
    v_item_qty   := coalesce((v_line->>'qty')::numeric, 1);
    v_item_price := coalesce(
      (v_line->>'unit_price')::numeric,
      (v_line->>'price')::numeric,
      (v_line->>'sale_price')::numeric,
      0
    );
    v_subtotal := v_subtotal + (v_item_qty * v_item_price);
    v_line_count := v_line_count + 1;
  end loop;

  v_total := greatest(0, v_subtotal - v_discount);
  v_due   := greatest(0, v_total - v_paid);
  v_remaining_paid := v_paid;

  insert into invoices (
    id, invoice_no, customer_id, business_id, subtotal, discount, total,
    paid_amount, due_amount, pay_type, note, date
  ) values (
    'inv-' || to_char(now(),'YYMMDDHH24MISSMS') || '-' || substr(md5(random()::text),1,6),
    coalesce(nullif(payload->>'invoice_no',''), 'INV-' || to_char(now(),'YYMMDDHH24MISS')),
    v_customer_id,
    v_business_id,
    v_subtotal, v_discount, v_total, v_paid, v_due, v_pay_type,
    payload->>'note', v_date
  )
  returning * into v_invoice;

  insert into sale_items (
    id, invoice_id, product_id, product_name, qty, unit_price, unit, amount,
    serial_number, warranty_note
  )
  select
    'si-' || substr(md5(random()::text),1,12),
    v_invoice.id,
    nullif(l->>'product_id',''),
    coalesce(l->>'name', l->>'product_name', 'Item'),
    coalesce((l->>'qty')::numeric, 1),
    coalesce((l->>'unit_price')::numeric, (l->>'price')::numeric, (l->>'sale_price')::numeric, 0),
    coalesce(nullif(l->>'unit',''), 'pcs'),
    round(
      coalesce((l->>'qty')::numeric, 1)
      * coalesce((l->>'unit_price')::numeric, (l->>'price')::numeric, (l->>'sale_price')::numeric, 0),
      2
    ),
    nullif(l->>'serialNumber',''),
    nullif(l->>'warrantyNote','')
  from jsonb_array_elements(coalesce(payload->'items', '[]'::jsonb)) l;

  update products p
     set stock = greatest(0, p.stock - coalesce((l->>'qty')::numeric, 1))
  from jsonb_array_elements(coalesce(payload->'items', '[]'::jsonb)) l
  where p.id = coalesce(nullif(l->>'product_id',''), nullif(l->>'id',''))
    and p.business_id = v_shop;

  if v_customer_id is not null and v_due > 0 then
    update customers
       set balance = coalesce(balance, 0) + v_due
     where id = v_customer_id
       and business_id = v_shop;
  end if;

  -- Allocate v_paid across lines so sum(transactions.paid_amount) equals the invoice paid amount.
  for v_line in select * from jsonb_array_elements(coalesce(payload->'items', '[]'::jsonb))
  loop
    v_line_index := v_line_index + 1;
    v_item_qty   := coalesce((v_line->>'qty')::numeric, 1);
    v_item_price := coalesce(
      (v_line->>'unit_price')::numeric,
      (v_line->>'price')::numeric,
      (v_line->>'sale_price')::numeric,
      0
    );
    v_line_amount := round(v_item_qty * v_item_price, 2);
    if v_line_index = v_line_count then
      v_line_paid := v_remaining_paid;
    elsif v_subtotal = 0 then
      v_line_paid := 0;
    else
      v_line_paid := round(v_paid * (v_item_qty * v_item_price) / v_subtotal, 2);
      v_remaining_paid := v_remaining_paid - v_line_paid;
    end if;

    insert into transactions (
      id, type, customer_id, product_id, product_name,
      qty, unit_price, amount, discount, paid_amount,
      pay_type, note, business_id, date
    ) values (
      't-' || substr(md5(random()::text),1,12),
      'sale',
      v_invoice.customer_id,
      nullif(v_line->>'product_id',''),
      coalesce(v_line->>'name', v_line->>'product_name'),
      v_item_qty,
      v_item_price,
      v_line_amount,
      0,
      v_line_paid,
      v_pay_type,
      v_invoice.note,
      v_business_id,
      v_invoice.date
    );
  end loop;

  return v_invoice;
end;
$$;

-- record_payment: Records Baki repayment, updates customer ledger & flat log
create or replace function record_payment(payload jsonb)
returns payments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row         payments;
  v_customer_id text := payload->>'customer_id';
  v_business_id text := nullif(payload->>'business_id', '');
  v_shop        text := public.shop_phone();
begin
  if v_shop is null then
    raise exception 'shop phone required';
  end if;
  if v_business_id is null then
    v_business_id := v_shop;
  elsif v_business_id <> v_shop then
    raise exception 'payment shop does not match the signed-in shop';
  end if;
  if not exists (
    select 1 from customers
    where id = v_customer_id and business_id = v_shop
  ) then
    raise exception 'customer is not in this shop';
  end if;

  insert into payments (id, customer_id, amount, note, business_id, date)
  values (
    'pay-' || to_char(now(),'YYMMDDHH24MISSMS') || '-' || substr(md5(random()::text),1,6),
    v_customer_id,
    (payload->>'amount')::numeric,
    coalesce(payload->>'note',''),
    v_business_id,
    coalesce((payload->>'date')::timestamptz, now())
  )
  returning * into v_row;

  insert into transactions (id, type, customer_id, amount, paid_amount, pay_type, note, business_id, date)
  values (
    't-' || substr(md5(random()::text),1,12),
    'payment', v_row.customer_id, v_row.amount, v_row.amount, 'cash',
    v_row.note, v_row.business_id, v_row.date
  );

  update customers
     set balance = greatest(0, coalesce(balance,0) - v_row.amount)
   where id = v_customer_id
     and business_id = v_shop;

  return v_row;
end;
$$;

-- ---------- 3. ROW LEVEL SECURITY (RLS) POLICIES --------------------

alter table businesses enable row level security;
alter table categories enable row level security;
alter table vendors enable row level security;
alter table customers enable row level security;
alter table products enable row level security;
alter table invoices enable row level security;
alter table sale_items enable row level security;
alter table transactions enable row level security;
alter table payments enable row level security;
alter table dokan_profile enable row level security;

-- Shop identity comes from the x-shop-phone header set by the web app.
-- The anon key has no user id, so a missing header sees nothing.
create or replace function public.shop_phone()
returns text
language sql
stable
set search_path = public
as $$
  select nullif(btrim(coalesce(
    current_setting('request.headers', true)::json->>'x-shop-phone',
    ''
  )), '');
$$;

drop policy if exists "Anon full access businesses" on businesses;
drop policy if exists "shop businesses" on businesses;
create policy "shop businesses" on businesses
  for all to anon, authenticated
  using (phone = public.shop_phone())
  with check (phone = public.shop_phone());

drop policy if exists "Anon full access dokan_profile" on dokan_profile;
drop policy if exists "shop dokan_profile" on dokan_profile;
create policy "shop dokan_profile" on dokan_profile
  for all to anon, authenticated
  using (session_phone = public.shop_phone())
  with check (session_phone = public.shop_phone());

drop policy if exists "Anon full access categories" on categories;
drop policy if exists "shop categories" on categories;
create policy "shop categories" on categories
  for all to anon, authenticated
  using (business_id = public.shop_phone())
  with check (business_id = public.shop_phone());

drop policy if exists "Anon full access vendors" on vendors;
drop policy if exists "shop vendors" on vendors;
create policy "shop vendors" on vendors
  for all to anon, authenticated
  using (business_id = public.shop_phone())
  with check (business_id = public.shop_phone());

drop policy if exists "Anon full access customers" on customers;
drop policy if exists "shop customers" on customers;
create policy "shop customers" on customers
  for all to anon, authenticated
  using (business_id = public.shop_phone())
  with check (business_id = public.shop_phone());

drop policy if exists "Anon full access products" on products;
drop policy if exists "shop products" on products;
create policy "shop products" on products
  for all to anon, authenticated
  using (business_id = public.shop_phone())
  with check (business_id = public.shop_phone());

drop policy if exists "Anon full access invoices" on invoices;
drop policy if exists "shop invoices" on invoices;
create policy "shop invoices" on invoices
  for all to anon, authenticated
  using (business_id = public.shop_phone())
  with check (business_id = public.shop_phone());

drop policy if exists "Anon full access sale_items" on sale_items;
drop policy if exists "shop sale_items" on sale_items;
create policy "shop sale_items" on sale_items
  for all to anon, authenticated
  using (
    public.shop_phone() is not null
    and exists (
      select 1 from invoices i
      where i.id = sale_items.invoice_id
        and i.business_id = public.shop_phone()
    )
  )
  with check (
    public.shop_phone() is not null
    and exists (
      select 1 from invoices i
      where i.id = sale_items.invoice_id
        and i.business_id = public.shop_phone()
    )
  );

drop policy if exists "Anon full access transactions" on transactions;
drop policy if exists "shop transactions" on transactions;
create policy "shop transactions" on transactions
  for all to anon, authenticated
  using (business_id = public.shop_phone())
  with check (business_id = public.shop_phone());

drop policy if exists "Anon full access payments" on payments;
drop policy if exists "shop payments" on payments;
create policy "shop payments" on payments
  for all to anon, authenticated
  using (business_id = public.shop_phone())
  with check (business_id = public.shop_phone());

-- Direct inserts from the app omit business_id. Stamp it from the shop header.
create or replace function public.stamp_shop_business()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_shop text := public.shop_phone();
begin
  -- Migrations and the SQL editor have no request headers. App traffic does.
  if current_setting('request.headers', true) is null then
    return new;
  end if;
  if v_shop is null then
    raise exception 'shop phone required';
  end if;
  if new.business_id is null then
    new.business_id := v_shop;
  elsif new.business_id <> v_shop then
    raise exception 'business_id must match the signed-in shop';
  end if;
  return new;
end;
$$;

drop trigger if exists products_stamp_shop on products;
create trigger products_stamp_shop before insert or update on products
  for each row execute function public.stamp_shop_business();

drop trigger if exists customers_stamp_shop on customers;
create trigger customers_stamp_shop before insert or update on customers
  for each row execute function public.stamp_shop_business();

drop trigger if exists vendors_stamp_shop on vendors;
create trigger vendors_stamp_shop before insert or update on vendors
  for each row execute function public.stamp_shop_business();

drop trigger if exists categories_stamp_shop on categories;
create trigger categories_stamp_shop before insert or update on categories
  for each row execute function public.stamp_shop_business();

-- Admin reads bypass shop RLS. The header matches the demo admin email
-- the same way shop RLS trusts x-shop-phone.
create or replace function public.admin_email()
returns text
language sql
stable
set search_path = public
as $$
  select nullif(lower(btrim(coalesce(
    current_setting('request.headers', true)::json->>'x-admin-email',
    ''
  ))), '');
$$;

create or replace function public.assert_admin()
returns void
language plpgsql
stable
set search_path = public
as $$
begin
  if public.admin_email() is distinct from 'admin@dokanbhai.com' then
    raise exception 'admin only';
  end if;
end;
$$;

create or replace function public.admin_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  perform public.assert_admin();
  select jsonb_build_object(
    'shops', (select count(*) from businesses),
    'products', (select count(*) from products where business_id is not null),
    'customers', (select count(*) from customers where business_id is not null),
    'invoices', (select count(*) from invoices),
    'sales_total', (select coalesce(sum(total), 0) from invoices),
    'sales_today', (select coalesce(sum(total), 0) from invoices where date >= date_trunc('day', now())),
    'sales_month', (select coalesce(sum(total), 0) from invoices where date >= date_trunc('month', now())),
    'low_stock', (select count(*) from products where business_id is not null and stock <= min_stock),
    'by_type', coalesce((
      select jsonb_agg(jsonb_build_object(
        'type', s.business_type,
        'shops', s.shops,
        'sales', s.sales
      ))
      from (
        select b.business_type,
               count(distinct b.id) as shops,
               coalesce(sum(i.total), 0) as sales
        from businesses b
        left join invoices i on i.business_id = b.id
        group by b.business_type
      ) s
    ), '[]'::jsonb),
    'recent', coalesce((
      select jsonb_agg(to_jsonb(r) order by r.date desc)
      from (
        select i.invoice_no, i.total, i.pay_type, i.date, b.name as shop
        from invoices i
        left join businesses b on b.id = i.business_id
        order by i.date desc
        limit 8
      ) r
    ), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;

create or replace function public.admin_shops()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_admin();
  return coalesce((
    select jsonb_agg(to_jsonb(s) order by s.created_at desc)
    from (
      select b.id,
             b.name,
             coalesce(d.owner_name, b.owner_user_id) as owner,
             b.phone,
             b.business_type as type,
             coalesce(b.address, d.region) as address,
             b.created_at
      from businesses b
      left join dokan_profile d on d.session_phone = b.phone
    ) s
  ), '[]'::jsonb);
end;
$$;

create or replace function public.admin_products()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_admin();
  return coalesce((
    select jsonb_agg(to_jsonb(s) order by s.shop, s.name)
    from (
      select p.id,
             p.name,
             coalesce(b.name, p.business_id) as shop,
             coalesce(c.name, '') as category,
             p.stock,
             p.sale_price as price,
             p.business_id
      from products p
      left join businesses b on b.id = p.business_id
      left join categories c on c.id = p.category_id
      where p.business_id is not null
    ) s
  ), '[]'::jsonb);
end;
$$;

grant execute on function public.admin_overview() to anon, authenticated;
grant execute on function public.admin_shops() to anon, authenticated;
grant execute on function public.admin_products() to anon, authenticated;

-- ---------- 4. NO GLOBAL SEED ---------------------------------------
-- New shops start empty. Shared grocery rows (business_id null) are removed
-- so one shop cannot see or sell another shop's stock. Invoice lines keep
-- product_name after the product link is cleared.

update sale_items si
   set product_id = null
  from products p
 where si.product_id = p.id
   and p.business_id is null;

update transactions t
   set product_id = null
  from products p
 where t.product_id = p.id
   and p.business_id is null;

delete from products where business_id is null;

delete from vendors v
 where v.business_id is null
   and not exists (select 1 from products p where p.vendor_id = v.id);

delete from categories c
 where c.business_id is null
   and not exists (select 1 from products p where p.category_id = c.id);

update customers c
   set business_id = sub.business_id
  from (
    select customer_id, min(business_id) as business_id
    from invoices
    where customer_id is not null
      and business_id is not null
    group by customer_id
    having count(distinct business_id) = 1
  ) sub
 where c.id = sub.customer_id
   and c.business_id is null;

delete from customers c
 where c.business_id is null
   and not exists (select 1 from invoices i where i.customer_id = c.id)
   and not exists (select 1 from payments p where p.customer_id = c.id)
   and not exists (select 1 from transactions t where t.customer_id = c.id);