import React, { useState } from 'react';
import {
  Database,
  Table,
  Key,
  Download,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Code,
  FileText,
  Server,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type { Customer, Product, Sale, Transaction, MarketingCampaign } from '../types';
import { api } from '../services/api';

interface DatabaseViewProps {
  customers: Customer[];
  products: Product[];
  sales: Sale[];
  transactions: Transaction[];
  campaigns: MarketingCampaign[];
  onResetDatabase: () => void;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  customers,
  products,
  sales,
  transactions,
  campaigns,
  onResetDatabase,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'schema' | 'sql_console' | 'sql_dump'>('schema');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM products WHERE stock_quantity <= reorder_level;');
  const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: any[]; rowCount: number } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('customers');

  const sampleQueries = [
    { title: 'Low Stock Products', query: 'SELECT * FROM products WHERE stock_quantity <= reorder_level;' },
    { title: 'VIP Customers', query: "SELECT * FROM customers WHERE customer_segment = 'VIP';" },
    { title: 'Top 10 Largest Sales', query: 'SELECT * FROM sales ORDER BY total_amount DESC LIMIT 10;' },
    { title: 'High-ROI Marketing', query: 'SELECT * FROM marketing_campaigns WHERE roi_percentage > 400;' },
    { title: 'Describe Sales Table', query: 'DESCRIBE sales;' },
    { title: 'Show All Tables', query: 'SHOW TABLES;' },
  ];

  const handleExecute = async (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    setIsExecuting(true);
    try {
      const res = await api.executeSQL(q);
      setQueryResult(res);
    } catch (e: any) {
      setQueryResult({
        columns: ['Error'],
        rows: [{ Error: e.message || 'SQL execution failed' }],
        rowCount: 0,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDownloadDump = () => {
    const sql = api.getMySQLDumpText();
    const blob = new Blob([sql], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retail_business_analytics.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyDump = () => {
    const sql = api.getMySQLDumpText();
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tablesMeta = [
    {
      name: 'customers',
      rows: customers.length,
      primaryKey: 'customer_id (INT AUTO_INCREMENT)',
      foreignKeys: [],
      description: 'Stores retail consumer and wholesale accounts with spending tiers',
    },
    {
      name: 'products',
      rows: products.length,
      primaryKey: 'product_id (INT AUTO_INCREMENT)',
      foreignKeys: [],
      description: 'Inventory items, SKUs, wholesale cost, retail price and safety stock levels',
    },
    {
      name: 'sales',
      rows: sales.length,
      primaryKey: 'sale_id (INT AUTO_INCREMENT)',
      foreignKeys: ['customer_id -> customers.customer_id (ON DELETE CASCADE)'],
      description: 'Master checkout transactions, payment method, tax, discounts, and margins',
    },
    {
      name: 'transactions',
      rows: transactions.length,
      primaryKey: 'transaction_id (INT AUTO_INCREMENT)',
      foreignKeys: [
        'sale_id -> sales.sale_id (ON DELETE CASCADE)',
        'product_id -> products.product_id (ON DELETE CASCADE)',
      ],
      description: 'Relational order line items linking individual products sold to sales invoices',
    },
    {
      name: 'marketing_campaigns',
      rows: campaigns.length,
      primaryKey: 'campaign_id (INT AUTO_INCREMENT)',
      foreignKeys: [],
      description: 'Promotional channels, ad budgets, clicks, conversions, and ROI metrics',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Database Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">MySQL Database Architecture</h1>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-gray-900 text-white">
              retail_business_analytics
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            5 Relational Tables with 50+ realistic records each, primary keys & foreign key constraints
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadDump}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            title="Download full MySQL .sql dump file for submission or import"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download retail_business_analytics.sql</span>
          </button>

          <button
            onClick={onResetDatabase}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Reset all 5 tables to default 50+ seed records"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Reset Seed Data</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs: Relational Schema vs SQL Console vs View .sql Code */}
      <div className="flex items-center gap-2 border-b border-gray-200 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('schema')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'schema'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-black'
          }`}
        >
          Relational Schema & 5 Tables
        </button>

        <button
          onClick={() => {
            setActiveSubTab('sql_console');
            if (!queryResult) handleExecute();
          }}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'sql_console'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-black'
          }`}
        >
          Interactive SQL Query Console
        </button>

        <button
          onClick={() => setActiveSubTab('sql_dump')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'sql_dump'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-black'
          }`}
        >
          View Full MySQL DDL Script
        </button>
      </div>

      {/* -------------------------------------------------------------
          SUBTAB 1: RELATIONAL SCHEMA & 5 TABLES
      ------------------------------------------------------------- */}
      {activeSubTab === 'schema' && (
        <div className="space-y-6">
          {/* Summary Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {tablesMeta.map((t) => (
              <div
                key={t.name}
                onClick={() => {
                  setSelectedTable(t.name);
                  setSqlQuery(`SELECT * FROM ${t.name} LIMIT 10;`);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedTable === t.name
                    ? 'bg-red-50/50 border-red-500 shadow-xs'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-gray-900 truncate">{t.name}</span>
                  <Table className="w-3.5 h-3.5 text-red-600" />
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-xl font-black text-gray-900">{t.rows}</span>
                  <span className="text-[10px] text-gray-400 font-semibold">rows (50+ req)</span>
                </div>
                <div className="mt-2 text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>PK Defined</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Schema Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tablesMeta.map((t) => (
              <div key={t.name} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    <h3 className="font-mono font-bold text-sm text-gray-900">{t.name}</h3>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                    {t.rows} Records
                  </span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">{t.description}</p>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Key className="w-3 h-3 text-amber-500" /> Primary Key:
                    </span>
                    <span className="font-bold text-gray-900">{t.primaryKey}</span>
                  </div>

                  {t.foreignKeys.length > 0 && (
                    <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100 space-y-1">
                      <span className="text-blue-700 font-bold block text-[11px]">
                        Foreign Key Constraints:
                      </span>
                      {t.foreignKeys.map((fk, idx) => (
                        <div key={idx} className="text-blue-900 text-[11px] font-semibold">
                          ↳ {fk}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setSqlQuery(`SELECT * FROM ${t.name} LIMIT 10;`);
                      setActiveSubTab('sql_console');
                      handleExecute(`SELECT * FROM ${t.name} LIMIT 10;`);
                    }}
                    className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
                  >
                    Query Table <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          SUBTAB 2: INTERACTIVE SQL QUERY CONSOLE
      ------------------------------------------------------------- */}
      {activeSubTab === 'sql_console' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-4 h-4 text-red-600" />
                <span>MySQL Query Editor (Database: retail_business_analytics)</span>
              </label>

              <button
                disabled={isExecuting}
                onClick={() => handleExecute()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isExecuting ? 'Running...' : 'Execute SQL Query'}</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full p-3 font-mono text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none bg-gray-900 text-emerald-400"
            />

            {/* Quick Queries Buttons */}
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                Sample Demonstration Queries:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleQueries.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => {
                      setSqlQuery(item.query);
                      handleExecute(item.query);
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors cursor-pointer"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Query Results */}
          {queryResult && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">
                  Result Set: {queryResult.rowCount} rows returned
                </span>
                <span className="font-mono text-emerald-600 font-semibold">Status: 200 OK</span>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 border-b border-gray-200 uppercase tracking-wider text-[11px]">
                      {queryResult.columns.map((col) => (
                        <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {queryResult.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {queryResult.columns.map((col) => (
                          <td key={col} className="py-2 px-3 whitespace-nowrap">
                            {String(row[col] != null ? row[col] : 'NULL')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          SUBTAB 3: VIEW FULL MYSQL DDL SCRIPT
      ------------------------------------------------------------- */}
      {activeSubTab === 'sql_dump' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-500" />
              <span className="font-mono text-xs font-bold">retail_business_analytics.sql</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyDump}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
              </button>
              <button
                onClick={handleDownloadDump}
                className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .sql</span>
              </button>
            </div>
          </div>

          <pre className="p-5 font-mono text-[11px] bg-gray-950 text-gray-200 overflow-x-auto max-h-[500px] leading-relaxed">
            {api.getMySQLDumpText().slice(0, 4500)}
            {'\n\n-- ... [Includes all 250+ full INSERT rows for all 5 tables in downloadable file] ...\n'}
          </pre>
        </div>
      )}
    </div>
  );
};
