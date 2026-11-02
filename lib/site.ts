// ==============================================================================
// Nexora Law Firm — Global Firm Configuration & Site Metadata
// Sourced directly from typed environment configuration module (lib/config.ts)
// ==============================================================================

import { CONFIG } from './config';

export const FIRM_CONFIG = {
  name: CONFIG.firm.name,
  tagline: CONFIG.firm.tagline,
  legalName: CONFIG.firm.legalName,
  phone: CONFIG.firm.phone,
  email: CONFIG.firm.email,
  address: CONFIG.firm.address,
  officeHours: CONFIG.firm.officeHours,
  canonicalUrl: CONFIG.firm.siteUrl,
  social: {
    linkedin: 'https://linkedin.com/company/nexora-law',
    twitter: 'https://twitter.com/nexoralaw',
  },
  disclaimer:
    'The legal information presented on this site is for general informational purposes only and does not establish an attorney-client relationship. Prior case results do not guarantee similar outcomes.',
};

export type FirmConfig = typeof FIRM_CONFIG;
