/* //app/lib/data.ts

import { Pool } from 'pg';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  User,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
export async function fetchRevenue() {
  noStore();
  try {
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const data = await pool.query<Revenue>('SELECT * FROM revenue');
    console.log('Data fetch completed after 3 seconds.');
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}
export async function fetchLatestInvoices() {
  noStore();
  try {
    console.log('Fetching latest invoice data...');
    await new Promise((resolve) => setTimeout(resolve, 3200));
    const data = await pool.query<LatestInvoiceRaw>(`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`);
    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}
export async function fetchCardData() {
  noStore();
  try {
    console.log('Fetching card data...');
    await new Promise((resolve) => setTimeout(resolve, 800));
    const [invoiceCount, customerCount, invoiceStatus] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM invoices'),
      pool.query('SELECT COUNT(*) FROM customers'),
      pool.query(`
        SELECT
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
        FROM invoices
      `),
    ]);
    const numberOfInvoices = Number(invoiceCount.rows[0].count ?? '0');
    const numberOfCustomers = Number(customerCount.rows[0].count ?? '0');
    const totalPaidInvoices = formatCurrency(invoiceStatus.rows[0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(
      invoiceStatus.rows[0].pending ?? '0',
    );
    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}
const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  noStore();
  try {
    const invoices = await pool.query<InvoicesTable>(
      `
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE $1 OR
        customers.email ILIKE $1 OR
        invoices.amount::text ILIKE $1 OR
        invoices.date::text ILIKE $1 OR
        invoices.status ILIKE $1
      ORDER BY invoices.date DESC
      LIMIT $2 OFFSET $3
    `,
      [`%${query}%`, ITEMS_PER_PAGE, offset],
    );
    return invoices.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}
export async function fetchInvoicesPages(query: string) {
  noStore();
  try {
    const count = await pool.query(
      `
      SELECT COUNT(*)
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE $1 OR
        customers.email ILIKE $1 OR
        invoices.amount::text ILIKE $1 OR
        invoices.date::text ILIKE $1 OR
        invoices.status ILIKE $1
    `,
      [`%${query}%`],
    );
    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}
export async function fetchInvoiceById(id: string) {
  noStore();
  try {
    const data = await pool.query<InvoiceForm>(
      `
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = $1
    `,
      [id],
    );
    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      amount: invoice.amount / 100,
    }));
    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}
export async function fetchCustomers() {
  try {
    const data = await pool.query<CustomerField>(`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `);
    return data.rows;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}
export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await pool.query<CustomersTableType>(
      `
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url,
        COUNT(invoices.id) AS total_invoices,
        SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
        SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
      FROM customers
      LEFT JOIN invoices ON customers.id = invoices.customer_id
      WHERE
        customers.name ILIKE $1 OR
        customers.email ILIKE $1
      GROUP BY customers.id, customers.name, customers.email, customers.image_url
      ORDER BY customers.name ASC
    `,
      [`%${query}%`],
    );
    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
export async function getUser(email: string) {
  try {
    const user = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
 */


//
// Fil: data.ts

import Revenue from '@/scripts/models/Revenue.js';
import Invoice from '@/scripts/models/Invoice.js';
import Customer from '@/scripts/models/Customer.js';
import User from '@/scripts/models/Users.js';
import { unstable_noStore as noStore } from 'next/cache';
import { formatCurrency } from './utils';
import connectDB from '@/scripts/db.js';

// Funktion för att hämta revenue
async function fetchRevenue() {
  await connectDB(); // Säkerställ att anslutningen är upprättad
  noStore();
  try {
    console.log('Fetching revenue data...');
    const data = await Revenue.find({});
    console.log('Data fetch completed.');
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

// Funktion för att hämta de senaste fakturorna
async function fetchLatestInvoices() {
  await connectDB(); // Säkerställ att anslutningen är upprättad
  noStore();
  try {
    console.log('Fetching latest invoice data...');
    const invoices = await Invoice.find().sort({ date: -1 }).limit(5).populate('customer_id');
    const latestInvoices = invoices.map(invoice => ({
      ...invoice.toObject(),
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

// Funktion för att hämta fakturor med sidindelning
async function fetchInvoicesPages(query: string, currentPage: number) {
  await connectDB(); // Säkerställ att anslutningen är upprättad
  const ITEMS_PER_PAGE = 6;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const searchConditions = [];
    
    // Kontrollera om query är ett nummer eller en sträng och justera sökningen
    if (!isNaN(Number(query))) {
      searchConditions.push({ 'amount': Number(query) });
    } else if (query) {
      searchConditions.push(
        { 'date': { $regex: query, $options: 'i' } },
        { 'status': { $regex: query, $options: 'i' } }
      );
    }

    // Utför sökningen med filtrerade villkor
    const invoices = await Invoice.find(
      searchConditions.length > 0 ? { $or: searchConditions } : {}
    ).skip(offset).limit(ITEMS_PER_PAGE);

    // Hämta totala antalet fakturor för pagination
    const totalInvoicesCount = await Invoice.countDocuments(
      searchConditions.length > 0 ? { $or: searchConditions } : {}
    );

    return {
      invoices,
      totalPages: Math.ceil(totalInvoicesCount / ITEMS_PER_PAGE),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices with pagination.');
  }
}

// Funktion för att hämta faktura efter ID
async function fetchInvoiceById(id: string) {
  await connectDB(); // Säkerställ att anslutningen är upprättad
  try {
    const invoice = await Invoice.findById(id).populate('customer_id');
    return invoice;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice by ID.');
  }
}

// Funktion för att hämta kunder
async function fetchCustomers() {
  await connectDB(); // Säkerställ att anslutningen är upprättad
  try {
    const customers = await Customer.find().sort({ name: 'asc' }).exec();
    return customers;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customers.');
  }
}

// Funktion för att hämta kortdata
async function fetchCardData() {
  await connectDB(); // Säkerställ att anslutningen är upprättad
  noStore();
  try {
    console.log('Fetching card data...');
    const invoiceCount = await Invoice.countDocuments();
    const customerCount = await Customer.countDocuments();
    const paidInvoices = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const pendingInvoices = await Invoice.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    return {
      numberOfInvoices: invoiceCount,
      numberOfCustomers: customerCount,
      totalPaidInvoices: formatCurrency(paidInvoices[0]?.total || 0),
      totalPendingInvoices: formatCurrency(pendingInvoices[0]?.total || 0),
    };
  } catch (error) {
    console.error('Failed to fetch card data:', error);
    throw new Error('Failed to fetch card data.');
  }
}

// Exportera alla funktioner
export {
  fetchRevenue,
  fetchLatestInvoices,
  fetchInvoicesPages,
  fetchInvoiceById,
  fetchCustomers,
  fetchCardData,
};
