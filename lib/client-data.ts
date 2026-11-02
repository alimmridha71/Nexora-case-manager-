// Server-only data access for the client portal. Every query is scoped to the signed-in client.
import { getServiceSupabase } from './supabase';

export async function getActiveClient(clientId: number) {
  const { data } = await getServiceSupabase()
    .from('client_accounts')
    .select('client_id, full_name, email, is_active')
    .eq('client_id', clientId)
    .maybeSingle();
  return data && data.is_active ? data : null;
}

/** True only if the client has been granted access to this exact case (ownership check). */
export async function clientCanSeeCase(clientId: number, caseId: number): Promise<boolean> {
  const { data } = await getServiceSupabase()
    .from('client_case_access')
    .select('case_id')
    .eq('client_id', clientId)
    .eq('case_id', caseId)
    .maybeSingle();
  return Boolean(data);
}
