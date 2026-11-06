import React, { useState } from 'react';
import {
  Bell,
  Search,
  ShoppingCart,
  Database,
  User as UserIcon,
  LogOut,
  Sparkles,
  AlertTriangle,
  Menu,
} from 'lucide-react';
import type { User, Product } from '../types';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  lowStockProducts: Product[];
  onNavigateToTab: (tab: any) => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  lowStockProducts,
  onNavigateToTab,
  onToggleSidebar,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-xs">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left: Mobile Menu Toggle & Project Badge */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100 lg:hidden"
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-lg tracking-wider shadow-sm">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 tracking-tight text-base sm:text-lg">
                  RETAIL<span className="text-red-600">ANALYTICS</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                  College Final Project
                </span>
              </div>
              <p className="hidden sm:block text-xs text-gray-500 font-medium">
                Sales, Inventory & Business Analytics Suite
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search / Quick Schema Link */}
        <div className="hidden md:flex items-center gap-2 max-w-md w-full mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, customers, transactions (e.g. SKU, Name, Order #)..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-gray-900 transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onNavigateToTab('products');
                }
              }}
            />
          </div>
        </div>

        {/* Right: Actions, Alerts, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick POS Button */}
          <button
            onClick={() => onNavigateToTab('sales')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            aria-label="Open Point of Sale Terminal"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">New Sale (POS)</span>
          </button>

          {/* MySQL Database Quick Button */}
          <button
            onClick={() => onNavigateToTab('database')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            aria-label="View MySQL Database Schema"
            title="Inspect MySQL retail_business_analytics schema & tables"
          >
            <Database className="w-4 h-4 text-red-600" />
            <span className="text-xs font-mono font-semibold">retail_business_analytics</span>
          </button>

          {/* Low Stock Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              aria-label="View Low Stock Notifications"
            >
              <Bell className="w-5 h-5" />
              {lowStockProducts.length > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-600 rounded-full animate-pulse">
                  {lowStockProducts.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <h3 className="font-semibold text-sm text-gray-900">
                      Low-Stock Alerts ({lowStockProducts.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigateToTab('products');
                    }}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="mt-3 max-h-60 overflow-y-auto space-y-2">
                  {lowStockProducts.length === 0 ? (
                    <p className="text-xs text-gray-500 py-3 text-center">
                      All inventory levels are healthy and above reorder thresholds.
                    </p>
                  ) : (
                    lowStockProducts.slice(0, 5).map((p) => (
                      <div
                        key={p.product_id}
                        className="flex items-center justify-between p-2 rounded-lg bg-red-50/60 border border-red-100 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                          <p className="text-gray-500">
                            SKU: {p.sku} | In Stock:{' '}
                            <span className="font-bold text-red-600">{p.stock_quantity}</span> (Reorder at {p.reorder_level})
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            onNavigateToTab('products');
                          }}
                          className="px-2 py-1 text-[11px] font-semibold bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Restock
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth Switcher */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-left"
                  aria-label="User Account Menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-bold text-gray-900 line-clamp-1">{user.name}</p>
                    <p className="text-[11px] text-red-600 font-semibold">{user.role}</p>
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-50 text-red-700 border border-red-200">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenAuth();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-red-600" />
                      Switch Demo Role / Account
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigateToTab('database');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left cursor-pointer"
                    >
                      <Database className="w-4 h-4 text-gray-500" />
                      Inspect MySQL Tables
                    </button>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
              >
                <UserIcon className="w-4 h-4 text-gray-700" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
