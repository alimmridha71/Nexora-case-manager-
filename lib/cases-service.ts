// Case business logic shared by the server actions (app/actions/cases.ts) and the REST handlers
// (app/api/admin/cases/route.ts). Callers MUST verify the admin session before calling these.
import { z } from 'zod';
import { getServiceSupabase } from './supabase';
import { notifyCaseClients } from './notify';
import { STORAGE_BUCKET } from './storage';

export const CaseIdSchema = z.coerce.number().int().positive('Valid positive case ID is required');

export const CreateCaseSchema = z.object({
  case_no: z.string().trim().min(2, 'Case number is required').max(100),
  plaintiff_name: z.string().trim().min(2, 'Client / plaintiff name is required').max(150),
  defendants_name: z.string().trim().min(2, 'Respondent / defendant name is required').max(150),
  under_section: z.string().trim().max(150).default('General Law'),
  court_id: z.coerce.number().int().positive('Choose a court'),
  case_type_id: z.coerce.number().int().positive('Choose a case type'),
  client_mobile: z.string().trim().min(5, 'A valid contact number is required').max(30),
});

export const UpdateCaseSchema = z
  .object({
    case_id: CaseIdSchema,
    status: z.enum(['active', 'inactive']).optional(),
    under_section: z.string().trim().min(1).max(150).optional(),
  })
  .refine((d) => d.status !== undefined || d.under_section !== undefined, { message: 'Nothing to update' });

export type ServiceResult<T> = { ok: true; data: T; message?: string } | { ok: false; error: string; status: number };

const fail = (error: string, status: number): { ok: false; error: string; status: number } => ({ ok: false, error, status });

export async function createCase(input: unknown): Promise<ServiceResult<{ case_id: number; case_no: string }>> {
  const parsed = CreateCaseSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || 'Invalid case details.', 400);

  const supabase = getServiceSupabase();
  // The case belongs to the firm user that owns the chosen court (no hard-coded user id)
  const { data: court } = await supabase.from('court').select('user_id').eq('court_id', parsed.data.court_id).maybeSingle();
  if (!court) return fail('Selected court was not found.', 400);

  const { data, error } = await supabase
    .from('cases')
    .insert([{ ...parsed.data, user_id: court.user_id, filing_date: new Date().toISOString().slice(0, 10), status: 'active' }])
    .select('case_id, case_no')
    .single();
  if (error) {
    console.error('createCase failed:', error.message);
    return error.code === '23505' ? fail('A case with this number already exists.', 409) : fail('Could not create the case.', 500);
  }
  return { ok: true, data, message: `Case ${data.case_no} created.` };
}

/** Update status and/or matter. A status change is written to the timeline and the linked clients are notified. */
export async function updateCase(input: unknown): Promise<ServiceResult<{ case_id: number; case_no: string; status: string | null; notified: number }>> {
  const parsed = UpdateCaseSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || 'Invalid update.', 400);
  const { case_id, status, under_section } = parsed.data;

  const patch: Record<string, string> = { updated_at: new Date().toISOString() };
  if (status) patch.status = status;
  if (under_section) patch.under_section = under_section;

  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from('cases').update(patch).eq('case_id', case_id).select('case_id, case_no, status').maybeSingle();
  if (error) {
    console.error('updateCase failed:', error.message);
    return fail('Could not update the case.', 500);
  }
  if (!data) return fail('Case not found.', 404);

  let notified = 0;
  if (status) {
    const title = `Case status changed to ${status}`;
    await supabase.from('case_events').insert([{ case_id, event_type: 'status', title, client_visible: true }]);
    notified = await notifyCaseClients(case_id, data.case_no, title, `The status of case ${data.case_no} is now ${status}.`);
  }
  return { ok: true, data: { ...data, notified }, message: status ? `Status updated. ${notified} client(s) notified.` : 'Case updated.' };
}

export async function deleteCase(rawId: unknown): Promise<ServiceResult<{ case_id: number }>> {
  const parsed = CaseIdSchema.safeParse(rawId);
  if (!parsed.success) return fail('Valid positive integer case ID is required.', 400);
  const caseId = parsed.data;

  const supabase = getServiceSupabase();
  // Stored files first: database rows cascade, but storage objects would be orphaned
  const { data: files } = await supabase.from('case_files').select('storage_path').eq('case_id', caseId);
  if (files && files.length > 0) {
    await supabase.storage.from(STORAGE_BUCKET).remove(files.map((f) => f.storage_path));
  }
  const { error } = await supabase.from('cases').delete().eq('case_id', caseId);
  if (error) {
    console.error('deleteCase failed:', error.message);
    return fail('Could not delete the case.', 500);
  }
  return { ok: true, data: { case_id: caseId }, message: 'Case deleted.' };
}

export async function listCases(page: number, limit: number) {
  const from = (page - 1) * limit;
  const { data, count, error } = await getServiceSupabase()
    .from('cases')
    .select(
      'case_id, case_no, plaintiff_name, defendants_name, under_section, court_id, case_type_id, assistant_id, client_mobile, status, filing_date, created_at, court:court_id(court_name), case_type:case_type_id(case_type), assistant:assistant_id(assistant_name)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);
  if (error) {
    console.error('listCases failed:', error.message);
    return null;
  }
  return { cases: data || [], total: count ?? data?.length ?? 0 };
}
