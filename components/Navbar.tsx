'use client';

import Link from 'next/link';
import { Scale, ShieldCheck, FolderLock } from 'lucide-react';

export default function Navbar({ shortName, subtitle, productMode }: { shortName: string; subtitle: string; productMode: boolean }) {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass-panel border-b border-gold/20 bg-neutral-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-burgundy to-neutral-900 border border-gold/40 flex items-center justify-center text-gold shadow-md group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg tracking-wider text-white group-hover:text-gold transition-colors">
              {shortName}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-gold font-sans font-semibold">
              {subtitle}
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-wider text-neutral-300">
          {productMode ? (
            <>
              <Link href="/#features" className="hover:text-gold transition-colors">Features</Link>
              <Link href="/#how-it-works" className="hover:text-gold transition-colors">How it works</Link>
              <Link href="/#demo" className="hover:text-gold transition-colors">Live demo</Link>
            </>
          ) : (
            <>
              <Link href="/practice-areas" className="hover:text-gold transition-colors">Practice Areas</Link>
              <Link href="/attorneys" className="hover:text-gold transition-colors">Attorneys</Link>
            </>
          )}
          <Link href="/client" className="hover:text-gold transition-colors flex items-center gap-1.5">
            <FolderLock className="w-3.5 h-3.5 text-gold" />
            Client Portal
          </Link>
          {!productMode && <Link href="/cases" className="hover:text-gold transition-colors">Case Status</Link>}
          <Link href="/admin" className="hover:text-gold transition-colors flex items-center gap-1.5 text-amber-300/80">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Suite
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={productMode ? '/#demo' : '/#consultation'}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-burgundy to-burgundy-light hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
          >
            {productMode ? 'Try the Demo' : 'Request Counsel'}
          </Link>
        </div>
      </div>
    </nav>
  );
}
