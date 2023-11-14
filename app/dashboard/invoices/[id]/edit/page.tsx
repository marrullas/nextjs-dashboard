import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers, fetchInvoiceById } from '@/app/lib/data';
import NoInvoiceEdit from '@/app/ui/invoices/no-invoice-edit';
import { notFound } from 'next/navigation';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editar invoice',
};
 
export default async function Page({ params }: { params: { id: string } }) {
    const id = params.id;
    const [invoice, customers] = await Promise.all([
        fetchInvoiceById(id),
        fetchCustomers(),
        ]);

        if (!invoice) {
            return notFound();
        }

    const breadcrumbs = [
      { label: 'Invoices', href: '/dashboard/invoices', active: false },
    ];

    if (invoice) {
      breadcrumbs.push({
        label: 'Edit Invoice',
        href: `/dashboard/invoices/${id}/edit`,
        active: true,
      });
    }


  return (
    <main>
    <Breadcrumbs breadcrumbs={breadcrumbs} />

      {invoice ? <Form invoice={invoice} customers={customers} /> : <NoInvoiceEdit invoiceId={id}/>}
    </main>
  );
}