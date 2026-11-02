import Link from 'next/link';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/auth';
import { FolderLock, ShieldCheck, Search, KeyRound } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CasesPageProps {
  searchParams?: Promise<{
    case_no?: string;
    verifier?: string;
  }>;
}

export default async function CasesPortalPage({ searchParams }: CasesPageProps) {
  const auth = await verifyAdminSession();
  const params = searchParams ? await searchParams : {};

  // If authenticated as admin, load official firm docket
  let cases: any[] = [];
  let searchedCase: any = null;
  let searchError: string | null = null;

  if (auth.isValid) {
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = getServiceSupabase();
        const { data } = await supabase
          .from('cases')
          .select('*, court:court_id(court_name), case_type:case_type_id(case_type), assistant:assistant_id(assistant_name)')
          .order('created_at', { ascending: false });
        cases = data || [];
      }
    } catch (err) {
      console.error('Cases fetch error:', err);
    }
  } else if (params.case_no && params.verifier) {
    // Secondary-secret verified inquiry: requires case_no + client mobile verifier
    const caseRef = params.case_no.trim();
    const verifier = params.verifier.trim().toLowerCase();

    if (verifier.replace(/[^0-9]/g, '').length < 7) {
      searchError = 'Authentication failed: Please provide your full telephone number as verification.';
    } else {
      try {
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const supabase = getServiceSupabase();
          const { data, error } = await supabase
            .from('cases')
            .select('case_no, status, filing_date, court:court_id(court_name), client_mobile')
            .eq('case_no', caseRef)
            .limit(1)
            .maybeSingle();

          if (error || !data) {
            searchError = 'No matching case record found with the supplied reference number.';
          } else {
            // Verify secondary secret against the registered client mobile number
            const clientMobile = (data.client_mobile || '').toLowerCase().replace(/[^0-9]/g, '');
            const cleanVerifier = verifier.replace(/[^0-9]/g, '');

            const isPhoneMatch = cleanVerifier.length >= 7 && clientMobile.endsWith(cleanVerifier);

            if (!isPhoneMatch) {
              searchError = 'Authentication failed: Provided verification details do not match the registered client record.';
            } else {
              // Return only minimal public status fields (no sensitive personal details)
              searchedCase = {
                case_no: data.case_no,
                status: data.status,
                filing_date: data.filing_date,
                court: data.court,
              };
            }
          }
        } else {
          searchError = 'Database service is currently initializing. Please try again shortly.';
        }
      } catch (err) {
        console.error('Case search error:', err);
        searchError = 'An error occurred while verifying the docket reference.';
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border-gold/40">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-burgundy to-neutral-900 border border-gold/40 flex items-center justify-center text-gold shadow-lg flex-shrink-0">
            <FolderLock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-2xl text-white">
                {auth.isValid ? 'Firm Case Docket & Vault' : 'Client Case Status Inquiry'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-burgundy/40 text-gold border border-burgundy">
                {auth.isValid ? 'Admin Access Active' : 'Verified Inquiry Portal'}
              </span>
            </div>
            <p className="text-neutral-400 text-xs mt-0.5">
              {auth.isValid
                ? 'Full administrative case docket, document repository, and hearing management.'
                : 'Enter your legal docket reference and secondary client verifier to inspect hearing status.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/client"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-burgundy to-burgundy-light hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
          >
            <FolderLock className="w-4 h-4 text-gold" />
            <span>Client Portal Sign-In</span>
          </Link>
          {auth.isValid ? (
            <Link
              href="/admin"
              className="px-4 py-2.5 rounded-xl glass-panel hover:bg-neutral-900 text-neutral-300 hover:text-gold text-xs font-semibold flex items-center gap-1.5 border border-neutral-800 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-gold" />
              <span>Admin Console</span>
            </Link>
          ) : (
            <Link
              href="/admin/login"
              className="px-4 py-2.5 rounded-xl glass-panel hover:bg-neutral-900 text-neutral-300 hover:text-gold text-xs font-semibold flex items-center gap-1.5 border border-neutral-800 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-gold" />
              <span>Staff Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* IF NOT AUTHENTICATED: SHOW TWO-FACTOR CASE INQUIRY VERIFIER */}
      {!auth.isValid && (
        <div className="glass-panel rounded-3xl p-8 border border-neutral-800 max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">Private Status Verification</h2>
            <p className="text-xs text-neutral-400">
              Per attorney-client confidentiality rules, inquiries require both your docket number and secondary verifier.
            </p>
          </div>

          <form method="GET" action="/cases" className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Docket Reference Number</label>
              <input
                type="text"
                name="case_no"
                required
                placeholder="e.g. NX-2025-001"
                defaultValue={params.case_no || ''}
                className="w-full bg-[#07101E] border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Client Verifier (Registered Mobile Number)
              </label>
              <input
                type="text"
                name="verifier"
                required
                placeholder="e.g. registered phone digits or access code"
                defaultValue={params.verifier || ''}
                className="w-full bg-[#07101E] border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#D4AF37] hover:bg-[#B5952F] text-[#0A192F] font-bold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Verify &amp; Check Case Status</span>
            </button>
          </form>

          {searchError && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs">
              {searchError}
            </div>
          )}

          {searchedCase && (
            <div className="p-6 rounded-2xl bg-[#0A192F] border border-gold/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-gold font-bold text-sm">{searchedCase.case_no}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-700">
                  {searchedCase.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-800 pt-4">
                <div>
                  <span className="text-neutral-400 block">Forum / Jurisdiction:</span>
                  <span className="text-white font-semibold">{searchedCase.court?.court_name || 'Tribunal'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Filing Date:</span>
                  <span className="text-white font-mono">{searchedCase.filing_date}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* IF ADMIN AUTHENTICATED: SHOW FULL OFFICIAL DOCKET REGISTER */}
      {auth.isValid && (
        <div className="glass-panel rounded-3xl overflow-hidden border border-neutral-800 space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-xl text-white">Active Matter Register</h2>
              <p className="text-neutral-400 text-xs">Official dockets with isolated document vault attachments.</p>
            </div>
            <span className="text-xs font-mono text-gold">{cases.length} Registered Matters</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Docket Number</th>
                  <th className="py-3 px-4">Client / Matter</th>
                  <th className="py-3 px-4">Court / Tribunal</th>
                  <th className="py-3 px-4">Filing Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-300">
                {cases.map((c: any) => (
                  <tr key={c.case_id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-gold">{c.case_no}</td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-white block">{c.plaintiff_name}</span>
                      <span className="text-neutral-500 text-[11px] block mt-0.5">vs. {c.defendants_name}</span>
                    </td>
                    <td className="py-4 px-4 text-neutral-300">{c.court?.court_name || 'Tribunal Forum'}</td>
                    <td className="py-4 px-4 font-mono text-[11px] text-neutral-400">{c.filing_date}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-700/50">
                        {c.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/admin/cases/${c.case_id}`}
                        className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-gold border border-neutral-800 transition-colors inline-flex items-center gap-1.5 text-xs"
                      >
                        <FolderLock className="w-3.5 h-3.5 text-gold" />
                        <span>Manage Docket</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
