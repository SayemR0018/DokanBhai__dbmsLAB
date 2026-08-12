// Vertical (business-type) catalog for DokanBhai.
// Each business type carries its own sample categories, vendors, and products so a
// new shop can boot with a ready-made catalog. The Mudi seed deliberately mirrors
// the original localDb seed so existing users see no churn when no profile exists.

export const BUSINESS_TYPES = [
  {
    key: 'mudi',
    label: 'মুদি ও জেনারেল স্টোর',
    labelEn: 'Grocery / Mudi Dokan',
    blurb: 'চাল, ডাল, তেল, মশলা, স্ন্যাক্স ও দৈনন্দিন মুদি মালামাল।',
    icon: '🛒',
  },
  {
    key: 'electronics',
    label: 'ইলেকট্রনিক্স ও ইলেকট্রিক',
    labelEn: 'Electronics & Electrical',
    blurb: 'LED, সুইচ, তার, ফ্যান, মাল্টিপ্লাগ ও ছোট ইলেকট্রনিক্স।',
    icon: '💡',
  },
  {
    key: 'hardware',
    label: 'হার্ডওয়্যার ও কনস্ট্রাকশন',
    labelEn: 'Hardware & Builders Supply',
    blurb: 'রড, সিমেন্ট, পাইপ, নেইলস, পেইন্ট ও নির্মাণ সামগ্রী।',
    icon: '🏗️',
  },
  {
    key: 'general',
    label: 'সাধারণ রিটেইল',
    labelEn: 'General Retail',
    blurb: 'যেকোন মিশ্র পণ্য — পোশাক, স্টেশনারি, টিফিন ও অন্যান্য।',
    icon: '🏪',
  },
]

export const getBusinessType = (key) => BUSINESS_TYPES.find((b) => b.key === key) || BUSINESS_TYPES[0]

// ---------------------------------------------------------------------------
// CATEGORIES_BY_TYPE
// ---------------------------------------------------------------------------
export const CATEGORIES_BY_TYPE = {
  mudi: [
    { name: 'চাল ও আটা / Rice & Flour', color: '#0f9d58' },
    { name: 'তেল ও মসলা / Oil & Spices', color: '#ca8a04' },
    { name: 'চা ও পানীয় / Tea & Drinks', color: '#0891b2' },
    { name: 'নুন-চিনি / Salt & Sugar', color: '#94a3b8' },
    { name: 'দুগ্ধজাত / Dairy', color: '#16a34a' },
    { name: 'গৃহস্থালী / Household', color: '#2563eb' },
    { name: 'স্ন্যাক্স / Snacks', color: '#9333ea' },
  ],
  electronics: [
    { name: 'LED ও লাইটিং / Lighting', color: '#facc15' },
    { name: 'সুইচ ও সকেট / Switches', color: '#0ea5e9' },
    { name: 'তার ও ক্যাবল / Cables', color: '#1e293b' },
    { name: 'ফ্যান ও হিটার / Fans', color: '#0f9d58' },
    { name: 'মাল্টিপ্লাগ / Multiplugs', color: '#9333ea' },
    { name: 'ব্যাটারি / Batteries', color: '#dc2626' },
    { name: 'ছোট ইলেকট্রনিক্স / Gadgets', color: '#2563eb' },
  ],
  hardware: [
    { name: 'রড ও সিমেন্ট / Rod & Cement', color: '#64748b' },
    { name: 'পাইপ ও ফিটিংস / Pipes', color: '#0ea5e9' },
    { name: 'নেইলস ও স্ক্রু / Nails', color: '#a16207' },
    { name: 'পেইন্ট / Paints', color: '#db2777' },
    { name: 'স্যান্ড ও স্টোন / Sand & Stone', color: '#ca8a04' },
    { name: 'টুলস / Tools', color: '#334155' },
    { name: 'টাইলস ও স্যানিটারি / Tiles', color: '#0f9d58' },
  ],
  general: [
    { name: 'পণ্য মিক্স / Mixed Goods', color: '#0f9d58' },
    { name: 'প্যাকেজড / Packaged', color: '#2563eb' },
    { name: 'পোশাক / Apparel', color: '#9333ea' },
    { name: 'গৃহস্থালী / Household', color: '#0891b2' },
    { name: 'স্টেশনারি / Stationery', color: '#dc2626' },
    { name: 'টিফিন ও স্ন্যাক্স / Tiffin', color: '#ca8a04' },
  ],
}

// ---------------------------------------------------------------------------
// VENDORS_BY_TYPE
// ---------------------------------------------------------------------------
export const VENDORS_BY_TYPE = {
  mudi: [
    { name: 'City Group', phone: '01711-000001', address: 'Tejgaon, Dhaka', note: 'Edible oil & flour supplier' },
    { name: 'ACI Consumer Brands', phone: '01711-000002', address: 'Motijheel, Dhaka', note: 'Salt, spices & personal care' },
    { name: 'Meghna Group of Industries', phone: '01711-000003', address: 'Gazipur', note: 'Atta & flour distributor' },
    { name: 'PRAN-RFL Group', phone: '01711-000004', address: 'Habiganj', note: 'Juices, snacks & dairy' },
    { name: 'Square Food & Beverage', phone: '01711-000005', address: 'Pabna', note: 'Snacks & beverages' },
  ],
  electronics: [
    { name: 'Walton', phone: '01713-100100', address: 'Bashundhara, Dhaka', note: 'LED, fan & home appliances' },
    { name: 'Super Star', phone: '01713-200200', address: 'Elephant Road, Dhaka', note: 'Switches, sockets & MCBs' },
    { name: 'BRB Cables', phone: '01713-300300', address: 'Tongi, Gazipur', note: 'Industrial & household cables' },
    { name: 'Vision Electronics', phone: '01713-400400', address: 'Nawabpur, Dhaka', note: 'LED bulbs & lighting' },
    { name: 'Havells Bangladesh', phone: '01713-500500', address: 'Gulshan, Dhaka', note: 'Wires & switches' },
    { name: 'MK Battery', phone: '01713-600600', address: 'Chittagong', note: 'Automotive & inverter batteries' },
  ],
  hardware: [
    { name: 'BSRM', phone: '01715-100100', address: 'Chittagong', note: 'MS rod & steel' },
    { name: 'Crown Cement', phone: '01715-200200', address: 'Munshiganj', note: 'OPC & PCC cement' },
    { name: 'RFL Plastics', phone: '01715-300300', address: 'Narayanganj', note: 'PVC pipes & fittings' },
    { name: 'Berger Paints Bangladesh', phone: '01715-400400', address: 'Dhaka', note: 'Paints & coatings' },
    { name: 'Concord Construction Supply', phone: '01715-500500', address: 'Gulshan, Dhaka', note: 'Sand, stone & aggregates' },
  ],
  general: [
    { name: 'Local Wholesale House', phone: '01717-100100', address: 'Old Dhaka', note: 'Mixed goods wholesale' },
    { name: 'Karim Sons', phone: '01717-200200', address: 'New Market, Dhaka', note: 'Apparel & fabrics' },
    { name: 'BCB (Bangladesh Chemical)', phone: '01717-300300', address: 'Tongi', note: 'Cosmetics & household' },
    { name: 'PRAN', phone: '01717-400400', address: 'Habiganj', note: 'Snacks & beverages' },
    { name: 'RFL', phone: '01717-500500', address: 'Narayanganj', note: 'Plastics & housewares' },
  ],
}

// ---------------------------------------------------------------------------
// PRODUCTS_BY_TYPE
// Each product has businessKey → categoryName → vendorName mappings that are
// resolved to IDs by seedFor() at first run. Optional flags: serialTracked,
// warrantyMonths.
// ---------------------------------------------------------------------------
export const PRODUCTS_BY_TYPE = {
  mudi: [
    { name: 'Miniket Rice (Premium)',  category: 'চাল ও আটা / Rice & Flour', vendor: 'City Group', cost_price: 58, sale_price: 65,  stock: 250, min_stock: 50, unit: 'kg' },
    { name: 'Nazirshail Rice 5kg',      category: 'চাল ও আটা / Rice & Flour', vendor: 'Meghna Group of Industries', cost_price: 320, sale_price: 380, stock: 40, min_stock: 10, unit: 'pack' },
    { name: 'Pushti Atta 2kg',          category: 'চাল ও আটা / Rice & Flour', vendor: 'Meghna Group of Industries', cost_price: 110, sale_price: 135, stock: 80, min_stock: 20, unit: 'pack' },
    { name: 'Teer Soyabean Oil 5L',     category: 'তেল ও মশলা / Oil & Spices', vendor: 'City Group', cost_price: 950, sale_price: 1050, stock: 60, min_stock: 12, unit: 'litre' },
    { name: 'ACI Pure Salt 1kg',        category: 'নুন-চিনি / Salt & Sugar',  vendor: 'ACI Consumer Brands', cost_price: 28, sale_price: 35, stock: 240, min_stock: 40, unit: 'pcs' },
    { name: 'Deshi Masoor Dal 1kg',     category: 'তেল ও মশলা / Oil & Spices', vendor: 'ACI Consumer Brands', cost_price: 130, sale_price: 160, stock: 45, min_stock: 15, unit: 'kg' },
    { name: 'Ispahani Mirzapore Tea 400g', category: 'চা ও পানীয় / Tea & Drinks', vendor: 'ACI Consumer Brands', cost_price: 220, sale_price: 260, stock: 35, min_stock: 10, unit: 'pack' },
    { name: 'PRAN Mango Juice 1L',      category: 'চা ও পানীয় / Tea & Drinks', vendor: 'PRAN-RFL Group', cost_price: 95,  sale_price: 120, stock: 95, min_stock: 25, unit: 'pcs' },
    { name: 'Dano Daily Pushti Milk Powder 1kg', category: 'দুগ্ধজাত / Dairy', vendor: 'ACI Consumer Brands', cost_price: 580, sale_price: 650, stock: 18, min_stock: 10, unit: 'pack' },
    { name: 'Rin Washing Powder 1kg',   category: 'গৃহস্থালী / Household',    vendor: 'ACI Consumer Brands', cost_price: 175, sale_price: 210, stock: 65, min_stock: 15, unit: 'pcs' },
    { name: 'Bombay Sweets Chanachur 500g', category: 'স্ন্যাক্স / Snacks', vendor: 'Square Food & Beverage', cost_price: 110, sale_price: 140, stock: 55, min_stock: 15, unit: 'pack' },
  ],
  electronics: [
    { name: 'LED Bulb 9W (Vision)',     category: 'LED ও লাইটিং / Lighting',  vendor: 'Vision Electronics', cost_price: 180, sale_price: 250, stock: 80, min_stock: 20, unit: 'pcs', serialTracked: true, warrantyMonths: 12 },
    { name: 'LED Bulb 15W (Super Star)', category: 'LED ও লাইটিং / Lighting', vendor: 'Super Star', cost_price: 280, sale_price: 380, stock: 60, min_stock: 15, unit: 'pcs', serialTracked: true, warrantyMonths: 12 },
    { name: '1-Gang Switch (Havells)',  category: 'সুইচ ও সকেট / Switches',   vendor: 'Havells Bangladesh', cost_price: 55, sale_price: 80, stock: 220, min_stock: 50, unit: 'pcs' },
    { name: '3-Gang Switch (Havells)',  category: 'সুইচ ও সকেট / Switches',   vendor: 'Havells Bangladesh', cost_price: 140, sale_price: 200, stock: 120, min_stock: 30, unit: 'pcs' },
    { name: 'Multiplug 3-Gang (Super Star)', category: 'মাল্টিপ্লাগ / Multiplugs', vendor: 'Super Star', cost_price: 240, sale_price: 350, stock: 70, min_stock: 15, unit: 'pcs' },
    { name: 'BRB Cable 1.5mm 90m Roll', category: 'তার ও ক্যাবল / Cables',  vendor: 'BRB Cables', cost_price: 2300, sale_price: 2800, stock: 30, min_stock: 8, unit: 'box' },
    { name: 'Havells Wire 1mm 100m',    category: 'তার ও ক্যাবল / Cables',     vendor: 'Havells Bangladesh', cost_price: 1900, sale_price: 2400, stock: 25, min_stock: 8, unit: 'box' },
    { name: 'Walton Ceiling Fan 56"',   category: 'ফ্যান ও হিটার / Fans',     vendor: 'Walton', cost_price: 3500, sale_price: 4200, stock: 14, min_stock: 4, unit: 'pcs', serialTracked: true, warrantyMonths: 24 },
    { name: 'Walton Rechargeable Fan',  category: 'ফ্যান ও হিটার / Fans',     vendor: 'Walton', cost_price: 2200, sale_price: 2800, stock: 10, min_stock: 3, unit: 'pcs', serialTracked: true, warrantyMonths: 6 },
    { name: 'MK Battery 12V Inverter',  category: 'ব্যাটারি / Batteries',     vendor: 'MK Battery', cost_price: 9800, sale_price: 11500, stock: 9, min_stock: 3, unit: 'pcs', serialTracked: true, warrantyMonths: 18 },
    { name: 'Vision LED Tube Light 18W', category: 'LED ও লাইটিং / Lighting', vendor: 'Vision Electronics', cost_price: 320, sale_price: 450, stock: 50, min_stock: 12, unit: 'pcs', serialTracked: true, warrantyMonths: 12 },
  ],
  hardware: [
    { name: 'BSRM Deformed Rod 10mm',  category: 'রড ও সিমেন্ট / Rod & Cement', vendor: 'BSRM', cost_price: 88000, sale_price: 92000, stock: 6, min_stock: 2, unit: 'ton', serialTracked: true },
    { name: 'BSRM Deformed Rod 12mm',  category: 'রড ও সিমেন্ট / Rod & Cement', vendor: 'BSRM', cost_price: 88000, sale_price: 92500, stock: 5, min_stock: 2, unit: 'ton', serialTracked: true },
    { name: 'Crown Cement 50kg Bag',   category: 'রড ও সিমেন্ট / Rod & Cement', vendor: 'Crown Cement', cost_price: 510, sale_price: 560, stock: 220, min_stock: 40, unit: 'bag' },
    { name: 'Holcim Cement 50kg Bag',  category: 'রড ও সিমেন্ট / Rod & Cement', vendor: 'Crown Cement', cost_price: 540, sale_price: 595, stock: 180, min_stock: 40, unit: 'bag' },
    { name: 'RFL PVC Pipe 1" (10ft)',  category: 'পাইপ ও ফিটিংস / Pipes', vendor: 'RFL Plastics', cost_price: 230, sale_price: 290, stock: 120, min_stock: 30, unit: 'feet' },
    { name: 'RFL PVC Pipe 2" (10ft)',  category: 'পাইপ ও ফিটিংস / Pipes', vendor: 'RFL Plastics', cost_price: 540, sale_price: 650, stock: 80, min_stock: 20, unit: 'feet' },
    { name: 'Concrete Nails 3"',       category: 'নেইলস ও স্ক্রু / Nails', vendor: 'RFL Plastics', cost_price: 95, sale_price: 130, stock: 60, min_stock: 20, unit: 'kg' },
    { name: 'Wood Screws Assorted 1kg', category: 'নেইলস ও স্ক্রু / Nails', vendor: 'RFL Plastics', cost_price: 220, sale_price: 280, stock: 45, min_stock: 15, unit: 'kg' },
    { name: 'Berger Robbialac 4L',     category: 'পেইন্ট / Paints',         vendor: 'Berger Paints Bangladesh', cost_price: 1600, sale_price: 1850, stock: 22, min_stock: 6, unit: 'pcs' },
    { name: 'Sand (Sylhet)',           category: 'স্যান্ড ও স্টোন / Sand & Stone', vendor: 'Concord Construction Supply', cost_price: 70, sale_price: 90, stock: 5000, min_stock: 200, unit: 'cft' },
    { name: 'Aggregate Stone 3/4"',    category: 'স্যান্ড ও স্টোন / Sand & Stone', vendor: 'Concord Construction Supply', cost_price: 110, sale_price: 140, stock: 3500, min_stock: 200, unit: 'cft' },
  ],
  general: [
    { name: 'Facial Tissue Box',        category: 'পণ্য মিক্স / Mixed Goods', vendor: 'Local Wholesale House', cost_price: 65, sale_price: 90, stock: 90, min_stock: 25, unit: 'pcs' },
    { name: 'Biscuit (Mixed Pack)',     category: 'প্যাকেজড / Packaged', vendor: 'PRAN', cost_price: 35, sale_price: 50, stock: 120, min_stock: 30, unit: 'pack' },
    { name: 'Bottled Water 1.5L',      category: 'পণ্য মিক্স / Mixed Goods', vendor: 'PRAN', cost_price: 18, sale_price: 30, stock: 180, min_stock: 36, unit: 'pcs' },
    { name: 'Men\'s T-Shirt (M)',         category: 'পোশাক / Apparel', vendor: 'Karim Sons', cost_price: 220, sale_price: 350, stock: 28, min_stock: 8, unit: 'pcs' },
    { name: 'Lungi (Cotton)',            category: 'পোশাক / Apparel', vendor: 'Karim Sons', cost_price: 280, sale_price: 420, stock: 20, min_stock: 6, unit: 'pcs' },
    { name: 'Notebook (200 pages)',     category: 'স্টেশনারি / Stationery', vendor: 'Local Wholesale House', cost_price: 55, sale_price: 80, stock: 60, min_stock: 20, unit: 'pcs' },
    { name: 'Ball Pen (Box of 12)',     category: 'স্টেশনারি / Stationery', vendor: 'Local Wholesale House', cost_price: 90, sale_price: 130, stock: 45, min_stock: 12, unit: 'box' },
    { name: 'Plastic Bucket (15L)',     category: 'গৃহস্থালী / Household', vendor: 'RFL', cost_price: 220, sale_price: 290, stock: 30, min_stock: 8, unit: 'pcs' },
    { name: 'Tiffin Box (3-Compartment)', category: 'টিফিন ও স্ন্যাক্স / Tiffin', vendor: 'RFL', cost_price: 90, sale_price: 140, stock: 40, min_stock: 10, unit: 'pcs' },
  ],
}

// ---------------------------------------------------------------------------
// seedFor - Apply vertical seed to a localDb-like API (must expose insert, raw).
// Only seeds if the target table is empty (idempotent).
// ---------------------------------------------------------------------------
export function seedFor(db, type) {
  const biz = getBusinessType(type)
  if (!biz) return
  const categories = CATEGORIES_BY_TYPE[type] || []
  const vendors = VENDORS_BY_TYPE[type] || []
  const products = PRODUCTS_BY_TYPE[type] || []

  // Update or insert the single business row.
  const raw = db.raw() || {}
  if (raw.businesses && raw.businesses.length > 0) {
    raw.businesses[0] = {
      ...raw.businesses[0],
      name: biz.label,
      address: '',
      phone: '',
    }
  }

  // Categories
  if (db.list('categories').length === 0) {
    for (const c of categories) {
      db.insert('categories', { name: c.name, color: c.color })
    }
  }
  // Vendors
  if (db.list('vendors').length === 0) {
    for (const v of vendors) {
      db.insert('vendors', { name: v.name, phone: v.phone, address: v.address, note: v.note })
    }
  }
  // Products
  if (db.list('products').length === 0) {
    const catMap = new Map(db.list('categories').map((c) => [c.name, c.id]))
    const venMap = new Map(db.list('vendors').map((v) => [v.name, v.id]))
    for (const p of products) {
      const payload = {
        name: p.name,
        category_id: catMap.get(p.category) || null,
        vendor_id: venMap.get(p.vendor) || null,
        cost_price: p.cost_price,
        sale_price: p.sale_price,
        stock: p.stock,
        min_stock: p.min_stock,
        unit: p.unit,
      }
      if (p.serialTracked) payload.serialTracked = true
      if (p.warrantyMonths) payload.warrantyMonths = p.warrantyMonths
      db.insert('products', payload)
    }
  }
}
