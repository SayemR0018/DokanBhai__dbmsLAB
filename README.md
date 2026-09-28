# DokanBhai (দোকান ভাই)

DokanBhai is a bilingual Bangla and English ledger for a small Bangladeshi shop: মুদি, electronics, hardware, or general retail. It replaces the paper খাতা on the counter with stock, sales, receipts, and বাকি in one place.

A new shop starts empty. Every product, customer, supplier, invoice, and payment belongs to that shop’s mobile number. One shop cannot see or change another shop’s stock.

Live site: [https://dokanbhai.vercel.app](https://dokanbhai.vercel.app)

| File | What it is |
|------|------------|
| [`../DokanBhai.sql`](../DokanBhai.sql) | Tables, `create_sale`, `record_payment`, and row security. Run this first. |
| [`../seed.sql`](../seed.sql) | One hardware demo shop you can sign into. Run this second, only if you want that shop. |
| [`public/dokanbhai-demo-import.csv`](public/dokanbhai-demo-import.csv) | A small CSV for the dashboard import button. |

---

## Who it is for

The person at the counter is the দোকান মালিক. They register with a shop name and an `01` mobile number. There is no shop password. Staff can use the same phone on that device.

The home page also has an admin login. Admin is separate from a shop. It lists registered shops and live sales totals. It does not open a shop’s POS.

---

## A normal day

1. Open the home page and register, or sign in with the shop mobile.
2. The sidebar shows the shop name and the owner’s name.
3. Add categories, suppliers, and products. Stock can be fractional (`2.5 kg`, `0.45 ton`, `12.5 cft`).
4. On **বিক্রয় / POS**, pick products, take cash, বাকি, or online payment, and print a 58 mm or 80 mm receipt.
5. **হিসাব খাতা** lists who still owes money. Record a payment or send a Bangla WhatsApp or SMS reminder.
6. The dashboard shows the last 30 days of sales, cash, dues, low stock, and a 7-day chart.

If the internet drops and Supabase is configured, the save stays on the screen with an error. It is not copied into a hidden local ledger. A copy on this phone is used only when Supabase is not configured at all.

---

## Shop types

Registration asks for one type. The type is a label on the shop. It does not insert products.

| Key | Label |
|-----|--------|
| `mudi` | মুদি ও জেনারেল স্টোর |
| `electronics` | ইলেকট্রনিক্স ও ইলেকট্রিক |
| `hardware` | হার্ডওয়্যার ও কনস্ট্রাকশন |
| `general` | সাধারণ রিটেইল |

---

## Screens

### Home (`/`)

Logo, a shop-front drawing, **নতুন একাউন্ট খুলুন**, **লগ ইন করুন**, **অ্যাডমিন লগইন**, and **দোকান ঘুরে দেখুন**. Admin login is linked only from this page.

### Register (`/register`)

Required: shop name, owner name, and a Bangladesh mobile (`01` then 3–9, then 8 digits). District and area become the address. After save, the dashboard is empty.

The phone is stored on `businesses` and `dokan_profile`. Later screens send it as the `x-shop-phone` header.

### Login (`/login`)

Enter the same mobile. The app checks that the number exists on `businesses.phone` or `dokan_profile.session_phone`. The sidebar then loads the shop name and owner from those rows.

### Dashboard (`/dashboard`)

“আজকের খাতা”: sales for 30 days, cash, total বাকি, low-stock count, a 7-day bar chart, and recent sale lines.

**আগের হিসাব আনুন** opens the CSV / Excel import. See [Import an old ledger](#import-an-old-ledger).

### POS (`/pos`)

- Search products and filter by category.
- Quantity steps follow the unit (1 piece, 0.001 kg, 0.01 litre).
- The line price can be changed before checkout.
- Quantity cannot go above the stock on hand.
- Discount is taken off the invoice. Due is `total − paid`.
- **নগদ** and **অনলাইন** can be a walk-in (`customer_id` is null) or a saved customer, or **ডেমো ক্রেতা** (`demo1`, `demo2`, …). Those demo names are real customer rows for this shop, used when the buyer does not want to give a number.
- **বাকি** requires a saved customer with a valid `01` number. A demo name is not enough.
- Checkout calls `create_sale`. Stock, the invoice, the lines, and the ledger update together.
- The receipt shows the shop, owner, area, lines, serial or warranty text when present, and **ধন্যবাদ! আবার আসবেন।**

### Stock (`/inventory`)

Add or edit a product: name, category, supplier, cost, sale price, stock, minimum, unit, serial tracking, warranty months, note. A red banner lists items at or under the minimum. Search, category, and supplier filters sit above the cards. A failed save stays on the form.

### Sales (`/sales`)

Invoices for this shop only, newest first. Filter by text, customer, pay type, and today / this week / this month. Open a row for the line items and a print button.

### Customers (`/customers`)

Name and 11-digit mobile are required. Address and note are optional. The list shows the running বাকি balance.

### হিসাব খাতা (`/hisab`)

One summary for total due, how many customers still owe, and how many are clear. The list under it is only people with a balance above zero. **মনে করান** opens a Bangla message with WhatsApp, SMS, and copy. Opening a name records a payment through `record_payment` and shows that customer’s sales and deposits.

### Suppliers and categories

Each row belongs to the signed-in shop. Category names are unique inside the shop, not across the whole database.

### Settings

Change the shop name, owner, area, type, and receipt width (58 mm or 80 mm). Save writes those fields back to `businesses` and `dokan_profile`. Sign out and device reset are in the footer of the sheet, once each.

---

## Two ways to see sample data

These are not the same thing.

### 1. Home-page tour

**দোকান ঘুরে দেখুন** loads a hardware shop into this browser only (`sessionStorage` flag `dokanbhai-demo`, storage key `dokanbhai-demo-tour`). You can open every shop page. **হোমে ফিরুন** deletes that copy. Nothing is written to Supabase.

Use this when you want to click around without creating a shop.

### 2. Database demo shop (`seed.sql`)

[`../seed.sql`](../seed.sql) inserts the same hardware shop into Postgres so you can sign in for real:

| | |
|--|--|
| Shop | Bhai Bhai Hardware & Construction (ভাই ভাই হার্ডওয়্যার) |
| Owner | Haji Md. Noor Islam |
| Phone | `01719876543` |
| Type | hardware |
| Address | Plot 14, Gabtoli Beribadh Road, Mirpur, Dhaka |

After the seed, sign in with **01719876543**. The sidebar should show that shop and **Haji Md. Noor Islam**.

The file includes:

- 8 categories (rod and cement, sand and brick, pipe, tools, fasteners, paint, tin, sanitary)
- 6 suppliers (BSRM, Shah Cement, RFL, Berger, Dongcheng, a Gabtoli sand depot)
- 20 products, including low-stock cement and rod, and one pipe at zero stock
- 5 customers, three of them with বাকি (Rafiqul Islam ৳1,84,500, Subal Mistri ৳6,800, Dream Homes ৳4,25,000)
- 5 invoices: credit, cash, bKash, a site chalan, and a walk-in
- Matching sale lines, ledger rows, and 3 payments (check, cash, RTGS)

Running `seed.sql` again deletes and reinserts only phone `01719876543`. Other shops are left alone.

---

## Import an old ledger

On the dashboard, **আগের হিসাব আনুন** accepts `.csv` or `.xlsx`. Rows are saved on the signed-in shop. The tour refuses this button.

Rules:

- A section that is not in the file is not touched.
- A blank cell does not wipe a value that is already saved. Only filled columns are written.
- A matching product or category name, or a matching customer or supplier phone, updates that row. A new name is inserted.
- If the file cannot be read, or the column names are not recognized, nothing is saved.
- A new customer still needs an 11-digit `01` number.
- Units must be one of: `pcs`, `kg`, `litre`, `bag`, `feet`, `cft`, `ton`, `gaj`, `box`, `pack`, `dozen`, `bundle` (short forms such as `ltr`, `ft`, `ctn` are accepted).

Put many sections in one CSV with a `section` column (`category`, `vendor`, `customer`, `product`). Or use an Excel workbook whose sheet names are `categories`, `vendors`, `customers`, and `products`.

```csv
section,name,phone,address,note,balance,color,category,vendor,cost_price,sale_price,stock,min_stock,unit
category,চাল ও আটা,,,,,,#10b981,,,,,,
product,Miniket Rice,,,,,,চাল ও আটা,City Group,65,72,100,20,kg
customer,Rahim Mia,01712345678,Mirpur 10,,450,,,,,,,,
```

The ready-made sample is [`public/dokanbhai-demo-import.csv`](public/dokanbhai-demo-import.csv).

---

## Admin

Open **অ্যাডমিন লগইন** on the home page.

| | |
|--|--|
| Email | `admin@dokanbhai.com` |
| Password | `Admin@123` |

| Path | What you see |
|------|----------------|
| `/admin/dashboard` | Shop count, product count, customer count, sales total, today’s sales, this month, low stock, recent invoices |
| `/admin/shops` | Every registered shop: name, owner, phone, type, area |
| `/admin/products` | Products that belong to a shop |
| `/admin/reports` | Sales grouped by shop type |

These numbers come from `admin_overview`, `admin_shops`, and `admin_products`. The browser sends `x-admin-email` with the demo admin address. Log out returns to the home page. Reloading an `/admin/...` page keeps the admin session even if a shop is also signed in on this browser.

---

## How one shop stays separate

The anon key has no user id. The app sends the shop phone on every request:

```http
x-shop-phone: 01719876543
```

`shop_phone()` reads that header. Row policies allow a row only when `business_id` equals that phone. The same rule is on products, customers, vendors, categories, invoices, sale lines, transactions, and payments. A row with an empty `business_id` is not shown.

`create_sale` and `record_payment` are `security definer` functions. They still check the header. A sale cannot reduce another shop’s stock, and a payment cannot reduce another shop’s customer balance. Walk-in cash stores `customer_id` as null.

New text ids are generated in the app (`p-…`, `c-…`, `v-…`, `cat-…`). The tables also have a default id, and `stamp_shop_business()` fills `business_id` from the header when the insert omits it.

---

## Tables

Full definitions, indexes, triggers, and policies are in [`../DokanBhai.sql`](../DokanBhai.sql). The short map:

| Table | Role |
|-------|------|
| `businesses` | Shop. `id` and `phone` are the 11-digit mobile. `phone` is unique. |
| `dokan_profile` | Owner name, area, type, currency `BDT`, receipt width. `session_phone` is unique. |
| `categories` | Name and color. Unique per shop, not globally. |
| `vendors` | Supplier name, phone, address, note. |
| `customers` | Name, phone, address, note, running `balance` (বাকি). |
| `products` | Cost, sale price, `stock` and `min_stock` as `numeric(12,3)`, unit, serial flag, warranty months. |
| `invoices` | Header: subtotal, discount, total, paid, due, `pay_type` (`cash`, `credit`, `online`). |
| `sale_items` | Lines. `product_name` is kept even if the product row is later removed. |
| `transactions` | Flat ledger the dashboard sums. One row per sale line or payment. |
| `payments` | Money received against বাকি. |

Money columns are `numeric(12,2)`. Dates on invoices, transactions, and payments are in `date`, not `created_at`.

---

## Stack

| Piece | Choice |
|-------|--------|
| UI | React 18 |
| Build | Vite 5 |
| Routing | React Router 6 |
| Style | Tailwind CSS 3 |
| Data | Supabase JS 2, PostgreSQL |
| Spreadsheets | `xlsx` (loaded when an Excel file is imported) |
| Hosting | Vercel static build, `dist/` |

There is no separate Node API. The browser talks to PostgREST and the two SQL functions.

---

## Run it on your machine

Node.js 18 or newer.

```bash
cd DokanVy_webapp
npm install
cp .env.example .env
npm run dev
```

The dev server is [http://localhost:5173](http://localhost:5173). `host: true` in Vite lets a phone on the same network open it too.

```bash
npm run build      # production files in dist/
npm run preview    # serve that build
npm run serve      # preview on port 4173
```

Without the two env vars, the app keeps an empty ledger in `localStorage` under `dokanbhai-local-db_<phone>`. That is only for a machine that has no Supabase project.

---

## Database setup

1. Create a Supabase project.
2. Open the SQL editor and run all of [`../DokanBhai.sql`](../DokanBhai.sql).
3. Optional: run [`../seed.sql`](../seed.sql) to create the hardware demo shop.
4. In **Project Settings → API**, copy the project URL and the anon public key into `.env`.
5. Restart `npm run dev`.

Do not paste an older schema from a previous README. Those scripts used UUID tables and different column names. They do not match this app.

`seed.sql` expects the tables from `DokanBhai.sql` to exist already, including `business_id` and `dokan_profile`.

---

## Environment

`.env` (from `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Vite embeds any `VITE_` value in the browser bundle. Use the anon key only. Never put the service-role key in this file or in Vercel’s client env.

The production project URL is `https://rumwkbuhxtbicbpzzsst.supabase.co`.

---

## Deploy

`vercel.json` rewrites every path to `index.html`, so `/pos` and `/hisab` work on refresh.

1. Push the `DokanVy_webapp` app (the git root is that folder).
2. Import the repo on Vercel. Framework: Vite. Build: `npm run build`. Output: `dist`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Deploy. The current production URL is [https://dokanbhai.vercel.app](https://dokanbhai.vercel.app).

Pushes to `main` deploy again. Env changes need a new deploy because Vite reads them at build time.

---

## Routes

| Path | Screen | Who can open it |
|------|--------|-----------------|
| `/` | Home | Anyone |
| `/register` | New shop | Anyone |
| `/login` | Phone sign-in | Anyone; a signed-in shop goes to the dashboard |
| `/dashboard` | Today’s ledger and import | Shop, or the tour |
| `/pos` | New sale | Shop, or the tour |
| `/inventory` | Stock | Shop, or the tour |
| `/sales` | Invoice list | Shop, or the tour |
| `/customers` | Customers | Shop, or the tour |
| `/hisab` | বাকি খাতা | Shop, or the tour |
| `/vendors` | Suppliers | Shop, or the tour |
| `/categories` | Categories | Shop, or the tour |
| `/admin/login` | Admin sign-in | Anyone |
| `/admin/dashboard` | Live totals | Admin |
| `/admin/shops` | Shop list | Admin |
| `/admin/products` | Product list | Admin |
| `/admin/reports` | Sales by type | Admin |

Unknown paths go back to `/`.

---

## Folder map

```
DokanVy_webapp/
├── public/
│   ├── dokanBhai_logo.png
│   └── dokanbhai-demo-import.csv
├── src/
│   ├── App.jsx                      # Routes
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardScreen.jsx
│   │   ├── NewSaleScreen.jsx
│   │   ├── InventoryScreen.jsx
│   │   ├── SalesScreen.jsx
│   │   ├── CustomersScreen.jsx
│   │   ├── HisabScreen.jsx
│   │   ├── VendorsScreen.jsx
│   │   ├── CategoriesScreen.jsx
│   │   └── admin/                   # Login, totals, shops, products, reports
│   ├── components/
│   │   ├── AppShell.jsx             # Sidebar, owner card, settings
│   │   ├── SiteHeader.jsx
│   │   ├── Logo.jsx
│   │   ├── PhoneGateScreen.jsx
│   │   └── ReminderSheet.jsx
│   ├── context/
│   │   ├── AuthContext.jsx          # Shop phone session and admin session
│   │   └── ProfileContext.jsx
│   └── lib/
│       ├── data.js                  # list / insert / createSale / recordPayment
│       ├── supabaseClient.js        # Client, x-shop-phone, x-admin-email
│       ├── dokanProfile.js          # Device profile; loads name from Postgres
│       ├── hardwareDemo.js          # Browser tour dataset
│       ├── ledgerImport.js          # CSV and Excel
│       ├── localDb.js               # Empty per-phone ledger when offline
│       ├── units.js
│       ├── format.js                # ৳
│       └── reminders.js
├── vercel.json
└── package.json

../DokanBhai.sql                     # Canonical schema
../seed.sql                          # Demo hardware shop
```

---

## Scripts

| Command | Effect |
|---------|--------|
| `npm run dev` | Vite dev server |
| `npm start` | Same as `dev` |
| `npm run build` | Production bundle in `dist/` |
| `npm run preview` | Serve `dist/` |
| `npm run serve` | Serve `dist/` on port 4173 |
