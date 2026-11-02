import { NextResponse } from 'next/server';
import { verifyAdminSession, verifyClientSession } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { clientCanSeeCase, getActiveClient } from '@/lib/client-data';
import { signedDownloadUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';

// GET /api/files/:fileId  ->  302 to a 60-second signed URL.
// Allowed for: an admin, or a client who was granted the case AND the file is marked client-visible.
export async function GET(_req: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const fileId = Number((await params).fileId);
  if (!Number.isInteger(fileId) || fileId <= 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: file } = await getServiceSupabase()
    .from('case_files')
    .select('storage_path, case_id, client_visible')
    .eq('file_id', fileId)
    .maybeSingle();
  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const admin = await verifyAdminSession();
  let allowed = admin.isValid;

  if (!allowed) {
    const client = await verifyClientSession();
    if (!client.isValid || !client.session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const active = await getActiveClient(client.session.clientId);
    allowed = Boolean(active && file.client_visible && (await clientCanSeeCase(active.client_id, file.case_id)));
  }
  if (!allowed) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const url = await signedDownloadUrl(file.storage_path);
  if (!url) return NextResponse.json({ error: 'File unavailable' }, { status: 502 });
  return NextResponse.redirect(url, 302);
}
