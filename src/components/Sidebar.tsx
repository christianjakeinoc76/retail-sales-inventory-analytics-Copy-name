import React from 'react';
import {
  LayoutDashboard,
  Users,
  Boxes,
  Receipt,
  Megaphone,
  LineChart,
  Database,
  ChevronRight,
  ShieldCheck,
  Server,
  Layers,
} from 'lucide-react';
import type { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  lowStockCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  lowStockCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      description: 'KPIs, charts & summary',
    },
    {
      id: 'customers' as ActiveTab,
      label: 'Customer Management',
      icon: Users,
      badge: null,
      description: 'Add, edit, view & search',
    },
    {
      id: 'products' as ActiveTab,
      label: 'Products & Inventory',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} Alert` : null,
      badgeColor: 'bg-red-600 text-white',
      description: 'Stock levels, catalog & prices',
    },
    {
      id: 'sales' as ActiveTab,
      label: 'Sales & POS Terminal',
      icon: Receipt,
      badge: 'POS',
      badgeColor: 'bg-gray-900 text-white',
      description: 'Checkout, transactions & receipts',
    },
    {
      id: 'marketing' as ActiveTab,
      label: 'Marketing Analytics',
      icon: Megaphone,
      badge: null,
      description: 'Campaigns, spend & ROI',
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Business Analytics',
      icon: LineChart,
      badge: '3-in-1',
      badgeColor: 'bg-red-100 text-red-700',
      description: 'Descriptive, Predictive & Prescriptive',
    },
    {
      id: 'database' as ActiveTab,
      label: 'MySQL Database',
      icon: Database,
      badge: '5 Tables',
      badgeColor: 'bg-gray-100 text-gray-800',
      description: 'Schema, live SQL & .sql export',
    },
  ];

  const content = (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 w-64 lg:w-72">
      {/* Brand header for mobile drawer */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-sm">
            R
          </div>
          <span className="font-bold text-gray-900 text-sm">Retail Analytics</span>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1 rounded text-gray-400 hover:text-gray-700"
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Core Operations
        </div>

        {menuItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-50 text-red-700 font-semibold shadow-xs border border-red-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg ${
                    isActive ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-sm font-medium leading-none">{item.label}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5 truncate">{item.description}</div>
                </div>
              </div>
              {item.badge && (
                <span
                  className={`ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase shrink-0 ${
                    item.badgeColor || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Intelligence & Data
        </div>

        {menuItems.slice(4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-50 text-red-700 font-semibold shadow-xs border border-red-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg ${
                    isActive ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-sm font-medium leading-none">{item.label}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5 truncate">{item.description}</div>
                </div>
              </div>
              {item.badge && (
                <span
                  className={`ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase shrink-0 ${
                    item.badgeColor || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* College Project Meta Card */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/70 m-3 rounded-xl border">
        <div className="flex items-center gap-2 mb-1.5">
          <Server className="w-4 h-4 text-red-600" />
          <span className="text-xs font-bold text-gray-900">Database Active</span>
        </div>
        <p className="text-[11px] font-mono text-gray-600 truncate">retail_business_analytics</p>
        <div className="mt-2 pt-2 border-t border-gray-200/80 flex items-center justify-between text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            50+ Rows / Table
          </span>
          <span className="font-semibold text-gray-700">MySQL 8.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-14 h-[calc(100vh-3.5rem)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
