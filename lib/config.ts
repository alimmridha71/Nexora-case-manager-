// ==============================================================================
// Nexora Law Firm — Typed Server & Client Environment Configuration Module
// Central single source of truth for runtime environment variables
// ==============================================================================

export const CONFIG = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  admin: {
    // Session & brute-force settings (single source of truth, no magic numbers elsewhere)
    cookieName: 'nexora_admin_token',
    sessionTtlSeconds: 60 * 60 * 8, // 8 hours
    maxLoginAttempts: 5,
    loginLockoutMs: 15 * 60 * 1000, // 15 minutes
    get email(): string {
      const email = process.env.ADMIN_EMAIL;
      if (!email) {
        throw new Error('ADMIN_EMAIL is required in environment variables');
      }
      return email;
    },
    // Preferred: scrypt hash produced by `npm run hash-password`
    get passwordHash(): string {
      return process.env.ADMIN_PASSWORD_HASH || '';
    },
    // Fallback only when no hash is configured (plaintext env password)
    get defaultPassword(): string {
      if (process.env.NODE_ENV === 'production') {
        const hash = process.env.ADMIN_PASSWORD_HASH;
        if (!hash) {
          throw new Error('ADMIN_PASSWORD_HASH is mandatory in production mode.');
        }
      }
      const pwd = process.env.ADMIN_DEFAULT_PASSWORD;
      if (!pwd || pwd === 'your-secure-admin-password-here') {
        throw new Error('Set ADMIN_PASSWORD_HASH (recommended) or a valid non-placeholder ADMIN_DEFAULT_PASSWORD in environment variables');
      }
      return pwd;
    },
    get sessionSecret(): string {
      const secret = process.env.SESSION_SECRET;
      if (!secret || secret.length < 32) {
        throw new Error('SESSION_SECRET must be at least 32 characters in environment variables');
      }
      return secret;
    },
  },
  site: {
    // 'product' = marketplace landing page for the software (default); 'firm' = the firm's own public home page
    homeMode: (process.env.HOME_MODE === 'firm' ? 'firm' : 'product') as 'firm' | 'product',
  },
  client: {
    cookieName: 'nexora_client_token',
    sessionTtlSeconds: 60 * 60 * 24, // 24 hours
    minPasswordLength: 10,
  },
  notify: {
    // Optional email delivery through Resend (https://resend.com). Without these, notifications
    // are still stored and shown in the client portal (email_status = 'not_configured').
    get resendApiKey(): string {
      return process.env.RESEND_API_KEY || '';
    },
    get fromEmail(): string {
      return process.env.NOTIFY_FROM_EMAIL || '';
    },
  },
  // Firm Branding & Contact Details
  firm: {
    name: process.env.FIRM_NAME || 'Nexora Law Firm',
    tagline: process.env.FIRM_TAGLINE || 'Advocates & Legal Consultants',
    shortName: process.env.FIRM_SHORT_NAME || 'NEXORA',
    subtitle: process.env.FIRM_SUBTITLE || 'Law Firm Chambers',
    primaryColor: process.env.BRAND_PRIMARY_COLOR || '#6b1d2f',
    accentColor: process.env.BRAND_ACCENT_COLOR || '#c5a059',
    legalName: process.env.FIRM_LEGAL_NAME || 'Nexora Legal Advocacy & Advisory Chambers LLC',
    phone: process.env.FIRM_PHONE || '+1-800-555-0199',
    email: process.env.FIRM_EMAIL || 'contact@nexoralaw.com',
    address: process.env.FIRM_OFFICE_ADDRESS || '742 Evergreen Terrace, Suite 500, New York, NY 10001',
    officeHours: process.env.FIRM_OFFICE_HOURS || 'Monday – Friday, 8:30 AM – 6:30 PM EST',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://nexoralaw.vercel.app',
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'case-documents',
  },
};

export type AppConfig = typeof CONFIG;
