import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { createClientAction, resetClientPasswordAction, setClientActiveAction } from '@/app/actions/clients';
import ActionForm from '@/components/ActionForm';
import { inputCls, labelCls, panelCls, smallBtnCls } from '@/lib/ui';

export const dynamic = 'force-dynamic';

export default async function AdminClientsPage() {
  await requireAdmin();
  const { data: clients } = await getServiceSupabase()
    .from('client_accounts')
    .select('client_id, full_name, email, mobile, is_active, last_login_at, created_at, client_case_access(count)')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link href="/admin" className="text-xs text-neutral-400 hover:text-gold inline-flex items-center gap-1.5"><ArrowLeft className="w-3.5 h-3.5" /> Console</Link>
        <h1 className="font-serif font-bold text-2xl text-white mt-1">Client Accounts</h1>
        <p className="text-neutral-400 text-xs mt-1">Clients sign in at <span className="font-mono text-gold">/client</span> and only see the cases you link to them.</p>
      </div>

      <div className={panelCls}>
        <h2 className="font-serif font-bold text-lg text-white mb-4">Create a client account</h2>
        <ActionForm action={createClientAction} submitLabel="Create account" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelCls}>Full name</label><input name="full_name" required className={inputCls} /></div>
          <div><label className={labelCls}>Email (login)</label><input type="email" name="email" required className={inputCls} /></div>
          <div><label className={labelCls}>Mobile (optional)</label><input name="mobile" className={inputCls} /></div>
        </ActionForm>
        <p className="text-[11px] text-neutral-500 mt-2">A temporary password is generated and shown once. Share it securely; it is never stored in readable form.</p>
      </div>

      <div className={`${panelCls} overflow-x-auto`}>
        <table className="w-full text-left text-xs">
          <thead className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Cases</th>
              <th className="py-3 px-4">Last sign-in</th>
              <th className="py-3 px-4">Account</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900 text-neutral-300 align-top">
            {(clients || []).map((c: any) => (
              <tr key={c.client_id}>
                <td className="py-3 px-4"><span className="text-white font-semibold block">{c.full_name}</span><span className="text-neutral-500">{c.email}</span></td>
                <td className="py-3 px-4 font-mono">{c.client_case_access?.[0]?.count ?? 0}</td>
                <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">{c.last_login_at ? new Date(c.last_login_at).toLocaleString() : 'never'}</td>
                <td className="py-3 px-4">{c.is_active ? <span className="text-emerald-400">active</span> : <span className="text-neutral-500">deactivated</span>}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-2">
                    <ActionForm action={resetClientPasswordAction} submitLabel="Reset password" buttonClassName={smallBtnCls} className="space-y-1" confirmMessage="Generate a new temporary password for this client?">
                      <input type="hidden" name="client_id" value={c.client_id} />
                    </ActionForm>
                    <ActionForm action={setClientActiveAction} submitLabel={c.is_active ? 'Deactivate' : 'Activate'} buttonClassName={smallBtnCls} className="space-y-1">
                      <input type="hidden" name="client_id" value={c.client_id} />
                      <input type="hidden" name="active" value={c.is_active ? 'false' : 'true'} />
                    </ActionForm>
                  </div>
                </td>
              </tr>
            ))}
            {(!clients || clients.length === 0) && <tr><td colSpan={5} className="py-6 text-center text-neutral-500">No client accounts yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
