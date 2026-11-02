'use server';

// Admin-only management of client accounts and which cases each client may see.
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdmin, hashPassword, generateTemporaryPassword } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';

type Result = { success: boolean; error?: string; message?: string };

const CreateClientSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required').max(100),
  email: z.string().trim().toLowerCase().email('A valid email is required').max(120),
  mobile: z.string().trim().max(30).optional().or(z.literal('')),
});
const IdSchema = z.coerce.number().int().positive();

export async function createClientAction(formData: FormData): Promise<Result> {
  await requireAdmin();
  const parsed = CreateClientSchema.safeParse({
    full_name: formData.get('full_name')?.toString(),
    email: formData.get('email')?.toString(),
    mobile: formData.get('mobile')?.toString() || '',
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || 'Invalid client details.' };

  const tempPassword = generateTemporaryPassword();
  const { error } = await getServiceSupabase().from('client_accounts').insert([
    {
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      mobile: parsed.data.mobile || null,
      password_hash: hashPassword(tempPassword),
    },
  ]);
  if (error) {
    const duplicate = error.code === '23505';
    return { success: false, error: duplicate ? 'A client with this email already exists.' : 'Could not create the client account.' };
  }
  revalidatePath('/admin/clients');
  return { success: true, message: `Client created. Temporary password (shown once, share it securely): ${tempPassword}` };
}

export async function resetClientPasswordAction(formData: FormData): Promise<Result> {
  await requireAdmin();
  const id = IdSchema.safeParse(formData.get('client_id'));
  if (!id.success) return { success: false, error: 'Invalid client.' };
  const tempPassword = generateTemporaryPassword();
  const { error } = await getServiceSupabase()
    .from('client_accounts')
    .update({ password_hash: hashPassword(tempPassword) })
    .eq('client_id', id.data);
  if (error) return { success: false, error: 'Could not reset the password.' };
  return { success: true, message: `New temporary password (shown once): ${tempPassword}` };
}

export async function setClientActiveAction(formData: FormData): Promise<Result> {
  await requireAdmin();
  const id = IdSchema.safeParse(formData.get('client_id'));
  const active = formData.get('active')?.toString() === 'true';
  if (!id.success) return { success: false, error: 'Invalid client.' };
  const { error } = await getServiceSupabase().from('client_accounts').update({ is_active: active }).eq('client_id', id.data);
  if (error) return { success: false, error: 'Could not update the account.' };
  revalidatePath('/admin/clients');
  return { success: true, message: active ? 'Account activated.' : 'Account deactivated.' };
}

export async function grantCaseAccessAction(formData: FormData): Promise<Result> {
  await requireAdmin();
  const clientId = IdSchema.safeParse(formData.get('client_id'));
  const caseId = IdSchema.safeParse(formData.get('case_id'));
  if (!clientId.success || !caseId.success) return { success: false, error: 'Choose a client first.' };
  const { error } = await getServiceSupabase()
    .from('client_case_access')
    .upsert([{ client_id: clientId.data, case_id: caseId.data }], { onConflict: 'client_id,case_id' });
  if (error) return { success: false, error: 'Could not grant access.' };
  revalidatePath(`/admin/cases/${caseId.data}`);
  return { success: true, message: 'Access granted.' };
}

export async function revokeCaseAccessAction(formData: FormData): Promise<Result> {
  await requireAdmin();
  const clientId = IdSchema.safeParse(formData.get('client_id'));
  const caseId = IdSchema.safeParse(formData.get('case_id'));
  if (!clientId.success || !caseId.success) return { success: false, error: 'Invalid request.' };
  const { error } = await getServiceSupabase()
    .from('client_case_access')
    .delete()
    .eq('client_id', clientId.data)
    .eq('case_id', caseId.data);
  if (error) return { success: false, error: 'Could not remove access.' };
  revalidatePath(`/admin/cases/${caseId.data}`);
  return { success: true, message: 'Access removed.' };
}
