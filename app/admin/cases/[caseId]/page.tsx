import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { setCaseStatusFormAction, deleteCaseFormAction } from '@/app/actions/cases';
import { addCaseEventAction, deleteCaseEventAction } from '@/app/actions/events';
import { uploadCaseFileAction, deleteCaseFileAction } from '@/app/actions/files';
import { ACCEPT_ATTRIBUTE } from '@/lib/files';
import { grantCaseAccessAction, revokeCaseAccessAction } from '@/app/actions/clients';
import { EVENT_TYPES } from '@/lib/case-events';
import ActionForm from '@/components/ActionForm';
import { inputCls, labelCls, panelCls, smallBtnCls, statusBadgeCls } from '@/lib/ui';

export const dynamic = 'force-dynamic';

export default async function AdminCaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  await requireAdmin();
  const { caseId: raw } = await params;
  const caseId = Number(raw);
  if (!Number.isInteger(caseId) || caseId <= 0) notFound();

  const supabase = getServiceSupabase();
  const { data: c } = await supabase
    .from('cases')
    .select('*, court:court_id(court_name), type:case_type_id(case_type)')
    .eq('case_id', caseId)
    .maybeSingle();
  if (!c) notFound();

  const [{ data: events }, { data: access }, { data: allClients }, { data: files }] = await Promise.all([
    supabase.from('case_events').select('*').eq('case_id', caseId).order('event_date', { ascending: false }).order('event_id', { ascending: false }),
    supabase.from('client_case_access').select('client_accounts(client_id, full_name, email)').eq('case_id', caseId),
    supabase.from('client_accounts').select('client_id, full_name, email').eq('is_active', true).order('full_name'),
    supabase.from('case_files').select('file_id, file_name, size_bytes, client_visible, created_at').eq('case_id', caseId).order('created_at', { ascending: false }),
  ]);

  const linked = (access || []).map((a: any) => a.client_accounts).filter(Boolean) as { client_id: number; full_name: string; email: string }[];
  const linkedIds = new Set(linked.map((l) => l.client_id));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link href="/admin/cases" className="text-xs text-neutral-400 hover:text-gold inline-flex items-center gap-1.5"><ArrowLeft className="w-3.5 h-3.5" /> Case register</Link>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <h1 className="font-serif font-bold text-2xl text-white font-mono">{c.case_no}</h1>
          <span className={statusBadgeCls(c.status)}>{c.status || 'n/a'}</span>
        </div>
        <p className="text-neutral-400 text-xs mt-1">{c.plaintiff_name} vs. {c.defendants_name} · {c.court?.court_name || 'Court n/a'} · {c.type?.case_type || ''} · filed {c.filing_date}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className={panelCls}>
          <h2 className="font-serif font-bold text-lg text-white mb-3">Status</h2>
          <ActionForm action={setCaseStatusFormAction} submitLabel="Update status & notify clients" className="flex flex-wrap items-end gap-3" resetOnSuccess={false}>
            <input type="hidden" name="case_id" value={caseId} />
            <div>
              <label className={labelCls}>Status</label>
              <select name="status" defaultValue={c.status === 'inactive' ? 'inactive' : 'active'} className={inputCls}>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
          </ActionForm>
        </div>

        <div className={panelCls}>
          <h2 className="font-serif font-bold text-lg text-white mb-3">Client access</h2>
          <ul className="space-y-2 mb-4">
            {linked.map((l) => (
              <li key={l.client_id} className="flex items-center justify-between gap-3 text-xs text-neutral-300">
                <span>{l.full_name} <span className="text-neutral-500">({l.email})</span></span>
                <ActionForm action={revokeCaseAccessAction} submitLabel="Remove" buttonClassName={smallBtnCls} className="flex" confirmMessage="Remove this client's access to the case?">
                  <input type="hidden" name="client_id" value={l.client_id} />
                  <input type="hidden" name="case_id" value={caseId} />
                </ActionForm>
              </li>
            ))}
            {linked.length === 0 && <li className="text-xs text-neutral-500">No client can see this case yet.</li>}
          </ul>
          <ActionForm action={grantCaseAccessAction} submitLabel="Grant access" className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="case_id" value={caseId} />
            <div className="min-w-[12rem]">
              <label className={labelCls}>Client account</label>
              <select name="client_id" required className={inputCls}>
                <option value="">Select a client…</option>
                {(allClients || []).filter((cl) => !linkedIds.has(cl.client_id)).map((cl) => (
                  <option key={cl.client_id} value={cl.client_id}>{cl.full_name} — {cl.email}</option>
                ))}
              </select>
            </div>
          </ActionForm>
          <p className="text-[11px] text-neutral-500 mt-2">Create client accounts under <Link href="/admin/clients" className="text-gold hover:underline">Clients</Link>.</p>
        </div>
      </div>

      <div className={panelCls}>
        <h2 className="font-serif font-bold text-lg text-white mb-4">Timeline</h2>
        <ActionForm action={addCaseEventAction} submitLabel="Add to timeline" className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input type="hidden" name="case_id" value={caseId} />
          <div>
            <label className={labelCls}>Type</label>
            <select name="event_type" className={inputCls}>{EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
          </div>
          <div><label className={labelCls}>Date</label><input type="date" name="event_date" defaultValue={today} required className={inputCls} /></div>
          <div className="md:col-span-2"><label className={labelCls}>Title</label><input name="title" required maxLength={150} className={inputCls} placeholder="e.g. Hearing scheduled" /></div>
          <div className="md:col-span-4"><label className={labelCls}>Details (optional)</label><textarea name="description" rows={2} maxLength={1000} className={inputCls} /></div>
          <label className="text-xs text-neutral-300 flex items-center gap-2"><input type="checkbox" name="client_visible" defaultChecked /> Visible to client</label>
          <label className="text-xs text-neutral-300 flex items-center gap-2"><input type="checkbox" name="notify" /> Notify client</label>
        </ActionForm>

        <ol className="space-y-3 border-l border-neutral-800 pl-5">
          {(events || []).map((e: any) => (
            <li key={e.event_id} className="relative">
              <span className="absolute -left-[26px] top-1.5 w-2.5 h-2.5 rounded-full bg-gold" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-white font-semibold">{e.title} <span className="text-[10px] uppercase text-gold ml-2">{e.event_type}</span>{!e.client_visible && <span className="text-[10px] uppercase text-neutral-500 ml-2">internal</span>}</p>
                  <p className="text-[11px] text-neutral-500 font-mono">{e.event_date}</p>
                  {e.description && <p className="text-xs text-neutral-400 mt-1">{e.description}</p>}
                </div>
                <ActionForm action={deleteCaseEventAction} submitLabel="Delete" buttonClassName={smallBtnCls} className="flex" confirmMessage="Delete this timeline entry?">
                  <input type="hidden" name="event_id" value={e.event_id} />
                  <input type="hidden" name="case_id" value={caseId} />
                </ActionForm>
              </div>
            </li>
          ))}
          {(!events || events.length === 0) && <li className="text-xs text-neutral-500">No timeline entries yet.</li>}
        </ol>
      </div>

      <div className={panelCls}>
        <h2 className="font-serif font-bold text-lg text-white mb-4">Case files</h2>
        <ul className="space-y-2 mb-4">
          {(files || []).map((f) => (
            <li key={f.file_id} className="flex items-center justify-between gap-3 text-xs text-neutral-300">
              <span>
                <a href={`/api/files/${f.file_id}`} className="text-gold hover:underline">{f.file_name}</a>
                <span className="text-neutral-500"> · {(f.size_bytes / 1024).toFixed(0)} KB · {f.client_visible ? 'shared with client' : 'internal'}</span>
              </span>
              <ActionForm action={deleteCaseFileAction} submitLabel="Delete" buttonClassName={smallBtnCls} className="flex" confirmMessage="Delete this file permanently?">
                <input type="hidden" name="file_id" value={f.file_id} />
              </ActionForm>
            </li>
          ))}
          {(!files || files.length === 0) && <li className="text-xs text-neutral-500">No files uploaded.</li>}
        </ul>
        <ActionForm action={uploadCaseFileAction} submitLabel="Upload file" className="space-y-3">
          <input type="hidden" name="case_id" value={caseId} />
          <div><label className={labelCls}>File (PDF, PNG, JPG, TXT, DOCX, max 4 MB)</label><input type="file" name="file" required accept={ACCEPT_ATTRIBUTE} className={inputCls} /></div>
          <div className="flex flex-wrap gap-6">
            <label className="text-xs text-neutral-300 flex items-center gap-2"><input type="checkbox" name="client_visible" /> Share with client</label>
            <label className="text-xs text-neutral-300 flex items-center gap-2"><input type="checkbox" name="notify" /> Notify client</label>
          </div>
        </ActionForm>
        <p className="text-[11px] text-neutral-500 mt-2">Files are stored in a private bucket and only reachable through short-lived signed links.</p>
      </div>

      <div className="border border-red-900/40 rounded-2xl p-6">
        <h2 className="font-serif font-bold text-base text-red-300 mb-2">Danger zone</h2>
        <ActionForm action={deleteCaseFormAction} submitLabel="Delete this case" buttonClassName="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-200 text-xs font-bold border border-red-800/50" confirmMessage="Delete this case and its timeline permanently?" className="flex">
          <input type="hidden" name="case_id" value={caseId} />
        </ActionForm>
      </div>
    </div>
  );
}
