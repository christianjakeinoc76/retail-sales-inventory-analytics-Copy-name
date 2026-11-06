/**
 * Retail Business Analytics Pure Logic Module
 * Decoupled calculations for descriptive, predictive, and prescriptive analytics.
 */

export interface ProductItem {
  product_id: number;
  name: string;
  sku: string;
  category: string;
  cost_price: number;
  retail_price: number;
  stock_quantity: number;
  reorder_level: number;
  supplier_name: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface SaleRecord {
  sale_id: number;
  customer_id: number;
  sale_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  cost_amount: number;
  profit_amount: number;
  payment_method: string;
  status: string;
}

export interface TransactionItem {
  transaction_id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_cost: number;
  unit_price: number;
  total_price: number;
  profit: number;
  transaction_date: string;
}

/**
 * Calculate financial totals (Revenue, Cost, Profit, Margin %)
 */
export function calculateFinancialTotals(sales: SaleRecord[]) {
  const completedSales = sales.filter((s) => s.status !== 'Refunded');
  const totalRevenue = completedSales.reduce((acc, s) => acc + s.total_amount, 0);
  const totalCost = completedSales.reduce((acc, s) => acc + s.cost_amount, 0);
  const totalProfit = completedSales.reduce((acc, s) => acc + s.profit_amount, 0);
  const profitMarginPercent = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const averageOrderValue = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    totalProfit: Number(totalProfit.toFixed(2)),
    profitMarginPercent: Number(profitMarginPercent.toFixed(1)),
    completedSalesCount: completedSales.length,
    averageOrderValue: Number(averageOrderValue.toFixed(2)),
  };
}

/**
 * Filter low stock products based on reorder_level
 */
export function getLowStockProducts(products: ProductItem[]) {
  return products.filter((p) => p.stock_quantity <= p.reorder_level);
}

/**
 * Economic Order Quantity (EOQ) calculation:
 * EOQ = sqrt((2 * Demand * OrderingCost) / HoldingCost)
 * @param annualDemand Annual demand in units
 * @param orderingCost Fixed cost per order
 * @param holdingCost Annual holding cost per unit
 */
export function calculateEOQ(annualDemand: number, orderingCost = 25, holdingCost = 5): number {
  if (annualDemand <= 0 || holdingCost <= 0) return 0;
  const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
  return Math.round(eoq);
}

/**
 * Reorder Point (ROP) calculation:
 * ROP = (Average Daily Demand * Lead Time Days) + Safety Stock
 */
export function calculateReorderPoint(dailyDemand: number, leadTimeDays: number, safetyStock: number): number {
  return Math.ceil(dailyDemand * leadTimeDays + safetyStock);
}

/**
 * Simple Linear Regression for Predictive Analytics
 * Fits y = mx + c to a time series
 */
export function calculateLinearRegression(points: { x: number; y: number }[]): {
  slope: number;
  intercept: number;
  predict: (x: number) => number;
} {
  const n = points.length;
  if (n === 0) {
    return { slope: 0, intercept: 0, predict: () => 0 };
  }
  if (n === 1) {
    return { slope: 0, intercept: points[0].y, predict: () => points[0].y };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
  }

  const denominator = n * sumX2 - sumX * sumX;
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = (sumY - slope * sumX) / n;

  return {
    slope: Number(slope.toFixed(4)),
    intercept: Number(intercept.toFixed(2)),
    predict: (targetX: number) => Math.max(0, Number((slope * targetX + intercept).toFixed(2))),
  };
}

/**
 * Forecast future values based on past monthly/daily sequence
 */
export function forecastFuturePeriods(historicalValues: number[], periodsAhead: number): number[] {
  const points = historicalValues.map((val, idx) => ({ x: idx + 1, y: val }));
  const model = calculateLinearRegression(points);
  const forecast: number[] = [];

  for (let i = 1; i <= periodsAhead; i++) {
    const nextX = historicalValues.length + i;
    forecast.push(model.predict(nextX));
  }

  return forecast;
}
