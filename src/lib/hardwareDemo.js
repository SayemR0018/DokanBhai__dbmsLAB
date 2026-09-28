// Hardware shop used only by the home-page tour.
// Kept in the browser. Never inserted into Supabase.

export const DEMO_FLAG = 'dokanbhai-demo'
export const DEMO_DB_KEY = 'dokanbhai-demo-tour'

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()

export function isDemoMode() {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(DEMO_FLAG) === '1'
  } catch {
    return false
  }
}

export function getDemoProfile() {
  return {
    schemaVersion: 1,
    createdAt: daysAgo(60),
    store: {
      name: 'Bhai Bhai Hardware & Construction',
      ownerName: 'Haji Md. Noor Islam',
      region: 'Dhaka North',
      businessType: 'hardware',
      businessLabel: 'হার্ডওয়্যার ও নির্মাণ সামগ্রী',
      currency: 'BDT',
      receiptWidth: '80mm',
      locale: 'bn-BD',
    },
    session: {
      phone: '01719876543',
      displayName: 'Haji Md. Noor Islam',
    },
  }
}

function item(product_id, name, qty, unit_price, unit, amount, serialNumber, warrantyNote) {
  return {
    product_id,
    name,
    qty,
    unit_price,
    unit,
    amount,
    serialNumber: serialNumber || '',
    warrantyNote: warrantyNote || '',
  }
}

export function buildHardwareDb() {
  const biz = 'biz-hw-001'
  return {
    businesses: [{
      id: biz,
      name: 'Bhai Bhai Hardware & Construction (ভাই ভাই হার্ডওয়্যার)',
      business_type: 'hardware',
      owner_user_id: 'usr-owner-001',
      invite_code: 'HW7861',
      address: 'Plot 14, Gabtoli Beribadh Road, Mirpur, Dhaka',
      phone: '01719876543',
      business_id: biz,
      created_at: daysAgo(60),
    }],
    categories: [
      { id: 'cat-hw-1', name: 'রড ও সিমেন্ট (Rod & Cement)', color: '#dc2626', business_id: biz, created_at: daysAgo(60) },
      { id: 'cat-hw-2', name: 'বালু, ইট ও পাথর (Sand, Bricks & Aggregate)', color: '#d97706', business_id: biz, created_at: daysAgo(60) },
      { id: 'cat-hw-3', name: 'পাইপ ও প্লাম্বিং (Pipes & Plumbing)', color: '#0284c7', business_id: biz, created_at: daysAgo(60) },
      { id: 'cat-hw-4', name: 'পাওয়ার টুলস ও মেশিনারি (Power Tools)', color: '#7c3aed', business_id: biz, created_at: daysAgo(60) },
      { id: 'cat-hw-5', name: 'তার, পেরেক ও নাট-বল্টু (Fasteners & Wires)', color: '#4b5563', business_id: biz, created_at: daysAgo(60) },
      { id: 'cat-hw-6', name: 'রং ও কেমিক্যাল (Paints & Waterproofing)', color: '#059669', business_id: biz, created_at: daysAgo(60) },
      { id: 'cat-hw-7', name: 'টিন ও অ্যাঙ্গেল বার (Roofing & MS Flat/Angle)', color: '#0f766e', business_id: biz, created_at: daysAgo(60) },
      { id: 'cat-hw-8', name: 'ইলেকট্রিক ও স্যানিটারি (Electrical & Sanitary)', color: '#ea580c', business_id: biz, created_at: daysAgo(60) },
    ],
    vendors: [
      { id: 'v-hw-1', name: 'BSRM Steels Ltd (বিএসআরএম)', phone: '01711001122', address: 'Ali Mansion, Sadarghat, Dhaka', note: 'Direct mill supplier for 500W rebar', business_id: biz, created_at: daysAgo(58) },
      { id: 'v-hw-2', name: 'Shah Cement Industries', phone: '01711003344', address: 'Gulsan-1, Dhaka', note: 'OPC & PCC cement distributor', business_id: biz, created_at: daysAgo(58) },
      { id: 'v-hw-3', name: 'RFL Plastics & Sanitary', phone: '01711005566', address: 'PRAN-RFL Center, Badda, Dhaka', note: 'uPVC, CPVC pipes & bathroom fittings', business_id: biz, created_at: daysAgo(55) },
      { id: 'v-hw-4', name: 'Berger Paints Bangladesh', phone: '01711007788', address: 'Uttara, Dhaka', note: 'Paints, primers, and distempers', business_id: biz, created_at: daysAgo(55) },
      { id: 'v-hw-5', name: 'Dongcheng Power Tools BD', phone: '01711009900', address: 'Nawabpur Road, Old Dhaka', note: 'Grinders, drill machines & parts warranty', business_id: biz, created_at: daysAgo(50) },
      { id: 'v-hw-6', name: 'Sylhet Local Quarry Depot', phone: '01811002233', address: 'Gabtoli Ghat, Dhaka', note: 'Sylhet red sand & 3/4 stone chips by truck', business_id: biz, created_at: daysAgo(50) },
    ],
    customers: [
      { id: 'c-hw-1', name: 'Engr. Rafiqul Islam (Civil Contractor)', phone: '01712111222', address: 'Sector 10, Uttara, Dhaka', note: '5-Storey Residential Project site', balance: 184500, business_id: biz, created_at: daysAgo(45) },
      { id: 'c-hw-2', name: 'Subal Mistri (Head Plumber & Mason)', phone: '01812333444', address: 'Kallayanpur Pura Basti, Dhaka', note: 'Regular installer, takes small recurring dues', balance: 6800, business_id: biz, created_at: daysAgo(40) },
      { id: 'c-hw-3', name: 'Haji Mokbul Hossain (House Owner)', phone: '01912555666', address: 'Mirpur 1, Block D, Dhaka', note: 'Cash buyer, renovation work', balance: 0, business_id: biz, created_at: daysAgo(30) },
      { id: 'c-hw-4', name: 'Dream Homes Real Estate Ltd', phone: '01612777888', address: 'Road 4, Dhanmondi, Dhaka', note: 'Corporate account, 30-day payment cycle', balance: 425000, business_id: biz, created_at: daysAgo(30) },
      { id: 'c-hw-5', name: 'Kabir Enterprise (Sub-contractor)', phone: '01512999000', address: 'Aminbazar, Savar', note: 'Boundary wall project, irregular payer', balance: 32400, business_id: biz, created_at: daysAgo(20) },
    ],
    products: [
      { id: 'p-hw-01', name: 'Shah Cement Special (PCC)', category_id: 'cat-hw-1', vendor_id: 'v-hw-2', cost_price: 510, sale_price: 545, stock: 320, min_stock: 50, unit: 'bag', serial_tracked: false, warranty_months: 0, note: '50kg moisture-proof bag', business_id: biz, created_at: daysAgo(50) },
      { id: 'p-hw-02', name: 'Bashundhara Cement (OPC)', category_id: 'cat-hw-1', vendor_id: 'v-hw-2', cost_price: 540, sale_price: 575, stock: 15, min_stock: 40, unit: 'bag', serial_tracked: false, warranty_months: 0, note: 'Low Stock: Needs immediate truck order', business_id: biz, created_at: daysAgo(50) },
      { id: 'p-hw-03', name: 'BSRM Xtreme 500W Rod 16mm', category_id: 'cat-hw-1', vendor_id: 'v-hw-1', cost_price: 92000, sale_price: 96500, stock: 4.85, min_stock: 1.5, unit: 'ton', serial_tracked: false, warranty_months: 0, note: 'High strength thermo-mechanically treated', business_id: biz, created_at: daysAgo(50) },
      { id: 'p-hw-04', name: 'BSRM Xtreme 500W Rod 10mm', category_id: 'cat-hw-1', vendor_id: 'v-hw-1', cost_price: 93000, sale_price: 97500, stock: 0.45, min_stock: 1, unit: 'ton', serial_tracked: false, warranty_months: 0, note: 'Critical Low Stock warning', business_id: biz, created_at: daysAgo(50) },
      { id: 'p-hw-05', name: 'Sylhet Coarse Sand (সিলেট লাল বালু)', category_id: 'cat-hw-2', vendor_id: 'v-hw-6', cost_price: 42, sale_price: 55, stock: 850.5, min_stock: 150, unit: 'cft', serial_tracked: false, warranty_months: 0, note: '2.5 FM coarse graded sand', business_id: biz, created_at: daysAgo(48) },
      { id: 'p-hw-06', name: 'Stone Chips 3/4" Down (পাথর কুচি)', category_id: 'cat-hw-2', vendor_id: 'v-hw-6', cost_price: 175, sale_price: 210, stock: 420.25, min_stock: 100, unit: 'cft', serial_tracked: false, warranty_months: 0, note: 'Bholaganj black crushed stone', business_id: biz, created_at: daysAgo(48) },
      { id: 'p-hw-07', name: '1st Class Gas Burnt Auto Bricks', category_id: 'cat-hw-2', vendor_id: 'v-hw-6', cost_price: 11.5, sale_price: 13.5, stock: 5500, min_stock: 1000, unit: 'pcs', serial_tracked: false, warranty_months: 0, note: 'Standard size: 9.5 x 4.5 x 2.75 inch', business_id: biz, created_at: daysAgo(48) },
      { id: 'p-hw-08', name: 'RFL 1" uPVC Class D Pipe', category_id: 'cat-hw-3', vendor_id: 'v-hw-3', cost_price: 18, sale_price: 24, stock: 600, min_stock: 100, unit: 'feet', serial_tracked: false, warranty_months: 0, note: '20 feet per standard length', business_id: biz, created_at: daysAgo(45) },
      { id: 'p-hw-09', name: 'RFL 4" PVC SWR Sewer Pipe', category_id: 'cat-hw-3', vendor_id: 'v-hw-3', cost_price: 55, sale_price: 72, stock: 0, min_stock: 40, unit: 'feet', serial_tracked: false, warranty_months: 0, note: 'Out of Stock Case', business_id: biz, created_at: daysAgo(45) },
      { id: 'p-hw-10', name: 'Brass Ball Valve 1" (ইতালিয়ান)', category_id: 'cat-hw-3', vendor_id: 'v-hw-3', cost_price: 420, sale_price: 520, stock: 45, min_stock: 10, unit: 'pcs', serial_tracked: false, warranty_months: 6, note: '6 Months vendor replacement warranty', business_id: biz, created_at: daysAgo(45) },
      { id: 'p-hw-11', name: 'Dongcheng 26mm Rotary Hammer Drill', category_id: 'cat-hw-4', vendor_id: 'v-hw-5', cost_price: 4800, sale_price: 5600, stock: 6, min_stock: 2, unit: 'pcs', serial_tracked: true, warranty_months: 12, note: 'Includes chisel set, 800W motor', business_id: biz, created_at: daysAgo(40) },
      { id: 'p-hw-12', name: 'Dongcheng 4" Angle Grinder (DSM03-100)', category_id: 'cat-hw-4', vendor_id: 'v-hw-5', cost_price: 2100, sale_price: 2550, stock: 12, min_stock: 3, unit: 'pcs', serial_tracked: true, warranty_months: 12, note: '710W continuous duty grinder', business_id: biz, created_at: daysAgo(40) },
      { id: 'p-hw-13', name: 'Pedrollo 1HP Water Pump (CPM-158)', category_id: 'cat-hw-4', vendor_id: 'v-hw-5', cost_price: 11500, sale_price: 13200, stock: 4, min_stock: 1, unit: 'pcs', serial_tracked: true, warranty_months: 24, note: '2 Years warranty, Italian technology', business_id: biz, created_at: daysAgo(40) },
      { id: 'p-hw-14', name: 'MS Iron Wire Nails 2.5" (লোহার পেরেক)', category_id: 'cat-hw-5', vendor_id: 'v-hw-1', cost_price: 115, sale_price: 135, stock: 142.5, min_stock: 30, unit: 'kg', serial_tracked: false, warranty_months: 0, note: 'Loose weighable nail stock', business_id: biz, created_at: daysAgo(35) },
      { id: 'p-hw-15', name: '20-Gauge GI Binding Wire', category_id: 'cat-hw-5', vendor_id: 'v-hw-1', cost_price: 125, sale_price: 145, stock: 85, min_stock: 20, unit: 'kg', serial_tracked: false, warranty_months: 0, note: 'For tying structural rebar', business_id: biz, created_at: daysAgo(35) },
      { id: 'p-hw-16', name: 'Drywall Gypsum Screws 1.5" (1000 Pcs)', category_id: 'cat-hw-5', vendor_id: 'v-hw-5', cost_price: 380, sale_price: 460, stock: 28, min_stock: 5, unit: 'box', serial_tracked: false, warranty_months: 0, note: 'Black phosphate coated', business_id: biz, created_at: daysAgo(35) },
      { id: 'p-hw-17', name: 'Berger WeatherCoat Smooth (White)', category_id: 'cat-hw-6', vendor_id: 'v-hw-4', cost_price: 410, sale_price: 480, stock: 65, min_stock: 15, unit: 'litre', serial_tracked: false, warranty_months: 0, note: 'Exterior acrylic emulsion', business_id: biz, created_at: daysAgo(30) },
      { id: 'p-hw-18', name: 'Dr. Fixit Super Latex 1kg (লিকুইড)', category_id: 'cat-hw-6', vendor_id: 'v-hw-4', cost_price: 280, sale_price: 340, stock: 50, min_stock: 10, unit: 'pack', serial_tracked: false, warranty_months: 0, note: 'Waterproofing bonding agent', business_id: biz, created_at: daysAgo(30) },
      { id: 'p-hw-19', name: 'PHP 0.32mm Corrugated Tin (ঢেউটিন)', category_id: 'cat-hw-7', vendor_id: 'v-hw-1', cost_price: 5800, sale_price: 6400, stock: 22, min_stock: 5, unit: 'bundle', serial_tracked: false, warranty_months: 0, note: 'Color coated 72 sq ft bundle', business_id: biz, created_at: daysAgo(25) },
      { id: 'p-hw-20', name: 'Plain Galvanized Sheet (26 Gauge)', category_id: 'cat-hw-7', vendor_id: 'v-hw-1', cost_price: 95, sale_price: 120, stock: 180, min_stock: 30, unit: 'gaj', serial_tracked: false, warranty_months: 0, note: 'Roof ridge and flashing cut sheet', business_id: biz, created_at: daysAgo(25) },
    ],
    invoices: [
      {
        id: 'inv-260801-001', invoice_no: 'INV-20260801-01', customer_id: 'c-hw-1', business_id: biz,
        subtotal: 123750, discount: 1750, total: 122000, paid_amount: 50000, due_amount: 72000,
        pay_type: 'credit', note: 'Delivery to Uttara Sec 10 Site via Truck', date: daysAgo(25),
        items: [
          item('p-hw-01', 'Shah Cement Special (PCC)', 100, 545, 'bag', 54500),
          item('p-hw-03', 'BSRM Xtreme 500W Rod 16mm', 0.717, 96500, 'ton', 69250, '', 'Standard Mill Test Certificate Attached'),
        ],
      },
      {
        id: 'inv-260805-002', invoice_no: 'INV-20260805-02', customer_id: 'c-hw-3', business_id: biz,
        subtotal: 14757.5, discount: 257.5, total: 14500, paid_amount: 14500, due_amount: 0,
        pay_type: 'cash', note: 'Full cash payment upon pickup', date: daysAgo(20),
        items: [
          item('p-hw-05', 'Sylhet Coarse Sand (সিলেট লাল বালু)', 250.5, 55, 'cft', 13777.5),
          item('p-hw-14', 'MS Iron Wire Nails 2.5" (লোহার পেরেক)', 7.25, 135, 'kg', 980),
        ],
      },
      {
        id: 'inv-260810-003', invoice_no: 'INV-20260810-03', customer_id: 'c-hw-2', business_id: biz,
        subtotal: 8150, discount: 150, total: 8000, paid_amount: 8000, due_amount: 0,
        pay_type: 'online', note: 'Paid via bKash Merchant TrxID: 9X7A6B11', date: daysAgo(15),
        items: [
          item('p-hw-11', 'Dongcheng 26mm Rotary Hammer Drill', 1, 5600, 'pcs', 5600, 'DC-RH-2026-99410', '12 Months Free Service & Parts Warranty'),
          item('p-hw-12', 'Dongcheng 4" Angle Grinder (DSM03-100)', 1, 2550, 'pcs', 2550, 'DC-AG-2026-11883', '12 Months Official Service Warranty'),
        ],
      },
      {
        id: 'inv-260815-004', invoice_no: 'INV-20260815-04', customer_id: 'c-hw-4', business_id: biz,
        subtotal: 193000, discount: 3000, total: 190000, paid_amount: 0, due_amount: 190000,
        pay_type: 'credit', note: 'Chalan No: 4401 signed by Site Engineer', date: daysAgo(10),
        items: [
          item('p-hw-03', 'BSRM Xtreme 500W Rod 16mm', 2, 96500, 'ton', 193000, '', 'Chalan #4401 (Gate Pass Verified)'),
        ],
      },
      {
        id: 'inv-260820-005', invoice_no: 'INV-20260820-05', customer_id: null, business_id: biz,
        subtotal: 2860, discount: 60, total: 2800, paid_amount: 2800, due_amount: 0,
        pay_type: 'cash', note: 'Counter walk-in cash customer', date: daysAgo(2),
        items: [
          item('p-hw-08', 'RFL 1" uPVC Class D Pipe', 40, 24, 'feet', 960),
          item('p-hw-10', 'Brass Ball Valve 1" (ইতালিয়ান)', 2, 520, 'pcs', 1040, '', '6 Months Replacement Warranty'),
          item('p-hw-18', 'Dr. Fixit Super Latex 1kg (লিকুইড)', 2, 340, 'pack', 680),
          item('p-hw-14', 'MS Iron Wire Nails 2.5" (লোহার পেরেক)', 1.333, 135, 'kg', 180),
        ],
      },
    ],
    payments: [
      { id: 'pay-hw-001', customer_id: 'c-hw-1', amount: 40000, note: 'Bank Check #98820 cleared (Islami Bank)', business_id: biz, date: daysAgo(12) },
      { id: 'pay-hw-002', customer_id: 'c-hw-2', amount: 5000, note: 'Cash deposit against previous plumbing work bill', business_id: biz, date: daysAgo(5) },
      { id: 'pay-hw-003', customer_id: 'c-hw-4', amount: 100000, note: 'RTGS Bank transfer from Dream Homes Account', business_id: biz, date: daysAgo(3) },
    ],
    transactions: [
      { id: 't-hw-01', type: 'sale', customer_id: 'c-hw-1', product_id: 'p-hw-01', product_name: 'Shah Cement Special (PCC)', qty: 100, unit_price: 545, amount: 54500, discount: 0, paid_amount: 22020.2, pay_type: 'credit', note: 'Delivery to Uttara Sec 10 Site', business_id: biz, date: daysAgo(25) },
      { id: 't-hw-02', type: 'sale', customer_id: 'c-hw-1', product_id: 'p-hw-03', product_name: 'BSRM Xtreme 500W Rod 16mm', qty: 0.717, unit_price: 96500, amount: 69250, discount: 0, paid_amount: 27979.8, pay_type: 'credit', note: 'Delivery to Uttara Sec 10 Site', business_id: biz, date: daysAgo(25) },
      { id: 't-hw-03', type: 'sale', customer_id: 'c-hw-3', product_id: 'p-hw-05', product_name: 'Sylhet Coarse Sand (সিলেট লাল বালু)', qty: 250.5, unit_price: 55, amount: 13777.5, discount: 0, paid_amount: 13538, pay_type: 'cash', note: 'Full cash payment upon pickup', business_id: biz, date: daysAgo(20) },
      { id: 't-hw-04', type: 'sale', customer_id: 'c-hw-3', product_id: 'p-hw-14', product_name: 'MS Iron Wire Nails 2.5" (লোহার পেরেক)', qty: 7.25, unit_price: 135, amount: 980, discount: 0, paid_amount: 962, pay_type: 'cash', note: 'Full cash payment upon pickup', business_id: biz, date: daysAgo(20) },
      { id: 't-hw-05', type: 'sale', customer_id: 'c-hw-2', product_id: 'p-hw-11', product_name: 'Dongcheng 26mm Rotary Hammer Drill', qty: 1, unit_price: 5600, amount: 5600, discount: 0, paid_amount: 5496.93, pay_type: 'online', note: 'Paid via bKash', business_id: biz, date: daysAgo(15) },
      { id: 't-hw-06', type: 'sale', customer_id: 'c-hw-2', product_id: 'p-hw-12', product_name: 'Dongcheng 4" Angle Grinder (DSM03-100)', qty: 1, unit_price: 2550, amount: 2550, discount: 0, paid_amount: 2503.07, pay_type: 'online', note: 'Paid via bKash', business_id: biz, date: daysAgo(15) },
      { id: 't-hw-07', type: 'sale', customer_id: 'c-hw-4', product_id: 'p-hw-03', product_name: 'BSRM Xtreme 500W Rod 16mm', qty: 2, unit_price: 96500, amount: 193000, discount: 0, paid_amount: 0, pay_type: 'credit', note: 'Chalan No: 4401', business_id: biz, date: daysAgo(10) },
      { id: 't-hw-08', type: 'sale', customer_id: null, product_id: 'p-hw-08', product_name: 'RFL 1" uPVC Class D Pipe', qty: 40, unit_price: 24, amount: 960, discount: 0, paid_amount: 939.86, pay_type: 'cash', note: 'Counter walk-in cash customer', business_id: biz, date: daysAgo(2) },
      { id: 't-hw-09', type: 'sale', customer_id: null, product_id: 'p-hw-10', product_name: 'Brass Ball Valve 1" (ইতালিয়ান)', qty: 2, unit_price: 520, amount: 1040, discount: 0, paid_amount: 1018.18, pay_type: 'cash', note: 'Counter walk-in cash customer', business_id: biz, date: daysAgo(2) },
      { id: 't-hw-10', type: 'sale', customer_id: null, product_id: 'p-hw-18', product_name: 'Dr. Fixit Super Latex 1kg (লিকুইড)', qty: 2, unit_price: 340, amount: 680, discount: 0, paid_amount: 665.73, pay_type: 'cash', note: 'Counter walk-in cash customer', business_id: biz, date: daysAgo(2) },
      { id: 't-hw-11', type: 'sale', customer_id: null, product_id: 'p-hw-14', product_name: 'MS Iron Wire Nails 2.5" (লোহার পেরেক)', qty: 1.333, unit_price: 135, amount: 180, discount: 0, paid_amount: 176.23, pay_type: 'cash', note: 'Counter walk-in cash customer', business_id: biz, date: daysAgo(2) },
      { id: 't-hw-12', type: 'payment', customer_id: 'c-hw-1', product_id: null, product_name: null, qty: 0, unit_price: 0, amount: 40000, discount: 0, paid_amount: 40000, pay_type: 'cash', note: 'Bank Check #98820 cleared (Islami Bank)', business_id: biz, date: daysAgo(12) },
      { id: 't-hw-13', type: 'payment', customer_id: 'c-hw-2', product_id: null, product_name: null, qty: 0, unit_price: 0, amount: 5000, discount: 0, paid_amount: 5000, pay_type: 'cash', note: 'Cash deposit against previous plumbing work bill', business_id: biz, date: daysAgo(5) },
      { id: 't-hw-14', type: 'payment', customer_id: 'c-hw-4', product_id: null, product_name: null, qty: 0, unit_price: 0, amount: 100000, discount: 0, paid_amount: 100000, pay_type: 'cash', note: 'RTGS Bank transfer from Dream Homes Account', business_id: biz, date: daysAgo(3) },
    ],
  }
}

function notifyDemo() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('dokanbhai:profilechange'))
  window.dispatchEvent(new CustomEvent('dokanbhai:dbchange'))
}

export function enterDemo() {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(DEMO_FLAG, '1')
  localStorage.setItem(DEMO_DB_KEY, JSON.stringify(buildHardwareDb()))
  notifyDemo()
}

export function exitDemo() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(DEMO_FLAG)
  localStorage.removeItem(DEMO_DB_KEY)
  notifyDemo()
}
