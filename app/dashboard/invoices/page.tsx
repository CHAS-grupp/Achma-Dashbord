/* 

import { Metadata } from 'next';
import { fetchInvoicesPages } from '@/app/lib/data';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Invoices',
};

export default async function Page({ searchParams }: { searchParams: Record<string, string> }) {
 
  const query = searchParams.query || ''; 
  const currentPage = Number(searchParams.page) || 1; 

  
  const { invoices, totalPages } = await fetchInvoicesPages(query, currentPage);

  return (
    <main className="w-full">
      <div className="w-full items-center justify-between">
        <h1 className="text-2xl">Invoices</h1>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <InvoicesGrid invoices={invoices} totalPages={totalPages} currentPage={currentPage} />
      </Suspense>
    </main>
  );
}


function InvoicesGrid({ invoices, totalPages, currentPage }: { invoices: any[], totalPages: number, currentPage: number }) {
  return (
    <div className="mt-8 flow-root">
      <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
          {invoices.map((invoice) => (
            <div
              key={invoice._id}
              className="relative flex flex-col overflow-hidden rounded-lg bg-white p-4 shadow transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex-1 truncate">
                  <div className="flex items-center space-x-3">
                    <h2 className="truncate text-sm font-medium text-gray-900">
                      Invoice #{invoice._id}
                    </h2>
                    <span className={`inline-flex flex-shrink-0 items-center rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                    } px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-green-600/20`}>
                      {invoice.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-500">
                    Amount: {invoice.amount}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    Date: {invoice.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {invoices.length === 0 && (
          <div className="mx-auto max-w-md py-12 text-center">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No invoices found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or create a new invoice.
            </p>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button disabled={currentPage <= 1} className="btn">
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage >= totalPages} className="btn">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}


 */
import { Metadata } from 'next';
import { fetchInvoicesPages } from '@/app/lib/data';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Invoices',
};

export default async function Page({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  // Hantera `searchParams` som ett vanligt objekt
  const query = searchParams.query || ''; // Om query är undefined, använd en tom sträng
  const currentPage = searchParams.page ? parseInt(searchParams.page, 10) : 1; // Om page är undefined, använd 1 som standard

  // Hämta fakturor och totala sidor baserat på query och currentPage
  const { invoices, totalPages } = await fetchInvoicesPages(query, currentPage);

  return (
    <main className="w-full">
      <div className="w-full items-center justify-between">
        <h1 className="text-2xl">Invoices</h1>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <InvoicesGrid invoices={invoices} totalPages={totalPages} currentPage={currentPage} />
      </Suspense>
    </main>
  );
}

function InvoicesGrid({ invoices, totalPages, currentPage }: { invoices: any[], totalPages: number, currentPage: number }) {
  return (
    <div className="mt-8 flow-root">
      <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
          {invoices.length > 0 ? (
            invoices.map((invoice, index) => (
              <div
                key={invoice._id || index} // Använd `_id` som `key` eller `index` som fallback
                className="relative flex flex-col overflow-hidden rounded-lg bg-white p-4 shadow transition-all hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 truncate">
                    <div className="flex items-center space-x-3">
                      <h2 className="truncate text-sm font-medium text-gray-900">
                        Invoice #{invoice._id || index} {/* Om `_id` är null, använd `index` */}
                      </h2>
                      <span className={`inline-flex flex-shrink-0 items-center rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                      } px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-green-600/20`}>
                        {invoice.status}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-gray-500">
                      Amount: {invoice.amount}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      Date: {invoice.date}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="mx-auto max-w-md py-12 text-center">
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No invoices found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or create a new invoice.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-4">
          <button disabled={currentPage <= 1} className="btn">
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage >= totalPages} className="btn">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
