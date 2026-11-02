'use server';

// Admin-only case file uploads to a private Supabase Storage bucket.
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { validateUpload, buildStoragePath } from '@/lib/files';
import { ensureBucket, STORAGE_BUCKET } from '@/lib/storage';
import { notifyCaseClients } from '@/lib/notify';

type Result = { success: boolean; error?: string; message?: string };

export async function uploadCaseFileAction(formData: FormData): Promise<Result> {
  await requireAdmin();
  const caseId = z.coerce.number().int().positive().safeParse(formData.get('case_id'));
  if (!caseId.success) return { success: false, error: 'Invalid case.' };

  const file = formData.get('file');
  if (!(file instanceof File)) return { success: false, error: 'Choose a file to upload.' };
  const problem = validateUpload(file.name, file.type, file.size);
  if (problem) return { success: false, error: problem };

  const visible = formData.get('client_visible') === 'on';
  const notify = formData.get('notify') === 'on';
  const supabase = getServiceSupabase();

  const { data: caseRow } = await supabase.from('cases').select('case_no').eq('case_id', caseId.data).maybeSingle();
  if (!caseRow) return { success: false, error: 'Case not found.' };
  if (!(await ensureBucket())) return { success: false, error: 'File storage is not available right now.' };

  const path = buildStoragePath(caseId.data, globalThis.crypto.randomUUID(), file.name);
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (uploadError) {
    console.error('Storage upload failed:', uploadError.message);
    return { success: false, error: 'The upload failed. Please try again.' };
  }

  const { error: insertError } = await supabase.from('case_files').insert([
    {
      case_id: caseId.data,
      file_name: file.name.slice(0, 150),
      storage_path: path,
      content_type: file.type,
      size_bytes: file.size,
      client_visible: visible,
    },
  ]);
  if (insertError) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]); // do not leave an orphaned object
    return { success: false, error: 'Could not record the file.' };
  }

  let notified = 0;
  if (visible && notify) {
    notified = await notifyCaseClients(caseId.data, caseRow.case_no, 'A new document was shared with you', `A new document is available on case ${caseRow.case_no}.`);
  }
  revalidatePath(`/admin/cases/${caseId.data}`);
  return { success: true, message: visible && notify ? `File uploaded. ${notified} client(s) notified.` : 'File uploaded.' };
}

export async function deleteCaseFileAction(formData: FormData): Promise<Result> {
  await requireAdmin();
  const fileId = z.coerce.number().int().positive().safeParse(formData.get('file_id'));
  if (!fileId.success) return { success: false, error: 'Invalid file.' };

  const supabase = getServiceSupabase();
  const { data: row } = await supabase.from('case_files').select('storage_path, case_id').eq('file_id', fileId.data).maybeSingle();
  if (!row) return { success: false, error: 'File not found.' };

  await supabase.storage.from(STORAGE_BUCKET).remove([row.storage_path]);
  const { error } = await supabase.from('case_files').delete().eq('file_id', fileId.data);
  if (error) return { success: false, error: 'Could not delete the file.' };
  revalidatePath(`/admin/cases/${row.case_id}`);
  return { success: true, message: 'File deleted.' };
}
