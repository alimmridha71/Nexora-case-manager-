import Link from 'next/link';
import { ArrowLeft, Scale } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { createCaseAction } from '@/app/actions/cases';
import ActionForm from '@/components/ActionForm';
import { inputCls, labelCls, panelCls, statusBadgeCls } from '@/lib/ui';

export const dynamic = 'force-dynamic';

export default async function AdminCasesPage() {
  await requireAdmin();
  const supabase = getServiceSupabase();
  const [{ data: cases }, { data: courts }, { data: caseTypes }] = await Promise.all([
    supabase
      .from('cases')
      .select('case_id, case_no, plaintiff_name, defendants_name, status, filing_date, court:court_id(court_name)')
      .order('created_at', { ascending: false }),
    supabase.from('court').select('court_id, court_name').order('court_name'),
    supabase.from('case_type').select('case_type_id, case_type').order('case_type'),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-xs text-neutral-400 hover:text-gold inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Console
          </Link>
          <h1 className="font-serif font-bold text-2xl text-white mt-1">Case Register</h1>
        </div>
        <span className="text-xs font-mono text-gold">{cases?.length || 0} matters</span>
      </div>

      <div className={panelCls}>
        <h2 className="font-serif font-bold text-lg text-white mb-4">Open a New Case</h2>
        <ActionForm action={createCaseAction} submitLabel="Create case" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelCls}>Case number</label><input name="case_no" required className={inputCls} placeholder="NEX-2026-002" /></div>
          <div><label className={labelCls}>Client / plaintiff</label><input name="plaintiff_name" required className={inputCls} /></div>
          <div><label className={labelCls}>Respondent / defendant</label><input name="defendants_name" required className={inputCls} /></div>
          <div><label className={labelCls}>Under section / matter</label><input name="under_section" className={inputCls} placeholder="General Law" /></div>
          <div>
            <label className={labelCls}>Court</label>
            <select name="court_id" required className={inputCls}>
              {(courts || []).map((c) => <option key={c.court_id} value={c.court_id}>{c.court_name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Case type</label>
            <select name="case_type_id" required className={inputCls}>
              {(caseTypes || []).map((t) => <option key={t.case_type_id} value={t.case_type_id}>{t.case_type}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Client mobile</label><input name="client_mobile" required className={inputCls} placeholder="+1-800-555-0100" /></div>
        </ActionForm>
      </div>

      <div className={`${panelCls} overflow-x-auto`}>
        <table className="w-full text-left text-xs">
          <thead className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Case no.</th>
              <th className="py-3 px-4">Parties</th>
              <th className="py-3 px-4">Court</th>
              <th className="py-3 px-4">Filed</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900 text-neutral-300">
            {(cases || []).map((c: any) => (
              <tr key={c.case_id} className="hover:bg-neutral-900/40">
                <td className="py-3 px-4 font-mono font-bold text-gold">{c.case_no}</td>
                <td className="py-3 px-4"><span className="text-white font-semibold">{c.plaintiff_name}</span><span className="text-neutral-500 block text-[11px]">vs. {c.defendants_name}</span></td>
                <td className="py-3 px-4">{c.court?.court_name || '—'}</td>
                <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">{c.filing_date}</td>
                <td className="py-3 px-4"><span className={statusBadgeCls(c.status)}>{c.status || 'n/a'}</span></td>
                <td className="py-3 px-4 text-right">
                  <Link href={`/admin/cases/${c.case_id}`} className="inline-flex items-center gap-1.5 text-gold hover:underline"><Scale className="w-3.5 h-3.5" />Open</Link>
                </td>
              </tr>
            ))}
            {(!cases || cases.length === 0) && (
              <tr><td colSpan={6} className="py-6 text-center text-neutral-500">No cases yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
