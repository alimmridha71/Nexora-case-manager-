'use client';

import { useState } from 'react';
import { submitConsultationIntake } from '@/app/actions/intake';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactForm() {
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  async function handleSubmit(formData: FormData) {
    setStatus({ type: 'loading', message: 'Transmitting confidential consultation brief...' });
    const res = await submitConsultationIntake(formData);
    if (res.success) {
      setStatus({ type: 'success', message: res.message });
    } else {
      setStatus({ type: 'error', message: res.message });
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {/* Bot mitigation honeypot field - visually hidden, rejected if filled */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website_url">Website</label>
        <input
          type="text"
          id="website_url"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {status.type === 'success' ? (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-600/50 text-emerald-200 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{status.message}</span>
        </div>
      ) : (
        <>
          {status.type === 'error' && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{status.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">Full Legal Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g., Alexander Wright"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-gold font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">Telephone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+1 (800) 555-0100"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-gold font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="counsel@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-gold font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">Practice Specialty</label>
              <select
                name="service"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-gold font-sans"
              >
                <option value="Corporate & Commercial Litigation">Corporate & Commercial Litigation</option>
                <option value="White Collar & Criminal Defense">White Collar & Criminal Defense</option>
                <option value="Intellectual Property & Patents">Intellectual Property & Patents</option>
                <option value="Real Estate & Land Acquisition">Real Estate & Land Acquisition</option>
                <option value="Constitutional & Appellate">Constitutional & Appellate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">Confidential Matter Summary</label>
            <textarea
              name="message"
              rows={4}
              placeholder="Provide a concise description of the legal proceeding, arbitration, or commercial dispute..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-gold font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={status.type === 'loading'}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-burgundy to-burgundy-light hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 text-gold" />
            <span>{status.type === 'loading' ? 'Transmitting Brief...' : 'Submit Confidential Brief'}</span>
          </button>
        </>
      )}
    </form>
  );
}
