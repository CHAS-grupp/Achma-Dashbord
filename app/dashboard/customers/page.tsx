import { Metadata } from 'next';
import { Pool } from 'pg';
import { CustomersTableType } from '@/app/lib/definitions';
import Image from 'next/image';
import { Suspense } from 'react';
import { lusitana } from '@/app/ui/fonts';
import { UserGroupIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Customers',
};

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function fetchCustomers() {
  try {
    const data = await pool.query<CustomersTableType>(
      'SELECT id, name, email, image_url FROM customers ORDER BY name ASC',
    );
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export default async function Page() {
  const customers = await fetchCustomers();

  return (
    <main className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Customers</h1>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <div className="mt-8 flow-root">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="relative flex flex-col overflow-hidden rounded-lg bg-white p-4 shadow transition-all hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 flex-none">
                      <Image
                        src={customer.image_url}
                        alt={customer.name}
                        className="rounded-full object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <h2 className="truncate text-sm font-medium text-gray-900">
                          {customer.name}
                        </h2>
                        <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          Active
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-gray-500">
                        {customer.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex border-t pt-4">
                    <button className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {customers.length === 0 && (
              <div className="mx-auto max-w-md py-12 text-center">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  No customers
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding your first customer.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                  >
                    Add Customer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Suspense>
    </main>
  );
}
