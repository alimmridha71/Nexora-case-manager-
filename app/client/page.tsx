import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Bell, FolderLock, LogOut } from 'lucide-react';
import { requireClient } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { getActiveClient } from '@/lib/client-data';
import { clientLogoutAction } from '@/app/actions/client';
import MarkReadButton from '@/components/MarkReadButton';
import { panelCls, statusBadgeCls } from '@/lib/ui';

export const dynamic = 'force-dynamic';

export default async function ClientPortalPage() {
  const session = await requireClient();
  const client = await getActiveClient(session.clientId);
  if (!client) redirect('/client/login?error=disabled');

  const supabase = getServiceSupabase();
  const [{ data: access }, { data: notes }] = await Promise.all([
    supabase
      .from('client_case_access')
      .select('cases(case_id, case_no, status, filing_date, under_section, court:court_id(court_name))')
      .eq('client_id', client.client_id),
    supabase
      .from('notifications')
      .select('notification_id, case_id, subject, body, read_at, created_at')
      .eq('client_id', client.client_id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);
  const cases = (access || []).map((a: any) => a.cases).filter(Boolean);
  const unread = (notes || []).filter((n) => !n.read_at).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-white">Welcome, {client.full_name}</h1>
          <p className="text-neutral-400 text-xs mt-1">Signed in as <span className="font-mono text-gold">{client.email}</span></p>
        </div>
        <form action={clientLogoutAction}>
          <button type="submit" className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-red-400 text-xs font-semibold flex items-center gap-2 border border-neutral-800">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </form>
      </div>

      <div className={panelCls}>
        <h2 className="font-serif font-bold text-lg text-white mb-4 flex items-center gap-2"><FolderLock className="w-5 h-5 text-gold" /> Your cases</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {cases.map((c: any) => (
            <Link key={c.case_id} href={`/client/cases/${c.case_id}`} className="block p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-gold/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-gold text-sm">{c.case_no}</span>
                <span className={statusBadgeCls(c.status)}>{c.status || 'n/a'}</span>
              </div>
              <p className="text-xs text-neutral-300 mt-2">{c.under_section}</p>
              <p className="text-[11px] text-neutral-500 mt-1">{c.court?.court_name || ''} · filed {c.filing_date}</p>
            </Link>
          ))}
          {cases.length === 0 && <p className="text-xs text-neutral-500">No cases have been shared with you yet. Please contact the firm.</p>}
        </div>
      </div>

      <div className={panelCls}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-lg text-white flex items-center gap-2"><Bell className="w-5 h-5 text-gold" /> Notifications {unread > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-burgundy text-gold">{unread} new</span>}</h2>
          {unread > 0 && <MarkReadButton />}
        </div>
        <ul className="space-y-3">
          {(notes || []).map((n) => (
            <li key={n.notification_id} className={`text-xs p-3 rounded-lg border ${n.read_at ? 'border-neutral-900 text-neutral-400' : 'border-gold/30 text-neutral-200 bg-gold/5'}`}>
              <p className="font-semibold">{n.subject}</p>
              <p className="text-neutral-400 mt-0.5">{n.body}</p>
              <p className="text-[10px] text-neutral-600 font-mono mt-1">{new Date(n.created_at).toLocaleString()}</p>
            </li>
          ))}
          {(!notes || notes.length === 0) && <li className="text-xs text-neutral-500">No notifications yet.</li>}
        </ul>
      </div>
    </div>
  );
}
