import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_TRANSACTIONS,
  INITIAL_CAMPAIGNS,
  generateMySQLDump,
} from './retailDatabase';

test('database requirements: each table has at least 50 sample records', () => {
  assert.ok(INITIAL_CUSTOMERS.length >= 50, `Customers count: ${INITIAL_CUSTOMERS.length}`);
  assert.ok(INITIAL_PRODUCTS.length >= 50, `Products count: ${INITIAL_PRODUCTS.length}`);
  assert.ok(INITIAL_SALES.length >= 50, `Sales count: ${INITIAL_SALES.length}`);
  assert.ok(INITIAL_TRANSACTIONS.length >= 50, `Transactions count: ${INITIAL_TRANSACTIONS.length}`);
  assert.ok(INITIAL_CAMPAIGNS.length >= 50, `Marketing Campaigns count: ${INITIAL_CAMPAIGNS.length}`);
});

test('relational integrity: primary keys are unique and foreign keys exist', () => {
  const customerIds = new Set(INITIAL_CUSTOMERS.map((c) => c.customer_id));
  assert.equal(customerIds.size, INITIAL_CUSTOMERS.length, 'Customer IDs must be unique');

  const productIds = new Set(INITIAL_PRODUCTS.map((p) => p.product_id));
  assert.equal(productIds.size, INITIAL_PRODUCTS.length, 'Product IDs must be unique');

  const saleIds = new Set(INITIAL_SALES.map((s) => s.sale_id));
  assert.equal(saleIds.size, INITIAL_SALES.length, 'Sale IDs must be unique');

  const transactionIds = new Set(INITIAL_TRANSACTIONS.map((t) => t.transaction_id));
  assert.equal(transactionIds.size, INITIAL_TRANSACTIONS.length, 'Transaction IDs must be unique');

  const campaignIds = new Set(INITIAL_CAMPAIGNS.map((c) => c.campaign_id));
  assert.equal(campaignIds.size, INITIAL_CAMPAIGNS.length, 'Campaign IDs must be unique');

  // Verify foreign keys
  for (const sale of INITIAL_SALES) {
    assert.ok(customerIds.has(sale.customer_id), `Sale ${sale.sale_id} references nonexistent customer ${sale.customer_id}`);
  }

  for (const txn of INITIAL_TRANSACTIONS) {
    assert.ok(saleIds.has(txn.sale_id), `Transaction ${txn.transaction_id} references nonexistent sale ${txn.sale_id}`);
    assert.ok(productIds.has(txn.product_id), `Transaction ${txn.transaction_id} references nonexistent product ${txn.product_id}`);
  }
});

test('generateMySQLDump generates database DDL with 5 tables, primary & foreign keys', () => {
  const sql = generateMySQLDump();
  assert.ok(sql.includes('CREATE DATABASE retail_business_analytics'));
  assert.ok(sql.includes('CREATE TABLE customers ('));
  assert.ok(sql.includes('CREATE TABLE products ('));
  assert.ok(sql.includes('CREATE TABLE sales ('));
  assert.ok(sql.includes('CREATE TABLE transactions ('));
  assert.ok(sql.includes('CREATE TABLE marketing_campaigns ('));
  assert.ok(sql.includes('FOREIGN KEY (customer_id) REFERENCES customers(customer_id)'));
  assert.ok(sql.includes('FOREIGN KEY (sale_id) REFERENCES sales(sale_id)'));
  assert.ok(sql.includes('FOREIGN KEY (product_id) REFERENCES products(product_id)'));
  assert.ok(sql.includes('INSERT INTO customers'));
  assert.ok(sql.includes('INSERT INTO products'));
  assert.ok(sql.includes('INSERT INTO sales'));
  assert.ok(sql.includes('INSERT INTO transactions'));
  assert.ok(sql.includes('INSERT INTO marketing_campaigns'));
});
