import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFinancialTotals,
  getLowStockProducts,
  calculateEOQ,
  calculateReorderPoint,
  calculateLinearRegression,
  forecastFuturePeriods,
  type SaleRecord,
  type ProductItem,
} from './analytics';

test('calculateFinancialTotals computes revenue, cost, profit and margin correctly', () => {
  const sampleSales: SaleRecord[] = [
    {
      sale_id: 1,
      customer_id: 10,
      sale_date: '2026-03-01',
      subtotal: 100,
      tax_amount: 10,
      discount_amount: 0,
      total_amount: 110,
      cost_amount: 60,
      profit_amount: 50,
      payment_method: 'Credit Card',
      status: 'Completed',
    },
    {
      sale_id: 2,
      customer_id: 12,
      sale_date: '2026-03-02',
      subtotal: 200,
      tax_amount: 20,
      discount_amount: 20,
      total_amount: 200,
      cost_amount: 100,
      profit_amount: 100,
      payment_method: 'Cash',
      status: 'Completed',
    },
    {
      sale_id: 3,
      customer_id: 15,
      sale_date: '2026-03-03',
      subtotal: 50,
      tax_amount: 5,
      discount_amount: 0,
      total_amount: 55,
      cost_amount: 30,
      profit_amount: 25,
      payment_method: 'Cash',
      status: 'Refunded', // Should be excluded from totals
    },
  ];

  const totals = calculateFinancialTotals(sampleSales);
  assert.equal(totals.totalRevenue, 310);
  assert.equal(totals.totalCost, 160);
  assert.equal(totals.totalProfit, 150);
  assert.equal(totals.completedSalesCount, 2);
  assert.equal(totals.profitMarginPercent, 48.4); // 150 / 310 * 100
  assert.equal(totals.averageOrderValue, 155);
});

test('getLowStockProducts identifies items with stock_quantity <= reorder_level', () => {
  const products: ProductItem[] = [
    {
      product_id: 1,
      name: 'Wireless Mouse',
      sku: 'ELEC-001',
      category: 'Electronics',
      cost_price: 15,
      retail_price: 30,
      stock_quantity: 4,
      reorder_level: 10,
      supplier_name: 'TechSupply',
      status: 'Low Stock',
    },
    {
      product_id: 2,
      name: 'Mechanical Keyboard',
      sku: 'ELEC-002',
      category: 'Electronics',
      cost_price: 45,
      retail_price: 90,
      stock_quantity: 25,
      reorder_level: 10,
      supplier_name: 'TechSupply',
      status: 'In Stock',
    },
    {
      product_id: 3,
      name: 'USB-C Cable',
      sku: 'ELEC-003',
      category: 'Electronics',
      cost_price: 3,
      retail_price: 12,
      stock_quantity: 0,
      reorder_level: 15,
      supplier_name: 'CableCo',
      status: 'Out of Stock',
    },
  ];

  const lowStock = getLowStockProducts(products);
  assert.equal(lowStock.length, 2);
  assert.equal(lowStock[0].sku, 'ELEC-001');
  assert.equal(lowStock[1].sku, 'ELEC-003');
});

test('calculateEOQ computes optimal order batch correctly', () => {
  // Annual demand = 1000, Ordering cost = 20, Holding cost = 4
  // sqrt(2 * 1000 * 20 / 4) = sqrt(10000) = 100
  const eoq = calculateEOQ(1000, 20, 4);
  assert.equal(eoq, 100);

  // Test zero demand
  assert.equal(calculateEOQ(0), 0);
});

test('calculateReorderPoint computes safety stock and demand buffer', () => {
  // Daily demand = 5, Lead time = 7 days, Safety stock = 15
  // ROP = 5 * 7 + 15 = 50
  const rop = calculateReorderPoint(5, 7, 15);
  assert.equal(rop, 50);
});

test('calculateLinearRegression and forecastFuturePeriods predict future values', () => {
  // Perfect linear slope: y = 2x + 10
  // Values: 12, 14, 16, 18, 20
  const pastValues = [12, 14, 16, 18, 20];
  const forecast = forecastFuturePeriods(pastValues, 3);
  assert.equal(forecast.length, 3);
  assert.equal(forecast[0], 22);
  assert.equal(forecast[1], 24);
  assert.equal(forecast[2], 26);
});
