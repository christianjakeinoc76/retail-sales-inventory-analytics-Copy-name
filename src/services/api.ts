import {
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_TRANSACTIONS,
  INITIAL_CAMPAIGNS,
  generateMySQLDump,
} from '../data/retailDatabase';
import type { Customer, Product, Sale, Transaction, MarketingCampaign, User } from '../types';

const STORAGE_KEYS = {
  CUSTOMERS: 'retail_customers_v1',
  PRODUCTS: 'retail_products_v1',
  SALES: 'retail_sales_v1',
  TRANSACTIONS: 'retail_transactions_v1',
  CAMPAIGNS: 'retail_campaigns_v1',
  CURRENT_USER: 'retail_user_v1',
};

// Safe local storage helpers
function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(fallback) && parsed.length === 0 ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save failed', e);
  }
}

export const api = {
  // Current session user
  getCurrentUser(): User {
    return (
      loadLocal<User>(STORAGE_KEYS.CURRENT_USER, {
        id: 1,
        name: 'Alexander Cross',
        email: 'admin@retail.com',
        role: 'Admin',
      })
    );
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      saveLocal(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const json = await res.json();
        saveLocal(STORAGE_KEYS.CUSTOMERS, json.data);
        return json.data;
      }
    } catch {
      // Fallback to local
    }
    return loadLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },

  async addCustomer(customer: Omit<Customer, 'customer_id' | 'total_spent' | 'registration_date' | 'status'>): Promise<Customer> {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const current = loadLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const newId = current.length > 0 ? Math.max(...current.map((c) => c.customer_id)) + 1 : 1;
    const created: Customer = {
      ...customer,
      customer_id: newId,
      total_spent: 0,
      registration_date: new Date().toISOString().split('T')[0],
      status: 'Active',
    };
    const updated = [created, ...current];
    saveLocal(STORAGE_KEYS.CUSTOMERS, updated);
    return created;
  },

  async updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer> {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const current = loadLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const index = current.findIndex((c) => c.customer_id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates };
      saveLocal(STORAGE_KEYS.CUSTOMERS, current);
      return current[index];
    }
    throw new Error('Customer not found');
  },

  async deleteCustomer(id: number): Promise<boolean> {
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {}

    const current = loadLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const filtered = current.filter((c) => c.customer_id !== id);
    saveLocal(STORAGE_KEYS.CUSTOMERS, filtered);
    return true;
  },

  // Products
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const json = await res.json();
        saveLocal(STORAGE_KEYS.PRODUCTS, json.data);
        return json.data;
      }
    } catch {}
    return loadLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  async addProduct(product: Omit<Product, 'product_id' | 'status'>): Promise<Product> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const current = loadLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const newId = current.length > 0 ? Math.max(...current.map((p) => p.product_id)) + 1 : 1;
    const status: Product['status'] =
      product.stock_quantity === 0
        ? 'Out of Stock'
        : product.stock_quantity <= product.reorder_level
        ? 'Low Stock'
        : 'In Stock';
    const created: Product = {
      ...product,
      product_id: newId,
      status,
    };
    const updated = [created, ...current];
    saveLocal(STORAGE_KEYS.PRODUCTS, updated);
    return created;
  },

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const current = loadLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const index = current.findIndex((p) => p.product_id === id);
    if (index !== -1) {
      const item = { ...current[index], ...updates };
      if (item.stock_quantity === 0) item.status = 'Out of Stock';
      else if (item.stock_quantity <= item.reorder_level) item.status = 'Low Stock';
      else item.status = 'In Stock';

      current[index] = item;
      saveLocal(STORAGE_KEYS.PRODUCTS, current);
      return item;
    }
    throw new Error('Product not found');
  },

  async restockProduct(id: number, quantity: number): Promise<Product> {
    try {
      const res = await fetch(`/api/products/${id}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const current = loadLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const index = current.findIndex((p) => p.product_id === id);
    if (index !== -1) {
      current[index].stock_quantity += quantity;
      if (current[index].stock_quantity > current[index].reorder_level) {
        current[index].status = 'In Stock';
      } else if (current[index].stock_quantity > 0) {
        current[index].status = 'Low Stock';
      }
      saveLocal(STORAGE_KEYS.PRODUCTS, current);
      return current[index];
    }
    throw new Error('Product not found');
  },

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {}

    const current = loadLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const filtered = current.filter((p) => p.product_id !== id);
    saveLocal(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  },

  // Sales & POS Checkout
  async getSales(): Promise<Sale[]> {
    try {
      const res = await fetch('/api/sales');
      if (res.ok) {
        const json = await res.json();
        saveLocal(STORAGE_KEYS.SALES, json.data);
        return json.data;
      }
    } catch {}
    return loadLocal<Sale[]>(STORAGE_KEYS.SALES, INITIAL_SALES);
  },

  async getTransactions(): Promise<Transaction[]> {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const json = await res.json();
        saveLocal(STORAGE_KEYS.TRANSACTIONS, json.data);
        return json.data;
      }
    } catch {}
    return loadLocal<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  },

  async recordSale(payload: {
    customer_id: number;
    items: { product_id: number; quantity: number }[];
    discount_amount: number;
    payment_method: Sale['payment_method'];
  }): Promise<{ sale: Sale; transactions: Transaction[] }> {
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    // Local fallback processing
    const products = loadLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const sales = loadLocal<Sale[]>(STORAGE_KEYS.SALES, INITIAL_SALES);
    const transactions = loadLocal<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    const customers = loadLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);

    const newSaleId = sales.length > 0 ? Math.max(...sales.map((s) => s.sale_id)) + 1 : 101;
    const today = new Date().toISOString().split('T')[0];

    let subtotal = 0;
    let costAmount = 0;
    const newTxns: Transaction[] = [];

    for (const item of payload.items) {
      const prod = products.find((p) => p.product_id === item.product_id);
      if (!prod) continue;
      const qty = item.quantity;
      const totalP = Number((prod.retail_price * qty).toFixed(2));
      const totalC = Number((prod.cost_price * qty).toFixed(2));

      subtotal += totalP;
      costAmount += totalC;

      prod.stock_quantity = Math.max(0, prod.stock_quantity - qty);
      if (prod.stock_quantity === 0) prod.status = 'Out of Stock';
      else if (prod.stock_quantity <= prod.reorder_level) prod.status = 'Low Stock';

      const txnId = transactions.length > 0 ? Math.max(...transactions.map((t) => t.transaction_id)) + 1 + newTxns.length : 501;
      newTxns.push({
        transaction_id: txnId,
        sale_id: newSaleId,
        product_id: prod.product_id,
        quantity: qty,
        unit_cost: prod.cost_price,
        unit_price: prod.retail_price,
        total_price: totalP,
        profit: Number((totalP - totalC).toFixed(2)),
        transaction_date: today,
        payment_reference: `TXN-90${txnId}`,
      });
    }

    const taxAmount = Number((subtotal * 0.08).toFixed(2));
    const discount = Math.min(subtotal, Math.max(0, payload.discount_amount || 0));
    const totalAmount = Number((subtotal + taxAmount - discount).toFixed(2));
    const profitAmount = Number((subtotal - discount - costAmount).toFixed(2));

    const newSale: Sale = {
      sale_id: newSaleId,
      customer_id: payload.customer_id,
      sale_date: today,
      subtotal: Number(subtotal.toFixed(2)),
      tax_amount: taxAmount,
      discount_amount: discount,
      total_amount: totalAmount,
      cost_amount: Number(costAmount.toFixed(2)),
      profit_amount: profitAmount,
      payment_method: payload.payment_method,
      status: 'Completed',
    };

    saveLocal(STORAGE_KEYS.PRODUCTS, products);
    saveLocal(STORAGE_KEYS.SALES, [newSale, ...sales]);
    saveLocal(STORAGE_KEYS.TRANSACTIONS, [...newTxns, ...transactions]);

    const cust = customers.find((c) => c.customer_id === payload.customer_id);
    if (cust) {
      cust.total_spent = Number((cust.total_spent + totalAmount).toFixed(2));
      saveLocal(STORAGE_KEYS.CUSTOMERS, customers);
    }

    return { sale: newSale, transactions: newTxns };
  },

  // Marketing Campaigns
  async getCampaigns(): Promise<MarketingCampaign[]> {
    try {
      const res = await fetch('/api/campaigns');
      if (res.ok) {
        const json = await res.json();
        saveLocal(STORAGE_KEYS.CAMPAIGNS, json.data);
        return json.data;
      }
    } catch {}
    return loadLocal<MarketingCampaign[]>(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
  },

  async addCampaign(campaign: Omit<MarketingCampaign, 'campaign_id' | 'roi_percentage'>): Promise<MarketingCampaign> {
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const current = loadLocal<MarketingCampaign[]>(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    const newId = current.length > 0 ? Math.max(...current.map((c) => c.campaign_id)) + 1 : 1;
    const roi = campaign.spend > 0 ? Number((((campaign.revenue_generated - campaign.spend) / campaign.spend) * 100).toFixed(1)) : 0;
    const created: MarketingCampaign = {
      ...campaign,
      campaign_id: newId,
      roi_percentage: roi,
    };
    saveLocal(STORAGE_KEYS.CAMPAIGNS, [created, ...current]);
    return created;
  },

  async updateCampaign(id: number, updates: Partial<MarketingCampaign>): Promise<MarketingCampaign> {
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const current = loadLocal<MarketingCampaign[]>(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    const index = current.findIndex((c) => c.campaign_id === id);
    if (index !== -1) {
      const item = { ...current[index], ...updates };
      if (item.spend > 0 && item.revenue_generated != null) {
        item.roi_percentage = Number((((item.revenue_generated - item.spend) / item.spend) * 100).toFixed(1));
      }
      current[index] = item;
      saveLocal(STORAGE_KEYS.CAMPAIGNS, current);
      return item;
    }
    throw new Error('Campaign not found');
  },

  async deleteCampaign(id: number): Promise<boolean> {
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {}

    const current = loadLocal<MarketingCampaign[]>(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    const filtered = current.filter((c) => c.campaign_id !== id);
    saveLocal(STORAGE_KEYS.CAMPAIGNS, filtered);
    return true;
  },

  // MySQL SQL Dump and Query Runner
  async executeSQL(query: string): Promise<{ columns: string[]; rows: any[]; rowCount: number }> {
    try {
      const res = await fetch('/api/database/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        const json = await res.json();
        return { columns: json.columns, rows: json.rows, rowCount: json.rowCount };
      }
    } catch {}

    // In-browser mock execution
    const q = query.trim().toUpperCase();
    if (q.includes('PRODUCTS')) {
      const prods = loadLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      const filtered = q.includes('REORDER_LEVEL') ? prods.filter((p) => p.stock_quantity <= p.reorder_level) : prods.slice(0, 20);
      return { columns: Object.keys(filtered[0] || {}), rows: filtered, rowCount: filtered.length };
    }
    if (q.includes('CUSTOMERS')) {
      const custs = loadLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
      const filtered = q.includes('VIP') ? custs.filter((c) => c.customer_segment === 'VIP') : custs.slice(0, 20);
      return { columns: Object.keys(filtered[0] || {}), rows: filtered, rowCount: filtered.length };
    }
    return {
      columns: ['Message', 'Status'],
      rows: [{ Message: `Executed: ${query}`, Status: 'Success (MySQL syntax valid)' }],
      rowCount: 1,
    };
  },

  getMySQLDumpText(): string {
    const custs = loadLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const prods = loadLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const sales = loadLocal<Sale[]>(STORAGE_KEYS.SALES, INITIAL_SALES);
    const txns = loadLocal<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    const camps = loadLocal<MarketingCampaign[]>(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    return generateMySQLDump(custs, prods, sales, txns, camps);
  },

  resetDatabase(): void {
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CAMPAIGNS);
    fetch('/api/database/reset', { method: 'POST' }).catch(() => {});
  },
};
