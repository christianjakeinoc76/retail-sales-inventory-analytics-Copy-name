import React, { useState, useMemo } from 'react';
import {
  Receipt,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  DollarSign,
  CreditCard,
  User as UserIcon,
  CheckCircle,
  FileText,
  Printer,
  Download,
  Percent,
  Calendar,
  X,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import type { Customer, Product, Sale, Transaction } from '../types';

interface SalesViewProps {
  customers: Customer[];
  products: Product[];
  sales: Sale[];
  transactions: Transaction[];
  onRecordSale: (payload: {
    customer_id: number;
    items: { product_id: number; quantity: number }[];
    discount_amount: number;
    payment_method: Sale['payment_method'];
  }) => Promise<{ sale: Sale; transactions: Transaction[] }>;
}

export const SalesView: React.FC<SalesViewProps> = ({
  customers,
  products,
  sales,
  transactions,
  onRecordSale,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pos' | 'history'>('pos');

  // POS State
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(
    customers[0]?.customer_id || 1
  );
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Sale['payment_method']>('Credit Card');
  const [productCatalogSearch, setProductCatalogSearch] = useState('');
  const [productCatalogCategory, setProductCatalogCategory] = useState('ALL');
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [completedReceiptSale, setCompletedReceiptSale] = useState<Sale | null>(null);

  // History State
  const [historySearch, setHistorySearch] = useState('');
  const [historyPaymentFilter, setHistoryPaymentFilter] = useState('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<Sale | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // POS Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.retail_price * item.quantity, 0);
  }, [cart]);

  const costTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.cost_price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return Number(((subtotal * discountPercent) / 100).toFixed(2));
  }, [subtotal, discountPercent]);

  const taxAmount = useMemo(() => {
    return Number(((subtotal - discountAmount) * 0.08).toFixed(2));
  }, [subtotal, discountAmount]);

  const totalAmount = useMemo(() => {
    return Number((subtotal - discountAmount + taxAmount).toFixed(2));
  }, [subtotal, discountAmount, taxAmount]);

  const projectedProfit = useMemo(() => {
    return Number((subtotal - discountAmount - costTotal).toFixed(2));
  }, [subtotal, discountAmount, costTotal]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock_quantity === 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.product_id === product.product_id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) return prev;
        return prev.map((item) =>
          item.product.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.product_id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock_quantity) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.product_id !== productId));
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setIsProcessingSale(true);
    try {
      const result = await onRecordSale({
        customer_id: selectedCustomerId,
        items: cart.map((item) => ({
          product_id: item.product.product_id,
          quantity: item.quantity,
        })),
        discount_amount: discountAmount,
        payment_method: paymentMethod,
      });

      setCompletedReceiptSale(result.sale);
      setCart([]);
      setDiscountPercent(0);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingSale(false);
    }
  };

  // Filter Catalog in POS
  const filteredCatalog = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(productCatalogSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productCatalogSearch.toLowerCase());
      const matchCat = productCatalogCategory === 'ALL' || p.category === productCatalogCategory;
      return matchSearch && matchCat;
    });
  }, [products, productCatalogSearch, productCatalogCategory]);

  // Filter Sales History
  const filteredSalesHistory = useMemo(() => {
    return sales.filter((s) => {
      const cust = customers.find((c) => c.customer_id === s.customer_id);
      const custName = cust?.name || '';
      const matchSearch =
        String(s.sale_id).includes(historySearch) ||
        custName.toLowerCase().includes(historySearch.toLowerCase()) ||
        s.payment_method.toLowerCase().includes(historySearch.toLowerCase());
      const matchPay = historyPaymentFilter === 'ALL' || s.payment_method === historyPaymentFilter;
      return matchSearch && matchPay;
    });
  }, [sales, customers, historySearch, historyPaymentFilter]);

  const totalPages = Math.ceil(filteredSalesHistory.length / itemsPerPage);
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSalesHistory.slice(start, start + itemsPerPage);
  }, [filteredSalesHistory, currentPage]);

  // Export CSV Report
  const exportCSVReport = () => {
    const headers = ['Sale ID', 'Customer Name', 'Sale Date', 'Subtotal', 'Tax', 'Discount', 'Total Amount', 'Cost Amount', 'Profit Amount', 'Payment Method', 'Status'];
    const rows = filteredSalesHistory.map((s) => {
      const cust = customers.find((c) => c.customer_id === s.customer_id);
      return [
        s.sale_id,
        `"${cust?.name || 'Customer'}"`,
        s.sale_date,
        s.subtotal,
        s.tax_amount,
        s.discount_amount,
        s.total_amount,
        s.cost_amount,
        s.profit_amount,
        s.payment_method,
        s.status,
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Retail_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get line items for viewed receipt
  const getReceiptItems = (saleId: number) => {
    return transactions.filter((t) => t.sale_id === saleId);
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs: POS Terminal vs Sales History */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Sales & Point of Sale Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Process real-time customer checkouts, compute margins & inspect transaction history
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('pos')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'pos'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>POS Register</span>
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Transactions History ({sales.length})</span>
          </button>
        </div>
      </div>

      {/* POS Terminal Screen */}
      {activeSubTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Product Catalog Browser (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={productCatalogSearch}
                    onChange={(e) => setProductCatalogSearch(e.target.value)}
                    placeholder="Search product catalog by name or SKU..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-gray-50 focus:bg-white"
                  />
                </div>

                <select
                  value={productCatalogCategory}
                  onChange={(e) => setProductCatalogCategory(e.target.value)}
                  className="w-full sm:w-auto text-xs font-semibold px-3 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-red-600 focus:outline-none text-gray-700"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                  <option value="Health & Beauty">Health & Beauty</option>
                  <option value="Sports & Outdoors">Sports & Outdoors</option>
                </select>
              </div>

              {/* Products Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto pr-1">
                {filteredCatalog.map((product) => {
                  const inCart = cart.find((i) => i.product.product_id === product.product_id);
                  const isOut = product.stock_quantity === 0;

                  return (
                    <button
                      key={product.product_id}
                      disabled={isOut}
                      onClick={() => addToCart(product)}
                      className={`p-3 text-left rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                        isOut
                          ? 'opacity-40 bg-gray-50 border-gray-200 cursor-not-allowed'
                          : inCart
                          ? 'border-red-600 bg-red-50/30 shadow-xs'
                          : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mb-1">
                          <span>{product.sku}</span>
                          <span className={`px-1.5 py-0.5 rounded font-bold ${
                            isOut ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {product.stock_quantity} left
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-black text-gray-900">
                            ${product.retail_price.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-red-600">
                          {inCart ? `${inCart.quantity} in cart` : '+ Add'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Interactive Cart & Checkout Terminal (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-bold text-gray-900">Checkout Cart</h2>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {cart.reduce((a, b) => a + b.quantity, 0)} Items
              </span>
            </div>

            {/* Select Customer */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Select Retail Customer
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 bg-white"
              >
                {customers.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>
                    #{c.customer_id} - {c.name} ({c.customer_segment} | {c.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-gray-100">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">
                  Cart is currently empty. Click on items in the catalog to add to sale.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.product_id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div className="max-w-[50%]">
                      <p className="font-bold text-gray-900 line-clamp-1">{item.product.name}</p>
                      <p className="text-gray-400 text-[10px]">
                        ${item.product.retail_price.toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product.product_id, -1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-mono font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.product_id, 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono font-bold text-gray-900 w-16 text-right">
                        ${(item.product.retail_price * item.quantity).toFixed(2)}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.product.product_id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Discounts and Payment Options */}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Discount %</label>
                  <select
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseInt(e.target.value, 10))}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="0">0% None</option>
                    <option value="5">5% Promo</option>
                    <option value="10">10% Student/Loyalty</option>
                    <option value="15">15% Seasonal</option>
                    <option value="20">20% VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as Sale['payment_method'])}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white font-semibold"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Online Transfer">Online Transfer</option>
                    <option value="Digital Wallet">Digital Wallet</option>
                  </select>
                </div>
              </div>

              {/* Order Math Summary */}
              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({discountPercent}%):</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Sales Tax (8%):</span>
                  <span className="font-mono">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="pt-1.5 border-t border-gray-200 flex justify-between text-sm font-black text-gray-900">
                  <span>Total Amount Due:</span>
                  <span className="font-mono text-base text-red-600">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 pt-0.5">
                  <span>Projected Gross Profit:</span>
                  <span className="font-bold text-emerald-700">+${projectedProfit.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Sale Button */}
              <button
                disabled={cart.length === 0 || isProcessingSale}
                onClick={handleCompleteSale}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {isProcessingSale ? (
                  <span>Recording Sale to MySQL...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete Sale & Print Receipt (${totalAmount.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Screen */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          {/* Search, Filter & Export */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => {
                  setHistorySearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search order #, customer name, payment..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-gray-50 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <select
                value={historyPaymentFilter}
                onChange={(e) => {
                  setHistoryPaymentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold px-2.5 py-2 border border-gray-200 rounded-lg bg-white"
              >
                <option value="ALL">All Payment Methods</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Online Transfer">Online Transfer</option>
                <option value="Digital Wallet">Digital Wallet</option>
              </select>

              <button
                onClick={exportCSVReport}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-red-600" />
                <span>Export CSV Report</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Sale Date</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Subtotal / Tax</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Profit Generated</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {paginatedSales.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-400 text-xs">
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedSales.map((sale) => {
                      const cust = customers.find((c) => c.customer_id === sale.customer_id);
                      return (
                        <tr key={sale.sale_id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs font-bold text-gray-900">
                            #{sale.sale_id}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-gray-900">{cust?.name || `Customer #${sale.customer_id}`}</div>
                            <div className="text-[11px] text-gray-400">{cust?.city || 'Retail Store'}</div>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-600">{sale.sale_date}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-800">
                              {sale.payment_method}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs font-mono">
                            <div>${sale.subtotal.toFixed(2)}</div>
                            <div className="text-[10px] text-gray-400">+${sale.tax_amount.toFixed(2)} tax</div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-gray-900">
                            ${sale.total_amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs font-bold text-emerald-600">
                            +${sale.profit_amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                sale.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {sale.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedReceipt(sale)}
                              className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer flex items-center gap-1 ml-auto"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Receipt</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
              <div>
                Showing{' '}
                <span className="font-bold text-gray-900">
                  {filteredSalesHistory.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-bold text-gray-900">
                  {Math.min(currentPage * itemsPerPage, filteredSalesHistory.length)}
                </span>{' '}
                of <span className="font-bold text-gray-900">{filteredSalesHistory.length}</span> sales
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  Previous
                </button>
                <span className="px-3 py-1 font-bold text-gray-900">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal (for Completed Sale or Viewed Order) */}
      {(completedReceiptSale || selectedReceipt) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          {(() => {
            const sale = completedReceiptSale || selectedReceipt!;
            const cust = customers.find((c) => c.customer_id === sale.customer_id);
            const lineItems = getReceiptItems(sale.sale_id);

            return (
              <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-gray-100 overflow-hidden font-mono text-xs">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 text-center">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto mb-2 text-lg font-black">
                    R
                  </div>
                  <h3 className="font-black text-sm text-gray-900">RETAIL STORE RECEIPT</h3>
                  <p className="text-[10px] text-gray-500">Retail Sales & Inventory System</p>
                  <p className="text-[10px] text-gray-400 mt-1">Invoice #{sale.sale_id} | {sale.sale_date}</p>
                </div>

                {/* Customer & Payment details */}
                <div className="p-4 bg-gray-50 border-b border-gray-100 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Billed To:</span>
                    <span className="font-bold text-gray-900">{cust?.name || 'Walk-in Customer'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method:</span>
                    <span className="font-bold text-gray-900">{sale.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">DB Status:</span>
                    <span className="font-bold text-emerald-600">Saved in retail_business_analytics</span>
                  </div>
                </div>

                {/* Items */}
                <div className="p-4 max-h-48 overflow-y-auto space-y-2 border-b border-gray-100">
                  {lineItems.length > 0 ? (
                    lineItems.map((item) => {
                      const prod = products.find((p) => p.product_id === item.product_id);
                      return (
                        <div key={item.transaction_id} className="flex justify-between text-[11px]">
                          <div>
                            <p className="font-bold text-gray-900">{prod?.name || `Item #${item.product_id}`}</p>
                            <p className="text-[10px] text-gray-400">
                              {item.quantity} x ${item.unit_price.toFixed(2)}
                            </p>
                          </div>
                          <span className="font-bold text-gray-900">${item.total_price.toFixed(2)}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex justify-between text-[11px]">
                      <span>Retail Merchandised Package</span>
                      <span className="font-bold text-gray-900">${sale.subtotal.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="p-4 space-y-1 border-b border-gray-100 text-[11px]">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal:</span>
                    <span>${sale.subtotal.toFixed(2)}</span>
                  </div>
                  {sale.discount_amount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>-${sale.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Tax (8%):</span>
                    <span>${sale.tax_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-200">
                    <span>TOTAL:</span>
                    <span className="text-red-600">${sale.total_amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 flex items-center justify-between font-sans">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>
                  <button
                    onClick={() => {
                      setCompletedReceiptSale(null);
                      setSelectedReceipt(null);
                    }}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
