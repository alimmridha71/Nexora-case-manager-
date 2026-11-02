'use server';

// Admin-only case timeline: add/remove events and optionally notify the case's clients.
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { notifyCaseClients } from '@/lib/notify';
import { EVENT_TYPES } from '@/lib/case-events';

type Result = { success: boolean; error?: string; message?: string };

const AddEventSchema = z.object({
  case_id: z.coerce.number().int().positive(),
  event_type: z.enum(EVENT_TYPES),
  title: z.string().trim().min(2, 'A title is required').max(150),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a valid date'),
});

export async function addCaseEventAction(formData: FormData): Promise<Result> {
  await requireAdmin();
  const parsed = AddEventSchema.safeParse({
    case_id: formData.get('case_id'),
    event_type: formData.get('event_type')?.toString() || 'note',
    title: formData.get('title')?.toString(),
    description: formData.get('description')?.toString() || '',
    event_date: formData.get('event_date')?.toString(),
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || 'Invalid timeline entry.' };

  const visible = formData.get('client_visible') === 'on';
  const notify = formData.get('notify') === 'on';
  const supabase = getServiceSupabase();

  const { data: caseRow } = await supabase.from('cases').select('case_no').eq('case_id', parsed.data.case_id).maybeSingle();
  if (!caseRow) return { success: false, error: 'Case not found.' };

  const { error } = await supabase.from('case_events').insert([
    {
      case_id: parsed.data.case_id,
      event_type: parsed.data.event_type,
      title: parsed.data.title,
      description: parsed.data.description || null,
      event_date: parsed.data.event_date,
      client_visible: visible,
    },
  ]);
  if (error) return { success: false, error: 'Could not save the timeline entry.' };

  let notified = 0;
  if (visible && notify) {
    notified = await notifyCaseClients(parsed.data.case_id, caseRow.case_no, parsed.data.title, parsed.data.description || parsed.data.title);
  }
  revalidatePath(`/admin/cases/${parsed.data.case_id}`);
  return { success: true, message: notify && visible ? `Entry added. ${notified} client(s) notified.` : 'Entry added.' };
}

export async function deleteCaseEventAction(formData: FormData): Promise<Result> {
  await requireAdmin();
  const eventId = z.coerce.number().int().positive().safeParse(formData.get('event_id'));
  const caseId = z.coerce.number().int().positive().safeParse(formData.get('case_id'));
  if (!eventId.success || !caseId.success) return { success: false, error: 'Invalid request.' };
  const { error } = await getServiceSupabase().from('case_events').delete().eq('event_id', eventId.data).eq('case_id', caseId.data);
  if (error) return { success: false, error: 'Could not delete the entry.' };
  revalidatePath(`/admin/cases/${caseId.data}`);
  return { success: true, message: 'Entry deleted.' };
}
