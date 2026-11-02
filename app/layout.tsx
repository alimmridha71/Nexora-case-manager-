import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CONFIG } from '@/lib/config';
import { brandCssVars } from '@/lib/brand';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Branding and HOME_MODE come from environment variables that may differ between build and runtime
// (Docker, Vercel previews), so pages render per request instead of being frozen at build time.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `${CONFIG.firm.name} | ${CONFIG.firm.tagline}`,
  description: 'Premier legal counsel in Corporate Litigation, Cross-Border M&A, Intellectual Property, and Trial Defense.',
  metadataBase: new URL(CONFIG.firm.siteUrl),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} scroll-smooth`}
      style={brandCssVars(CONFIG.firm.primaryColor, CONFIG.firm.accentColor) as React.CSSProperties}
    >
      <body className="bg-neutral-950 text-neutral-100 min-h-screen flex flex-col font-sans antialiased">
        <Navbar shortName={CONFIG.firm.shortName} subtitle={CONFIG.firm.subtitle} productMode={CONFIG.site.homeMode === 'product'} />
        <main className="flex-1 pt-20">
          {children}
        </main>
        <Footer />

        {/* Vibe96 Live Demo Verification Engine */}
        <script src="https://vibe96.com/js/v96-demo.js" defer></script>
      </body>
    </html>
  );
}
