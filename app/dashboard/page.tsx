import { Card } from '../ui/dashboard/cards';
import RevenueChart from '../ui/dashboard/revenue-chart';
import LatestInvoices from '../ui/dashboard/latest-invoices';
import { fetchRevenue, fetchLatestInvoices, fetchCardData } from '../lib/data';
import { lusitana } from '../ui/fonts';

export default async function Page() {
  const revenue = await fetchRevenue();
  const latestInvoices = await fetchLatestInvoices();
  const { totalPaidInvoices, totalPendingInvoices, numberOfCustomers, numberOfInvoices } = await fetchCardData();

  return (
    <main>
      <h1 className={`${lusitana.className} md:text-2x1 mb-4 text-xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChart revenue={revenue}  />
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
}