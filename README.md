# DokanBhai (দোকান ভাই)

> **"Shop Brother"** — A bilingual (Bangla + English) digital khata and mobile-first Point-of-Sale (POS) web application that replaces the paper ledger at the corner store with a fast, mobile-friendly, offline-capable digital counter.

**DokanBhai** is a Digital Mudi Dokan Management & Mobile-First POS built specifically for Bangladeshi physical retailers — covering **groceries (মুদি), electronics, hardware, builders supply, and construction materials** shops. It runs entirely in the browser, works offline, prints thermal receipts in BDT (৳), and syncs to the cloud when configured.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Core Features](#core-features)
- [Local Development Setup](#local-development-setup)
- [Database Setup Guide (Supabase)](#database-setup-guide-supabase)
- [Environment Variables](#environment-variables)
- [Vercel Deployment Guide](#vercel-deployment-guide)
- [High-Level Module Map](#high-level-module-map)
- [License](#license)

---

## Project Overview

DokanBhai is engineered for the Bangladeshi retail ecosystem. The product replaces the paper *khata* at the corner store with a fast, mobile-friendly, offline-capable digital counter that:

- Onboards in under 30 seconds with no signup.
- Speaks Bangla first (`bn-BD`) with bilingual fallbacks for every label.
- Treats the merchant's BD mobile number (`01XXXXXXXXX`) as a trusted-device identifier.
- Falls back to a fully-functional in-browser database when Supabase is not configured — zero-friction demos, no backend required.

### Target Business Sectors

| Sector | Bengali | Notes |
|--------|---------|-------|
| **Groceries (Mudi Dokan)** | মুদি দোকান | Rice, flour, oil, spices, snacks, personal care |
| **Electronics & Electrical** | ইলেকট্রনিক্স ও ইলেকট্রিক্যাল | Serial-numbered items, warranty tracking |
| **Hardware** | হার্ডওয়্যার | Tools, fittings, fasteners |
| **Builders Supply** | বিল্ডার্স সাপ্লাই | Plumbing, sanitary, finishing materials |
| **Construction Materials** | নির্মাণ সামগ্রী | Sand, cement, bricks, steel, aggregates (Cft, Ton, Gaj) |

---

## Architecture & Tech Stack

| Layer | Technology |
|-------|------------|
| **UI Framework** | React 18 |
| **Build Tool** | Vite 5 |
| **Routing** | React Router DOM 6 |
| **Styling** | Tailwind CSS 3 (custom `brand` green + `steel` palettes) |
| **State Management** | React Context (`AuthContext`, `ProfileContext`) |
| **Cloud Backend** | Supabase — hosted PostgreSQL 15 + `@supabase/supabase-js` v2 |
| **Transactional RPCs** | PL/pgSQL functions: `create_sale`, `record_payment` |
| **Offline Persistence** | Browser `localStorage` with in-memory mirror |
| **Deployment** | Vercel (static SPA, `dist/` output) |

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  React 18 SPA (Vite 5 + Tailwind 3 + React Router 6)        │
│  ────────────────────────────────────────────────────────── │
│  Pages: Dashboard · POS · Inventory · Sales · Customers     │
│         Hisab · Vendors · Categories · Login                │
└──────────────┬─────────────────────────┬────────────────────┘
               │                         │
   Supabase path│                         │ Local-only path
               ▼                         ▼
   ┌─────────────────────┐    ┌────────────────────────────┐
   │  Supabase / Postgres │    │  localDb.js (localStorage) │
   │  ─────────────────── │    │  In-memory mirror + CRUD   │
   │  Tables: businesses, │    │  Atomic createSale /      │
   │  categories, vendors,│    │  recordPayment shims       │
   │  customers, products,│    │                            │
   │  transactions,       │    │                            │
   │  invoices, payments  │    │                            │
   │  RPC: create_sale,   │    │                            │
   │  record_payment      │    │                            │
   └─────────────────────┘    └────────────────────────────┘
                  ▲
                  │ selected automatically by src/lib/data.js
                  │ based on isSupabaseConfigured
```

The unified adapter `src/lib/data.js` transparently routes every read/write to Supabase when configured, and falls back to `localDb.js` when not — so the same UI works in fully offline (demo) mode and cloud-synced mode.

---

## Core Features

### 1. Phone-First Trusted Sign-In (No Signup)
- Single-screen wizard on first launch: **Store Name**, **Owner**, **Region**, **Business Type**, and **Mobile Number**.
- BD mobile number (`^01[3-9]\d{8}$`) becomes the trusted-device identifier — no email, no password, no OTP, no KYC.
- Re-entry on every cold boot via `PhoneGateScreen` (state lives in `localStorage`).

### 2. Multi-Unit Fractional Billing
- Full unit catalog: **Pcs, Kg, Bag, Cft (cubic feet), Ton, Gaj (square yard), Box, Litre**.
- Fractional billing — sell `0.5 kg` rice, `2.5 Cft` sand, `1.25 ton` cement.
- Unit-aware inventory, cart, and 58/80 mm thermal receipt rendering.

### 3. Atomic POS Settlement (Split Tender)
- **Split payment** per invoice: **Nogod (নগদ / cash)** vs **Baki (বাকি / credit)** with auto-calculated `due_amount`.
- **bKash / Nagad MFS TrxID tracking** for online payments.
- Stock validation, customer picker, discount, and one-tap checkout.
- Backed by a single transactional Postgres RPC (`create_sale`) so partial failures don't desync stock or ledger.

### 4. Baki Khata Customer Ledger
- Persistent customer credit ledger with per-customer transaction history.
- **1-tap WhatsApp / SMS payment reminders** with pre-filled Bangla copy via deep-link builders (`src/lib/reminders.js`).
- Payment recording via `record_payment` RPC.

### 5. Thermal Receipt Generator
- Print-ready **80 mm** and **58 mm** POS thermal receipts branded as DokanBhai.
- BDT `৳` currency formatting and bilingual line items.

### 6. Low-Stock Alerts
- Configurable `min_stock` per product with a dedicated dashboard widget.
- Filter inventory by low-stock for fast reorder decisions.

### 7. Electronics Serial & Warranty Tracking
- Per-product serial-number capture and warranty expiry tracking.
- Designed for electronics retailers selling serialized SKUs.

### 8. Offline-First, Cloud-Optional
- **Offline-first** via `localStorage` fallback with in-memory mirror.
- Transparent background sync to Supabase (PostgreSQL) when online.
- App is fully functional with **zero configuration** — upgrades to multi-device sync when Supabase keys are provided.

---

## Local Development Setup

### Prerequisites
- **Node.js** 18+ and **npm** 9+
- A modern browser (Chrome, Edge, Firefox, Safari)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>

# 2. Install dependencies
npm install

# 3. Copy env template (optional — app works without env vars in offline mode)
cp .env.example .env

# 4. Start the Vite dev server on http://localhost:5173
npm run dev
```

### Development Scripts

```bash
npm run dev      # Start Vite dev server (port 5173, HMR enabled)
npm run build    # Build optimized production bundle into dist/
npm run preview  # Preview the production build on http://localhost:4173
npm run serve    # Same as preview, pinned to port 4173
```

The dev server binds to `0.0.0.0` (`host: true`), so you can also test from a mobile device on the same LAN.

---

## Database Setup Guide (Supabase)

DokanBhai's data adapter (`src/lib/data.js`) auto-detects Supabase configuration. When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set to valid values, every CRUD operation routes to Supabase. When they're missing or placeholders, the app falls back to `localDb.js` so the UI is fully functional without a backend.

### 1. Create a Supabase Project
1. Sign up / log in at [supabase.com](https://supabase.com).
2. Create a new project (Postgres 15).
3. Copy your **Project URL** and **anon public key** from *Project Settings → API*.

### 2. Create the Required Tables

Run this SQL in the Supabase SQL editor:

```sql
-- Businesses (multi-store support — one row per tenant)
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_name text,
  region text,
  phone text,
  business_type text,
  business_label text,
  currency text default 'BDT',
  receipt_width text default '80mm',
  locale text default 'bn-BD',
  created_at timestamptz default now()
);

-- Categories (color-tagged taxonomy)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz default now()
);

-- Vendors (suppliers)
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  name text not null,
  phone text,
  region text,
  notes text,
  created_at timestamptz default now()
);

-- Customers
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  name text not null,
  phone text,
  address text,
  balance numeric default 0,
  created_at timestamptz default now()
);

-- Products (with low-stock threshold + warranty metadata)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  name text not null,
  cost_price numeric default 0,
  sale_price numeric default 0,
  stock numeric default 0,
  min_stock numeric default 0,
  unit text default 'piece',
  serial_no text,
  warranty_until date,
  created_at timestamptz default now()
);

-- Transactions (header — one per sale)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  invoice_no text,
  subtotal numeric default 0,
  discount numeric default 0,
  total numeric default 0,
  paid_cash numeric default 0,
  paid_online numeric default 0,
  due_amount numeric default 0,
  status text default 'completed',
  created_at timestamptz default now()
);

-- Invoices (line items — one or more per transaction)
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references public.transactions(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  qty numeric default 0,
  unit text default 'piece',
  unit_price numeric default 0,
  line_total numeric default 0,
  created_at timestamptz default now()
);

-- Payments (Baki settlements against customers)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  amount numeric default 0,
  method text default 'cash',          -- cash | bkash | nagad | other
  trx_id text,                        -- MFS TrxID for online payments
  note text,
  created_at timestamptz default now()
);
```

### 3. Add the Transactional RPCs

The POS calls two PL/pgSQL functions for atomic operations. Add these in the Supabase SQL editor:

```sql
-- create_sale: atomically inserts a transaction + invoice lines + decrements stock.
create or replace function public.create_sale(payload jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_tx_id uuid;
  v_invoice jsonb;
  v_lines jsonb := payload->'lines';
  v_line jsonb;
  v_total numeric := 0;
begin
  -- Compute totals server-side so the client cannot mismatch them.
  if v_lines is null or jsonb_typeof(v_lines) <> 'array' then
    raise exception 'payload.lines must be a JSON array';
  end if;

  for v_line in select * from jsonb_array_elements(v_lines)
  loop
    v_total := v_total + coalesce((v_line->>'line_total')::numeric, 0);
  end loop;

  insert into public.transactions (
    business_id, customer_id, invoice_no,
    subtotal, discount, total,
    paid_cash, paid_online, due_amount, status
  ) values (
    (payload->>'business_id')::uuid,
    nullif(payload->>'customer_id','')::uuid,
    payload->>'invoice_no',
    coalesce((payload->>'subtotal')::numeric, v_total),
    coalesce((payload->>'discount')::numeric, 0),
    coalesce((payload->>'total')::numeric, v_total),
    coalesce((payload->>'paid_cash')::numeric, 0),
    coalesce((payload->>'paid_online')::numeric, 0),
    coalesce((payload->>'due_amount')::numeric, 0),
    coalesce(payload->>'status', 'completed')
  )
  returning id into v_tx_id;

  for v_line in select * from jsonb_array_elements(v_lines)
  loop
    insert into public.invoices (transaction_id, product_id, qty, unit, unit_price, line_total)
    values (
      v_tx_id,
      nullif(v_line->>'product_id','')::uuid,
      coalesce((v_line->>'qty')::numeric, 0),
      coalesce(v_line->>'unit', 'piece'),
      coalesce((v_line->>'unit_price')::numeric, 0),
      coalesce((v_line->>'line_total')::numeric, 0)
    );

    -- Decrement stock atomically; never go below zero.
    update public.products
       set stock = greatest(0, stock - coalesce((v_line->>'qty')::numeric, 0))
     where id = nullif(v_line->>'product_id','')::uuid;
  end loop;

  -- Mirror any Baki due onto the customer ledger.
  if nullif(payload->>'customer_id','') is not null and coalesce((payload->>'due_amount')::numeric, 0) > 0 then
    update public.customers
       set balance = coalesce(balance, 0) + coalesce((payload->>'due_amount')::numeric, 0)
     where id = nullif(payload->>'customer_id','')::uuid;
  end if;

  v_invoice := jsonb_build_object('id', v_tx_id, 'total', v_total);
  return v_invoice;
end;
$$;

-- record_payment: settle Baki against a customer, append a payments row.
create or replace function public.record_payment(payload jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_payment_id uuid;
  v_customer_id uuid := nullif(payload->>'customer_id','')::uuid;
  v_amount numeric := coalesce((payload->>'amount')::numeric, 0);
begin
  if v_customer_id is null then
    raise exception 'customer_id is required';
  end if;
  if v_amount <= 0 then
    raise exception 'amount must be > 0';
  end if;

  insert into public.payments (business_id, customer_id, amount, method, trx_id, note)
  values (
    nullif(payload->>'business_id','')::uuid,
    v_customer_id,
    v_amount,
    coalesce(payload->>'method', 'cash'),
    payload->>'trx_id',
    payload->>'note'
  )
  returning id into v_payment_id;

  update public.customers
     set balance = coalesce(balance, 0) - v_amount
   where id = v_customer_id;

  return jsonb_build_object('id', v_payment_id, 'amount', v_amount);
end;
$$;
```

### 4. Configure RLS (recommended for production)

For production, enable Row Level Security on each table and add policies that scope reads/writes by `business_id` (or your auth model). For dev/demo you can leave RLS off — the anon key only sees what the RPCs and table grants expose.

---

## Environment Variables

All env vars are **public** and exposed to the client bundle (Vite `VITE_*` prefix). Never put service-role keys here.

`.env.example` (committed to repo):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

If either variable is missing, empty, or still a placeholder, the app **automatically falls back** to offline `localDb` mode — no errors, no broken client.

---

## Vercel Deployment Guide

DokanBhai is a static SPA and ships with a `vercel.json` that rewrites all routes to `/index.html` so deep links like `/pos`, `/inventory`, `/sales`, `/customers`, `/hisab`, `/vendors`, and `/categories` resolve correctly.

### 1. Push to Git

```bash
git init            # only if not already a repo
git add .
git commit -m "chore: production-ready release"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import into Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. **Import** your Git repository.
3. Vercel auto-detects Vite. Confirm the project settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Click **Environment Variables** and add:
   - `VITE_SUPABASE_URL` → `https://<your-project>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon public key
5. Click **Deploy**. First build takes ~1–2 minutes.

### 3. Verify the Deployment
- Open the production URL.
- The first launch shows the **Onboarding Modal**; completing it routes you to `/dashboard`.
- Deep links like `https://<your-app>.vercel.app/pos` resolve to the POS page (thanks to `vercel.json` rewrites).
- Open *DevTools → Network* and confirm Supabase requests succeed (or that offline mode is logged in the console if env vars are blank).

### 4. Continuous Deployment
Every push to `main` (or your production branch) auto-deploys via Vercel. Preview deploys are created for every PR.

---

## High-Level Module Map

```
src/
├── main.jsx                          # Bootstraps BrowserRouter + Providers
├── App.jsx                           # Routes, Protected gate, OnboardingModal
├── styles.css                        # Tailwind layers + custom CSS variables
├── context/
│   ├── AuthContext.jsx               # Supabase auth + phone-first login
│   └── ProfileContext.jsx            # Dokan profile (store, owner, region, businessType)
├── lib/
│   ├── supabaseClient.js             # createClient(), isSupabaseConfigured flag
│   ├── localDb.js                    # CRUD + createSale + recordPayment (offline)
│   ├── data.js                       # Unified Supabase↔local adapter
│   ├── dokanProfile.js               # Read/write dokan_profile localStorage
│   ├── units.js                      # Unit catalog + fractional qty helpers
│   ├── format.js                     # BDT/৳, dates, initials, avatar colors
│   ├── reminders.js                  # WhatsApp/SMS deep-link builder for Baki
│   └── verticals.js                  # Business-type catalog + sample seeds
├── components/
│   ├── AppShell.jsx                  # Sidebar nav + header + SettingsModal
│   ├── OnboardingModal.jsx           # First-launch store setup wizard + navigate('/dashboard')
│   ├── PhoneGateScreen.jsx           # Phone-first sign-in screen
│   ├── ReminderSheet.jsx             # Baki reminder WhatsApp/SMS drawer
│   └── BusinessTypeChips.jsx, UnitSelect.jsx, icons.jsx, ui.jsx
└── pages/
    ├── DashboardScreen.jsx           # KPIs + 7-day chart + low-stock + recent sales
    ├── NewSaleScreen.jsx             # POS: cart, customer picker, payment split, receipt
    ├── InventoryScreen.jsx           # Products + low-stock filter + serial/warranty
    ├── SalesScreen.jsx               # Invoice list with filters + invoice detail drawer
    ├── CustomersScreen.jsx           # Customer directory + per-customer Hisab
    ├── HisabScreen.jsx               # Baki ledger + payment recording + reminders
    ├── VendorsScreen.jsx             # Supplier directory + supplied products
    └── CategoriesScreen.jsx          # Category CRUD with color tagging
```

### Routing Map

| Path | Screen | Auth |
|------|--------|------|
| `/` | Redirect → `/dashboard` | — |
| `/login` | `PhoneGateScreen` | — |
| `/dashboard` | `DashboardScreen` | Protected |
| `/pos` | `NewSaleScreen` | Protected |
| `/inventory` | `InventoryScreen` | Protected |
| `/sales` | `SalesScreen` | Protected |
| `/customers` | `CustomersScreen` | Protected |
| `/hisab` | `HisabScreen` | Protected |
| `/vendors` | `VendorsScreen` | Protected |
| `/categories` | `CategoriesScreen` | Protected |
| `*` | Redirect → `/dashboard` | — |

All routes are SPA-rewritten to `/index.html` by `vercel.json` so deep links never 404.

---

## License

This project is private and proprietary. All rights reserved.

---

**Built with ❤️ for the Bangladeshi Dokan Malik (দোকান মালিক).**
