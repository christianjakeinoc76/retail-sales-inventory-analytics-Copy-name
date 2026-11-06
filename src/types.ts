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

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Inventory Manager' | 'Cashier' | 'Business Analyst';
}

export type ActiveTab =
  | 'dashboard'
  | 'customers'
  | 'products'
  | 'sales'
  | 'marketing'
  | 'analytics'
  | 'database';
