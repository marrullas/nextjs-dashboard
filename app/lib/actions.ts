'use server'

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import  { z } from 'zod';




const invoiceSchema = z.object({
    id: z.string(),
    customerId: z.string({invalid_type_error: 'Seleccione un cliente'}).nonempty(),
    amount: z.coerce.number().gt(0,{ message: 'Por favor ingrese un monto mayor a 0'}),
    status: z.enum(['paid', 'pending'], { invalid_type_error: 'Por favor seleccione el estado' }),
    date: z.string(),
});

const CreateInvoice = invoiceSchema.omit({ id: true, date: true });

export type State = {
  errors?:{
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
}

export async function createInvoice(prevState: State, formData: FormData) {
  //throw new Error('Failed to Create Invoice');
  //const { customerId, amount, status } = CreateInvoice.sa({
    const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please fix the errors below.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
 
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
 
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// Use Zod to update the expected types
const UpdateInvoice = invoiceSchema.omit({ date: true, id: true });
 
// ...
 
export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  const validateFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if(!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
      message: 'Please fix the errors below.',
    };
  }

  const { customerId, amount, status } = validateFields.data;
 
  const amountInCents = amount * 100;
 
  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

//const DeleteInvoice = FormSchema.omit({ date: true, id: true });
// ...
 
export async function deleteInvoice(id: string) {
  throw new Error('Failed to Delete Invoice');
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}