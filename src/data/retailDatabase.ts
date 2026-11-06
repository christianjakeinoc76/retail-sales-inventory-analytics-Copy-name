/**
 * Database Seed and Schema for Retail Sales and Inventory Management System
 * Database Name: retail_business_analytics
 * 5 Tables: Customers, Products, Sales, Transactions, Marketing Campaigns (>= 50 realistic records each)
 */

export interface Customer {
  customer_id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  customer_segment: 'VIP' | 'Regular' | 'Wholesale' | 'Occasional';
  registration_date: string;
  total_spent: number;
  status: 'Active' | 'Inactive';
}

export interface Product {
  product_id: number;
  name: string;
  sku: string;
  category: 'Electronics' | 'Apparel' | 'Home & Kitchen' | 'Health & Beauty' | 'Sports & Outdoors';
  cost_price: number;
  retail_price: number;
  stock_quantity: number;
  reorder_level: number;
  supplier_name: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Sale {
  sale_id: number;
  customer_id: number;
  sale_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  cost_amount: number;
  profit_amount: number;
  payment_method: 'Credit Card' | 'Debit Card' | 'Cash' | 'Online Transfer' | 'Digital Wallet';
  status: 'Completed' | 'Refunded';
}

export interface Transaction {
  transaction_id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_cost: number;
  unit_price: number;
  total_price: number;
  profit: number;
  transaction_date: string;
  payment_reference: string;
}

export interface MarketingCampaign {
  campaign_id: number;
  campaign_name: string;
  channel: 'Email Marketing' | 'Google Ads' | 'Social Media' | 'In-Store Promo' | 'Influencer Campaign' | 'Loyalty Program';
  start_date: string;
  end_date: string;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue_generated: number;
  roi_percentage: number;
  status: 'Active' | 'Completed' | 'Planned';
}

// -------------------------------------------------------------
// SEED DATA GENERATION: >= 50 REALISTIC RECORDS PER TABLE
// -------------------------------------------------------------

const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington'];
const SUPPLIERS = ['Apex Logistics', 'Vertex Supply Co.', 'GlobalRetail Hub', 'Pacific Wholesale', 'Summit Direct', 'PrimeGoods Ltd.', 'Starlight Importers', 'Metro Distro'];

// Generate 52 Customers
export const INITIAL_CUSTOMERS: Customer[] = [
  { customer_id: 1, name: 'Alexander Wright', email: 'alexander.w@gmail.com', phone: '+1 212-555-0143', address: '452 Lexington Ave', city: 'New York', customer_segment: 'VIP', registration_date: '2025-01-14', total_spent: 4850.50, status: 'Active' },
  { customer_id: 2, name: 'Sophia Martinez', email: 'sophia.m@outlook.com', phone: '+1 310-555-0182', address: '884 Wilshire Blvd', city: 'Los Angeles', customer_segment: 'VIP', registration_date: '2025-01-20', total_spent: 3920.00, status: 'Active' },
  { customer_id: 3, name: 'Marcus Johnson', email: 'marcus.j@yahoo.com', phone: '+1 312-555-0199', address: '120 Michigan Ave', city: 'Chicago', customer_segment: 'Regular', registration_date: '2025-02-04', total_spent: 1250.75, status: 'Active' },
  { customer_id: 4, name: 'Emily Chen', email: 'emily.chen@techmail.com', phone: '+1 415-555-0128', address: '640 Market St', city: 'San Francisco', customer_segment: 'VIP', registration_date: '2025-02-12', total_spent: 5600.20, status: 'Active' },
  { customer_id: 5, name: 'David Kim', email: 'david.kim@gmail.com', phone: '+1 206-555-0164', address: '932 Pine St', city: 'Seattle', customer_segment: 'Regular', registration_date: '2025-02-28', total_spent: 890.00, status: 'Active' },
  { customer_id: 6, name: 'Olivia Taylor', email: 'olivia.t@gmail.com', phone: '+1 713-555-0175', address: '500 Main St', city: 'Houston', customer_segment: 'Wholesale', registration_date: '2025-03-05', total_spent: 12400.00, status: 'Active' },
  { customer_id: 7, name: 'James Wilson', email: 'james.wilson@corp.com', phone: '+1 602-555-0111', address: '300 Camelback Rd', city: 'Phoenix', customer_segment: 'Regular', registration_date: '2025-03-15', total_spent: 1450.00, status: 'Active' },
  { customer_id: 8, name: 'Isabella Davis', email: 'isabella.d@gmail.com', phone: '+1 215-555-0133', address: '1800 Chestnut St', city: 'Philadelphia', customer_segment: 'Occasional', registration_date: '2025-03-22', total_spent: 420.00, status: 'Active' },
  { customer_id: 9, name: 'Lucas Brown', email: 'lucas.b@yahoo.com', phone: '+1 210-555-0155', address: '725 Riverwalk Dr', city: 'San Antonio', customer_segment: 'Regular', registration_date: '2025-04-02', total_spent: 1680.50, status: 'Active' },
  { customer_id: 10, name: 'Mia Anderson', email: 'mia.anderson@gmail.com', phone: '+1 619-555-0188', address: '412 Broadway', city: 'San Diego', customer_segment: 'VIP', registration_date: '2025-04-18', total_spent: 3410.00, status: 'Active' },
  { customer_id: 11, name: 'Ethan Thomas', email: 'ethan.t@outlook.com', phone: '+1 214-555-0144', address: '1100 Elm St', city: 'Dallas', customer_segment: 'Wholesale', registration_date: '2025-05-01', total_spent: 9800.00, status: 'Active' },
  { customer_id: 12, name: 'Charlotte Jackson', email: 'charlotte.j@gmail.com', phone: '+1 408-555-0167', address: '250 First St', city: 'San Jose', customer_segment: 'Regular', registration_date: '2025-05-14', total_spent: 950.00, status: 'Active' },
  { customer_id: 13, name: 'Benjamin White', email: 'ben.white@gmail.com', phone: '+1 512-555-0190', address: '600 Congress Ave', city: 'Austin', customer_segment: 'VIP', registration_date: '2025-05-27', total_spent: 4120.00, status: 'Active' },
  { customer_id: 14, name: 'Amelia Harris', email: 'amelia.h@gmail.com', phone: '+1 904-555-0122', address: '820 Bay St', city: 'Jacksonville', customer_segment: 'Occasional', registration_date: '2025-06-03', total_spent: 310.00, status: 'Inactive' },
  { customer_id: 15, name: 'Mason Martin', email: 'mason.m@yahoo.com', phone: '+1 817-555-0138', address: '400 Houston St', city: 'Fort Worth', customer_segment: 'Regular', registration_date: '2025-06-19', total_spent: 1380.00, status: 'Active' },
  { customer_id: 16, name: 'Harper Thompson', email: 'harper.t@gmail.com', phone: '+1 614-555-0177', address: '150 High St', city: 'Columbus', customer_segment: 'Regular', registration_date: '2025-07-02', total_spent: 1100.00, status: 'Active' },
  { customer_id: 17, name: 'Evelyn Garcia', email: 'evelyn.g@gmail.com', phone: '+1 704-555-0151', address: '300 Tryon St', city: 'Charlotte', customer_segment: 'VIP', registration_date: '2025-07-15', total_spent: 4670.00, status: 'Active' },
  { customer_id: 18, name: 'Logan Martinez', email: 'logan.m@corp.com', phone: '+1 317-555-0162', address: '200 Meridian St', city: 'Indianapolis', customer_segment: 'Wholesale', registration_date: '2025-08-01', total_spent: 15200.00, status: 'Active' },
  { customer_id: 19, name: 'Abigail Robinson', email: 'abigail.r@gmail.com', phone: '+1 303-555-0185', address: '1600 16th St', city: 'Denver', customer_segment: 'Regular', registration_date: '2025-08-14', total_spent: 1750.00, status: 'Active' },
  { customer_id: 20, name: 'Henry Clark', email: 'henry.clark@outlook.com', phone: '+1 202-555-0193', address: '1200 K St NW', city: 'Washington', customer_segment: 'VIP', registration_date: '2025-08-29', total_spent: 5120.00, status: 'Active' },
  // 21 - 52
  ...Array.from({ length: 32 }, (_, i) => {
    const id = 21 + i;
    const firstNames = ['Noah', 'Liam', 'Oliver', 'Elijah', 'William', 'James', 'Lucas', 'Benjamin', 'Theodore', 'Jack', 'Emma', 'Ava', 'Isabella', 'Mia', 'Harper', 'Evelyn', 'Aria', 'Chloe', 'Ella', 'Grace', 'Chloe', 'Zoe', 'Daniel', 'Matthew', 'Samuel', 'Joseph', 'Owen', 'Sebastian', 'Levi', 'Luke', 'Asher', 'Carter'];
    const lastNames = ['Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen'];
    const segments: ('VIP' | 'Regular' | 'Wholesale' | 'Occasional')[] = ['Regular', 'Regular', 'VIP', 'Occasional', 'Wholesale'];
    const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
    const segment = segments[i % segments.length];
    const city = CITIES[i % CITIES.length];
    const spent = segment === 'Wholesale' ? 8500 + i * 400 : segment === 'VIP' ? 3200 + i * 150 : segment === 'Regular' ? 900 + i * 45 : 250 + i * 15;
    return {
      customer_id: id,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}${id}@example.com`,
      phone: `+1 ${200 + (id * 7) % 800}-555-01${(id * 13) % 99}`,
      address: `${100 + id * 12} ${['Oak', 'Maple', 'Cedar', 'Main', 'Park', 'Center'][id % 6]} Ave`,
      city,
      customer_segment: segment,
      registration_date: `2025-${String(1 + (id % 12)).padStart(2, '0')}-${String(1 + (id % 27)).padStart(2, '0')}`,
      total_spent: Number(spent.toFixed(2)),
      status: (id % 11 === 0 ? 'Inactive' : 'Active') as 'Active' | 'Inactive',
    };
  }),
];

// Generate 52 Products across 5 categories
export const INITIAL_PRODUCTS: Product[] = [
  // Electronics
  { product_id: 1, name: 'Pro Wireless Noise-Cancelling Headphones', sku: 'ELEC-1001', category: 'Electronics', cost_price: 120.00, retail_price: 249.99, stock_quantity: 45, reorder_level: 15, supplier_name: 'Apex Logistics', status: 'In Stock' },
  { product_id: 2, name: 'Ultra-Slim 27-inch 4K UHD Monitor', sku: 'ELEC-1002', category: 'Electronics', cost_price: 190.00, retail_price: 349.99, stock_quantity: 18, reorder_level: 10, supplier_name: 'Apex Logistics', status: 'In Stock' },
  { product_id: 3, name: 'Ergonomic Mechanical Keyboard RGB', sku: 'ELEC-1003', category: 'Electronics', cost_price: 45.00, retail_price: 99.99, stock_quantity: 8, reorder_level: 15, supplier_name: 'Pacific Wholesale', status: 'Low Stock' },
  { product_id: 4, name: 'Precision Wireless Gaming Mouse', sku: 'ELEC-1004', category: 'Electronics', cost_price: 28.00, retail_price: 69.99, stock_quantity: 5, reorder_level: 12, supplier_name: 'Pacific Wholesale', status: 'Low Stock' },
  { product_id: 5, name: 'Thunderbolt 4 Universal Docking Station', sku: 'ELEC-1005', category: 'Electronics', cost_price: 85.00, retail_price: 179.99, stock_quantity: 22, reorder_level: 8, supplier_name: 'Summit Direct', status: 'In Stock' },
  { product_id: 6, name: 'Portable Bluetooth Waterproof Speaker', sku: 'ELEC-1006', category: 'Electronics', cost_price: 32.00, retail_price: 79.99, stock_quantity: 3, reorder_level: 10, supplier_name: 'Summit Direct', status: 'Low Stock' },
  { product_id: 7, name: 'Smart Fitness Tracker Watch Band', sku: 'ELEC-1007', category: 'Electronics', cost_price: 55.00, retail_price: 129.99, stock_quantity: 35, reorder_level: 10, supplier_name: 'Apex Logistics', status: 'In Stock' },
  { product_id: 8, name: 'High-Speed MagSafe Wireless Charger', sku: 'ELEC-1008', category: 'Electronics', cost_price: 14.00, retail_price: 39.99, stock_quantity: 60, reorder_level: 20, supplier_name: 'Pacific Wholesale', status: 'In Stock' },
  { product_id: 9, name: 'Dual USB-C 100W GaN Wall Adapter', sku: 'ELEC-1009', category: 'Electronics', cost_price: 18.00, retail_price: 49.99, stock_quantity: 0, reorder_level: 15, supplier_name: 'Pacific Wholesale', status: 'Out of Stock' },
  { product_id: 10, name: 'Full HD 1080p Streaming Webcam with Mic', sku: 'ELEC-1010', category: 'Electronics', cost_price: 30.00, retail_price: 69.99, stock_quantity: 4, reorder_level: 10, supplier_name: 'PrimeGoods Ltd.', status: 'Low Stock' },

  // Apparel
  { product_id: 11, name: 'Men’s Classic Merino Wool Crewneck', sku: 'APPR-2001', category: 'Apparel', cost_price: 35.00, retail_price: 89.99, stock_quantity: 42, reorder_level: 15, supplier_name: 'GlobalRetail Hub', status: 'In Stock' },
  { product_id: 12, name: 'Women’s Tailored Stretch Blazer Navy', sku: 'APPR-2002', category: 'Apparel', cost_price: 52.00, retail_price: 139.99, stock_quantity: 26, reorder_level: 10, supplier_name: 'GlobalRetail Hub', status: 'In Stock' },
  { product_id: 13, name: 'Water-Resistant All-Weather Shell Jacket', sku: 'APPR-2003', category: 'Apparel', cost_price: 65.00, retail_price: 169.99, stock_quantity: 6, reorder_level: 12, supplier_name: 'Summit Direct', status: 'Low Stock' },
  { product_id: 14, name: 'Slim-Fit Chino Pants Olive Green', sku: 'APPR-2004', category: 'Apparel', cost_price: 24.00, retail_price: 59.99, stock_quantity: 50, reorder_level: 20, supplier_name: 'GlobalRetail Hub', status: 'In Stock' },
  { product_id: 15, name: 'Premium Heavyweight Cotton T-Shirt Pack (3)', sku: 'APPR-2005', category: 'Apparel', cost_price: 16.00, retail_price: 44.99, stock_quantity: 80, reorder_level: 25, supplier_name: 'GlobalRetail Hub', status: 'In Stock' },
  { product_id: 16, name: 'Thermal Base Layer Bottoms Charcoal', sku: 'APPR-2006', category: 'Apparel', cost_price: 15.00, retail_price: 39.99, stock_quantity: 7, reorder_level: 12, supplier_name: 'Vertex Supply Co.', status: 'Low Stock' },
  { product_id: 17, name: 'Breathable Running Athletic Shorts', sku: 'APPR-2007', category: 'Apparel', cost_price: 12.00, retail_price: 34.99, stock_quantity: 44, reorder_level: 15, supplier_name: 'Vertex Supply Co.', status: 'In Stock' },
  { product_id: 18, name: 'Seamless High-Waist Yoga Leggings', sku: 'APPR-2008', category: 'Apparel', cost_price: 20.00, retail_price: 54.99, stock_quantity: 38, reorder_level: 15, supplier_name: 'GlobalRetail Hub', status: 'In Stock' },
  { product_id: 19, name: 'Genuine Italian Leather Dress Belt', sku: 'APPR-2009', category: 'Apparel', cost_price: 18.00, retail_price: 49.99, stock_quantity: 2, reorder_level: 10, supplier_name: 'Starlight Importers', status: 'Low Stock' },
  { product_id: 20, name: 'Cashmere Winter Knit Scarf Oatmeal', sku: 'APPR-2010', category: 'Apparel', cost_price: 28.00, retail_price: 74.99, stock_quantity: 19, reorder_level: 10, supplier_name: 'Starlight Importers', status: 'In Stock' },

  // Home & Kitchen
  { product_id: 21, name: 'Barista Touch Espresso Machine Silver', sku: 'HOME-3001', category: 'Home & Kitchen', cost_price: 320.00, retail_price: 699.99, stock_quantity: 14, reorder_level: 6, supplier_name: 'PrimeGoods Ltd.', status: 'In Stock' },
  { product_id: 22, name: 'Enameled Cast Iron Dutch Oven 6-Qt', sku: 'HOME-3002', category: 'Home & Kitchen', cost_price: 55.00, retail_price: 129.99, stock_quantity: 20, reorder_level: 8, supplier_name: 'PrimeGoods Ltd.', status: 'In Stock' },
  { product_id: 23, name: 'Professional Chef Knife 8-Inch Japanese VG10', sku: 'HOME-3003', category: 'Home & Kitchen', cost_price: 40.00, retail_price: 99.99, stock_quantity: 5, reorder_level: 10, supplier_name: 'Starlight Importers', status: 'Low Stock' },
  { product_id: 24, name: 'Digital Air Fryer Max XL 5.8 Qt', sku: 'HOME-3004', category: 'Home & Kitchen', cost_price: 48.00, retail_price: 119.99, stock_quantity: 29, reorder_level: 10, supplier_name: 'Metro Distro', status: 'In Stock' },
  { product_id: 25, name: 'Organic Bamboo Cutting Board Set (3 pcs)', sku: 'HOME-3005', category: 'Home & Kitchen', cost_price: 12.00, retail_price: 32.99, stock_quantity: 55, reorder_level: 18, supplier_name: 'Metro Distro', status: 'In Stock' },
  { product_id: 26, name: 'Cordless Handheld Vacuum with HEPA Filter', sku: 'HOME-3006', category: 'Home & Kitchen', cost_price: 38.00, retail_price: 89.99, stock_quantity: 9, reorder_level: 12, supplier_name: 'PrimeGoods Ltd.', status: 'Low Stock' },
  { product_id: 27, name: 'Insulated French Press Coffee Maker 34oz', sku: 'HOME-3007', category: 'Home & Kitchen', cost_price: 16.00, retail_price: 42.99, stock_quantity: 34, reorder_level: 12, supplier_name: 'Metro Distro', status: 'In Stock' },
  { product_id: 28, name: 'Non-Stick Ceramic Cookware 10-Piece Set', sku: 'HOME-3008', category: 'Home & Kitchen', cost_price: 95.00, retail_price: 219.99, stock_quantity: 11, reorder_level: 6, supplier_name: 'PrimeGoods Ltd.', status: 'In Stock' },
  { product_id: 29, name: 'Smart Aromatherapy Diffuser Ultrasonic', sku: 'HOME-3009', category: 'Home & Kitchen', cost_price: 14.00, retail_price: 39.99, stock_quantity: 40, reorder_level: 15, supplier_name: 'Vertex Supply Co.', status: 'In Stock' },
  { product_id: 30, name: 'Electric Salt and Pepper Grinder Set', sku: 'HOME-3010', category: 'Home & Kitchen', cost_price: 10.00, retail_price: 28.99, stock_quantity: 1, reorder_level: 8, supplier_name: 'Vertex Supply Co.', status: 'Low Stock' },

  // Health & Beauty
  { product_id: 31, name: 'Hydrating Botanical Facial Cleanser 200ml', sku: 'BEAU-4001', category: 'Health & Beauty', cost_price: 8.50, retail_price: 24.99, stock_quantity: 65, reorder_level: 20, supplier_name: 'Vertex Supply Co.', status: 'In Stock' },
  { product_id: 32, name: 'Hyaluronic Acid + Vitamin C Brightening Serum', sku: 'BEAU-4002', category: 'Health & Beauty', cost_price: 14.00, retail_price: 42.99, stock_quantity: 48, reorder_level: 15, supplier_name: 'Vertex Supply Co.', status: 'In Stock' },
  { product_id: 33, name: 'Mineral Sunscreen SPF 50 Broad Spectrum', sku: 'BEAU-4003', category: 'Health & Beauty', cost_price: 9.00, retail_price: 27.99, stock_quantity: 6, reorder_level: 15, supplier_name: 'Vertex Supply Co.', status: 'Low Stock' },
  { product_id: 34, name: 'Sonic Electric Toothbrush Rechargeable', sku: 'BEAU-4004', category: 'Health & Beauty', cost_price: 28.00, retail_price: 79.99, stock_quantity: 23, reorder_level: 10, supplier_name: 'Apex Logistics', status: 'In Stock' },
  { product_id: 35, name: 'Deep Tissue Muscle Percussion Massage Gun', sku: 'BEAU-4005', category: 'Health & Beauty', cost_price: 45.00, retail_price: 119.99, stock_quantity: 15, reorder_level: 8, supplier_name: 'Apex Logistics', status: 'In Stock' },
  { product_id: 36, name: 'Organic Argan Hair Repair Treatment Oil', sku: 'BEAU-4006', category: 'Health & Beauty', cost_price: 11.00, retail_price: 32.99, stock_quantity: 30, reorder_level: 12, supplier_name: 'Starlight Importers', status: 'In Stock' },
  { product_id: 37, name: 'Natural Clay Detoxifying Pore Mask 120g', sku: 'BEAU-4007', category: 'Health & Beauty', cost_price: 7.00, retail_price: 21.99, stock_quantity: 45, reorder_level: 15, supplier_name: 'Starlight Importers', status: 'In Stock' },
  { product_id: 38, name: 'Smart Digital Body Weight Scale Bluetooth', sku: 'BEAU-4008', category: 'Health & Beauty', cost_price: 16.00, retail_price: 44.99, stock_quantity: 18, reorder_level: 10, supplier_name: 'Apex Logistics', status: 'In Stock' },
  { product_id: 39, name: 'Collagen Peptide Protein Powder 16oz', sku: 'BEAU-4009', category: 'Health & Beauty', cost_price: 18.00, retail_price: 46.99, stock_quantity: 3, reorder_level: 10, supplier_name: 'Pacific Wholesale', status: 'Low Stock' },
  { product_id: 40, name: 'Lavender & Chamomile Sleep Mist 100ml', sku: 'BEAU-4010', category: 'Health & Beauty', cost_price: 6.00, retail_price: 18.99, stock_quantity: 52, reorder_level: 15, supplier_name: 'Starlight Importers', status: 'In Stock' },

  // Sports & Outdoors
  { product_id: 41, name: 'Insulated Stainless Steel Water Bottle 32oz', sku: 'SPRT-5001', category: 'Sports & Outdoors', cost_price: 11.00, retail_price: 34.99, stock_quantity: 75, reorder_level: 25, supplier_name: 'Pacific Wholesale', status: 'In Stock' },
  { product_id: 42, name: 'Extra Thick Anti-Tear Yoga Mat with Strap', sku: 'SPRT-5002', category: 'Sports & Outdoors', cost_price: 15.00, retail_price: 42.99, stock_quantity: 33, reorder_level: 12, supplier_name: 'GlobalRetail Hub', status: 'In Stock' },
  { product_id: 43, name: 'Adjustable Quick-Select Dumbbells (Pair 50lb)', sku: 'SPRT-5003', category: 'Sports & Outdoors', cost_price: 140.00, retail_price: 329.99, stock_quantity: 7, reorder_level: 8, supplier_name: 'Summit Direct', status: 'Low Stock' },
  { product_id: 44, name: 'Lightweight Packable 40L Hiking Backpack', sku: 'SPRT-5004', category: 'Sports & Outdoors', cost_price: 32.00, retail_price: 84.99, stock_quantity: 21, reorder_level: 10, supplier_name: 'Summit Direct', status: 'In Stock' },
  { product_id: 45, name: 'Heavy-Duty Resistance Loop Bands Set (5)', sku: 'SPRT-5005', category: 'Sports & Outdoors', cost_price: 7.50, retail_price: 24.99, stock_quantity: 60, reorder_level: 20, supplier_name: 'Metro Distro', status: 'In Stock' },
  { product_id: 46, name: 'Camping Double Hammock with Tree Straps', sku: 'SPRT-5006', category: 'Sports & Outdoors', cost_price: 16.00, retail_price: 49.99, stock_quantity: 19, reorder_level: 10, supplier_name: 'Summit Direct', status: 'In Stock' },
  { product_id: 47, name: 'LED Rechargeable Headlamp 1000 Lumens', sku: 'SPRT-5007', category: 'Sports & Outdoors', cost_price: 10.00, retail_price: 29.99, stock_quantity: 28, reorder_level: 10, supplier_name: 'Apex Logistics', status: 'In Stock' },
  { product_id: 48, name: 'Carbon Fiber Trekking Poles Anti-Shock', sku: 'SPRT-5008', category: 'Sports & Outdoors', cost_price: 22.00, retail_price: 59.99, stock_quantity: 4, reorder_level: 10, supplier_name: 'Summit Direct', status: 'Low Stock' },
  { product_id: 49, name: 'Compact 2-Person Waterproof Dome Tent', sku: 'SPRT-5009', category: 'Sports & Outdoors', cost_price: 58.00, retail_price: 139.99, stock_quantity: 12, reorder_level: 6, supplier_name: 'Summit Direct', status: 'In Stock' },
  { product_id: 50, name: 'Speed Jump Rope with Ball Bearings', sku: 'SPRT-5010', category: 'Sports & Outdoors', cost_price: 4.50, retail_price: 16.99, stock_quantity: 80, reorder_level: 25, supplier_name: 'Metro Distro', status: 'In Stock' },
  { product_id: 51, name: 'High-Density Foam Roller for Deep Tissue', sku: 'SPRT-5011', category: 'Sports & Outdoors', cost_price: 8.00, retail_price: 22.99, stock_quantity: 36, reorder_level: 12, supplier_name: 'Metro Distro', status: 'In Stock' },
  { product_id: 52, name: 'Bicycle U-Lock with 4-Ft Steel Security Cable', sku: 'SPRT-5012', category: 'Sports & Outdoors', cost_price: 14.00, retail_price: 36.99, stock_quantity: 2, reorder_level: 8, supplier_name: 'Apex Logistics', status: 'Low Stock' },
];

// Generate 54 Sales records spanning the last few months
export const INITIAL_SALES: Sale[] = [
  { sale_id: 101, customer_id: 1, sale_date: '2026-01-05', subtotal: 349.98, tax_amount: 28.00, discount_amount: 0.00, total_amount: 377.98, cost_amount: 165.00, profit_amount: 184.98, payment_method: 'Credit Card', status: 'Completed' },
  { sale_id: 102, customer_id: 4, sale_date: '2026-01-08', subtotal: 699.99, tax_amount: 56.00, discount_amount: 35.00, total_amount: 720.99, cost_amount: 320.00, profit_amount: 344.99, payment_method: 'Credit Card', status: 'Completed' },
  { sale_id: 103, customer_id: 6, sale_date: '2026-01-12', subtotal: 1240.00, tax_amount: 99.20, discount_amount: 100.00, total_amount: 1239.20, cost_amount: 580.00, profit_amount: 560.00, payment_method: 'Online Transfer', status: 'Completed' },
  { sale_id: 104, customer_id: 2, sale_date: '2026-01-15', subtotal: 249.99, tax_amount: 20.00, discount_amount: 15.00, total_amount: 254.99, cost_amount: 120.00, profit_amount: 114.99, payment_method: 'Credit Card', status: 'Completed' },
  { sale_id: 105, customer_id: 8, sale_date: '2026-01-18', subtotal: 89.99, tax_amount: 7.20, discount_amount: 0.00, total_amount: 97.19, cost_amount: 38.00, profit_amount: 51.99, payment_method: 'Debit Card', status: 'Completed' },
  { sale_id: 106, customer_id: 11, sale_date: '2026-01-22', subtotal: 1850.00, tax_amount: 148.00, discount_amount: 150.00, total_amount: 1848.00, cost_amount: 860.00, profit_amount: 840.00, payment_method: 'Online Transfer', status: 'Completed' },
  { sale_id: 107, customer_id: 3, sale_date: '2026-01-26', subtotal: 169.98, tax_amount: 13.60, discount_amount: 10.00, total_amount: 173.58, cost_amount: 73.00, profit_amount: 86.98, payment_method: 'Cash', status: 'Completed' },
  { sale_id: 108, customer_id: 13, sale_date: '2026-01-30', subtotal: 529.98, tax_amount: 42.40, discount_amount: 25.00, total_amount: 547.38, cost_amount: 235.00, profit_amount: 269.98, payment_method: 'Credit Card', status: 'Completed' },
  { sale_id: 109, customer_id: 5, sale_date: '2026-02-02', subtotal: 129.99, tax_amount: 10.40, discount_amount: 0.00, total_amount: 140.39, cost_amount: 55.00, profit_amount: 74.99, payment_method: 'Digital Wallet', status: 'Completed' },
  { sale_id: 110, customer_id: 17, sale_date: '2026-02-06', subtotal: 449.97, tax_amount: 36.00, discount_amount: 20.00, total_amount: 465.97, cost_amount: 180.00, profit_amount: 249.97, payment_method: 'Credit Card', status: 'Completed' },
  { sale_id: 111, customer_id: 7, sale_date: '2026-02-10', subtotal: 329.99, tax_amount: 26.40, discount_amount: 0.00, total_amount: 356.39, cost_amount: 140.00, profit_amount: 189.99, payment_method: 'Credit Card', status: 'Completed' },
  { sale_id: 112, customer_id: 9, sale_date: '2026-02-14', subtotal: 199.98, tax_amount: 16.00, discount_amount: 20.00, total_amount: 195.98, cost_amount: 70.00, profit_amount: 109.98, payment_method: 'Cash', status: 'Completed' },
  { sale_id: 113, customer_id: 18, sale_date: '2026-02-17', subtotal: 2400.00, tax_amount: 192.00, discount_amount: 200.00, total_amount: 2392.00, cost_amount: 1100.00, profit_amount: 1100.00, payment_method: 'Online Transfer', status: 'Completed' },
  { sale_id: 114, customer_id: 12, sale_date: '2026-02-21', subtotal: 119.99, tax_amount: 9.60, discount_amount: 0.00, total_amount: 129.59, cost_amount: 48.00, profit_amount: 71.99, payment_method: 'Debit Card', status: 'Completed' },
  { sale_id: 115, customer_id: 15, sale_date: '2026-02-25', subtotal: 84.99, tax_amount: 6.80, discount_amount: 0.00, total_amount: 91.79, cost_amount: 32.00, profit_amount: 52.99, payment_method: 'Cash', status: 'Completed' },
  { sale_id: 116, customer_id: 20, sale_date: '2026-02-28', subtotal: 789.97, tax_amount: 63.20, discount_amount: 50.00, total_amount: 803.17, cost_amount: 345.00, profit_amount: 394.97, payment_method: 'Credit Card', status: 'Completed' },
  { sale_id: 117, customer_id: 10, sale_date: '2026-03-02', subtotal: 219.99, tax_amount: 17.60, discount_amount: 10.00, total_amount: 227.59, cost_amount: 95.00, profit_amount: 114.99, payment_method: 'Credit Card', status: 'Completed' },
  { sale_id: 118, customer_id: 14, sale_date: '2026-03-05', subtotal: 99.99, tax_amount: 8.00, discount_amount: 0.00, total_amount: 107.99, cost_amount: 40.00, profit_amount: 59.99, payment_method: 'Debit Card', status: 'Refunded' },
  { sale_id: 119, customer_id: 16, sale_date: '2026-03-08', subtotal: 159.98, tax_amount: 12.80, discount_amount: 15.00, total_amount: 157.78, cost_amount: 64.00, profit_amount: 80.98, payment_method: 'Digital Wallet', status: 'Completed' },
  { sale_id: 120, customer_id: 19, sale_date: '2026-03-12', subtotal: 319.97, tax_amount: 25.60, discount_amount: 20.00, total_amount: 325.57, cost_amount: 135.00, profit_amount: 164.97, payment_method: 'Credit Card', status: 'Completed' },
  // Generate more realistic sales up to 54
  ...Array.from({ length: 34 }, (_, i) => {
    const sale_id = 121 + i;
    const custId = 1 + ((i * 7) % 50);
    const sub = 65 + ((i * 37) % 650);
    const tax = Number((sub * 0.08).toFixed(2));
    const disc = i % 4 === 0 ? Number((sub * 0.1).toFixed(2)) : 0;
    const total = Number((sub + tax - disc).toFixed(2));
    const cost = Number((sub * 0.44).toFixed(2));
    const profit = Number((sub - disc - cost).toFixed(2));
    const methods: ('Credit Card' | 'Debit Card' | 'Cash' | 'Online Transfer' | 'Digital Wallet')[] = ['Credit Card', 'Credit Card', 'Debit Card', 'Cash', 'Digital Wallet', 'Online Transfer'];
    const day = 1 + ((i * 3) % 28);
    const month = 1 + ((i + 2) % 3); // Jan, Feb, Mar 2026
    return {
      sale_id,
      customer_id: custId,
      sale_date: `2026-0${month}-${String(day).padStart(2, '0')}`,
      subtotal: Number(sub.toFixed(2)),
      tax_amount: tax,
      discount_amount: disc,
      total_amount: total,
      cost_amount: cost,
      profit_amount: profit,
      payment_method: methods[i % methods.length],
      status: (i === 17 ? 'Refunded' : 'Completed') as 'Completed' | 'Refunded',
    };
  }),
];

// Generate 56 Transactions (order items) linking sales and products
export const INITIAL_TRANSACTIONS: Transaction[] = [
  { transaction_id: 501, sale_id: 101, product_id: 1, quantity: 1, unit_cost: 120.00, unit_price: 249.99, total_price: 249.99, profit: 129.99, transaction_date: '2026-01-05', payment_reference: 'TXN-901140' },
  { transaction_id: 502, sale_id: 101, product_id: 3, quantity: 1, unit_cost: 45.00, unit_price: 99.99, total_price: 99.99, profit: 54.99, transaction_date: '2026-01-05', payment_reference: 'TXN-901141' },
  { transaction_id: 503, sale_id: 102, product_id: 21, quantity: 1, unit_cost: 320.00, unit_price: 699.99, total_price: 699.99, profit: 379.99, transaction_date: '2026-01-08', payment_reference: 'TXN-901142' },
  { transaction_id: 504, sale_id: 103, product_id: 2, quantity: 2, unit_cost: 190.00, unit_price: 349.99, total_price: 699.98, profit: 319.98, transaction_date: '2026-01-12', payment_reference: 'TXN-901143' },
  { transaction_id: 505, sale_id: 103, product_id: 5, quantity: 3, unit_cost: 85.00, unit_price: 179.99, total_price: 539.97, profit: 284.97, transaction_date: '2026-01-12', payment_reference: 'TXN-901144' },
  { transaction_id: 506, sale_id: 104, product_id: 1, quantity: 1, unit_cost: 120.00, unit_price: 249.99, total_price: 249.99, profit: 129.99, transaction_date: '2026-01-15', payment_reference: 'TXN-901145' },
  { transaction_id: 507, sale_id: 105, product_id: 26, quantity: 1, unit_cost: 38.00, unit_price: 89.99, total_price: 89.99, profit: 51.99, transaction_date: '2026-01-18', payment_reference: 'TXN-901146' },
  { transaction_id: 508, sale_id: 106, product_id: 43, quantity: 4, unit_cost: 140.00, unit_price: 329.99, total_price: 1319.96, profit: 759.96, transaction_date: '2026-01-22', payment_reference: 'TXN-901147' },
  { transaction_id: 509, sale_id: 106, product_id: 44, quantity: 4, unit_cost: 32.00, unit_price: 84.99, total_price: 339.96, profit: 211.96, transaction_date: '2026-01-22', payment_reference: 'TXN-901148' },
  { transaction_id: 510, sale_id: 107, product_id: 4, quantity: 1, unit_cost: 28.00, unit_price: 69.99, total_price: 69.99, profit: 41.99, transaction_date: '2026-01-26', payment_reference: 'TXN-901149' },
  { transaction_id: 511, sale_id: 107, product_id: 3, quantity: 1, unit_cost: 45.00, unit_price: 99.99, total_price: 99.99, profit: 54.99, transaction_date: '2026-01-26', payment_reference: 'TXN-901150' },
  { transaction_id: 512, sale_id: 108, product_id: 2, quantity: 1, unit_cost: 190.00, unit_price: 349.99, total_price: 349.99, profit: 159.99, transaction_date: '2026-01-30', payment_reference: 'TXN-901151' },
  { transaction_id: 513, sale_id: 108, product_id: 5, quantity: 1, unit_cost: 85.00, unit_price: 179.99, total_price: 179.99, profit: 94.99, transaction_date: '2026-01-30', payment_reference: 'TXN-901152' },
  { transaction_id: 514, sale_id: 109, product_id: 7, quantity: 1, unit_cost: 55.00, unit_price: 129.99, total_price: 129.99, profit: 74.99, transaction_date: '2026-02-02', payment_reference: 'TXN-901153' },
  { transaction_id: 515, sale_id: 110, product_id: 12, quantity: 2, unit_cost: 52.00, unit_price: 139.99, total_price: 279.98, profit: 175.98, transaction_date: '2026-02-06', payment_reference: 'TXN-901154' },
  { transaction_id: 516, sale_id: 110, product_id: 13, quantity: 1, unit_cost: 65.00, unit_price: 169.99, total_price: 169.99, profit: 104.99, transaction_date: '2026-02-06', payment_reference: 'TXN-901155' },
  // Generate 40 additional realistic transaction rows to exceed 50
  ...Array.from({ length: 40 }, (_, i) => {
    const txnId = 517 + i;
    const saleId = 111 + (i % 40);
    const prodId = 1 + ((i * 5) % 52);
    const prod = INITIAL_PRODUCTS[prodId - 1];
    const qty = 1 + (i % 3);
    const totalP = Number((prod.retail_price * qty).toFixed(2));
    const profit = Number(((prod.retail_price - prod.cost_price) * qty).toFixed(2));
    return {
      transaction_id: txnId,
      sale_id: saleId,
      product_id: prodId,
      quantity: qty,
      unit_cost: prod.cost_price,
      unit_price: prod.retail_price,
      total_price: totalP,
      profit: profit,
      transaction_date: `2026-0${1 + (i % 3)}-${String(1 + (i % 28)).padStart(2, '0')}`,
      payment_reference: `TXN-90${txnId}`,
    };
  }),
];

// Generate 52 Marketing Campaigns
export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  { campaign_id: 1, campaign_name: 'New Year Electronics Flash Sale', channel: 'Google Ads', start_date: '2026-01-01', end_date: '2026-01-10', budget: 3500.00, spend: 3420.00, impressions: 84500, clicks: 4210, conversions: 290, revenue_generated: 16800.00, roi_percentage: 391.2, status: 'Completed' },
  { campaign_id: 2, campaign_name: 'Winter Clearance Apparel Promo', channel: 'Social Media', start_date: '2026-01-05', end_date: '2026-01-20', budget: 2200.00, spend: 2150.00, impressions: 62000, clicks: 3100, conversions: 215, revenue_generated: 9400.00, roi_percentage: 337.2, status: 'Completed' },
  { campaign_id: 3, campaign_name: 'Home & Kitchen Chef Essentials Email Blast', channel: 'Email Marketing', start_date: '2026-01-15', end_date: '2026-01-25', budget: 800.00, spend: 750.00, impressions: 45000, clicks: 5400, conversions: 380, revenue_generated: 12200.00, roi_percentage: 1526.7, status: 'Completed' },
  { campaign_id: 4, campaign_name: 'Valentine’s Day Luxury Fragrance & Beauty', channel: 'Social Media', start_date: '2026-02-01', end_date: '2026-02-14', budget: 3000.00, spend: 2980.00, impressions: 98000, clicks: 6100, conversions: 420, revenue_generated: 18500.00, roi_percentage: 520.8, status: 'Completed' },
  { campaign_id: 5, campaign_name: 'VIP Loyalty Tier Exclusive 20% Off', channel: 'Loyalty Program', start_date: '2026-02-05', end_date: '2026-02-28', budget: 1200.00, spend: 1100.00, impressions: 18000, clicks: 4200, conversions: 350, revenue_generated: 14900.00, roi_percentage: 1254.5, status: 'Completed' },
  { campaign_id: 6, campaign_name: 'Spring Fitness & Outdoor Gear Kickoff', channel: 'Google Ads', start_date: '2026-03-01', end_date: '2026-03-31', budget: 4500.00, spend: 3850.00, impressions: 112000, clicks: 7800, conversions: 510, revenue_generated: 24600.00, roi_percentage: 538.9, status: 'Active' },
  { campaign_id: 7, campaign_name: 'Tech Influencer Unboxing TikTok Partnership', channel: 'Influencer Campaign', start_date: '2026-03-05', end_date: '2026-03-25', budget: 5000.00, spend: 4800.00, impressions: 240000, clicks: 14200, conversions: 680, revenue_generated: 32100.00, roi_percentage: 568.75, status: 'Active' },
  { campaign_id: 8, campaign_name: 'In-Store Weekend Cooking Demo & Sampling', channel: 'In-Store Promo', start_date: '2026-03-10', end_date: '2026-03-12', budget: 1500.00, spend: 1450.00, impressions: 8500, clicks: 1200, conversions: 195, revenue_generated: 7800.00, roi_percentage: 437.9, status: 'Active' },
  { campaign_id: 9, campaign_name: 'Earth Month Eco-Friendly Reusable Goods', channel: 'Email Marketing', start_date: '2026-04-01', end_date: '2026-04-22', budget: 1000.00, spend: 0.00, impressions: 0, clicks: 0, conversions: 0, revenue_generated: 0.00, roi_percentage: 0.0, status: 'Planned' },
  { campaign_id: 10, campaign_name: 'Mother’s Day Wellness & Spa Gift Sets', channel: 'Social Media', start_date: '2026-04-20', end_date: '2026-05-10', budget: 3500.00, spend: 0.00, impressions: 0, clicks: 0, conversions: 0, revenue_generated: 0.00, roi_percentage: 0.0, status: 'Planned' },
  // 11 to 52 realistic campaigns
  ...Array.from({ length: 42 }, (_, i) => {
    const id = 11 + i;
    const channels: ('Email Marketing' | 'Google Ads' | 'Social Media' | 'In-Store Promo' | 'Influencer Campaign' | 'Loyalty Program')[] = [
      'Email Marketing', 'Google Ads', 'Social Media', 'Influencer Campaign', 'In-Store Promo', 'Loyalty Program'
    ];
    const channel = channels[i % channels.length];
    const themes = [
      'Summer Activewear Spotlight', 'Back-to-School Tech Bundles', 'Labor Day Appliance Blowout',
      'Fall Home Decor Refresh', 'Halloween Kitchen Party Promo', 'Early Bird Holiday Savings',
      'Black Friday Doorusters Preview', 'Cyber Monday Gadget Extravaganza', 'Green Monday Last Chance Shipping',
      'Super Bowl Snack & Entertainment Tech', 'Presidents Day Furniture Special', 'March Madness Sports Barbecue',
      'Memorial Day Cookout & Camping', 'Prime Shoppers Summer Carnival', 'Autumn Outdoor Trail Gear',
      'Mid-Season Style Refresh', 'Smart Home Security Awareness', 'Hydration & Running Challenge',
      'Skincare Routine Reset Campaign', 'Student Dorm Room Essentials', 'Gourmet Coffee Lovers Club'
    ];
    const name = `${themes[i % themes.length]} #${1 + Math.floor(i / themes.length)}`;
    const budget = 1000 + ((i * 350) % 6000);
    const spend = Math.min(budget, budget * (0.8 + ((i % 5) * 0.04)));
    const impressions = Math.round(spend * (20 + (i % 15)));
    const clicks = Math.round(impressions * 0.045);
    const conversions = Math.round(clicks * 0.07);
    const rev = Number((conversions * (45 + (i % 30))).toFixed(2));
    const roi = spend > 0 ? Number((((rev - spend) / spend) * 100).toFixed(1)) : 0;
    const statuses: ('Active' | 'Completed' | 'Planned')[] = ['Completed', 'Completed', 'Active', 'Completed', 'Planned'];

    return {
      campaign_id: id,
      campaign_name: name,
      channel,
      start_date: `2025-${String(1 + (i % 12)).padStart(2, '0')}-01`,
      end_date: `2025-${String(1 + (i % 12)).padStart(2, '0')}-28`,
      budget: Number(budget.toFixed(2)),
      spend: Number(spend.toFixed(2)),
      impressions,
      clicks,
      conversions,
      revenue_generated: rev,
      roi_percentage: roi,
      status: statuses[i % statuses.length],
    };
  }),
];

/**
 * Generate full compliant MySQL script `retail_business_analytics.sql`
 * With database creation, tables DDL, primary keys, foreign keys, and 50+ INSERTs per table.
 */
export function generateMySQLDump(
  customers = INITIAL_CUSTOMERS,
  products = INITIAL_PRODUCTS,
  sales = INITIAL_SALES,
  transactions = INITIAL_TRANSACTIONS,
  campaigns = INITIAL_CAMPAIGNS
): string {
  let sql = `-- ==============================================================
-- College Final Project: Retail Sales and Inventory Management System
-- Database Name: retail_business_analytics
-- Target DBMS: MySQL 8.0+ / MariaDB
-- Description: Complete Relational Schema with 5 Tables & 50+ Seed Records
-- Tables: Customers, Products, Sales, Transactions, Marketing Campaigns
-- ==============================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS retail_business_analytics;
CREATE DATABASE retail_business_analytics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE retail_business_analytics;

-- --------------------------------------------------------------
-- Table Structure for 'customers'
-- --------------------------------------------------------------
DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(80) NOT NULL,
  customer_segment ENUM('VIP', 'Regular', 'Wholesale', 'Occasional') DEFAULT 'Regular',
  registration_date DATE NOT NULL,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customer_email (email),
  INDEX idx_customer_segment (customer_segment)
) ENGINE=InnoDB;

-- --------------------------------------------------------------
-- Table Structure for 'products'
-- --------------------------------------------------------------
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(50) NOT NULL UNIQUE,
  category ENUM('Electronics', 'Apparel', 'Home & Kitchen', 'Health & Beauty', 'Sports & Outdoors') NOT NULL,
  cost_price DECIMAL(10, 2) NOT NULL,
  retail_price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 10,
  supplier_name VARCHAR(120) NOT NULL,
  status ENUM('In Stock', 'Low Stock', 'Out of Stock') DEFAULT 'In Stock',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_sku (sku),
  INDEX idx_product_category (category),
  INDEX idx_product_stock (stock_quantity)
) ENGINE=InnoDB;

-- --------------------------------------------------------------
-- Table Structure for 'sales'
-- --------------------------------------------------------------
DROP TABLE IF EXISTS sales;
CREATE TABLE sales (
  sale_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  sale_date DATE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL,
  cost_amount DECIMAL(10, 2) NOT NULL,
  profit_amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('Credit Card', 'Debit Card', 'Cash', 'Online Transfer', 'Digital Wallet') NOT NULL,
  status ENUM('Completed', 'Refunded') DEFAULT 'Completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
  INDEX idx_sale_date (sale_date),
  INDEX idx_sale_customer (customer_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------------
-- Table Structure for 'transactions' (Order Line Items)
-- --------------------------------------------------------------
DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_cost DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  profit DECIMAL(10, 2) NOT NULL,
  transaction_date DATE NOT NULL,
  payment_reference VARCHAR(60) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  INDEX idx_txn_sale (sale_id),
  INDEX idx_txn_product (product_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------------
-- Table Structure for 'marketing_campaigns'
-- --------------------------------------------------------------
DROP TABLE IF EXISTS marketing_campaigns;
CREATE TABLE marketing_campaigns (
  campaign_id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_name VARCHAR(200) NOT NULL,
  channel ENUM('Email Marketing', 'Google Ads', 'Social Media', 'In-Store Promo', 'Influencer Campaign', 'Loyalty Program') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(10, 2) NOT NULL,
  spend DECIMAL(10, 2) NOT NULL,
  impressions INT NOT NULL DEFAULT 0,
  clicks INT NOT NULL DEFAULT 0,
  conversions INT NOT NULL DEFAULT 0,
  revenue_generated DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  roi_percentage DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
  status ENUM('Active', 'Completed', 'Planned') DEFAULT 'Active',
  INDEX idx_campaign_channel (channel),
  INDEX idx_campaign_status (status)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================
-- POPULATE SEED DATA (>= 50 Records per Table)
-- ==============================================================

-- 1. Insert into customers (${customers.length} rows)
INSERT INTO customers (customer_id, name, email, phone, address, city, customer_segment, registration_date, total_spent, status) VALUES
`;

  sql += customers.map((c) =>
    `(${c.customer_id}, '${escapeSQL(c.name)}', '${escapeSQL(c.email)}', '${escapeSQL(c.phone)}', '${escapeSQL(c.address)}', '${escapeSQL(c.city)}', '${c.customer_segment}', '${c.registration_date}', ${c.total_spent}, '${c.status}')`
  ).join(',\n') + ';\n\n';

  sql += `-- 2. Insert into products (${products.length} rows)\nINSERT INTO products (product_id, name, sku, category, cost_price, retail_price, stock_quantity, reorder_level, supplier_name, status) VALUES\n`;
  sql += products.map((p) =>
    `(${p.product_id}, '${escapeSQL(p.name)}', '${escapeSQL(p.sku)}', '${escapeSQL(p.category)}', ${p.cost_price}, ${p.retail_price}, ${p.stock_quantity}, ${p.reorder_level}, '${escapeSQL(p.supplier_name)}', '${p.status}')`
  ).join(',\n') + ';\n\n';

  sql += `-- 3. Insert into sales (${sales.length} rows)\nINSERT INTO sales (sale_id, customer_id, sale_date, subtotal, tax_amount, discount_amount, total_amount, cost_amount, profit_amount, payment_method, status) VALUES\n`;
  sql += sales.map((s) =>
    `(${s.sale_id}, ${s.customer_id}, '${s.sale_date}', ${s.subtotal}, ${s.tax_amount}, ${s.discount_amount}, ${s.total_amount}, ${s.cost_amount}, ${s.profit_amount}, '${s.payment_method}', '${s.status}')`
  ).join(',\n') + ';\n\n';

  sql += `-- 4. Insert into transactions (${transactions.length} rows)\nINSERT INTO transactions (transaction_id, sale_id, product_id, quantity, unit_cost, unit_price, total_price, profit, transaction_date, payment_reference) VALUES\n`;
  sql += transactions.map((t) =>
    `(${t.transaction_id}, ${t.sale_id}, ${t.product_id}, ${t.quantity}, ${t.unit_cost}, ${t.unit_price}, ${t.total_price}, ${t.profit}, '${t.transaction_date}', '${t.payment_reference}')`
  ).join(',\n') + ';\n\n';

  sql += `-- 5. Insert into marketing_campaigns (${campaigns.length} rows)\nINSERT INTO marketing_campaigns (campaign_id, campaign_name, channel, start_date, end_date, budget, spend, impressions, clicks, conversions, revenue_generated, roi_percentage, status) VALUES\n`;
  sql += campaigns.map((m) =>
    `(${m.campaign_id}, '${escapeSQL(m.campaign_name)}', '${escapeSQL(m.channel)}', '${m.start_date}', '${m.end_date}', ${m.budget}, ${m.spend}, ${m.impressions}, ${m.clicks}, ${m.conversions}, ${m.revenue_generated}, ${m.roi_percentage}, '${m.status}')`
  ).join(',\n') + ';\n';

  return sql;
}

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''");
}
