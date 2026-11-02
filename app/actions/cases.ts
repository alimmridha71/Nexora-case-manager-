'use server';

// Case server actions: each verifies the admin session first, then delegates to lib/cases-service.ts.
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createCase, updateCase, deleteCase } from '@/lib/cases-service';

type Result = { success: boolean; error?: string; message?: string };

function refreshCaseViews(caseId?: number): void {
  revalidatePath('/cases');
  revalidatePath('/admin/cases');
  if (caseId) revalidatePath(`/admin/cases/${caseId}`);
}

export async function createCaseAction(formData: FormData): Promise<Result> {
  await requireAdmin();
  const result = await createCase({
    case_no: formData.get('case_no'),
    plaintiff_name: formData.get('plaintiff_name'),
    defendants_name: formData.get('defendants_name'),
    under_section: formData.get('under_section') || undefined,
    court_id: formData.get('court_id'),
    case_type_id: formData.get('case_type_id'),
    client_mobile: formData.get('client_mobile'),
  });
  if (!result.ok) return { success: false, error: result.error };
  refreshCaseViews();
  return { success: true, message: result.message };
}

export async function updateCaseStatusAction(caseId: number, status: 'active' | 'inactive'): Promise<Result> {
  await requireAdmin();
  const result = await updateCase({ case_id: caseId, status });
  if (!result.ok) return { success: false, error: result.error };
  refreshCaseViews(caseId);
  return { success: true, message: result.message };
}

export async function deleteCaseAction(caseId: number): Promise<Result> {
  await requireAdmin();
  const result = await deleteCase(caseId);
  if (!result.ok) return { success: false, error: result.error };
  refreshCaseViews();
  return { success: true, message: result.message };
}

// FormData wrappers used by the admin pages
export async function setCaseStatusFormAction(formData: FormData): Promise<Result> {
  const status = formData.get('status')?.toString();
  if (status !== 'active' && status !== 'inactive') return { success: false, error: 'Choose a valid status.' };
  return updateCaseStatusAction(Number(formData.get('case_id')), status);
}

export async function deleteCaseFormAction(formData: FormData): Promise<Result> {
  const result = await deleteCaseAction(Number(formData.get('case_id')));
  if (result.success) redirect('/admin/cases');
  return result;
}
