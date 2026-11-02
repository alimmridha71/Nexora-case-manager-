import Link from 'next/link';
import { getServiceSupabase } from '@/lib/supabase';
import { Briefcase, ArrowRight, Scale } from 'lucide-react';

export const revalidate = 60;

export default async function PracticeAreasPage() {
  let practiceAreas: any[] | null = null;
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = getServiceSupabase();
      const { data } = await supabase
        .from('practice_areas')
        .select('*')
        .eq('status', 'active');
      practiceAreas = data;
    }
  } catch (err) {
    console.error('Practice areas fetch fallback:', err);
  }

  const areas = practiceAreas && practiceAreas.length > 0 ? practiceAreas : [
    {
      slug: 'corporate-litigation',
      title: 'Corporate & Commercial Litigation',
      subtitle: 'Cross-Border M&A and Shareholder Disputes',
      description: 'Comprehensive advocacy for complex commercial disputes, contract enforcement, and multi-jurisdictional arbitrations.',
    },
    {
      slug: 'criminal-defense',
      title: 'White Collar & Criminal Defense',
      subtitle: 'High-Stakes Regulatory & Federal Defense',
      description: 'Discreet, aggressive counsel in corporate compliance investigations, securities enforcement, and criminal trials.',
    },
    {
      slug: 'intellectual-property',
      title: 'Intellectual Property & Patents',
      subtitle: 'Trade Secret Preservation and Technology Licensing',
      description: 'Guarding intellectual property portfolios, patent infringement suits, and proprietary software rights globally.',
    },
    {
      slug: 'real-estate-land',
      title: 'Real Estate & Land Acquisition',
      subtitle: 'Commercial Property & Zoning Development',
      description: 'Advisory for multi-million dollar acquisitions, land zoning permits, commercial leases, and title litigation.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-xs uppercase tracking-widest text-gold border border-gold/30">
          <Scale className="w-4 h-4" />
          <span>Strategic Legal Disciplines</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white">Chambers Practice Areas</h1>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Comprehensive, client-focused advocacy tailored for enterprise resilience, asset protection, and trial success across major commercial jurisdictions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {areas.map((p) => (
          <Link
            key={p.slug}
            href={`/practice-areas/${p.slug}`}
            className="glass-panel p-8 rounded-3xl hover:border-gold/60 transition-all group block space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-burgundy/40 border border-gold/40 flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold block mb-1">{p.subtitle || 'Practice Area'}</span>
              <h2 className="font-serif font-bold text-2xl text-white group-hover:text-gold transition-colors">{p.title}</h2>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">{p.description}</p>
            <div className="flex items-center gap-2 text-xs font-semibold text-gold pt-2">
              <span>Read Full Practice Brief</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
