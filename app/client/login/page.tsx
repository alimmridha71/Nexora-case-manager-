'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderLock, Mail, KeyRound, AlertCircle } from 'lucide-react';
import { clientLoginAction } from '@/app/actions/client';
import { inputCls, labelCls } from '@/lib/ui';

export default function ClientLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await clientLoginAction(new FormData(e.currentTarget));
    if (res.success) {
      router.push('/client');
      router.refresh();
    } else {
      setError(res.error || 'Sign-in failed.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-gold/40 shadow-2xl space-y-6">
        <div className="flex items-center gap-3.5 pb-4 border-b border-neutral-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-burgundy to-neutral-900 border border-gold/40 flex items-center justify-center text-gold flex-shrink-0">
            <FolderLock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold block">Confidential</span>
            <h1 className="font-serif font-bold text-xl text-white">Client Portal Sign-In</h1>
          </div>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-red-950/60 border border-red-800/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" /><span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Email</label>
            <div className="relative"><Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input type="email" name="email" required autoComplete="username" className={`${inputCls} pl-9 py-2.5`} /></div>
          </div>
          <div>
            <label className={labelCls}>Password</label>
            <div className="relative"><KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input type="password" name="password" required autoComplete="current-password" className={`${inputCls} pl-9 py-2.5`} /></div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-burgundy to-burgundy-light hover:brightness-110 text-white font-bold text-sm border border-gold/40 disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-[11px] text-neutral-500 text-center">Your access details are provided by your attorney. Forgot your password? Contact the firm to have it reset.</p>
      </div>
    </div>
  );
}
