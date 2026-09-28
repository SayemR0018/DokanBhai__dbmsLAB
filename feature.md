# DokanBhai (দোকান ভাই) — Feature Matrix & Module Specification

> **Document type:** Product specification & feature matrix
> **Audience:** Product managers, engineers, shop owners piloting DokanBhai
> **Version:** 1.2 — aligned with `DokanVy_webapp/` and the live schema in `DokanBhai.sql`
> **Locale focus:** Bangladesh — BDT currency, Bangla + English UI, local FMCG brands

---

## 1. Application Overview

**DokanBhai** (দোকান ভাই — *Shop Brother*) is a **Digital Mudi Dokan Management** system — a BDT-denominated POS and inventory web app purpose-built for **Bangladeshi neighborhood stores** (grocery / electronics / hardware / general retail). It replaces the paper *khata* that a *dokan malik* traditionally keeps on the counter with a real-time, multilingual, mobile-first web app.

### 1.1 Core Value Proposition

| Pain Point (Today)                                       | DokanBhai Solution                                                                             |
|----------------------------------------------------------|------------------------------------------------------------------------------------------------|
| Paper *baki khata* is lost, smudged, or unreadable       | A persistent **Baki Khata** ledger with full transaction history per customer                   |
| Hard to know which items are running out                 | **Low-stock alerts** in real time on dashboard + inventory                                     |
| Reconciling cash vs credit at end of day is manual       | **Nogod / Baki / Online** split tracked per invoice with auto-generated `due_amount`          |
| Generic POS apps ignore Bangladeshi shop types            | Four shop types (মুদি, ইলেকট্রনিক্স, হার্ডওয়্যার, সাধারণ রিটেইল). A new shop starts empty. A home-page tour shows a hardware shop locally, without writing it to Supabase. |
| No thermal receipt for shoppers                          | **Thermal receipt preview + print** at 58 mm / 80 mm with `৳` BDT formatting                   |
| Chasing customers for credit repayment is awkward        | **One-tap WhatsApp / SMS Baki reminders** with pre-filled Bangla copy                         |
| Onboarding friction (email, OTP, KYC) for a small shop   | **Phone-first registration** — shop name, owner, district, and one BD mobile. No password.     |
| Needs internet 24/7                                      | **Offline ledger** only when Supabase is not configured. When it is configured, reads and writes go to Postgres and errors are shown. The hardware tour stays in this browser. |

### 1.2 Target User

- **Primary:** Dokan Malik (shop owner) running a small-to-medium Mudi/Grocery, Electronics, or Hardware store in Bangladesh.
- **Secondary:** Manager / staff who take orders at the counter.
- **Constraints:** Limited time, mixed Bangla/English literacy, intermittent connectivity, no specialized hardware (works on a phone).

### 1.3 High-Level Feature Matrix

| Module                                  | Status   | Offline | Online (Supabase) |
|-----------------------------------------|----------|---------|-------------------|
| Public home page + shop animation       | ✅ Ship  | ✅      | n/a               |
| Phone registration                      | ✅ Ship  | ✅      | ✅                |
| Phone-first sign-in                     | ✅ Ship  | ✅      | ✅                |
| Empty ledger for a new shop             | ✅ Ship  | ✅      | ✅                |
| Hardware shop tour (this browser only)  | ✅ Ship  | ✅      | never written     |
| Demo customer on cash / online sales    | ✅ Ship  | ✅      | ✅                |
| Dashboard analytics                     | ✅ Ship  | ✅      | ✅                |
| New Sale / POS                          | ✅ Ship  | ✅      | ✅                |
| Multi-unit measurement system           | ✅ Ship  | ✅      | ✅                |
| Thermal receipt (58 mm / 80 mm)         | ✅ Ship  | ✅      | ✅                |
| Inventory & low-stock alerts            | ✅ Ship  | ✅      | ✅                |
| Categories & suppliers (per shop)       | ✅ Ship  | ✅      | ✅                |
| Customers + Baki Khata                  | ✅ Ship  | ✅      | ✅                |
| Baki reminders (WhatsApp / SMS / copy)  | ✅ Ship  | ✅      | ✅                |
| Sales history + invoice drawer          | ✅ Ship  | ✅      | ✅                |
| Hisab (ledger) reconciliation           | ✅ Ship  | ✅      | ✅                |
| BDT `৳` currency formatting             | ✅ Ship  | ✅      | ✅                |
| Bangla / English bilingual UI           | ✅ Ship  | ✅      | ✅                |
| Admin panel (live shop / product counts)| ✅ Ship  | n/a     | ✅                |
| Row-Level Security by shop phone        | ✅ Ship  | n/a     | ✅                |

---

## 2. Detailed Module Breakdown

### 2.1 Registration, sign-in, and admin

*`src/pages/LandingPage.jsx`, `src/pages/RegisterPage.jsx`, `src/components/PhoneGateScreen.jsx`, `src/pages/admin/AdminLogin.jsx`, `src/context/AuthContext.jsx`*

| Capability                       | Detail                                                                                                                                                  |
|----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Public home**                  | `/` is the landing page: logo, shop-front animation, register, login, and **দোকান ঘুরে দেখুন**. Admin login is only linked from here.                  |
| **Registration**                 | `/register` collects shop name, owner, BD mobile (`^01[3-9]\d{8}$`), district, area, and business type. It writes `businesses` and `dokan_profile`. The ledger starts empty. |
| **No shop password**             | The mobile number is the shop identity. It is sent as the `x-shop-phone` header so Postgres RLS can see only that shop.                                 |
| **Phone-first login**            | `/login` accepts a registered BD mobile. A shop session is stored in `dokanbhai-auth-session`.                                                          |
| **Hardware tour**                | **দোকান ঘুরে দেখুন** loads `hardwareDemo.js` into `sessionStorage` / a local key. It never calls Supabase. **হোমে ফিরুন** deletes it.                   |
| **Admin**                        | `/admin/login` uses the demo email `admin@dokanbhai.com`. Admin pages read `admin_overview`, `admin_shops`, and `admin_products`. Logout returns home. |
| **Route guard**                  | Shop pages use `<Protected>`. The tour is allowed without a shop login. Admin pages use `<AdminProtected>`.                                            |

#### Roles (extensible)

| Role           | Display Name (BN/EN) | Privileges                                                                              |
|----------------|----------------------|------------------------------------------------------------------------------------------|
| Dokan Malik    | দোকান মালিক / Owner  | Full access: POS, inventory, customers, settings, business management                   |
| Manager        | ম্যানেজার            | Day-to-day operations: POS, inventory, customers, Hisab                                   |
| Staff          | কর্মচারী             | POS only (future)                                                                        |

---

### 2.2 Dashboard & Analytics *(স্ক্রিন: `src/pages/DashboardScreen.jsx`)*

**Purpose:** Single-screen *hisab* of the business for the last 30 days, plus a 7-day trend and live low-stock and recent-sales panes.

| KPI card (gradient) | Bengali label        | Source computation                                                                |
|---------------------|----------------------|-----------------------------------------------------------------------------------|
| Total Sales         | মোট বিক্রয়          | `SUM(transactions.amount WHERE type='sale' AND date >= now-30d)`                 |
| Total Cash (Nogod)  | নগদ                  | `SUM(transactions.paid_amount WHERE pay_type='cash' AND date >= now-30d)`        |
| Total Baki (Due)    | মোট বাকি             | `SUM(customers.balance)`                                                          |
| Low-stock count     | স্টক কম              | `COUNT(products WHERE stock <= min_stock)`                                        |

#### Trend chart

- A pure-CSS bar chart of last 7 days (`today - 6` … `today`).
- Each bar is labeled with the day's weekday (`Mon`/`Tue`/…) and its BDT total.
- Total in the header reflects the sum across the week.

#### Low-stock alert list

- Lists the first 6 items where `stock <= min_stock`.
- Each row shows `name`, `unit`, `min`, and a red `X left` badge.
- A `View all` deep-link navigates to `/inventory?low=true`.

#### Recent sales table

- The 6 most recent `type='sale'` transactions, sorted by `date DESC`.
- Columns: customer (with avatar), product name, qty, amount, pay_type badge, `daysAgo()` relative time.

---

### 2.3 New Sale / POS *(স্ক্রিন: `src/pages/NewSaleScreen.jsx`)*

**Purpose:** The fastest counter POS in Bangladesh — built for one-handed phone use.

| Capability                         | Detail                                                                                                                                                              |
|------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Product picker**                 | Searchable, category-filterable grid of products with stock badges and out-of-stock dimming. Inline category color dot for fast scanning.                          |
| **Multi-unit cart**                | Quantity step is unit-aware (`stepFor(unit)` / `decimalsFor(unit)`) — e.g. `kg` increments by `0.001`, `litre` by `0.01`, `pcs` by `1`.                          |
| **Fractional billing**             | Cart computes `qty × unit_price` per line; rounding drift is guarded via `roundQty(value, unitKey)` in `src/lib/units.js`.                                          |
| **Inline unit-price override**     | Each line exposes an editable unit-price `Input` so the cashier can apply ad-hoc discounts at the line level.                                                       |
| **Stock safety**                   | `updateQty` clamps the new qty to `[0, i.stock]`; adding an out-of-stock product is blocked at the picker.                                                          |
| **Customer picker**                | Saved customers, or **ডেমো ক্রেতা** (`demo1`, `demo2`…) for cash and online. বাকি still requires a real customer with an 11-digit BD mobile. Walk-in cash leaves `customer_id` null. |
| **Discount (BDT)**                 | Whole-invoice discount input; `total = max(0, subtotal − discount)`.                                                                                                |
| **Payment split**                  | `paid_amount` input + `pay_type` segmented control (`Nogod` / `Baki` / `Online`) → `due = max(0, total − paid)` and `change = max(0, paid − total)` rendered live.   |
| **Serial / warranty capture**      | When the product is `serialTracked`, the cart reveals a `সিরিয়াল নম্বর` input; when `warrantyMonths > 0`, a `ওয়ারেন্টি নোট` input. Both flow into `sale_items`.   |
| **Atomic checkout**                | `data.createSale({ payload })` calls `create_sale`. The function checks the shop header, writes the invoice, line items, stock change, and transactions for that `business_id` only. `localDb.createSale` is used only when Supabase is not configured, or during the tour. |
| **Thermal receipt preview**        | `<Receipt>` renders an 80 mm or 58 mm receipt DOM node (`#receipt-print`) with BDT totals, pay-type labels in Bangla (`Nogod`/`Baki`/`Online`), per-line serial/warranty, and bilingual footer. |
| **Print to thermal printer**       | `window.print()` + per-width CSS picks up the `data-width` attribute and crops margins accordingly.                                                                |
| **Toggle receipt width**           | `80mm` ↔ `58mm` toggle button updates `profile.store.receiptWidth` instantly and re-renders.                                                                       |

---

### 2.4 Multi-Unit Measurement System *(লাইব্রেরি: `src/lib/units.js`)*

A controlled catalog of 12 units, each with `bn` (Bangla), `short` (compact receipt label), and `decimals` (allowed fractional precision):

| Key      | Bangla      | Short | Decimals | Typical use                                      |
|----------|-------------|-------|----------|--------------------------------------------------|
| `pcs`    | পিস         | pcs   | 0        | Salt, soap, biscuits                             |
| `kg`     | কেজি        | kg    | 3        | Rice, dal, atta                                  |
| `litre`  | লিটার       | ltr   | 2        | Edible oil                                       |
| `bag`    | ব্যাগ       | bag   | 2        | 25 kg rice/atta bags                             |
| `feet`   | ফিট         | ft    | 2        | PVC pipe lengths                                 |
| `cft`    | সিএফটি      | cft   | 2        | Sand, aggregate                                  |
| `ton`    | টন          | ton   | 3        | Steel rods                                       |
| `gaj`    | গজ          | gaj   | 2        | Fabric                                           |
| `box`    | কার্টন      | ctn   | 0        | Cable boxes, battery packs                       |
| `pack`   | প্যাক       | pack  | 0        | Atta 2 kg pack, juice 1 L pack                   |
| `dozen`  | ডজন         | doz   | 0        | Eggs                                             |
| `bundle` | বান্ডিল      | bdl   | 0        | Rebar ties, betel leaves                         |

- `formatQty(value, unitKey)` trims trailing zeros and appends the short label.
- `stepFor(unitKey)` returns the unit's minimum increment for cart buttons and numeric inputs.
- `normalizeUnitKey(alias)` back-compat-maps legacy aliases (`piece`, `liter`, `tonne`, `carton`, `cuft`, etc.) to the canonical 12.

---

### 2.5 Inventory & Low-Stock *(স্ক্রিন: `src/pages/InventoryScreen.jsx`)*

| Capability                       | Detail                                                                                                              |
|----------------------------------|----------------------------------------------------------------------------------------------------------------------|
| **Product CRUD**                 | Add / edit modal with name, category, vendor, cost/sale price, stock, min-stock, unit, note.                          |
| **Serial tracking flag**         | `সিরিয়াল নম্বর ট্র্যাক` checkbox — surfaced at POS when checked.                                                    |
| **Warranty months**              | Integer months — surfaced at POS and printed on receipts.                                                            |
| **Filters**                      | Free-text search, category, vendor, and `Only show low stock` checkbox.                                              |
| **Low-stock banner**             | Red alert card listing how many items are at/below threshold with a `View` action.                                   |
| **Per-product card**             | Shows stock (color-coded), unit, cost/sale margin (`(sale − cost) / cost × 100 %`), category, and vendor badges.    |
| **Real-time sync**               | Listens to `dokanbhai:dbchange`; reloads on every mutation across tabs.                                              |

---

### 2.6 Customers & Baki Khata *(স্ক্রিন: `src/pages/CustomersScreen.jsx`, `HisabScreen.jsx`, `ReminderSheet.jsx`)*

| Capability                              | Detail                                                                                                                                          |
|-----------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| **Customer directory**                  | Avatar-card grid sorted by outstanding `balance` DESC; search by name or phone; inline edit + delete.                                            |
| **Per-customer detail drawer**          | Shows total due, total purchases, address, payment recorder, full Hisab ledger (sales + payments interleaved by date).                            |
| **Hisab screen (বাকি খাতা)**           | A focused Baki-only view: customers with `balance > 0`, summary cards (total outstanding, # customers, fully paid), per-customer last-sale date.   |
| **Record payment**                      | `data.recordPayment({customer_id, amount, note})` writes a `transactions.type='payment'` row, a `payments` row, and decrements `customers.balance`. |
| **WhatsApp / SMS Baki reminder**        | One tap on `মনে করান` opens a `ReminderSheet` drawer with a Bangla message preview, a WhatsApp deep link (`https://wa.me/880…?text=…`), an SMS deep link (`sms:+880…?body=…`), and a clipboard fallback (`navigator.clipboard` + `execCommand`). |
| **Phone-number normalization**          | `toInternational('017…')` → `88017…` so the deep links work for both local (`01XXXXXXXXX`) and international formats.                            |
| **Bilingual reminder copy**             | `buildBakiReminder()` composes a respectful Bangla message: greeting, store name, formatted BDT due, polite closing line.                       |

Sample reminder copy produced by `buildBakiReminder`:

```
আসসালামু আলাইকুম রহিম মিয়া,
DokanBhai থেকে আপনার কাছে বাকি আছে ৳1,250.00।
যখন সুবিধা হবে পরিশোধ করবেন। ধন্যবাদ।
```

---

### 2.7 Sales History *(স্ক্রিন: `src/pages/SalesScreen.jsx`)*

| Capability                       | Detail                                                                                                                                  |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| **Invoice list**                 | Sourced from `invoices` (or synthesized from `transactions` for legacy rows) — sort by `date DESC`.                                     |
| **Filters**                      | Search by invoice # or customer; filter by pay type (`cash`/`credit`/`online`); filter by customer; quick chips `Today`/`This week`/`This month`. |
| **Summary header**               | `# invoices`, total BDT, total due BDT across the filtered set.                                                                          |
| **Invoice detail drawer**        | Customer card, pay-type badge, items table, subtotal/discount/total/paid/due breakdown, note, `Print receipt` button.                    |

---

### 2.8 Adaptive Categories & Suppliers *(স্ক্রিন: `src/pages/CategoriesScreen.jsx`, `VendorsScreen.jsx`)*

| Capability                | Detail                                                                                                                                                  |
|---------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Categories CRUD**       | Name and color, unique per shop (`business_id` + name). A new shop has no categories until the owner adds them. |
| **Vendors CRUD**          | Name, phone, address, and note. Rows belong to the signed-in shop. |
| **Reference catalogs**    | `src/lib/verticals.js` still describes the four shop types. It is not copied into Supabase on registration. The hardware example the visitor can click through is `src/lib/hardwareDemo.js`, stored only in this browser. |

---

### 2.9 Thermal Receipt Generation *(component: `<Receipt>` inside `NewSaleScreen.jsx`)*

- **Width selector:** `data-width="58"` (58 mm) or `data-width="80"` (80 mm); the `<div>` width is set to match.
- **Header:** Store name, business label (e.g. *মুদি ও জেনারেল স্টোর*), region, owner name.
- **Meta block:** Invoice # (`INV-…`), `date`/`time`, customer name, `pay_type` rendered as `Nogod` / `Baki` / `Online`.
- **Items table:** Name, qty (with short unit — `pcs`, `kg`, `ltr`, …), unit price, line total. Underneath each line, `SN:` and `Warranty:` print only when present.
- **Totals:** Subtotal, discount (if any), bold `Total (৳)`, paid, and a red `Due (বাকি)` line when due > 0.
- **Footer:** `ধন্যবাদ! আবার আসবেন।` / `Thank you · Visit again · <date>` / `Powered by DokanBhai`.
- **Print pipeline:** `window.print()` + a `@media print` stylesheet clips margins to the active `data-width`.

---

### 2.10 Dashboard Analytics *(see §2.2 for KPI / chart detail)*

Plus contextual links:
- `New Sale` primary CTA → `/pos`
- `View all` (low stock) → `/inventory?low=true`
- `All sales` → `/sales`

---

## 3. Bangladesh Localization Features

### 3.1 Currency & Numeric Formatting *(লাইব্রেরি: `src/lib/format.js`)*

```js
formatBDT(1234.5) // => "৳1,234.5"   // Bangladeshi Taka sign
formatNumber(1234.5) // => "1,234.5"  // en-IN locale (Bangla-friendly grouping)
```

- The `৳` sign is a hard-coded `\u09F3` (Unicode BDT SIGN).
- All monetary values in the UI route through `formatBDT` — no raw float rendering.
- A legacy `formatTk(value)` helper is exported alongside for older imports.

### 3.2 Bilingual Terminology (BN / EN)

Every primary label pairs Bangla with English so the same UI speaks to owners, staff, and visiting managers:

| Bangla                            | English            | Used in                              |
|-----------------------------------|--------------------|---------------------------------------|
| ড্যাশবোর্ড                        | Dashboard          | Sidebar nav, headers                  |
| নতুন বিক্রয়                      | New Sale           | Sidebar nav, page title, CTA          |
| মালামাল                           | Inventory          | Sidebar nav                           |
| বিক্রয় তালিকা                    | Sales History      | Sidebar nav                           |
| কাস্টমার                          | Customers          | Sidebar nav                           |
| হিসাব খাতা                        | Hisab / Ledger     | Sidebar nav, drawer titles            |
| সরবরাহকারী                        | Vendors            | Sidebar nav                           |
| ক্যাটাগরি                         | Categories         | Sidebar nav                           |
| বাকি                              | Baki / Due         | Payment toggle, due badges            |
| নগদ                               | Nogod / Cash       | Payment toggle                        |
| অনলাইন                            | Online             | Payment toggle                        |
| মোট বাকি                          | Total Baki         | Dashboard / Hisab KPI                 |
| ক্রয়মূল্য / বিক্রয়মূল্য          | Cost / Sale price  | Inventory form                        |
| সেট আপ সম্পন্ন করুন               | Complete setup     | Onboarding submit                     |
| প্রবেশ করুন                       | Sign in            | Phone gate                            |
| মনে করান                          | Send reminder      | Baki CTA                              |
| ধন্যবাদ! আবার আসবেন               | Thank you! Visit again | Receipt footer                    |

### 3.3 Shop types and the hardware tour

Registration stores one of four types and does not insert the catalogs below. Those lists describe what each type sells. The only sample a visitor can open is **দোকান ঘুরে দেখুন**, which loads a hardware shop in this browser and deletes it on exit.

The four types:

- **মুদি ও জেনারেল স্টোর / Grocery / Mudi Dokan**
  - Categories: চাল ও আটা / Rice & Flour, তেল ও মসলা / Oil & Spices, চা ও পানীয় / Tea & Drinks, নুন-চিনি / Salt & Sugar, দুগ্ধজাত / Dairy, গৃহস্থালী / Household, স্ন্যাক্স / Snacks
  - Vendors: City Group, ACI Consumer Brands, Meghna Group of Industries, PRAN-RFL Group, Square Food & Beverage
  - Products: Miniket Rice, Nazirshail Rice, Pushti Atta, Teer Soyabean Oil 5L, ACI Pure Salt, Deshi Masoor Dal, Ispahani Mirzapore Tea, PRAN Mango Juice, Dano Daily Pushti Milk Powder, Rin Washing Powder, Bombay Sweets Chanachur

- **ইলেকট্রনিক্স ও ইলেকট্রিক / Electronics & Electrical**
  - Categories: LED ও লাইটিং / Lighting, সুইচ ও সকেট / Switches, তার ও ক্যাবল / Cables, ফ্যান ও হিটার / Fans, মাল্টিপ্লাগ / Multiplugs, ব্যাটারি / Batteries, ছোট ইলেকট্রনিক্স / Gadgets
  - Vendors: Walton, Super Star, BRB Cables, Vision Electronics, Havells Bangladesh, MK Battery
  - Products (with `serialTracked: true`, `warrantyMonths`): LED Bulb 9W (Vision), LED Bulb 15W (Super Star), 1-Gang Switch (Havells), 3-Gang Switch (Havells), Multiplug 3-Gang (Super Star), BRB Cable 1.5 mm 90 m Roll, Havells Wire 1 mm 100 m, Walton Ceiling Fan 56", Walton Rechargeable Fan, MK Battery 12V Inverter, Vision LED Tube Light 18W

- **হার্ডওয়্যার ও কনস্ট্রাকশন / Hardware & Builders Supply**
  - Categories: রড ও সিমেন্ট / Rod & Cement, পাইপ ও ফিটিংস / Pipes, নেইলস ও স্ক্রু / Nails, পেইন্ট / Paints, স্যান্ড ও স্টোন / Sand & Stone, টুলস / Tools, টাইলস ও স্যানিটারি / Tiles
  - Vendors: BSRM, Crown Cement, RFL Plastics, Berger Paints Bangladesh, Concord Construction Supply
  - Products: BSRM Deformed Rod 10 mm / 12 mm (per ton), Crown Cement 50 kg, Holcim Cement 50 kg, RFL PVC Pipe 1" / 2" (10 ft), Concrete Nails 3", Wood Screws Assorted 1 kg, Berger Robbialac 4L, Sand (Sylhet), Aggregate Stone 3/4"

- **সাধারণ রিটেইল / General Retail**
  - Categories: পণ্য মিক্স / Mixed Goods, প্যাকেজড / Packaged, পোশাক / Apparel, গৃহস্থালী / Household, স্টেশনারি / Stationery, টিফিন ও স্ন্যাক্স / Tiffin
  - Vendors: Local Wholesale House, Karim Sons, BCB (Bangladesh Chemical), PRAN, RFL
  - Products: Facial Tissue Box, Biscuit (Mixed Pack), Bottled Water 1.5 L, Men's T-Shirt (M), Lungi (Cotton), Notebook (200 pages), Ball Pen (Box of 12), Plastic Bucket (15 L), Tiffin Box (3-Compartment)

### 3.4 Mobile-Number Validation

- Every place a mobile is captured (`RegisterPage`, `PhoneGateScreen`, `CustomersScreen`, `AuthContext.login`) validates against `/^01[3-9]\d{8}$/`.
- `toInternational()` in `src/lib/reminders.js` normalizes `01712345678` → `8801712345678` so WhatsApp/SMS deep links work seamlessly.

### 3.5 Where data lives

- **Supabase configured (production):** every shop read and write goes to Postgres. A failed save stays on the form. It is not copied into `localStorage`.
- **Supabase not configured:** `localDb` keeps that phone's ledger in `dokanbhai-local-db_<phone>`. A new key starts empty.
- **Tour:** `dokanbhai-demo-tour` in `localStorage`, flagged by `sessionStorage` key `dokanbhai-demo`. Exit deletes both.
- **Profile:** `dokan_profile_<phone>` on the device, and the `dokan_profile` table in Postgres.
- **Reset:** Settings can wipe the device copy. Shop sign-out clears the session and returns toward home for admin.

### 3.6 Receipt Footer

Every printed receipt ends with the locally resonant closing:

```
ধন্যবাদ! আবার আসবেন।
Thank you · Visit again · 12 Aug 2026
Powered by DokanBhai
```

---

## 4. Cross-Module Feature Map

| Surface                           | Pages / components                                                                          | Data touched                                    |
|-----------------------------------|----------------------------------------------------------------------------------------------|-------------------------------------------------|
| First-run setup                   | `RegisterPage`                                                                              | `businesses`, `dokan_profile` (no catalog rows) |
| Hardware tour                     | Home **দোকান ঘুরে দেখুন**                                                                    | browser only (`hardwareDemo.js`)                |
| Returning login                   | `PhoneGateScreen` + `AuthContext.login`                                                     | `businesses.phone`, `dokan_profile.session_phone` |
| Admin                             | `/admin/login`, dashboard, shops, products, reports                                         | `admin_overview`, `admin_shops`, `admin_products` |
| Top-of-day check                  | `DashboardScreen`                                                                            | `transactions`, `customers.balance`, `products` |
| Counter sale                      | `NewSaleScreen` + `<Receipt>` + `data.createSale`                                            | `invoices`, `sale_items`, `products.stock`, `customers.balance`, `transactions` |
| Restock & edit catalog            | `InventoryScreen`, `CategoriesScreen`, `VendorsScreen`                                       | `products`, `categories`, `vendors`             |
| Review sales                      | `SalesScreen`                                                                                | `invoices`, `customers`                         |
| Manage customers                  | `CustomersScreen`, `CustomerDetail` drawer                                                   | `customers`, `transactions`                     |
| Chase Baki                        | `HisabScreen` + `ReminderSheet` + `buildBakiReminder`                                        | `customers.balance`, `invoices`, `payments`     |
| Reset / hand over device          | `SettingsModal` + `localDb.reset` + `clearProfile`                                           | `localStorage` (full wipe)                      |

---

## 5. Build, Run, and Demo

```bash
cd DokanVy_webapp
npm install
npm run dev            # vite dev server
npm run build          # production bundle into dist/
npm run preview        # serves dist/
```

Production site: `https://dokanbhai.vercel.app/`. The database script is `DokanBhai.sql` and is already applied on the DokanBhai Supabase project.

Shop flow:

1. Open the home page and register a shop. The dashboard, stock, customers, and vendors are empty.
2. Add a product, then sell it from POS. Cash may use a demo customer. বাকি needs a real 11-digit customer.
3. Optional: **দোকান ঘুরে দেখুন** walks through a hardware shop that disappears when you return home.
4. Admin login from the home page shows live shop, product, and sales counts.

---

## 6. Summary

DokanBhai ships the four capabilities a Bangladeshi dokan malik needs the most:

1. **Phone registration with an empty ledger** — one BD mobile, no catalog copied from another shop.
2. **Multi-unit POS** — cash and online can use a demo customer; বাকি needs a real customer; the receipt is in BDT.
3. **Baki Khata** — due balances, payments, and a Bangla WhatsApp or SMS reminder.
4. **A local hardware tour and a live admin view** — the tour never reaches Supabase; admin counts come from the database. Shop rows are isolated by `x-shop-phone`.