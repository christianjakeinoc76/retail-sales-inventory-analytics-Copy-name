import React, { useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  CreditCard,
  Percent,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Customer, Product, Sale, Transaction, ActiveTab } from '../types';
import { calculateFinancialTotals, getLowStockProducts } from '../utils/analytics';

interface DashboardViewProps {
  customers: Customer[];
  products: Product[];
  sales: Sale[];
  transactions: Transaction[];
  onNavigateTab: (tab: ActiveTab) => void;
  onRestockItem: (productId: number, qty: number) => void;
}

const RED_PALETTE = ['#DC2626', '#111827', '#4B5563', '#9CA3AF', '#EF4444', '#B91C1C'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  customers,
  products,
  sales,
  transactions,
  onNavigateTab,
  onRestockItem,
}) => {
  const financialTotals = useMemo(() => calculateFinancialTotals(sales), [sales]);
  const lowStockItems = useMemo(() => getLowStockProducts(products), [products]);

  // Aggregate monthly sales & profit for charts
  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; revenue: number; profit: number; cost: number; orders: number }> = {
      'Jan 2026': { month: 'Jan', revenue: 0, profit: 0, cost: 0, orders: 0 },
      'Feb 2026': { month: 'Feb', revenue: 0, profit: 0, cost: 0, orders: 0 },
      'Mar 2026': { month: 'Mar', revenue: 0, profit: 0, cost: 0, orders: 0 },
    };

    for (const sale of sales) {
      if (sale.status === 'Refunded') continue;
      const date = new Date(sale.sale_date);
      const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (map[key]) {
        map[key].revenue += sale.total_amount;
        map[key].profit += sale.profit_amount;
        map[key].cost += sale.cost_amount;
        map[key].orders += 1;
      }
    }

    return Object.values(map).map((m) => ({
      ...m,
      revenue: Math.round(m.revenue),
      profit: Math.round(m.profit),
      cost: Math.round(m.cost),
    }));
  }, [sales]);

  // Aggregate sales by Category
  const categoryData = useMemo(() => {
    const catMap: Record<string, { category: string; revenue: number; count: number }> = {};
    for (const txn of transactions) {
      const prod = products.find((p) => p.product_id === txn.product_id);
      const cat = prod?.category || 'General';
      if (!catMap[cat]) catMap[cat] = { category: cat, revenue: 0, count: 0 };
      catMap[cat].revenue += txn.total_price;
      catMap[cat].count += txn.quantity;
    }
    return Object.values(catMap).map((c) => ({
      ...c,
      revenue: Math.round(c.revenue),
    }));
  }, [transactions, products]);

  // Payment methods breakdown
  const paymentData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const sale of sales) {
      map[sale.payment_method] = (map[sale.payment_method] || 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [sales]);

  return (
    <div className="space-y-6">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Executive Retail Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time sales performance, inventory status, and financial health
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Live & Connected
          </span>
          <button
            onClick={() => onNavigateTab('sales')}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Launch POS
          </button>
        </div>
      </div>

      {/* Low-stock Alerts Banner if any */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600 text-white shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-red-950">
                Action Required: {lowStockItems.length} Products at or below Reorder Threshold
              </h2>
              <p className="text-xs text-red-800 mt-0.5">
                Urgent inventory warning. Several high-demand items risk stockout in the next 7 days.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => onNavigateTab('products')}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Manage Inventory
            </button>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              View Prescriptive EOQ
            </button>
          </div>
        </div>
      )}

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">
              ${financialTotals.totalRevenue.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-600 font-semibold gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4%</span>
            <span className="text-gray-400 font-normal ml-1">vs last quarter</span>
          </div>
        </div>

        {/* Total Profit */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Profit</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">
              ${financialTotals.totalProfit.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs text-gray-600 font-medium gap-1">
            <Percent className="w-3.5 h-3.5 text-red-600" />
            <span className="font-bold text-gray-900">{financialTotals.profitMarginPercent}%</span>
            <span className="text-gray-400">Net Margin</span>
          </div>
        </div>

        {/* Total Sales Count */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-gray-100 text-gray-800 rounded-lg">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">
              {financialTotals.completedSalesCount}
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <span>Avg ticket: </span>
            <span className="font-bold text-gray-900 ml-1">${financialTotals.averageOrderValue}</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customers</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{customers.length}</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-600 font-semibold gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Active: {customers.filter((c) => c.status === 'Active').length}</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Products in Catalog</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{products.length}</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-red-600 font-semibold gap-1">
            <span>Low Stock: {lowStockItems.length}</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Profit Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900">Revenue & Net Profit Trend</h2>
              <p className="text-xs text-gray-500">Monthly progression across verified transactions</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-red-600 inline-block"></span> Revenue ($)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-gray-900 inline-block"></span> Net Profit ($)
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111827" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#111827" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#DC2626" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#111827" strokeWidth={2.5} fillOpacity={1} fill="url(#profitGrad)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Sales by Category</h2>
              <p className="text-xs text-gray-500">Revenue distribution by department</p>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Catalog
            </button>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `$${val}`} />
                <YAxis dataKey="category" type="category" stroke="#475569" fontSize={11} width={85} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#DC2626" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Sales & Low-Stock Quick Restock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-red-600" />
              <h2 className="text-sm font-bold text-gray-900">Recent Completed Sales</h2>
            </div>
            <button
              onClick={() => onNavigateTab('sales')}
              className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
            >
              All Sales <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {sales.slice(0, 6).map((sale) => {
              const cust = customers.find((c) => c.customer_id === sale.customer_id);
              return (
                <div key={sale.sale_id} className="p-4 flex items-center justify-between hover:bg-gray-50/70 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-900">Order #{sale.sale_id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold">
                        {sale.payment_method}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Customer: <span className="font-medium text-gray-700">{cust?.name || `Customer #${sale.customer_id}`}</span> | {sale.sale_date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">${sale.total_amount.toFixed(2)}</p>
                    <p className="text-xs font-semibold text-emerald-600">+${sale.profit_amount.toFixed(2)} profit</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low-Stock Reorder Watchlist */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <h2 className="text-sm font-bold text-gray-900">Inventory Alert Watchlist</h2>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
            >
              Catalog & Stock <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                No inventory alerts currently active. All stock quantities are above minimum safety thresholds.
              </div>
            ) : (
              lowStockItems.slice(0, 6).map((item) => (
                <div key={item.product_id} className="p-4 flex items-center justify-between hover:bg-red-50/30 transition-colors">
                  <div className="max-w-[65%]">
                    <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      SKU: <span className="font-mono">{item.sku}</span> | Supplier: {item.supplier_name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.stock_quantity === 0
                          ? 'bg-black text-white'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.stock_quantity === 0 ? 'OUT OF STOCK' : `Only ${item.stock_quantity} left`}
                      </span>
                      <span className="text-[10px] text-gray-400">Reorder level: {item.reorder_level}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRestockItem(item.product_id, 25)}
                      className="px-3 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      +25 Restock
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
