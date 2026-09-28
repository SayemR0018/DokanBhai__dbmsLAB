-- =====================================================================
-- DokanBhai demo shop seed
-- Shop: Bhai Bhai Hardware & Construction
-- Login phone: 01719876543
-- Owner: Haji Md. Noor Islam
--
-- Run this AFTER DokanBhai.sql. It is safe to run again: the demo shop
-- is removed and inserted once more. New real shops are not touched.
-- business_id is the shop phone, which is what x-shop-phone / RLS uses.
-- =====================================================================

begin;

delete from sale_items
 where invoice_id in (select id from invoices where business_id = '01719876543');

delete from transactions where business_id = '01719876543';
delete from payments where business_id = '01719876543';
delete from invoices where business_id = '01719876543';
delete from products where business_id = '01719876543';
delete from customers where business_id = '01719876543';
delete from vendors where business_id = '01719876543';
delete from categories where business_id = '01719876543';
delete from dokan_profile where session_phone = '01719876543' or id = '01719876543';
delete from businesses where phone = '01719876543' or id = '01719876543';

insert into businesses (
  id, name, business_type, owner_user_id, invite_code, address, phone, created_at
) values (
  '01719876543',
  'Bhai Bhai Hardware & Construction (ভাই ভাই হার্ডওয়্যার)',
  'hardware',
  '01719876543',
  'HW7861',
  'Plot 14, Gabtoli Beribadh Road, Mirpur, Dhaka',
  '01719876543',
  now() - interval '60 days'
);

insert into dokan_profile (
  id, schema_version, store_name, owner_name, region, business_type, business_label,
  currency, receipt_width, locale, session_phone, created_at
) values (
  '01719876543',
  1,
  'Bhai Bhai Hardware & Construction',
  'Haji Md. Noor Islam',
  'Dhaka North',
  'hardware',
  'হার্ডওয়্যার ও কনস্ট্রাকশন',
  'BDT',
  '80mm',
  'bn-BD',
  '01719876543',
  now() - interval '60 days'
);

insert into categories (id, name, color, business_id, created_at) values
  ('cat-hw-1', 'রড ও সিমেন্ট (Rod & Cement)', '#dc2626', '01719876543', now() - interval '60 days'),
  ('cat-hw-2', 'বালু, ইট ও পাথর (Sand, Bricks & Aggregate)', '#d97706', '01719876543', now() - interval '60 days'),
  ('cat-hw-3', 'পাইপ ও প্লাম্বিং (Pipes & Plumbing)', '#0284c7', '01719876543', now() - interval '60 days'),
  ('cat-hw-4', 'পাওয়ার টুলস ও মেশিনারি (Power Tools)', '#7c3aed', '01719876543', now() - interval '60 days'),
  ('cat-hw-5', 'তার, পেরেক ও নাট-বল্টু (Fasteners & Wires)', '#4b5563', '01719876543', now() - interval '60 days'),
  ('cat-hw-6', 'রং ও কেমিক্যাল (Paints & Waterproofing)', '#059669', '01719876543', now() - interval '60 days'),
  ('cat-hw-7', 'টিন ও অ্যাঙ্গেল বার (Roofing & MS Flat/Angle)', '#0f766e', '01719876543', now() - interval '60 days'),
  ('cat-hw-8', 'ইলেকট্রিক ও স্যানিটারি (Electrical & Sanitary)', '#ea580c', '01719876543', now() - interval '60 days');

insert into vendors (id, name, phone, address, note, business_id, created_at) values
  ('v-hw-1', 'BSRM Steels Ltd (বিএসআরএম)', '01711001122', 'Ali Mansion, Sadarghat, Dhaka', 'Direct mill supplier for 500W rebar', '01719876543', now() - interval '58 days'),
  ('v-hw-2', 'Shah Cement Industries', '01711003344', 'Gulsan-1, Dhaka', 'OPC & PCC cement distributor', '01719876543', now() - interval '58 days'),
  ('v-hw-3', 'RFL Plastics & Sanitary', '01711005566', 'PRAN-RFL Center, Badda, Dhaka', 'uPVC, CPVC pipes & bathroom fittings', '01719876543', now() - interval '55 days'),
  ('v-hw-4', 'Berger Paints Bangladesh', '01711007788', 'Uttara, Dhaka', 'Paints, primers, and distempers', '01719876543', now() - interval '55 days'),
  ('v-hw-5', 'Dongcheng Power Tools BD', '01711009900', 'Nawabpur Road, Old Dhaka', 'Grinders, drill machines & parts warranty', '01719876543', now() - interval '50 days'),
  ('v-hw-6', 'Sylhet Local Quarry Depot', '01811002233', 'Gabtoli Ghat, Dhaka', 'Sylhet red sand & 3/4 stone chips by truck', '01719876543', now() - interval '50 days');

insert into customers (id, name, phone, address, note, balance, business_id, created_at) values
  ('c-hw-1', 'Engr. Rafiqul Islam (Civil Contractor)', '01712111222', 'Sector 10, Uttara, Dhaka', '5-Storey Residential Project site', 184500, '01719876543', now() - interval '45 days'),
  ('c-hw-2', 'Subal Mistri (Head Plumber & Mason)', '01812333444', 'Kallayanpur Pura Basti, Dhaka', 'Regular installer, takes small recurring dues', 6800, '01719876543', now() - interval '40 days'),
  ('c-hw-3', 'Haji Mokbul Hossain (House Owner)', '01912555666', 'Mirpur 1, Block D, Dhaka', 'Cash buyer, renovation work', 0, '01719876543', now() - interval '30 days'),
  ('c-hw-4', 'Dream Homes Real Estate Ltd', '01612777888', 'Road 4, Dhanmondi, Dhaka', 'Corporate account, 30-day payment cycle', 425000, '01719876543', now() - interval '30 days'),
  ('c-hw-5', 'Kabir Enterprise (Sub-contractor)', '01512999000', 'Aminbazar, Savar', 'Boundary wall project, irregular payer', 32400, '01719876543', now() - interval '20 days');

insert into products (
  id, name, category_id, vendor_id, cost_price, sale_price, stock, min_stock,
  unit, serial_tracked, warranty_months, note, business_id, created_at
) values
  ('p-hw-01', 'Shah Cement Special (PCC)', 'cat-hw-1', 'v-hw-2', 510, 545, 320, 50, 'bag', false, 0, '50kg moisture-proof bag', '01719876543', now() - interval '50 days'),
  ('p-hw-02', 'Bashundhara Cement (OPC)', 'cat-hw-1', 'v-hw-2', 540, 575, 15, 40, 'bag', false, 0, 'Low Stock: Needs immediate truck order', '01719876543', now() - interval '50 days'),
  ('p-hw-03', 'BSRM Xtreme 500W Rod 16mm', 'cat-hw-1', 'v-hw-1', 92000, 96500, 4.850, 1.500, 'ton', false, 0, 'High strength thermo-mechanically treated', '01719876543', now() - interval '50 days'),
  ('p-hw-04', 'BSRM Xtreme 500W Rod 10mm', 'cat-hw-1', 'v-hw-1', 93000, 97500, 0.450, 1.000, 'ton', false, 0, 'Critical Low Stock warning', '01719876543', now() - interval '50 days'),
  ('p-hw-05', 'Sylhet Coarse Sand (সিলেট লাল বালু)', 'cat-hw-2', 'v-hw-6', 42, 55, 850.500, 150, 'cft', false, 0, '2.5 FM coarse graded sand', '01719876543', now() - interval '48 days'),
  ('p-hw-06', 'Stone Chips 3/4" Down (পাথর কুচি)', 'cat-hw-2', 'v-hw-6', 175, 210, 420.250, 100, 'cft', false, 0, 'Bholaganj black crushed stone', '01719876543', now() - interval '48 days'),
  ('p-hw-07', '1st Class Gas Burnt Auto Bricks', 'cat-hw-2', 'v-hw-6', 11.50, 13.50, 5500, 1000, 'pcs', false, 0, 'Standard size: 9.5 x 4.5 x 2.75 inch', '01719876543', now() - interval '48 days'),
  ('p-hw-08', 'RFL 1" uPVC Class D Pipe', 'cat-hw-3', 'v-hw-3', 18, 24, 600, 100, 'feet', false, 0, '20 feet per standard length', '01719876543', now() - interval '45 days'),
  ('p-hw-09', 'RFL 4" PVC SWR Sewer Pipe', 'cat-hw-3', 'v-hw-3', 55, 72, 0, 40, 'feet', false, 0, 'Out of Stock Case', '01719876543', now() - interval '45 days'),
  ('p-hw-10', 'Brass Ball Valve 1" (ইতালিয়ান)', 'cat-hw-3', 'v-hw-3', 420, 520, 45, 10, 'pcs', false, 6, '6 Months vendor replacement warranty', '01719876543', now() - interval '45 days'),
  ('p-hw-11', 'Dongcheng 26mm Rotary Hammer Drill', 'cat-hw-4', 'v-hw-5', 4800, 5600, 6, 2, 'pcs', true, 12, 'Includes chisel set, 800W motor', '01719876543', now() - interval '40 days'),
  ('p-hw-12', 'Dongcheng 4" Angle Grinder (DSM03-100)', 'cat-hw-4', 'v-hw-5', 2100, 2550, 12, 3, 'pcs', true, 12, '710W continuous duty grinder', '01719876543', now() - interval '40 days'),
  ('p-hw-13', 'Pedrollo 1HP Water Pump (CPM-158)', 'cat-hw-4', 'v-hw-5', 11500, 13200, 4, 1, 'pcs', true, 24, '2 Years warranty, Italian technology', '01719876543', now() - interval '40 days'),
  ('p-hw-14', 'MS Iron Wire Nails 2.5" (লোহার পেরেক)', 'cat-hw-5', 'v-hw-1', 115, 135, 142.500, 30, 'kg', false, 0, 'Loose weighable nail stock', '01719876543', now() - interval '35 days'),
  ('p-hw-15', '20-Gauge GI Binding Wire', 'cat-hw-5', 'v-hw-1', 125, 145, 85, 20, 'kg', false, 0, 'For tying structural rebar', '01719876543', now() - interval '35 days'),
  ('p-hw-16', 'Drywall Gypsum Screws 1.5" (1000 Pcs)', 'cat-hw-5', 'v-hw-5', 380, 460, 28, 5, 'box', false, 0, 'Black phosphate coated', '01719876543', now() - interval '35 days'),
  ('p-hw-17', 'Berger WeatherCoat Smooth (White)', 'cat-hw-6', 'v-hw-4', 410, 480, 65, 15, 'litre', false, 0, 'Exterior acrylic emulsion', '01719876543', now() - interval '30 days'),
  ('p-hw-18', 'Dr. Fixit Super Latex 1kg (লিকুইড)', 'cat-hw-6', 'v-hw-4', 280, 340, 50, 10, 'pack', false, 0, 'Waterproofing bonding agent', '01719876543', now() - interval '30 days'),
  ('p-hw-19', 'PHP 0.32mm Corrugated Tin (ঢেউটিন)', 'cat-hw-7', 'v-hw-1', 5800, 6400, 22, 5, 'bundle', false, 0, 'Color coated 72 sq ft bundle', '01719876543', now() - interval '25 days'),
  ('p-hw-20', 'Plain Galvanized Sheet (26 Gauge)', 'cat-hw-7', 'v-hw-1', 95, 120, 180, 30, 'gaj', false, 0, 'Roof ridge and flashing cut sheet', '01719876543', now() - interval '25 days');

insert into invoices (
  id, invoice_no, customer_id, business_id, subtotal, discount, total,
  paid_amount, due_amount, pay_type, note, date
) values
  ('inv-hw-001', 'INV-20260801-01', 'c-hw-1', '01719876543', 123750, 1750, 122000, 50000, 72000, 'credit', 'Delivery to Uttara Sec 10 Site via Truck', now() - interval '25 days'),
  ('inv-hw-002', 'INV-20260805-02', 'c-hw-3', '01719876543', 14757.50, 257.50, 14500, 14500, 0, 'cash', 'Full cash payment upon pickup', now() - interval '20 days'),
  ('inv-hw-003', 'INV-20260810-03', 'c-hw-2', '01719876543', 8150, 150, 8000, 8000, 0, 'online', 'Paid via bKash Merchant TrxID: 9X7A6B11', now() - interval '15 days'),
  ('inv-hw-004', 'INV-20260815-04', 'c-hw-4', '01719876543', 193000, 3000, 190000, 0, 190000, 'credit', 'Chalan No: 4401 signed by Site Engineer', now() - interval '10 days'),
  ('inv-hw-005', 'INV-20260820-05', null, '01719876543', 2860, 60, 2800, 2800, 0, 'cash', 'Counter walk-in cash customer', now() - interval '2 days');

insert into sale_items (
  id, invoice_id, product_id, product_name, qty, unit_price, unit, amount, serial_number, warranty_note
) values
  ('si-hw-001', 'inv-hw-001', 'p-hw-01', 'Shah Cement Special (PCC)', 100, 545, 'bag', 54500, null, null),
  ('si-hw-002', 'inv-hw-001', 'p-hw-03', 'BSRM Xtreme 500W Rod 16mm', 0.717, 96500, 'ton', 69250, null, 'Standard Mill Test Certificate Attached'),
  ('si-hw-003', 'inv-hw-002', 'p-hw-05', 'Sylhet Coarse Sand (সিলেট লাল বালু)', 250.5, 55, 'cft', 13777.50, null, null),
  ('si-hw-004', 'inv-hw-002', 'p-hw-14', 'MS Iron Wire Nails 2.5" (লোহার পেরেক)', 7.250, 135, 'kg', 980, null, null),
  ('si-hw-005', 'inv-hw-003', 'p-hw-11', 'Dongcheng 26mm Rotary Hammer Drill', 1, 5600, 'pcs', 5600, 'DC-RH-2026-99410', '12 Months Free Service & Parts Warranty'),
  ('si-hw-006', 'inv-hw-003', 'p-hw-12', 'Dongcheng 4" Angle Grinder (DSM03-100)', 1, 2550, 'pcs', 2550, 'DC-AG-2026-11883', '12 Months Official Service Warranty'),
  ('si-hw-007', 'inv-hw-004', 'p-hw-03', 'BSRM Xtreme 500W Rod 16mm', 2, 96500, 'ton', 193000, null, 'Chalan #4401 (Gate Pass Verified)'),
  ('si-hw-008', 'inv-hw-005', 'p-hw-08', 'RFL 1" uPVC Class D Pipe', 40, 24, 'feet', 960, null, null),
  ('si-hw-009', 'inv-hw-005', 'p-hw-10', 'Brass Ball Valve 1" (ইতালিয়ান)', 2, 520, 'pcs', 1040, null, '6 Months Replacement Warranty'),
  ('si-hw-010', 'inv-hw-005', 'p-hw-18', 'Dr. Fixit Super Latex 1kg (লিকুইড)', 2, 340, 'pack', 680, null, null),
  ('si-hw-011', 'inv-hw-005', 'p-hw-14', 'MS Iron Wire Nails 2.5" (লোহার পেরেক)', 1.333, 135, 'kg', 180, null, null);

insert into transactions (
  id, type, customer_id, product_id, product_name, qty, unit_price, amount,
  discount, paid_amount, pay_type, note, business_id, date
) values
  ('t-hw-01', 'sale', 'c-hw-1', 'p-hw-01', 'Shah Cement Special (PCC)', 100, 545, 54500, 0, 22020.20, 'credit', 'Delivery to Uttara Sec 10 Site', '01719876543', now() - interval '25 days'),
  ('t-hw-02', 'sale', 'c-hw-1', 'p-hw-03', 'BSRM Xtreme 500W Rod 16mm', 0.717, 96500, 69250, 0, 27979.80, 'credit', 'Delivery to Uttara Sec 10 Site', '01719876543', now() - interval '25 days'),
  ('t-hw-03', 'sale', 'c-hw-3', 'p-hw-05', 'Sylhet Coarse Sand (সিলেট লাল বালু)', 250.5, 55, 13777.50, 0, 13538, 'cash', 'Full cash payment upon pickup', '01719876543', now() - interval '20 days'),
  ('t-hw-04', 'sale', 'c-hw-3', 'p-hw-14', 'MS Iron Wire Nails 2.5" (লোহার পেরেক)', 7.250, 135, 980, 0, 962, 'cash', 'Full cash payment upon pickup', '01719876543', now() - interval '20 days'),
  ('t-hw-05', 'sale', 'c-hw-2', 'p-hw-11', 'Dongcheng 26mm Rotary Hammer Drill', 1, 5600, 5600, 0, 5496.93, 'online', 'Paid via bKash', '01719876543', now() - interval '15 days'),
  ('t-hw-06', 'sale', 'c-hw-2', 'p-hw-12', 'Dongcheng 4" Angle Grinder (DSM03-100)', 1, 2550, 2550, 0, 2503.07, 'online', 'Paid via bKash', '01719876543', now() - interval '15 days'),
  ('t-hw-07', 'sale', 'c-hw-4', 'p-hw-03', 'BSRM Xtreme 500W Rod 16mm', 2, 96500, 193000, 0, 0, 'credit', 'Chalan No: 4401', '01719876543', now() - interval '10 days'),
  ('t-hw-08', 'sale', null, 'p-hw-08', 'RFL 1" uPVC Class D Pipe', 40, 24, 960, 0, 939.86, 'cash', 'Counter walk-in cash customer', '01719876543', now() - interval '2 days'),
  ('t-hw-09', 'sale', null, 'p-hw-10', 'Brass Ball Valve 1" (ইতালিয়ান)', 2, 520, 1040, 0, 1018.18, 'cash', 'Counter walk-in cash customer', '01719876543', now() - interval '2 days'),
  ('t-hw-10', 'sale', null, 'p-hw-18', 'Dr. Fixit Super Latex 1kg (লিকুইড)', 2, 340, 680, 0, 665.73, 'cash', 'Counter walk-in cash customer', '01719876543', now() - interval '2 days'),
  ('t-hw-11', 'sale', null, 'p-hw-14', 'MS Iron Wire Nails 2.5" (লোহার পেরেক)', 1.333, 135, 180, 0, 176.23, 'cash', 'Counter walk-in cash customer', '01719876543', now() - interval '2 days'),
  ('t-hw-12', 'payment', 'c-hw-1', null, null, 0, 0, 40000, 0, 40000, 'cash', 'Bank Check #98820 cleared (Islami Bank)', '01719876543', now() - interval '12 days'),
  ('t-hw-13', 'payment', 'c-hw-2', null, null, 0, 0, 5000, 0, 5000, 'cash', 'Cash deposit against previous plumbing work bill', '01719876543', now() - interval '5 days'),
  ('t-hw-14', 'payment', 'c-hw-4', null, null, 0, 0, 100000, 0, 100000, 'cash', 'RTGS Bank transfer from Dream Homes Account', '01719876543', now() - interval '3 days');

insert into payments (id, customer_id, amount, note, business_id, date) values
  ('pay-hw-001', 'c-hw-1', 40000, 'Bank Check #98820 cleared (Islami Bank)', '01719876543', now() - interval '12 days'),
  ('pay-hw-002', 'c-hw-2', 5000, 'Cash deposit against previous plumbing work bill', '01719876543', now() - interval '5 days'),
  ('pay-hw-003', 'c-hw-4', 100000, 'RTGS Bank transfer from Dream Homes Account', '01719876543', now() - interval '3 days');

commit;
