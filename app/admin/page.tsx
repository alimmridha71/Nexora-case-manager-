import { verifyAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getServiceSupabase } from '@/lib/supabase';
import { adminLogoutAction } from '@/app/actions/admin';
import { ShieldCheck, Scale, Users, Mail, LogOut } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const auth = await verifyAdminSession();
  if (!auth.isValid) {
    redirect('/admin/login');
  }

  let cases: any[] = [];
  let contacts: any[] = [];
  let practiceAreas: any[] = [];

  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = getServiceSupabase();
      const [{ data: cData }, { data: ctData }, { data: pData }] = await Promise.all([
        supabase.from('cases').select('*').order('created_at', { ascending: false }),
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('practice_areas').select('*'),
      ]);
      cases = cData || [];
      contacts = ctData || [];
      practiceAreas = pData || [];
    }
  } catch (err) {
    console.error('Database query fallback:', err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-2xl border-gold/40">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-burgundy to-neutral-900 border border-gold/40 flex items-center justify-center text-gold shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-2xl text-white">Chambers Executive Console</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-700/50">
                Verified Admin
              </span>
            </div>
            <p className="text-neutral-400 text-xs mt-0.5">
              Logged in as: <strong className="text-gold font-mono">{auth.session?.email}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/cases"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-burgundy to-burgundy-light hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 border border-gold/40 shadow-lg transition-all"
          >
            <Scale className="w-4 h-4 text-gold" />
            <span>Cases & Timelines</span>
          </Link>
          <Link
            href="/admin/clients"
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-gold font-bold text-xs flex items-center gap-2 border border-neutral-800 transition-colors"
          >
            <Users className="w-4 h-4 text-gold" />
            <span>Client Accounts</span>
          </Link>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-red-400 text-xs font-semibold flex items-center gap-2 border border-neutral-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium uppercase">
            <span>Litigation Cases</span>
            <Scale className="w-4 h-4 text-gold" />
          </div>
          <span className="font-serif text-3xl font-bold text-white block">{cases?.length || 0}</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium uppercase">
            <span>Inbound Consultations</span>
            <Mail className="w-4 h-4 text-gold" />
          </div>
          <span className="font-serif text-3xl font-bold text-white block">{contacts?.length || 0}</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium uppercase">
            <span>Practice Disciplines</span>
            <Users className="w-4 h-4 text-gold" />
          </div>
          <span className="font-serif text-3xl font-bold text-white block">{practiceAreas?.length || 0}</span>
        </div>
      </div>

      {/* RECENT INTAKES */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-neutral-800 space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-white">Privileged Inbound Inquiries</h2>
          <span className="text-xs text-neutral-400">Total: {contacts?.length || 0}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Inquirer Name</th>
                <th className="py-3 px-4">Contact Detail</th>
                <th className="py-3 px-4">Practice Discipline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-neutral-300">
              {contacts && contacts.length > 0 ? (
                contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-900/40">
                    <td className="py-3 px-4 font-semibold text-white">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">
                      {c.phone || c.email || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gold">{c.service}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-burgundy/30 text-gold border border-burgundy/50">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500 font-mono text-[11px]">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-500">
                    No inquiries recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
