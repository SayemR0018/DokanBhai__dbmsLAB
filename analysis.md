# DokanBhai (দোকান ভাই) — System Architecture & DBMS Analysis

> **Author:** DokanBhai Engineering Team
> **Subject:** System Architecture, Relational Database Design, Normalization, and Analytical SQL for the DokanBhai Digital Mudi Dokan management web application.
> **Stack:** React 18 · Vite 5 · Tailwind CSS 3 · React Router 6 · `@supabase/supabase-js` (PostgreSQL) · `localStorage` offline fallback.
> **Codebase analyzed:** `DokanVy_webapp/` (paths prefixed `src/…` below).

---

## 1. Executive Overview

**DokanBhai** (দোকান ভাই — *"Shop Brother"*) is a Digital Shop Management & Point-of-Sale (POS) web application engineered specifically for **Bangladeshi Mudi Dokan** (neighborhood grocery, electronics and hardware stores). It replaces the paper *khata* that a dokan malik traditionally keeps on the counter with a real-time, mobile-first, bilingual (Bangla + English) web app.

The platform covers the full shopkeeper *hisab* workflow:

- Cash sales (নগদ / *Nogod*), credit sales (বাকি / *Baki*), and online payments
- Multi-unit inventory (pcs, kg, litre, bag, feet, cft, ton, gaj, box, pack, dozen, bundle)
- Per-product serial-number and warranty tracking for electronics
- Vendor / supplier ledgers
- Customer credit ledger (বাকি খাতা / *Baki Khata*) with one-tap WhatsApp / SMS reminders
- Thermal-receipt printing in 58 mm / 80 mm formats with BDT (৳) currency
- Dashboard analytics: 30-day totals, 7-day trend, low-stock alerts, customer-wise Baki totals

### 1.1 System Scope

| Layer           | Responsibility                                                                                |
|-----------------|-----------------------------------------------------------------------------------------------|
| **Presentation**| React 18 SPA, Tailwind CSS UI, mobile-first responsive design (`AppShell` sidebar + drawer)   |
| **State**       | `AuthContext` (session) + `ProfileContext` (dokan_profile) + per-page local state             |
| **Data**        | Unified `data` adapter (Supabase → `localStorage`) defined in `src/lib/data.js`               |
| **Persistence** | Supabase (PostgreSQL) when `VITE_SUPABASE_ANON_KEY` is set; otherwise in-browser `localStorage`|
| **Domain**      | Bangladeshi FMCG inventory, BDT currency, bilingual EN/BN labels, vertical-aware catalog       |

---

## 2. Tech Stack & System Architecture

### 2.1 Frontend Stack

| Concern         | Technology                                  | Rationale                                                                  |
|-----------------|---------------------------------------------|----------------------------------------------------------------------------|
| UI Framework    | **React 18** (`react`, `react-dom`)         | Component model, hooks, virtual DOM                                        |
| Build Tool      | **Vite 5** (`@vitejs/plugin-react`)         | Fast HMR, ESM-native, modern bundling                                      |
| Routing         | **React Router 6** (`react-router-dom`)     | SPA navigation with `<Protected>` route guard                              |
| Styling         | **Tailwind CSS 3** + PostCSS + Autoprefixer | Utility-first, JIT, custom `brand` (green) + `steel` palettes              |
| Icons           | Inline SVG components (`src/components/icons.jsx`) | Zero-runtime icon dependency                                        |
| State           | React Context + custom hooks                | Two top-level providers (`AuthProvider`, `ProfileProvider`)                |

### 2.2 Backend / Data Layer

- **Primary backend:** Supabase project `rumwkbuhxtbicbpzzsst` (`https://rumwkbuhxtbicbpzzsst.supabase.co`), Postgres 17, reached with `@supabase/supabase-js`. The anon key is `VITE_SUPABASE_ANON_KEY`. The client sends `x-shop-phone` on every request.
- **Offline ledger:** used only when those env vars are missing. The key is `dokanbhai-local-db_<phone>` and a new shop's copy is empty. A configured Supabase client does not swallow errors into `localStorage`.
- **Tour ledger:** `dokanbhai-demo-tour`, never uploaded.
- **Adapter (`src/lib/data.js`):** `list / get / insert / update / remove / createSale / recordPayment`. Sales call `rpc('create_sale', { payload })`. Inserts generate a text id and stamp `business_id`.
- **Profile:** `dokan_profile_<phone>` on the device, mirrored to the `dokan_profile` table.

### 2.3 Component / Module Map

```
src/
├── main.jsx                          # Bootstraps BrowserRouter + Providers
├── App.jsx                           # Routes, Protected gate, OnboardingModal
├── styles.css                        # Tailwind layers + custom CSS
├── context/
│   ├── AuthContext.jsx               # Supabase auth + phone-first login
│   └── ProfileContext.jsx            # Dokan profile (store, owner, region, businessType)
├── lib/
│   ├── supabaseClient.js             # createClient(), isSupabaseConfigured flag
│   ├── localDb.js                    # CRUD + createSale + recordPayment (offline)
│   ├── data.js                       # Unified Supabase↔local adapter
│   ├── hardwareDemo.js               # Local hardware tour, not written to Supabase
│   ├── adminApi.js                   # admin_overview / admin_shops / admin_products
│   ├── dokanProfile.js               # Per-phone dokan_profile localStorage
│   ├── units.js                      # Unit catalog + fractional qty helpers
│   ├── format.js                     # BDT/৳, dates, initials, avatar colors
│   ├── reminders.js                  # WhatsApp/SMS deep-link builder for Baki
│   └── verticals.js                  # Business-type labels (not auto-seeded)
├── components/
│   ├── AppShell.jsx                  # Sidebar nav + header + SettingsModal
│   ├── SiteHeader.jsx, Logo.jsx
│   ├── AdminProtected.jsx
│   ├── OnboardingModal.jsx           # Shared persistToSupabase helper
│   ├── PhoneGateScreen.jsx           # Phone-first sign-in screen
│   ├── ReminderSheet.jsx             # Baki reminder WhatsApp/SMS drawer
│   ├── BusinessTypeChips.jsx
│   └── UnitSelect.jsx, icons.jsx, ui.jsx
└── pages/
    ├── LandingPage.jsx               # Home, tour button, shop animation
    ├── RegisterPage.jsx
    ├── DashboardScreen.jsx
    ├── NewSaleScreen.jsx
    ├── InventoryScreen.jsx
    ├── SalesScreen.jsx
    ├── CustomersScreen.jsx
    ├── HisabScreen.jsx
    ├── VendorsScreen.jsx
    ├── CategoriesScreen.jsx
    └── admin/                        # Login, dashboard, shops, products, reports
```

### 2.4 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       Browser (React SPA)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │AuthContext   │  │ProfileContext│  │  AppShell + 8 Pages    │ │
│  │ (Session)    │  │ (dokan prof.)│  │  (Dashboard,POS,Sales, │ │
│  └──────────────┘  └──────────────┘  │   Inventory,Customers, │ │
│                                      │   Hisab,Vendors,Cats)  │ │
│                                      └────────────────────────┘ │
│                          │  data.list / insert / update / …    │
│                          ▼                                      │
│              ┌──────────────────────────┐                       │
│              │   data adapter (façade)  │  src/lib/data.js      │
│              └──────────────────────────┘                       │
│                │                       │                        │
│   (Supabase configured)          (no Supabase env, or the tour)     │
│                ▼                       ▼                        │
│      ┌──────────────────┐    ┌──────────────────────────┐         │
│      │ Supabase JS SDK  │    │ localDb (localStorage    │         │
│      │  → PostgreSQL    │    │  + 'dokanbhai:dbchange'  │         │
│      │  + RPC create_   │    │  window event bus)       │         │
│      │  sale / record_  │    │                          │         │
│      │  payment         │    │                          │         │
│      └──────────────────┘    └──────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Routing

| Path               | Component            | Guard                          |
|--------------------|----------------------|--------------------------------|
| `/`                | `LandingPage`        | none                           |
| `/register`        | `RegisterPage`       | none                           |
| `/login`           | `PhoneGateScreen`    | redirects if already signed in |
| `/admin/login`     | `AdminLogin`         | none                           |
| `/dashboard`       | `DashboardScreen`    | Protected (tour allowed)       |
| `/pos`             | `NewSaleScreen`      | Protected                      |
| `/inventory`       | `InventoryScreen`    | Protected                      |
| `/sales`           | `SalesScreen`        | Protected                      |
| `/customers`       | `CustomersScreen`    | Protected                      |
| `/hisab`           | `HisabScreen`        | Protected                      |
| `/vendors`         | `VendorsScreen`      | Protected                      |
| `/categories`      | `CategoriesScreen`   | Protected                      |
| `/admin/dashboard` | `AdminDashboard`     | AdminProtected                 |
| `/admin/shops`     | `AdminShops`         | AdminProtected                 |
| `/admin/products`  | `AdminProducts`      | AdminProtected                 |
| `/admin/reports`   | `AdminReports`       | AdminProtected                 |
| `*`                | redirect to `/`      | —                              |

`Protected` reads `useAuth()` and redirects to `/login` while `loading === true` it shows a spinner, otherwise renders `<AppShell>` with the page.

### 2.6 State Management

- **Auth state** (`AuthContext`): `{ user, loading, login, adminLogin, signOut, isSupabaseConfigured, backendsMode }`. Shop login checks `/^01[3-9]\d{8}$/` against `businesses` or `dokan_profile`. Admin login is a separate session. A reload on `/admin/*` keeps the admin session even if a shop session is also stored.
- **Profile state** (`ProfileContext`): store name, owner, region, business type, receipt width. Settings save writes those fields back to `businesses` and `dokan_profile`.
- **Tenant bus:** `dokanbhai:tenantchange` reloads shop pages when the phone changes. `dokanbhai:dbchange` reloads after a local mutation. Supabase screens also reload on that event when it is emitted.

---

## 3. Relational PostgreSQL Schema (DDL)

The executable schema, functions, and policies are `DokanBhai.sql`. That file is already applied on project `rumwkbuhxtbicbpzzsst`. The notes below describe the live shape. Do not treat an older inline script in this document as something to paste.

### 3.1 What isolates one shop

| Piece | Rule |
|-------|------|
| Shop identity | `businesses.phone` and `dokan_profile.session_phone` are unique. The app sends that phone as `x-shop-phone`. |
| `shop_phone()` | Reads that header. A missing header matches no rows. |
| `business_id` | On products, customers, vendors, categories, invoices, transactions, and payments. RLS is `business_id = shop_phone()`. |
| Categories | Unique on `(business_id, name)`, not on name alone. |
| New row ids | Text ids. The app sends one. The table default covers an older client that omits it. `stamp_shop_business()` fills `business_id` from the header. |
| `create_sale` / `record_payment` | `security definer`, `search_path = public`. They accept only products and customers whose `business_id` is the signed-in shop. Walk-in cash keeps `customer_id` null. |
| Admin | `admin_overview`, `admin_shops`, and `admin_products` run only when `x-admin-email` is the demo admin address. |
| Empty start | Registration inserts the shop profile only. Shared grocery seed rows are not part of the script. |

Invoice lines keep `product_name`, so a later product delete does not erase the receipt text.

### 3.2 Column sketch

The full `CREATE TABLE`, trigger, RLS, and function script is `DokanBhai.sql`. This document does not repeat it. The live tables are `businesses`, `dokan_profile`, `categories`, `vendors`, `customers`, `products`, `invoices`, `sale_items`, `transactions`, and `payments`. Shop-owned tables carry `business_id`. Money is `numeric(12,2)`. Stock and quantity are `numeric(12,3)`. Units are the 12 keys from `src/lib/units.js`.

### 3.3 Schema notes

- **Two-level sales model:** `invoices` + `sale_items` are the receipt. `transactions` is the flat ledger the dashboard sums. `create_sale` writes both, scoped to the shop.
- **`unit` constraint:** enforces the catalog from `src/lib/units.js` (`pcs/kg/litre/bag/feet/cft/ton/gaj/box/pack/dozen/bundle`).
- **`stock` / `qty` precision:** `numeric(12,3)` matches fractional sales (e.g., `0.5 kg`, `2.5 cft`, `12.5 cft`) emitted by `roundQty()`.
- **Serial / warranty:** `products.serial_tracked` + `products.warranty_months` are template flags; per-line capture lives in `sale_items.serial_number` and `sale_items.warranty_note`.

---

## 4. Normalization (1NF → 3NF)

### 4.1 First Normal Form (1NF)

> Every column holds an atomic value; no repeating groups; every row is unique.

- All attributes are scalar (`name`, `phone`, `balance numeric(12,2)`, etc.).
- The product catalog no longer stores multiple units per row — the unit is a single FK-style column with a controlled vocabulary (12 keys), enforced by `check (unit in (...))`.
- Per-line serial/warranty is split out into `sale_items.serial_number` and `sale_items.warranty_note` (one value per cell).

### 4.2 Second Normal Form (2NF)

> 1NF + every non-key attribute depends on the whole primary key.

- `sale_items.invoice_id` is a proper FK; `product_name`, `unit`, `serial_number`, `warranty_note` describe the *line*, not the invoice header — they depend on `sale_items.id`, not on `invoices.id`.
- `products.category_id` and `products.vendor_id` are surrogate-keyed FKs, so `name` (product name) is the only product attribute that depends on `products.id`.
- `invoices.subtotal`, `total`, `due_amount` are *derived* from `sale_items.amount`; we accept the controlled redundancy for hot-path reads (dashboard, receipt render) and compute them transactionally inside `create_sale`.

### 4.3 Third Normal Form (3NF)

> 2NF + no transitive dependencies on non-key attributes.

- Category info (`name`, `color`) is held only in `categories` and referenced via `products.category_id` — never duplicated in `products`.
- Vendor contact info is held only in `vendors` — `products.vendor_id` is the only attribute depending on it.
- `customers.balance` is the running total of Baki for that customer. It can be derived from `invoices.due_amount − payments.amount`, but it is denormalized for fast "Baki Khata" reads. The `create_sale` and `record_payment` RPCs update it transactionally, so the redundancy is consistent.
- Business/region metadata for receipts lives in `businesses` (and `dokan_profile` for per-device store config), not on `invoices`.

### 4.4 Functional Dependency Summary

```
businesses.id        → name, business_type, owner_user_id, invite_code, address, phone
categories.id        → name, color
vendors.id           → name, phone, address, note
customers.id         → name, phone, address, note, balance
products.id          → name, category_id, vendor_id, cost_price, sale_price,
                       stock, min_stock, unit, serial_tracked, warranty_months, note
sale_items.id        → invoice_id, product_id, product_name, qty, unit_price,
                       unit, amount, serial_number, warranty_note
invoices.id          → invoice_no, customer_id, business_id, subtotal, discount,
                       total, paid_amount, due_amount, pay_type, note, date
transactions.id      → type, customer_id, product_id, product_name, qty, unit_price,
                       amount, discount, paid_amount, pay_type, note, date
payments.id          → customer_id, amount, note, date
dokan_profile.id     → schema_version, store_name, owner_name, region, business_type,
                       business_label, currency, receipt_width, locale, session_phone
```

No non-key attribute determines another non-key attribute → 3NF holds.

---

## 5. Key Analytical SQL Queries

The following queries are written against the PostgreSQL schema in §3 and reproduce the analytics computed client-side by `DashboardScreen.jsx` and `HisabScreen.jsx`.

### 5.1 Low-Stock Warning

```sql
-- 5.1.a   All products currently below (or at) their minimum stock.
--         Used by the dashboard's red "স্টক কম" badge and the low-stock filter.
select
  p.id,
  p.name,
  p.unit,
  p.stock,
  p.min_stock,
  (p.min_stock - p.stock)                 as shortage,
  c.name                                  as category,
  v.name                                  as vendor
from   products p
left join categories c on c.id = p.category_id
left join vendors    v on v.id = p.vendor_id
where  p.stock <= p.min_stock
order  by shortage desc, p.name;
```

```sql
-- 5.1.b   Only low-stock items in a specific category (e.g. "চাল ও আটা").
select p.name, p.stock, p.min_stock, p.unit
from   products p
join   categories c on c.id = p.category_id
where  c.name = 'চাল ও আটা / Rice & Flour'
  and  p.stock <= p.min_stock
order  by p.stock asc;
```

### 5.2 Daily Revenue & Profit Summary

```sql
-- 5.2.a   Per-day revenue and gross profit for the last 30 days.
--         Profit = sum(line.qty * (sale_price - cost_price)) over sale items
--         joined to invoices for the date.
select
  date_trunc('day', i.date)::date          as day,
  count(distinct i.id)                      as invoices,
  sum(i.total)                              as revenue,
  sum(i.paid_amount)                        as cash_received,
  sum(i.due_amount)                         as credit_extended,
  sum(si.qty * (p.sale_price - p.cost_price)) as gross_profit
from   invoices i
join   sale_items si on si.invoice_id = i.id
left join products p on p.id = si.product_id
where  i.date >= now() - interval '30 days'
group  by 1
order  by 1 desc;
```

```sql
-- 5.2.b   Pay-type split for today.
select
  i.pay_type,
  count(*)              as invoices,
  sum(i.total)          as total,
  sum(i.paid_amount)    as paid,
  sum(i.due_amount)     as due
from   invoices i
where  i.date >= date_trunc('day', now())
group  by i.pay_type;
```

```sql
-- 5.2.c   7-day sales trend (matches the dashboard bar chart).
select
  to_char(date_trunc('day', i.date), 'Dy') as weekday,
  sum(i.total)                              as total
from   invoices i
where  i.date >= now() - interval '7 days'
group  by 1, date_trunc('day', i.date)
order  by date_trunc('day', i.date);
```

### 5.3 Customer Baki Totals (Baki Khata Ledger)

```sql
-- 5.3.a   Per-customer Baki outstanding — used by the Hisab page list.
--         Pulls the canonical balance plus a recomputed total for
--         audit / reconciliation.
select
  c.id,
  c.name,
  c.phone,
  c.balance                                    as stored_balance,
  coalesce((
    select sum(i.due_amount)
    from   invoices i
    where  i.customer_id = c.id
  ), 0) - coalesce((
    select sum(p.amount)
    from   payments p
    where  p.customer_id = c.id
  ), 0)                                         as computed_balance,
  coalesce((
    select max(i.date)
    from   invoices i
    where  i.customer_id = c.id
  ), c.created_at)                             as last_sale_date
from   customers c
where  c.balance > 0
order  by c.balance desc;
```

```sql
-- 5.3.b   Full per-customer Hisab ledger (sales + payments interleaved).
--         Drives the CustomerDetail / Hisab drawer.
select *
from (
  select
    i.id, i.date, 'sale'::text    as kind,
    i.pay_type,
    i.total                       as amount,
    i.paid_amount                 as paid,
    i.due_amount                  as due,
    null::text                    as note,
    i.invoice_no                  as ref
  from   invoices i
  where  i.customer_id = $1

  union all

  select
    p.id, p.date, 'payment'::text as kind,
    'cash'                        as pay_type,
    p.amount                      as amount,
    p.amount                      as paid,
    0                             as due,
    p.note                        as note,
    'PAY-' || right(p.id, 6)      as ref
  from   payments p
  where  p.customer_id = $1
) x
order by date desc;
```

```sql
-- 5.3.c   Customers whose last sale is older than 30 days and who still owe.
--         Surfaces candidates for WhatsApp / SMS reminders.
select
  c.id,
  c.name,
  c.phone,
  c.balance,
  max(i.date) as last_sale_at
from   customers c
join   invoices i on i.customer_id = c.id
where  c.balance > 0
group  by c.id
having max(i.date) < now() - interval '30 days'
order  by c.balance desc;
```

### 5.4 `create_sale` and `record_payment`

`data.createSale` calls `supabase.rpc('create_sale', { payload })`. The deployed function, in `DokanBhai.sql`, requires `shop_phone()`, rejects another shop's product or customer, writes the invoice and line items, lowers stock, and posts one transaction per line. `record_payment` does the same check before reducing `customers.balance`. Walk-in cash stores `customer_id` as null. If Supabase is not configured, `localDb` performs the same steps on this device. A failed RPC is shown on the form.

---

## 6. Data Flow Walkthrough — "New Sale"

1. The cashier opens `/pos` → `NewSaleScreen` loads products, customers and categories via `data.list(...)`.
2. Items are added to the cart with stock validation (`updateQty` clamps to `i.stock`) and step sizes derived from the unit catalog (`stepFor`, `decimalsFor` in `src/lib/units.js`).
3. For `serialTracked` products, the cashier captures a per-line `serialNumber`; for warranty items, a `warrantyNote`. Both are passed into `data.createSale(...)`.
4. The user chooses a `pay_type` (`cash` / `credit` / `online`) and a `paid_amount` — `due = total - paid` is rendered live.
5. On submit, `data.createSale` calls `rpc('create_sale', { payload })` with this shop's `business_id`. The database checks the shop header, writes the invoice, lines, stock change, and transactions. It does not fall back to `localStorage` when Supabase is configured. `localDb.createSale` runs only without Supabase, or inside the hardware tour.
6. The receipt renders at 58 mm or 80 mm and prints with `window.print()`. Cash and online may name a `demoN` customer. বাকি requires a saved customer.

---

## 7. Offline and tour data

- **No Supabase env:** `localDb` uses `dokanbhai-local-db_<phone>`. A new phone starts with empty categories, products, customers, and sales.
- **Supabase configured:** that path is not a silent backup. Errors stay on the screen.
- **Tour:** `enterDemo()` writes `dokanbhai-demo-tour` and sets `sessionStorage` `dokanbhai-demo`. Customer phone numbers in that file are contact numbers, not the shop key, so the tour list does not filter them out. `exitDemo()` deletes the copy.
- **Other tabs:** the `storage` listener reloads the active phone's key.
- **Reset:** Settings can wipe the device profile. Saving settings also updates `businesses` and `dokan_profile` in Postgres.

---

## 8. Security and access

- **Shop login:** a BD mobile that exists on `businesses.phone` or `dokan_profile.session_phone`. No shop password.
- **RLS:** `shop_phone()` reads `x-shop-phone`. Products, customers, vendors, categories, invoices, transactions, and payments require `business_id = shop_phone()`. There is no "unowned row is visible to every shop" exception.
- **Sales:** `create_sale` and `record_payment` are security definer and still check the same shop before changing stock or balance.
- **Admin:** a separate client session. The overview functions require `x-admin-email`. Reloading `/admin/*` does not drop that session in favor of a shop session.
- **Receipt width:** `#receipt-print` uses `data-width` so print CSS can crop to 58 mm or 80 mm.

---

## 9. Build and run

```bash
cd DokanVy_webapp
npm install
npm run dev
npm run build
npm run preview
```

Production: `https://dokanbhai.vercel.app/`. Database script: `DokanBhai.sql` on Supabase project `rumwkbuhxtbicbpzzsst`. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set for that project. Without them, the app uses the empty per-phone local ledger.

---

## 10. Summary

DokanBhai keeps one Postgres schema and one client adapter.

- Shop rows are keyed by the owner's phone (`business_id` / `x-shop-phone`), with RLS and sale functions that refuse another shop's stock.
- A new registration inserts the shop profile only.
- The hardware tour is a local dataset, not a database seed.
- Invoices and line items are the receipt; transactions are the dashboard ledger; `customers.balance` is updated inside the payment and sale functions.
- Admin counts are read from `admin_overview`, `admin_shops`, and `admin_products`.
- Currency, units, serials, warranties, and Baki reminders stay in the client. The canonical SQL is `DokanBhai.sql`.
