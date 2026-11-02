import Link from 'next/link';
import {
  FolderLock,
  ListChecks,
  FileUp,
  BellRing,
  Palette,
  ShieldCheck,
  KeyRound,
  Database,
  ArrowRight,
  Users,
} from 'lucide-react';
import { CONFIG } from '@/lib/config';

const FEATURES = [
  { icon: FolderLock, title: 'Client portal', text: 'Clients sign in with their own account and see only the cases you share with them. Every page checks an explicit access list.' },
  { icon: ListChecks, title: 'Case timeline', text: 'Record filings, hearings, orders and notes. Choose per entry whether the client can see it.' },
  { icon: FileUp, title: 'Secure documents', text: 'Upload PDFs, images and Word files to a private bucket. Clients download shared files through 60-second signed links.' },
  { icon: BellRing, title: 'Status notifications', text: 'Clients are notified when a status changes or you post an update, in the portal and optionally by email.' },
  { icon: Palette, title: 'White-label branding', text: 'Firm name, tagline and colors come from environment variables, so each buyer runs it under their own brand.' },
  { icon: Users, title: 'Staff console', text: 'Case register, client accounts with one-time temporary passwords, password resets and per-case access control.' },
];

const STEPS = [
  { n: '1', title: 'Create the client', text: 'Add a client account; a temporary password is shown once.' },
  { n: '2', title: 'Share the case', text: 'Grant access, add timeline entries and upload documents.' },
  { n: '3', title: 'Client follows along', text: 'The client signs in, reads updates and downloads files.' },
];

const STACK = ['Next.js 16 (App Router)', 'React 19', 'TypeScript (strict)', 'Supabase (PostgreSQL + Storage)', 'Tailwind CSS', 'Docker / Vercel'];

export default function ProductHome() {
  return (
    <div className="pt-20">
      <section className="relative overflow-hidden bg-gradient-to-b from-burgundy-dark/40 via-neutral-950 to-neutral-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
          <span className="inline-block text-[11px] uppercase tracking-widest font-bold text-gold border border-gold/40 rounded-full px-4 py-1">
            Software for law firms
          </span>
          <h1 className="font-serif font-bold text-4xl sm:text-5xl text-white leading-tight">
            Case management and a secure client portal, <span className="text-gold">ready to deploy</span>
          </h1>
          <p className="text-neutral-300 max-w-2xl mx-auto text-base leading-relaxed">
            {CONFIG.firm.name} Case Manager lets your staff run cases, timelines and documents, while clients sign in to follow their own matters and get notified when something changes.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/#demo" className="px-6 py-3 rounded-xl bg-gradient-to-r from-burgundy to-burgundy-light hover:brightness-110 text-white font-bold text-sm border border-gold/40 flex items-center gap-2">
              Try the live demo <ArrowRight className="w-4 h-4 text-gold" />
            </Link>
            <Link href="/#features" className="px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold text-sm border border-neutral-800">
              See the features
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-serif font-bold text-3xl text-white text-center mb-3">Everything a firm and its clients need</h2>
        <p className="text-neutral-400 text-center text-sm mb-12">Six working modules, all included in the source code.</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="glass-panel rounded-2xl border border-neutral-800 p-6 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-burgundy/40 border border-gold/40 flex items-center justify-center text-gold"><Icon className="w-5 h-5" /></div>
              <h3 className="font-serif font-bold text-lg text-white">{title}</h3>
              <p className="text-neutral-400 text-xs leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-neutral-900/40 border-y border-neutral-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="font-serif font-bold text-3xl text-white text-center mb-12">How it works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-burgundy to-burgundy-light border border-gold/50 text-gold font-bold flex items-center justify-center">{s.n}</div>
                <h3 className="font-serif font-bold text-white">{s.title}</h3>
                <p className="text-neutral-400 text-xs leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid gap-8 md:grid-cols-2">
        <div className="glass-panel rounded-2xl border border-neutral-800 p-8 space-y-4">
          <h2 className="font-serif font-bold text-2xl text-white flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-gold" /> Built with security in mind</h2>
          <ul className="space-y-2 text-xs text-neutral-300 list-disc pl-5 leading-relaxed">
            <li>Separate admin and client sessions; a client token can never pass an admin guard.</li>
            <li>Salted scrypt password hashes, login throttling and fail-closed session revocation.</li>
            <li>Row-level security on every table; private data is reached only through server code.</li>
            <li>Private file storage with short-lived signed download links.</li>
            <li>Unit-tested auth logic and a clean dependency audit.</li>
          </ul>
        </div>
        <div className="glass-panel rounded-2xl border border-neutral-800 p-8 space-y-4">
          <h2 className="font-serif font-bold text-2xl text-white flex items-center gap-2"><Database className="w-6 h-6 text-gold" /> What you get</h2>
          <ul className="space-y-2 text-xs text-neutral-300 list-disc pl-5 leading-relaxed">
            <li>Complete TypeScript source, database schema, migrations and seed data.</li>
            <li>Setup guide, architecture guide, API and data-model docs, changelog.</li>
            <li>Docker and Vercel deployment files, CI workflow, automated tests.</li>
          </ul>
          <div className="flex flex-wrap gap-2 pt-1">
            {STACK.map((t) => <span key={t} className="text-[10px] px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">{t}</span>)}
          </div>
        </div>
      </section>

      <section id="demo" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="glass-panel rounded-3xl border border-gold/40 p-8 sm:p-10 text-center space-y-6">
          <h2 className="font-serif font-bold text-3xl text-white">Try the live demo</h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto">Explore both sides of the product with sample data. Demo credentials are listed in the product datasheet.</p>
          <div className="grid gap-4 sm:grid-cols-2 text-left">
            <Link href="/admin/login" className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-gold/60 transition-colors space-y-2">
              <KeyRound className="w-5 h-5 text-gold" />
              <span className="font-serif font-bold text-white block">Staff console</span>
              <span className="text-xs text-neutral-400 block">Cases, timelines, documents, client accounts.</span>
            </Link>
            <Link href="/client/login" className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-gold/60 transition-colors space-y-2">
              <FolderLock className="w-5 h-5 text-gold" />
              <span className="font-serif font-bold text-white block">Client portal</span>
              <span className="text-xs text-neutral-400 block">What your clients see: their cases, updates and files.</span>
            </Link>
          </div>
          <p className="text-[11px] text-neutral-500">Public status lookup: <Link href="/cases" className="text-gold hover:underline">case number + registered mobile</Link>.</p>
        </div>
      </section>
    </div>
  );
}
