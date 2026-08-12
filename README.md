# DokanBhai (দোকান ভাই)

## Mobile-First Digital Shop Management & POS Web App for Bangladeshi Physical Retail Stores

> *"Shop Brother"* — A bilingual (Bangla + English) digital *khata* and Point-of-Sale (POS) web application that replaces the paper ledger at the corner store with a fast, mobile-friendly, offline-capable digital counter.

DokanBhai is engineered specifically for the Bangladeshi retail ecosystem — covering **groceries, electronics, hardware, and construction materials** shops. It runs entirely in the browser, works offline, and prints thermal receipts in BDT (৳).

---

## Target Business Sectors

DokanBhai is purpose-built for the following Bangladeshi physical retail verticals:

| Sector | Bengali | Notes |
|--------|---------|-------|
| **Groceries (Mudi Dokan)** | মুদি দোকান | Rice, flour, oil, spices, snacks, personal care |
| **Electronics & Electrical** | ইলেকট্রনিক্স ও ইলেকট্রিক্যাল | Serial-numbered items, warranty tracking |
| **Hardware** | হার্ডওয়্যার | Tools, fittings, fasteners |
| **Builders Supply** | বিল্ডার্স সাপ্লাই | Plumbing, sanitary, finishing materials |
| **Construction Materials Shops** | নির্মাণ সামগ্রী | Sand, cement, bricks, steel, aggregates (Cft, Ton, Gaj) |

---

## Key Features Matrix

### 1. Phone-First No-Signup Onboarding
- Single-screen wizard on first launch: **Store Name** + **Region**.
- BD mobile number (`^01[3-9]\d{8}$`) becomes the trusted-device identifier — no email, no password, no OTP, no KYC.
- Re-entry on every cold boot via `PhoneGateScreen`.

### 2. Multi-Unit Measurement System
- Full unit catalog: **Pcs, Kg, Bag, Cft (cubic feet), Ton, Gaj (square yard), Box, Litre**.
- Fractional billing support — sell `0.5 kg` rice, `2.5 Cft` sand, `1.25 ton` cement.
- Unit-aware inventory, cart, and receipt rendering.

### 3. Fast Counter POS with Split Settlement
- **Split payment** per invoice: **Nogod (নগদ / cash)** vs **Baki (বাকি / credit)** with auto-calculated `due_amount`.
- **bKash / Nagad MFS TrxID tracking** for online payments.
- Stock validation, customer picker, discount, and one-tap checkout.

### 4. Baki Khata Customer Credit Ledger
- Persistent customer credit ledger with per-customer transaction history.
- **1-tap WhatsApp / SMS payment reminders** with pre-filled Bangla copy via deep-link builders.

### 5. Thermal Receipt Generation
- Print-ready **80 mm** and **58 mm** POS thermal receipts branded as DokanBhai.
- BDT `৳` currency formatting and bilingual line items.

### 6. Electronics Serial & Warranty Tracking
- Per-product serial-number capture and warranty expiry tracking.
- Designed for electronics retailers selling serialized SKUs.

### 7. Local-First Browser Offline Persistence
- **Offline-first** via `localStorage` fallback with in-memory mirror.
- Transparent **background cloud sync** to Supabase (PostgreSQL) when online.
- The app is fully functional with zero configuration (offline mode) and upgrades to multi-device sync when Supabase keys are provided.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **UI Framework** | React 18 |
| **Build Tool** | Vite 5 |
| **Routing** | React Router 6 |
| **Styling** | Tailwind CSS 3 (with custom `brand` green + `steel` palettes) |
| **Cloud Backend** | Supabase (hosted PostgreSQL) via `@supabase/supabase-js` |
| **Offline Persistence** | Browser `localStorage` with in-memory mirror |
| **State** | React Context (`AuthContext`, `ProfileContext`) |

---

## Quick Start & Setup Instructions

### Prerequisites
- **Node.js** 18+ and **npm** 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd DokanVy_webapp

# Install dependencies
npm install
```

### Development

```bash
# Start the Vite dev server on http://localhost:5173
npm run dev
```

### Production Build

```bash
# Build optimized production bundle into dist/
npm run build

# Preview the production build on http://localhost:4173
npm run preview
```

### Environment Configuration (Optional)

Create a `.env` file in the project root (use `.env.example` as a template):

```env
VITE_SUPABASE_URL=https://ucbhnbxwdwjcmjwtodoo.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

> **Note:** If `VITE_SUPABASE_ANON_KEY` is not provided (or Supabase is unreachable), the app **automatically falls back** to a fully-functional in-browser database backed by `localStorage`, pre-seeded with Bangladeshi sample data. You can develop and demo immediately with zero backend setup.

---

## Architecture & Database References

For deeper technical details, please refer to the following documents in the project root:

| Document | Description |
|----------|-------------|
| **[`analysis.md`](../analysis.md)** | **System Architecture & DBMS Analysis** — full architecture diagram, ER breakdown, database DDL, normalization discussion, and analytical SQL queries. |
| **[`feature.md`](../feature.md)** | **Feature Matrix & Module Specification** — complete product specification, detailed module breakdown, and feature parity matrix (offline vs online). |

### High-Level Module Map

```
src/
├── main.jsx                          # Bootstraps BrowserRouter + Providers
├── App.jsx                           # Routes, Protected gate, OnboardingModal
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
│   ├── OnboardingModal.jsx           # First-launch store setup wizard
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

---

## License

This project is private and proprietary. All rights reserved.

---

**Built with ❤️ for the Bangladeshi Dokan Malik (দোকান মালিক).**