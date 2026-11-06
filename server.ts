import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_TRANSACTIONS,
  INITIAL_CAMPAIGNS,
  generateMySQLDump,
  type Customer,
  type Product,
  type Sale,
  type Transaction,
  type MarketingCampaign,
} from './src/data/retailDatabase.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-Memory Database State (Initialized with 50+ realistic records each)
let customers: Customer[] = [...INITIAL_CUSTOMERS];
let products: Product[] = [...INITIAL_PRODUCTS];
let sales: Sale[] = [...INITIAL_SALES];
let transactions: Transaction[] = [...INITIAL_TRANSACTIONS];
let campaigns: MarketingCampaign[] = [...INITIAL_CAMPAIGNS];

// In-Memory Users for Auth
let users = [
  { id: 1, name: 'Admin Manager', email: 'admin@retail.com', password: 'password123', role: 'Admin' },
  { id: 2, name: 'Elena Vance', email: 'manager@retail.com', password: 'password123', role: 'Inventory Manager' },
  { id: 3, name: 'Carlos Ramos', email: 'cashier@retail.com', password: 'password123', role: 'Cashier' },
  { id: 4, name: 'Nadia Thorne', email: 'analyst@retail.com', password: 'password123', role: 'Business Analyst' },
];

// -------------------------------------------------------------
// AUTH ENDPOINTS
// -------------------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  return res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token: `token_${user.id}_${Date.now()}`,
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  const newUser = {
    id: users.length + 1,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: role || 'Cashier',
  };
  users.push(newUser);
  return res.json({
    success: true,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    token: `token_${newUser.id}_${Date.now()}`,
  });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (!user) {
    return res.status(404).json({ success: false, message: 'Email address not found in system' });
  }
  return res.json({
    success: true,
    message: `Password reset instructions and verification PIN have been sent to ${email}.`,
    tempPin: '849201',
  });
});

// -------------------------------------------------------------
// CUSTOMERS CRUD
// -------------------------------------------------------------
app.get('/api/customers', (_req: Request, res: Response) => {
  res.json({ success: true, count: customers.length, data: customers });
});

app.post('/api/customers', (req: Request, res: Response) => {
  const { name, email, phone, address, city, customer_segment } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ success: false, message: 'Name, email, and phone are required' });
  }
  const newCustomer: Customer = {
    customer_id: customers.length > 0 ? Math.max(...customers.map((c) => c.customer_id)) + 1 : 1,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    address: (address || '123 Market St').trim(),
    city: (city || 'New York').trim(),
    customer_segment: customer_segment || 'Regular',
    registration_date: new Date().toISOString().split('T')[0],
    total_spent: 0,
    status: 'Active',
  };
  customers.unshift(newCustomer);
  res.status(201).json({ success: true, data: newCustomer });
});

app.put('/api/customers/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const index = customers.findIndex((c) => c.customer_id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }
  customers[index] = { ...customers[index], ...req.body, customer_id: id };
  res.json({ success: true, data: customers[index] });
});

app.delete('/api/customers/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const index = customers.findIndex((c) => c.customer_id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }
  const deleted = customers.splice(index, 1)[0];
  res.json({ success: true, message: 'Customer deleted successfully', data: deleted });
});

// -------------------------------------------------------------
// PRODUCTS & INVENTORY CRUD
// -------------------------------------------------------------
app.get('/api/products', (_req: Request, res: Response) => {
  res.json({ success: true, count: products.length, data: products });
});

app.post('/api/products', (req: Request, res: Response) => {
  const { name, sku, category, cost_price, retail_price, stock_quantity, reorder_level, supplier_name } = req.body;
  if (!name || !sku || !category || cost_price == null || retail_price == null) {
    return res.status(400).json({ success: false, message: 'Missing required product fields' });
  }
  const stock = parseInt(stock_quantity || 0, 10);
  const reorder = parseInt(reorder_level || 10, 10);
  const status: Product['status'] = stock === 0 ? 'Out of Stock' : stock <= reorder ? 'Low Stock' : 'In Stock';

  const newProduct: Product = {
    product_id: products.length > 0 ? Math.max(...products.map((p) => p.product_id)) + 1 : 1,
    name: name.trim(),
    sku: sku.trim().toUpperCase(),
    category,
    cost_price: parseFloat(cost_price),
    retail_price: parseFloat(retail_price),
    stock_quantity: stock,
    reorder_level: reorder,
    supplier_name: (supplier_name || 'Apex Logistics').trim(),
    status,
  };
  products.unshift(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const index = products.findIndex((p) => p.product_id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  const current = products[index];
  const updated = { ...current, ...req.body, product_id: id };
  if (updated.stock_quantity === 0) {
    updated.status = 'Out of Stock';
  } else if (updated.stock_quantity <= updated.reorder_level) {
    updated.status = 'Low Stock';
  } else {
    updated.status = 'In Stock';
  }
  products[index] = updated;
  res.json({ success: true, data: products[index] });
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const index = products.findIndex((p) => p.product_id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  const deleted = products.splice(index, 1)[0];
  res.json({ success: true, message: 'Product removed', data: deleted });
});

app.post('/api/products/:id/restock', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { quantity } = req.body;
  const index = products.findIndex((p) => p.product_id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  const addQty = Math.max(1, parseInt(quantity || 20, 10));
  products[index].stock_quantity += addQty;
  if (products[index].stock_quantity > products[index].reorder_level) {
    products[index].status = 'In Stock';
  } else if (products[index].stock_quantity > 0) {
    products[index].status = 'Low Stock';
  }
  res.json({ success: true, message: `Restocked ${addQty} units`, data: products[index] });
});

// -------------------------------------------------------------
// SALES & TRANSACTIONS (POS)
// -------------------------------------------------------------
app.get('/api/sales', (_req: Request, res: Response) => {
  res.json({ success: true, count: sales.length, data: sales });
});

app.get('/api/transactions', (_req: Request, res: Response) => {
  res.json({ success: true, count: transactions.length, data: transactions });
});

app.post('/api/sales', (req: Request, res: Response) => {
  const { customer_id, items, discount_amount = 0, payment_method = 'Credit Card' } = req.body;
  if (!customer_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Customer and items are required' });
  }

  const newSaleId = sales.length > 0 ? Math.max(...sales.map((s) => s.sale_id)) + 1 : 101;
  const today = new Date().toISOString().split('T')[0];

  let subtotal = 0;
  let costAmount = 0;
  const generatedTransactions: Transaction[] = [];

  for (const item of items) {
    const prod = products.find((p) => p.product_id === item.product_id);
    if (!prod) continue;
    const qty = Math.max(1, parseInt(item.quantity || 1, 10));
    const itemTotal = Number((prod.retail_price * qty).toFixed(2));
    const itemCost = Number((prod.cost_price * qty).toFixed(2));
    const itemProfit = Number((itemTotal - itemCost).toFixed(2));

    subtotal += itemTotal;
    costAmount += itemCost;

    // Deduct stock
    prod.stock_quantity = Math.max(0, prod.stock_quantity - qty);
    if (prod.stock_quantity === 0) {
      prod.status = 'Out of Stock';
    } else if (prod.stock_quantity <= prod.reorder_level) {
      prod.status = 'Low Stock';
    }

    const nextTxnId = transactions.length > 0 ? Math.max(...transactions.map((t) => t.transaction_id)) + 1 + generatedTransactions.length : 501;
    generatedTransactions.push({
      transaction_id: nextTxnId,
      sale_id: newSaleId,
      product_id: prod.product_id,
      quantity: qty,
      unit_cost: prod.cost_price,
      unit_price: prod.retail_price,
      total_price: itemTotal,
      profit: itemProfit,
      transaction_date: today,
      payment_reference: `TXN-90${nextTxnId}`,
    });
  }

  const taxAmount = Number((subtotal * 0.08).toFixed(2));
  const discount = Math.min(subtotal, Math.max(0, parseFloat(discount_amount || 0)));
  const totalAmount = Number((subtotal + taxAmount - discount).toFixed(2));
  const profitAmount = Number((subtotal - discount - costAmount).toFixed(2));

  const newSale: Sale = {
    sale_id: newSaleId,
    customer_id: parseInt(customer_id, 10),
    sale_date: today,
    subtotal: Number(subtotal.toFixed(2)),
    tax_amount: taxAmount,
    discount_amount: discount,
    total_amount: totalAmount,
    cost_amount: Number(costAmount.toFixed(2)),
    profit_amount: profitAmount,
    payment_method,
    status: 'Completed',
  };

  sales.unshift(newSale);
  transactions.unshift(...generatedTransactions);

  // Update customer total_spent
  const cust = customers.find((c) => c.customer_id === newSale.customer_id);
  if (cust) {
    cust.total_spent = Number((cust.total_spent + totalAmount).toFixed(2));
  }

  res.status(201).json({
    success: true,
    data: {
      sale: newSale,
      transactions: generatedTransactions,
    },
  });
});

// -------------------------------------------------------------
// MARKETING CAMPAIGNS CRUD
// -------------------------------------------------------------
app.get('/api/campaigns', (_req: Request, res: Response) => {
  res.json({ success: true, count: campaigns.length, data: campaigns });
});

app.post('/api/campaigns', (req: Request, res: Response) => {
  const { campaign_name, channel, budget, spend, impressions, clicks, conversions, revenue_generated, status } = req.body;
  if (!campaign_name || !channel || budget == null) {
    return res.status(400).json({ success: false, message: 'Name, channel, and budget are required' });
  }

  const b = parseFloat(budget);
  const s = parseFloat(spend || 0);
  const rev = parseFloat(revenue_generated || 0);
  const roi = s > 0 ? Number((((rev - s) / s) * 100).toFixed(1)) : 0;

  const newCampaign: MarketingCampaign = {
    campaign_id: campaigns.length > 0 ? Math.max(...campaigns.map((c) => c.campaign_id)) + 1 : 1,
    campaign_name: campaign_name.trim(),
    channel,
    start_date: req.body.start_date || new Date().toISOString().split('T')[0],
    end_date: req.body.end_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    budget: b,
    spend: s,
    impressions: parseInt(impressions || 0, 10),
    clicks: parseInt(clicks || 0, 10),
    conversions: parseInt(conversions || 0, 10),
    revenue_generated: rev,
    roi_percentage: roi,
    status: status || 'Active',
  };

  campaigns.unshift(newCampaign);
  res.status(201).json({ success: true, data: newCampaign });
});

app.put('/api/campaigns/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const index = campaigns.findIndex((c) => c.campaign_id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }
  const current = campaigns[index];
  const updated = { ...current, ...req.body, campaign_id: id };
  if (updated.spend > 0 && updated.revenue_generated != null) {
    updated.roi_percentage = Number((((updated.revenue_generated - updated.spend) / updated.spend) * 100).toFixed(1));
  }
  campaigns[index] = updated;
  res.json({ success: true, data: campaigns[index] });
});

app.delete('/api/campaigns/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const index = campaigns.findIndex((c) => c.campaign_id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }
  const deleted = campaigns.splice(index, 1)[0];
  res.json({ success: true, message: 'Campaign deleted', data: deleted });
});

// -------------------------------------------------------------
// DATABASE EXPLORER & MYSQL DUMP
// -------------------------------------------------------------
app.get('/api/database/dump', (_req: Request, res: Response) => {
  const sql = generateMySQLDump(customers, products, sales, transactions, campaigns);
  res.setHeader('Content-Type', 'application/sql');
  res.setHeader('Content-Disposition', 'attachment; filename="retail_business_analytics.sql"');
  res.send(sql);
});

app.get('/api/database/stats', (_req: Request, res: Response) => {
  res.json({
    database: 'retail_business_analytics',
    tables: [
      { name: 'customers', rows: customers.length, primaryKey: 'customer_id', foreignKeys: [] },
      { name: 'products', rows: products.length, primaryKey: 'product_id', foreignKeys: [] },
      { name: 'sales', rows: sales.length, primaryKey: 'sale_id', foreignKeys: ['customer_id -> customers.customer_id'] },
      { name: 'transactions', rows: transactions.length, primaryKey: 'transaction_id', foreignKeys: ['sale_id -> sales.sale_id', 'product_id -> products.product_id'] },
      { name: 'marketing_campaigns', rows: campaigns.length, primaryKey: 'campaign_id', foreignKeys: [] },
    ],
  });
});

app.post('/api/database/reset', (_req: Request, res: Response) => {
  customers = [...INITIAL_CUSTOMERS];
  products = [...INITIAL_PRODUCTS];
  sales = [...INITIAL_SALES];
  transactions = [...INITIAL_TRANSACTIONS];
  campaigns = [...INITIAL_CAMPAIGNS];
  res.json({ success: true, message: 'Database reset to initial 50+ sample records per table.' });
});

// Interactive SQL query execution simulator
app.post('/api/database/query', (req: Request, res: Response) => {
  const rawQuery = (req.body.query || '').trim();
  if (!rawQuery) {
    return res.status(400).json({ success: false, message: 'SQL query string required' });
  }

  const queryUpper = rawQuery.toUpperCase();

  try {
    if (queryUpper.startsWith('SHOW TABLES')) {
      return res.json({
        success: true,
        columns: ['Tables_in_retail_business_analytics'],
        rows: [
          { Tables_in_retail_business_analytics: 'customers' },
          { Tables_in_retail_business_analytics: 'products' },
          { Tables_in_retail_business_analytics: 'sales' },
          { Tables_in_retail_business_analytics: 'transactions' },
          { Tables_in_retail_business_analytics: 'marketing_campaigns' },
        ],
        rowCount: 5,
      });
    }

    if (queryUpper.startsWith('DESCRIBE') || queryUpper.startsWith('DESC')) {
      const parts = rawQuery.split(/\s+/);
      const tableName = (parts[1] || '').toLowerCase().replace(';', '');
      let schemaRows: any[] = [];
      if (tableName === 'customers') {
        schemaRows = [
          { Field: 'customer_id', Type: 'int AUTO_INCREMENT', Null: 'NO', Key: 'PRI', Default: null },
          { Field: 'name', Type: 'varchar(120)', Null: 'NO', Key: '', Default: null },
          { Field: 'email', Type: 'varchar(150)', Null: 'NO', Key: 'UNI', Default: null },
          { Field: 'phone', Type: 'varchar(30)', Null: 'NO', Key: '', Default: null },
          { Field: 'address', Type: 'varchar(255)', Null: 'NO', Key: '', Default: null },
          { Field: 'city', Type: 'varchar(80)', Null: 'NO', Key: '', Default: null },
          { Field: 'customer_segment', Type: "enum('VIP','Regular','Wholesale','Occasional')", Null: 'YES', Key: 'MUL', Default: 'Regular' },
          { Field: 'registration_date', Type: 'date', Null: 'NO', Key: '', Default: null },
          { Field: 'total_spent', Type: 'decimal(10,2)', Null: 'YES', Key: '', Default: '0.00' },
          { Field: 'status', Type: "enum('Active','Inactive')", Null: 'YES', Key: '', Default: 'Active' },
        ];
      } else if (tableName === 'products') {
        schemaRows = [
          { Field: 'product_id', Type: 'int AUTO_INCREMENT', Null: 'NO', Key: 'PRI', Default: null },
          { Field: 'name', Type: 'varchar(200)', Null: 'NO', Key: '', Default: null },
          { Field: 'sku', Type: 'varchar(50)', Null: 'NO', Key: 'UNI', Default: null },
          { Field: 'category', Type: "enum('Electronics','Apparel','Home & Kitchen','Health & Beauty','Sports & Outdoors')", Null: 'NO', Key: 'MUL', Default: null },
          { Field: 'cost_price', Type: 'decimal(10,2)', Null: 'NO', Key: '', Default: null },
          { Field: 'retail_price', Type: 'decimal(10,2)', Null: 'NO', Key: '', Default: null },
          { Field: 'stock_quantity', Type: 'int', Null: 'NO', Key: 'MUL', Default: '0' },
          { Field: 'reorder_level', Type: 'int', Null: 'NO', Key: '', Default: '10' },
          { Field: 'supplier_name', Type: 'varchar(120)', Null: 'NO', Key: '', Default: null },
          { Field: 'status', Type: "enum('In Stock','Low Stock','Out of Stock')", Null: 'YES', Key: '', Default: 'In Stock' },
        ];
      } else if (tableName === 'sales') {
        schemaRows = [
          { Field: 'sale_id', Type: 'int AUTO_INCREMENT', Null: 'NO', Key: 'PRI', Default: null },
          { Field: 'customer_id', Type: 'int', Null: 'NO', Key: 'MUL (FK)', Default: null },
          { Field: 'sale_date', Type: 'date', Null: 'NO', Key: 'MUL', Default: null },
          { Field: 'subtotal', Type: 'decimal(10,2)', Null: 'NO', Key: '', Default: null },
          { Field: 'tax_amount', Type: 'decimal(10,2)', Null: 'NO', Key: '', Default: '0.00' },
          { Field: 'discount_amount', Type: 'decimal(10,2)', Null: 'NO', Key: '', Default: '0.00' },
          { Field: 'total_amount', Type: 'decimal(10,2)', Null: 'NO', Key: '', Default: null },
          { Field: 'cost_amount', Type: 'decimal(10,2)', Null: 'NO', Key: '', Default: null },
          { Field: 'profit_amount', Type: 'decimal(10,2)', Null: 'NO', Key: '', Default: null },
          { Field: 'payment_method', Type: 'enum(...)', Null: 'NO', Key: '', Default: null },
          { Field: 'status', Type: "enum('Completed','Refunded')", Null: 'YES', Key: '', Default: 'Completed' },
        ];
      } else if (tableName === 'transactions') {
        schemaRows = [
          { Field: 'transaction_id', Type: 'int AUTO_INCREMENT', Null: 'NO', Key: 'PRI', Default: null },
          { Field: 'sale_id', Type: 'int', Null: 'NO', Key: 'MUL (FK)', Default: null },
          { Field: 'product_id', Type: 'int', Null: 'NO', Key: 'MUL (FK)', Default: null },
          { Field: 'quantity', Type: 'int', Null: 'NO', Key: '', Default: null },
          { Field: 'unit_cost', Type: 'decimal(10,2)', Null: 'NO', Key: '', Default: null },
          { Field: 'unit_price', Type: 'decimal(10,2)', Null: 'NO', Key: '', Default: null },
          { Field: 'total_price', Type: 'decimal(10,2)', Null: 'NO', Key: '', Default: null },
          { Field: 'profit', Type: 'decimal(10,2)', Null: 'NO', Key: '', Default: null },
          { Field: 'transaction_date', Type: 'date', Null: 'NO', Key: '', Default: null },
          { Field: 'payment_reference', Type: 'varchar(60)', Null: 'NO', Key: '', Default: null },
        ];
      } else if (tableName === 'marketing_campaigns') {
        schemaRows = [
          { Field: 'campaign_id', Type: 'int AUTO_INCREMENT', Null: 'NO', Key: 'PRI', Default: null },
          { Field: 'campaign_name', Type: 'varchar(200)', Null: 'NO', Key: '', Default: null },
          { Field: 'channel', Type: 'enum(...)', Null: 'NO', Key: 'MUL', Default: null },
          { Field: 'start_date', Type: 'date', Null: 'NO', Key: '', Default: null },
          { Field: 'end_date', Type: 'date', Null: 'NO', Key: '', Default: null },
          { Field: 'budget', Type: 'decimal(10,2)', Null: 'NO', Key: '', Default: null },
          { Field: 'spend', Type: 'decimal(10,2)', Null: 'NO', Key: '', Default: null },
          { Field: 'impressions', Type: 'int', Null: 'NO', Key: '', Default: '0' },
          { Field: 'clicks', Type: 'int', Null: 'NO', Key: '', Default: '0' },
          { Field: 'conversions', Type: 'int', Null: 'NO', Key: '', Default: '0' },
          { Field: 'revenue_generated', Type: 'decimal(10,2)', Null: 'NO', Key: '', Default: '0.00' },
          { Field: 'roi_percentage', Type: 'decimal(6,2)', Null: 'NO', Key: '', Default: '0.00' },
          { Field: 'status', Type: "enum('Active','Completed','Planned')", Null: 'YES', Key: '', Default: 'Active' },
        ];
      } else {
        return res.status(404).json({ success: false, message: `Table '${tableName}' doesn't exist in retail_business_analytics` });
      }

      return res.json({
        success: true,
        columns: ['Field', 'Type', 'Null', 'Key', 'Default'],
        rows: schemaRows,
        rowCount: schemaRows.length,
      });
    }

    // Handle SELECT queries
    if (queryUpper.startsWith('SELECT')) {
      let targetTable = '';
      if (queryUpper.includes('FROM CUSTOMERS')) targetTable = 'customers';
      else if (queryUpper.includes('FROM PRODUCTS')) targetTable = 'products';
      else if (queryUpper.includes('FROM SALES')) targetTable = 'sales';
      else if (queryUpper.includes('FROM TRANSACTIONS')) targetTable = 'transactions';
      else if (queryUpper.includes('FROM MARKETING_CAMPAIGNS')) targetTable = 'marketing_campaigns';

      let dataset: any[] = [];
      if (targetTable === 'customers') dataset = [...customers];
      else if (targetTable === 'products') dataset = [...products];
      else if (targetTable === 'sales') dataset = [...sales];
      else if (targetTable === 'transactions') dataset = [...transactions];
      else if (targetTable === 'marketing_campaigns') dataset = [...campaigns];
      else {
        return res.json({
          success: true,
          columns: ['Result'],
          rows: [{ Result: 'Query executed successfully' }],
          rowCount: 1,
        });
      }

      // Check for WHERE filters
      if (queryUpper.includes('WHERE')) {
        if (queryUpper.includes('STOCK_QUANTITY <= REORDER_LEVEL') || queryUpper.includes('STATUS = \'LOW STOCK\'')) {
          dataset = dataset.filter((p) => p.stock_quantity <= p.reorder_level);
        } else if (queryUpper.includes('STATUS = \'ACTIVE\'')) {
          dataset = dataset.filter((item) => item.status === 'Active');
        } else if (queryUpper.includes('VIP')) {
          dataset = dataset.filter((c) => c.customer_segment === 'VIP');
        }
      }

      // Check for LIMIT
      const limitMatch = queryUpper.match(/LIMIT\s+(\d+)/);
      if (limitMatch) {
        const lim = parseInt(limitMatch[1], 10);
        dataset = dataset.slice(0, lim);
      }

      const columns = dataset.length > 0 ? Object.keys(dataset[0]) : ['No data'];
      return res.json({
        success: true,
        columns,
        rows: dataset,
        rowCount: dataset.length,
      });
    }

    return res.json({
      success: true,
      columns: ['Status'],
      rows: [{ Status: `Executed query: ${rawQuery}` }],
      rowCount: 1,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'SQL execution error' });
  }
});

// -------------------------------------------------------------
// VITE DEV SERVER / STATIC PRODUCTION MOUNT
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Retail Management Server running on http://localhost:${PORT}`);
  });
}

startServer();
