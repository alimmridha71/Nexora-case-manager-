import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import { CONFIG } from '@/lib/config';
import { Scale, ShieldCheck, Briefcase, ArrowRight } from 'lucide-react';

export default function FirmHome() {
  const practiceAreas = [
    {
      slug: 'corporate-litigation',
      title: 'Corporate & Commercial Litigation',
      desc: 'Advising institutional enterprises on shareholder actions, multi-state contract disputes, and arbitration.',
    },
    {
      slug: 'criminal-defense',
      title: 'White Collar & Trial Defense',
      desc: 'Defending corporate executives in DOJ, SEC, and federal regulatory inquiries with relentless courtroom rigor.',
    },
    {
      slug: 'intellectual-property',
      title: 'Intellectual Property & Patents',
      desc: 'Guarding algorithmic patents, biotechnology trade secrets, and trademark licensing globally.',
    },
    {
      slug: 'real-estate-land',
      title: 'Real Estate & Land Acquisition',
      desc: 'Institutional property transactions, zoning appeals, commercial real estate development, and title advocacy.',
    },
  ];

  return (
    <div className="space-y-24">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-24 sm:py-32 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-xs uppercase tracking-widest text-gold border border-gold/30">
            <Scale className="w-4 h-4" />
            <span>Advocacy &bull; Integrity &bull; Trial Mastery</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Defending Your Enterprise With <span className="gold-gradient-text italic">Skill &amp; Precision</span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed">
            {CONFIG.firm.name} delivers strategic corporate litigation, cross-border M&amp;A advisory, and private client vault security for visionary corporations and leaders.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="#consultation"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-burgundy to-burgundy-light hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-burgundy/30 flex items-center justify-center gap-2"
            >
              <span>Schedule Consultation</span>
              <ArrowRight className="w-4 h-4 text-gold" />
            </Link>
            <Link
              href="/cases"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl glass-panel hover:bg-neutral-900 text-neutral-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all border border-neutral-800 hover:border-gold/50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-gold" />
              <span>Client Case Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '$4.2B+', label: 'Matters Adjudicated' },
            { value: '98.4%', label: 'Trial Success Record' },
            { value: '28+', label: 'Years Combined Advocacy' },
            { value: '100%', label: 'Confidential Vault Isolation' },
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl text-center space-y-1">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-gold block">{stat.value}</span>
              <span className="text-neutral-400 text-xs uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PRACTICE AREAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-gold">Legal Practice Specialties</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">Disciplines of Distinction</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {practiceAreas.map((p, i) => (
            <Link
              key={i}
              href={`/practice-areas/${p.slug}`}
              className="glass-panel p-8 rounded-2xl hover:border-gold/60 transition-all group block space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-burgundy/30 border border-burgundy flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-white group-hover:text-gold transition-colors">{p.title}</h3>
              <p className="text-neutral-400 text-xs leading-relaxed">{p.desc}</p>
              <div className="flex items-center gap-1.5 text-xs text-gold font-medium pt-2">
                <span>View Practice Brief</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CONSULTATION INTAKE */}
      <section id="consultation" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-gold/40 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Attorney-Client Privilege Intake</span>
            </div>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-white">Retain Legal Counsel</h2>
            <p className="text-neutral-400 text-xs max-w-lg mx-auto">
              Submit your inquiry. All communications through this portal are treated with the highest degree of confidential privilege.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>
    </div>
  );
}
