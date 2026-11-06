/**
 * Retail Sales and Inventory Management System with Business Analytics
 * College Final Project Main Application
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { CustomersView } from './components/CustomersView';
import { ProductsView } from './components/ProductsView';
import { SalesView } from './components/SalesView';
import { MarketingView } from './components/MarketingView';
import { BusinessAnalyticsView } from './components/BusinessAnalyticsView';
import { DatabaseView } from './components/DatabaseView';

import { api } from './services/api';
import type { Customer, Product, Sale, Transaction, MarketingCampaign, User, ActiveTab } from './types';
import { getLowStockProducts } from './utils/analytics';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [user, setUser] = useState<User | null>(api.getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Core Data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [c, p, s, t, camp] = await Promise.all([
          api.getCustomers(),
          api.getProducts(),
          api.getSales(),
          api.getTransactions(),
          api.getCampaigns(),
        ]);
        setCustomers(c);
        setProducts(p);
        setSales(s);
        setTransactions(t);
        setCampaigns(camp);
      } catch (err) {
        console.error('Failed to load initial data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const lowStockProducts = useMemo(() => getLowStockProducts(products), [products]);

  // Auth Handlers
  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    api.setCurrentUser(authenticatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    api.setCurrentUser(null);
  };

  // Customer CRUD Handlers
  const handleAddCustomer = async (data: Omit<Customer, 'customer_id' | 'total_spent' | 'registration_date' | 'status'>) => {
    const created = await api.addCustomer(data);
    setCustomers((prev) => [created, ...prev]);
  };

  const handleUpdateCustomer = async (id: number, updates: Partial<Customer>) => {
    const updated = await api.updateCustomer(id, updates);
    setCustomers((prev) => prev.map((c) => (c.customer_id === id ? updated : c)));
  };

  const handleDeleteCustomer = async (id: number) => {
    await api.deleteCustomer(id);
    setCustomers((prev) => prev.filter((c) => c.customer_id !== id));
  };

  // Product CRUD Handlers
  const handleAddProduct = async (data: Omit<Product, 'product_id' | 'status'>) => {
    const created = await api.addProduct(data);
    setProducts((prev) => [created, ...prev]);
  };

  const handleUpdateProduct = async (id: number, updates: Partial<Product>) => {
    const updated = await api.updateProduct(id, updates);
    setProducts((prev) => prev.map((p) => (p.product_id === id ? updated : p)));
  };

  const handleRestockProduct = async (id: number, quantity: number) => {
    const updated = await api.restockProduct(id, quantity);
    setProducts((prev) => prev.map((p) => (p.product_id === id ? updated : p)));
  };

  const handleDeleteProduct = async (id: number) => {
    await api.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.product_id !== id));
  };

  // Sales Handler (POS Checkout)
  const handleRecordSale = async (payload: {
    customer_id: number;
    items: { product_id: number; quantity: number }[];
    discount_amount: number;
    payment_method: Sale['payment_method'];
  }) => {
    const result = await api.recordSale(payload);
    setSales((prev) => [result.sale, ...prev]);
    setTransactions((prev) => [...result.transactions, ...prev]);

    // Refresh products & customers state to reflect deducted stock & added spend
    const [updatedProducts, updatedCustomers] = await Promise.all([
      api.getProducts(),
      api.getCustomers(),
    ]);
    setProducts(updatedProducts);
    setCustomers(updatedCustomers);

    return result;
  };

  // Marketing Campaign CRUD Handlers
  const handleAddCampaign = async (data: Omit<MarketingCampaign, 'campaign_id' | 'roi_percentage'>) => {
    const created = await api.addCampaign(data);
    setCampaigns((prev) => [created, ...prev]);
  };

  const handleUpdateCampaign = async (id: number, updates: Partial<MarketingCampaign>) => {
    const updated = await api.updateCampaign(id, updates);
    setCampaigns((prev) => prev.map((c) => (c.campaign_id === id ? updated : c)));
  };

  const handleDeleteCampaign = async (id: number) => {
    await api.deleteCampaign(id);
    setCampaigns((prev) => prev.filter((c) => c.campaign_id !== id));
  };

  // Database Reset
  const handleResetDatabase = async () => {
    api.resetDatabase();
    const [c, p, s, t, camp] = await Promise.all([
      api.getCustomers(),
      api.getProducts(),
      api.getSales(),
      api.getTransactions(),
      api.getCampaigns(),
    ]);
    setCustomers(c);
    setProducts(p);
    setSales(s);
    setTransactions(t);
    setCampaigns(camp);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900 font-sans">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        lowStockProducts={lowStockProducts}
        onNavigateToTab={(tab) => setActiveTab(tab)}
        onToggleSidebar={() => setIsMobileSidebarOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          lowStockCount={lowStockProducts.length}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-bold text-gray-600">Connecting to retail_business_analytics...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  customers={customers}
                  products={products}
                  sales={sales}
                  transactions={transactions}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onRestockItem={handleRestockProduct}
                />
              )}

              {activeTab === 'customers' && (
                <CustomersView
                  customers={customers}
                  sales={sales}
                  onAddCustomer={handleAddCustomer}
                  onUpdateCustomer={handleUpdateCustomer}
                  onDeleteCustomer={handleDeleteCustomer}
                />
              )}

              {activeTab === 'products' && (
                <ProductsView
                  products={products}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onRestockProduct={handleRestockProduct}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}

              {activeTab === 'sales' && (
                <SalesView
                  customers={customers}
                  products={products}
                  sales={sales}
                  transactions={transactions}
                  onRecordSale={handleRecordSale}
                />
              )}

              {activeTab === 'marketing' && (
                <MarketingView
                  campaigns={campaigns}
                  onAddCampaign={handleAddCampaign}
                  onUpdateCampaign={handleUpdateCampaign}
                  onDeleteCampaign={handleDeleteCampaign}
                />
              )}

              {activeTab === 'analytics' && (
                <BusinessAnalyticsView
                  customers={customers}
                  products={products}
                  sales={sales}
                  transactions={transactions}
                  onRestockProduct={handleRestockProduct}
                />
              )}

              {activeTab === 'database' && (
                <DatabaseView
                  customers={customers}
                  products={products}
                  sales={sales}
                  transactions={transactions}
                  campaigns={campaigns}
                  onResetDatabase={handleResetDatabase}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Auth Modal (Login, Register, Forgot Password, Demo Switcher) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
