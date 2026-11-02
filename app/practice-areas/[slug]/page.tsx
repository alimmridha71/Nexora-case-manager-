import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import { CONFIG } from '@/lib/config';

export default async function PracticeAreaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const formattedTitle = resolvedParams.slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <Link href="/practice-areas" className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-gold transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Practice Disciplines</span>
      </Link>

      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-gold/30 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-burgundy/30 border border-burgundy text-gold text-xs font-bold uppercase tracking-widest">
          <Scale className="w-3.5 h-3.5" />
          <span>Practice Brief</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white">{formattedTitle}</h1>

        <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-light">
          {CONFIG.firm.name} provides distinguished counsel in {formattedTitle}. Our partners combine deep regulatory expertise, assertive courtroom advocacy, and pragmatic commercial negotiation to secure optimal client outcomes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
          {[
            'Bespoke Litigation Strategy & Pre-Trial Risk Audit',
            'Cross-Border Forum Selection & Choice of Law Analysis',
            'Discovery Safeguards & Electronic Evidentiary Preservation',
            'Appellate Advocacy Before Highest Federal & State Courts',
          ].map((point, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-gold/40 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-xs text-gold uppercase font-bold tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Privileged Inquiry</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">Retain Counsel for {formattedTitle}</h2>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
