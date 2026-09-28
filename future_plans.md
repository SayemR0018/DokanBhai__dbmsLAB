# DokanBhai (দোকান ভাই) — Product Roadmap & Strategic Future Plans

## 1. Executive Summary & Strategic Vision
DokanBhai is designed to evolve from a standalone single-counter retail POS into an interconnected retail operating system and hyperlocal supply chain intelligence network. By building upon the current offline-first, multi-vertical architecture (Groceries, Electronics, Hardware, Builders Supply), the system will bridge the gap between grassroots neighborhood merchants and regional distributors/FMCG conglomerates.

---

## 2. Codebase-Aligned Evolution Roadmap

### Phase 1: Native Mobile Transformation (APK-First Strategy)
* **Android APK Packaging:** Wrap the current React/Vite responsive frontend into a lightweight native Android APK using Capacitor or Trusted Web Activity (TWA) optimized for entry-level Android devices (2GB RAM, Android 8.0+).
* **Native Bluetooth ESC/POS Printing:** Replace standard browser `window.print()` with native Bluetooth and USB thermal printer drivers for instant, one-tap 58mm/80mm receipt generation.
* **Camera-Based Barcode & QR Scanning:** Implement device camera scanning directly into `NewSaleScreen.jsx` and `InventoryScreen.jsx` for fast SKU lookup, stock intake, and bKash/Nagad merchant QR code payments.
* **Resilient Offline Sync Engine:** Upgrade the existing `localDb.js` event bus to a background worker queue (IndexedDB/SQLite) with automatic synchronization and conflict resolution when reconnecting to Supabase PostgreSQL.

### Phase 2: Grassroots Merchant Pilots & Local Dokan Adoption
* **Hyperlocal Field Trials:** Pilot the application across 50+ local neighborhood Mudi Dokans, hardware suppliers, and electrical shops in active urban/semi-urban commercial hubs.
* **Frictionless Onboarding Refinement:** Further streamline the phone-first setup flow so non-tech-savvy merchants can start billing and recording Baki within 30 seconds of installation.
* **SMS Gateway Integration:** Integrate local Bangladesh SMS aggregators (e.g., SSL Wireless, Greenweb) to automate Bengali debt reminders (`মনে করান`) and digital SMS receipts.
* **Merchant Community & Feedback Loop:** Establish local merchant support channels to collect UX feedback, track feature requests, and iterate on counter workflows.

### Phase 3: Supplier Integration & Area-Wise Supply Chain Intelligence
* **Automated Low-Stock Restocking:** Leverage existing `min_stock` triggers across retail clusters to automatically compile consolidated purchase orders for local vendors and distributors.
* **Hyperlocal Demand & Consumption Analytics:** Aggregate anonymized sales velocity data to provide regional distributors with actionable territory insights (e.g., daily consumption rates of edible oil, rice, cement, or electrical wiring by ward/district).
* **Vendor & Distributor Credit Ledger (*Mahajan Baki*):** Expand the current `vendors` module to track trade credit, deliveries, and payment settlements between store owners and delivery van representatives.

### Phase 4: FMCG & Enterprise Supplier Intelligence Portal
* **DokanBhai Enterprise Portal:** Build a dedicated B2B analytical web portal tailored for FMCG corporate brands and national manufacturers (e.g., City Group, ACI, Meghna Group, PRAN-RFL, Walton, BSRM).
* **Real-Time Secondary Sales Visibility:** Give enterprise brands live off-take metrics, stock depletion speeds, and retail price compliance straight from the neighborhood counter level.
* **Direct Trade Promotions & Schemes:** Enable FMCG brands to push digital trade discounts, retailer incentives, and new product launches directly to merchant POS screens.
* **Predictive Inventory Forecasting:** Apply machine learning models to historical sales data to forecast regional demand surges (e.g., Ramadan, Eid, seasonal construction cycles) and optimize distributor logistics.

---

## 3. Technology Evolution Matrix

| Milestone | Target Platform | Data & Backend Layer | Target Stakeholders | Core Value Delivered |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Android APK + PWA | Supabase PostgreSQL + SQLite Cache | Shop Owners & Counter Cashiers | Native performance, Bluetooth printing, fast barcode POS |
| **Phase 2** | Android APK | Supabase PostgreSQL + Cloud Sync | Local Retail Merchant Clusters | Real-world validation, automated SMS reminders, fast adoption |
| **Phase 3** | Mobile + Web Portal | PostgreSQL + Analytics Views | Retailers & Regional Distributors | Area-level restocking, trade credit ledger, demand insights |
| **Phase 4** | Enterprise Web Suite | Distributed PostgreSQL + Event Streaming | FMCG Brands & Corporate Suppliers | Real-time secondary sales data, predictive forecasting, targeted promos |