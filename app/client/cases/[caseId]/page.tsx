import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireClient } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { clientCanSeeCase, getActiveClient } from '@/lib/client-data';
import { panelCls, statusBadgeCls } from '@/lib/ui';

export const dynamic = 'force-dynamic';

export default async function ClientCasePage({ params }: { params: Promise<{ caseId: string }> }) {
  const session = await requireClient();
  const client = await getActiveClient(session.clientId);
  if (!client) redirect('/client/login?error=disabled');

  const { caseId: raw } = await params;
  const caseId = Number(raw);
  if (!Number.isInteger(caseId) || caseId <= 0) notFound();

  // Ownership check: a client can only open cases that were explicitly shared with them
  if (!(await clientCanSeeCase(client.client_id, caseId))) notFound();

  const supabase = getServiceSupabase();
  const [{ data: c }, { data: events }, { data: files }] = await Promise.all([
    supabase
      .from('cases')
      .select('case_no, status, filing_date, under_section, plaintiff_name, defendants_name, court:court_id(court_name), type:case_type_id(case_type)')
      .eq('case_id', caseId)
      .maybeSingle(),
    supabase
      .from('case_events')
      .select('event_id, event_type, title, description, event_date')
      .eq('case_id', caseId)
      .eq('client_visible', true)
      .order('event_date', { ascending: false })
      .order('event_id', { ascending: false }),
    supabase
      .from('case_files')
      .select('file_id, file_name, size_bytes, created_at')
      .eq('case_id', caseId)
      .eq('client_visible', true)
      .order('created_at', { ascending: false }),
  ]);
  if (!c) notFound();
  const court = (c as any).court?.court_name;
  const type = (c as any).type?.case_type;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link href="/client" className="text-xs text-neutral-400 hover:text-gold inline-flex items-center gap-1.5"><ArrowLeft className="w-3.5 h-3.5" /> My cases</Link>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <h1 className="font-serif font-bold text-2xl text-white font-mono">{c.case_no}</h1>
          <span className={statusBadgeCls(c.status)}>{c.status || 'n/a'}</span>
        </div>
      </div>

      <div className={`${panelCls} grid sm:grid-cols-2 gap-4 text-xs`}>
        <div><span className="text-neutral-500 block">Matter</span><span className="text-white">{c.under_section}</span></div>
        <div><span className="text-neutral-500 block">Case type</span><span className="text-white">{type || '—'}</span></div>
        <div><span className="text-neutral-500 block">Parties</span><span className="text-white">{c.plaintiff_name} vs. {c.defendants_name}</span></div>
        <div><span className="text-neutral-500 block">Court</span><span className="text-white">{court || '—'}</span></div>
        <div><span className="text-neutral-500 block">Filed</span><span className="text-white font-mono">{c.filing_date}</span></div>
      </div>

      <div className={panelCls}>
        <h2 className="font-serif font-bold text-lg text-white mb-4">Documents shared with you</h2>
        <ul className="space-y-2">
          {(files || []).map((f) => (
            <li key={f.file_id} className="text-xs text-neutral-300">
              <a href={`/api/files/${f.file_id}`} className="text-gold hover:underline">{f.file_name}</a>
              <span className="text-neutral-500"> · {(f.size_bytes / 1024).toFixed(0)} KB · {new Date(f.created_at).toLocaleDateString()}</span>
            </li>
          ))}
          {(!files || files.length === 0) && <li className="text-xs text-neutral-500">No documents have been shared yet.</li>}
        </ul>
      </div>

      <div className={panelCls}>
        <h2 className="font-serif font-bold text-lg text-white mb-4">Case timeline</h2>
        <ol className="space-y-4 border-l border-neutral-800 pl-5">
          {(events || []).map((e) => (
            <li key={e.event_id} className="relative">
              <span className="absolute -left-[26px] top-1.5 w-2.5 h-2.5 rounded-full bg-gold" />
              <p className="text-xs text-white font-semibold">{e.title} <span className="text-[10px] uppercase text-gold ml-2">{e.event_type}</span></p>
              <p className="text-[11px] text-neutral-500 font-mono">{e.event_date}</p>
              {e.description && <p className="text-xs text-neutral-400 mt-1">{e.description}</p>}
            </li>
          ))}
          {(!events || events.length === 0) && <li className="text-xs text-neutral-500">No updates have been posted yet.</li>}
        </ol>
      </div>
    </div>
  );
}
