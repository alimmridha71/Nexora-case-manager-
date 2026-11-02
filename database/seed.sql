-- ==============================================================================
-- NEXORA LAW FIRM — COMPLETE SEED DATA & DEMO ACCOUNTS
-- Run this file AFTER database/schema.sql
-- Sets up complete initial database with users, courts, cases, hearings, and vault
-- ==============================================================================

-- ==============================================================================
-- 1. DEMO ACCOUNTS & INITIAL USERS
-- ==============================================================================
-- Admin Initial Account (Configured via ADMIN_DEFAULT_PASSWORD in production)
INSERT INTO public.users (user_id, name, address, phone, password, email, role, is_active)
VALUES (
    1,
    'Managing Partner (Admin)',
    'Nexora Law Firm Chambers, Suite 500, New York, NY 10001',
    '+1-800-555-0199',
    '!login-disabled',
    'admin@example.com',
    'admin',
    true
) ON CONFLICT (user_id) DO NOTHING;

-- Secondary Assigned Partner Account
INSERT INTO public.users (user_id, name, address, phone, password, email, role, is_active)
VALUES (
    2,
    'Firm Counsel (Senior Associate)',
    'Nexora Chambers, Level 4, Financial District',
    '+1-800-555-0198',
    '!login-disabled',
    'counsel@example.com',
    'admin',
    true
) ON CONFLICT (user_id) DO NOTHING;

-- Client Account
INSERT INTO public.users (user_id, name, address, phone, password, email, role, is_active)
VALUES (
    3,
    'Hon. Rafael Del Rosario',
    'Del Rosario Corporate Holdings, 120 Broadway',
    '+1-800-555-0120',
    '!login-disabled',
    'client@nexoralaw.com',
    'client',
    true
) ON CONFLICT (user_id) DO NOTHING;

-- ==============================================================================
-- 2. PRACTICE AREAS (Required by Audit R4 & R10)
-- ==============================================================================
INSERT INTO public.practice_areas (id, slug, title, subtitle, description, icon, content, status, user_id)
VALUES
    (1, 'corporate-litigation', 'Corporate & Commercial Litigation', 'Cross-Border M&A and Shareholder Disputes', 'Comprehensive advocacy for complex commercial disputes, contract enforcement, and multi-jurisdictional arbitrations.', 'briefcase', 'Full commercial representation before appellate and federal circuits.', 'active', 1),
    (2, 'criminal-defense', 'White Collar & Criminal Defense', 'High-Stakes Regulatory & Federal Defense', 'Discreet, aggressive counsel in corporate compliance investigations, securities enforcement, and criminal trials.', 'shield-alert', 'Proven defense strategies defending corporate executives and high-profile individuals.', 'active', 1),
    (3, 'intellectual-property', 'Intellectual Property & Patents', 'Trade Secret Preservation and Technology Licensing', 'Guarding intellectual property portfolios, patent infringement suits, and proprietary software rights globally.', 'cpu', 'Strategic IP litigation across domestic and international arbitration courts.', 'active', 1),
    (4, 'real-estate-land', 'Real Estate & Land Acquisition', 'Commercial Property & Zoning Development', 'Advisory for multi-million dollar acquisitions, land zoning permits, commercial leases, and title litigation.', 'building-2', 'Institutional advisory on major commercial real estate development.', 'active', 1)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 3. ATTORNEYS & ROSTER (Required by Audit R4 & R10)
-- ==============================================================================
INSERT INTO public.attorneys (id, user_id, slug, name, title, specialization, bio, email, phone, image_url, status)
VALUES
    (1, 1, 'eleanor-vance', 'Eleanor Vance, Esq.', 'Senior Managing Partner', 'Corporate & Cross-Border M&A', 'Former federal prosecutor with over 22 years of high-stakes corporate litigation advocacy.', 'e.vance@nexoralaw.com', '+1-800-555-0199', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800', 'active'),
    (2, 2, 'marcus-sterling', 'Marcus Sterling, J.D.', 'Partner & Head of Trial Practice', 'White Collar & Criminal Defense', 'Renowned courtroom trial lawyer specializing in federal investigations and constitutional defense.', 'm.sterling@nexoralaw.com', '+1-800-555-0198', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800', 'active'),
    (3, 1, 'sophia-chen', 'Sophia Chen, LL.M.', 'Partner — Intellectual Property', 'Patent Litigation & Tech Law', 'Advises Fortune 500 tech firms on cross-border licensing and algorithmic trade secret litigation.', 's.chen@nexoralaw.com', '+1-800-555-0197', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800', 'active')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 4. SITE CONTENT & BRIEFINGS (Required by Audit R4)
-- ==============================================================================
INSERT INTO public.site_content (id, slug, section_key, title, content, status, user_id)
VALUES
    (1, 'homepage-hero', 'hero', 'Defending Your Rights With Skill & Integrity', 'Nexora Law Firm delivers elite corporate advocacy, trial litigation, and bespoke legal consultation for visionary enterprises.', 'published', 1),
    (2, 'disclaimer-policy', 'legal', 'Attorney-Client Relationship Disclaimer', 'Transmission of information through this website does not constitute an attorney-client relationship without formal retainer execution.', 'published', 1)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 5. DEFAULT COURTS & TRIBUNALS
-- ==============================================================================
INSERT INTO public.court (court_id, court_name, jurisdiction, user_id)
VALUES
    (1, 'Supreme Court (Appellate Division)',  'Federal', 1),
    (2, 'Supreme Court (High Court Division)', 'Federal', 1),
    (3, 'District & Sessions Judge Court',     'District', 1),
    (4, 'Commercial & Arbitration Tribunal',   'State', 1),
    (5, 'Metropolitan Magistrate Court',       'City', 1),
    (6, 'Chancery & Equity Court',             'State', 1),
    (7, 'Labour & Employment Relations Court', 'State', 1),
    (8, 'Bankruptcy & Insolvency Court',       'Federal', 1)
ON CONFLICT (court_id) DO NOTHING;

-- ==============================================================================
-- 6. CASE CLASSIFICATIONS (PRACTICE AREAS)
-- ==============================================================================
INSERT INTO public.case_type (case_type_id, case_type, description, user_id)
VALUES
    (1,  'Corporate & Commercial Litigation', 'Mergers, acquisitions, contract breaches, and shareholder disputes', 1),
    (2,  'Criminal Defense & White Collar',   'White collar financial crimes, regulatory investigations, and defense', 1),
    (3,  'Family & High-Net-Worth Matrimonial', 'Custody, marital agreements, estate division', 1),
    (4,  'Real Estate & Land Acquisition',   'Commercial real estate leasing, land disputes, zoning permits', 1),
    (5,  'Constitutional & Appellate',        'Constitutional writ petitions, judicial review, appellate advocacy', 1),
    (6,  'Labour & Executive Employment',     'Executive compensation, non-competes, workplace arbitration', 1),
    (7,  'Intellectual Property & Patents',   'Patent infringement, trademark protection, trade secrets', 1),
    (8,  'Banking & Financial Securities',    'Banking debt recovery, SEC enforcement, sovereign lending', 1)
ON CONFLICT (case_type_id) DO NOTHING;

-- ==============================================================================
-- 4. LEGAL ASSISTANTS & PARALEGALS
-- ==============================================================================
INSERT INTO public.assistant (assistant_id, assistant_name, email, phone, user_id)
VALUES
    (1, 'Marcus Vance, Esq. (Senior Associate)', 'm.vance@nexoralaw.com', '+1-800-555-0141', 1),
    (2, 'Elena Rostova (Senior Paralegal)',       'e.rostova@nexoralaw.com', '+1-800-555-0142', 1),
    (3, 'David Chen (Litigation Clerk)',         'd.chen@nexoralaw.com', '+1-800-555-0143', 1)
ON CONFLICT (assistant_id) DO NOTHING;

-- ==============================================================================
-- 5. SAMPLE ACTIVE CASES (LITIGATION DOCKET)
-- ==============================================================================
INSERT INTO public.cases (case_id, court_id, case_no, under_section, filing_date, plaintiff_name, defendants_name, assistant_id, client_mobile, user_id, note, on_behalf, case_type_id, case_no_note, status)
VALUES
    (1, 4, 'NX-2025-001', 'Sec. 12(a) Commercial Arbitration Act', '2025-02-15', 'Del Rosario Energy Holdings', 'Apex Sovereign Infrastructure Ltd.', 1, '+1-800-555-0120', 1, 'Injunction application regarding breach of exclusive distribution contract.', 'Plaintiff', 1, 'Cross-border ICC Hearing scheduled', 'active'),
    (2, 7, 'NX-2025-002', 'Labor Code Title III, Section 282', '2025-03-01', 'Kavita Patel (VP Operations)', 'Zenith Global Logistics Corp.', 2, '+1-800-555-0122', 1, 'Constructive dismissal and executive severance arbitration proceedings.', 'Plaintiff', 6, 'Pre-trial settlement conference', 'active'),
    (3, 1, 'NX-2025-003', 'Constitutional Article III, Due Process', '2025-01-20', 'Pacific Maritime Syndicate', 'Port Regulatory Commission', 3, '+1-800-555-0125', 1, 'Writ of Prohibition against unilateral tariff imposition.', 'Plaintiff', 5, 'En banc oral arguments completed', 'active')
ON CONFLICT (case_id) DO NOTHING;

-- ==============================================================================
-- 6. SAMPLE CASE HEARINGS & COURT PROCEEDINGS (case_detail)
-- ==============================================================================
INSERT INTO public.case_detail (case_detail_id, case_id, next_date, order_detail, presiding_judge, hearing_summary)
VALUES
    (1, 1, CURRENT_DATE + INTERVAL '14 days', 'Interim status quo order maintained; respondents directed to produce audited ledger books.', 'Hon. Justice M. Sterling', 'Counsel for plaintiff submitted reply on amended counter-claim.'),
    (2, 2, CURRENT_DATE + INTERVAL '21 days', 'Parties referred to mandatory mediation forum for amicable dispute settlement.', 'Hon. Commissioner L. Santos', 'Both parties agreed on mediator panel candidate.'),
    (3, 3, CURRENT_DATE + INTERVAL '30 days', 'Reserved for promulgation of judgment by en banc bench.', 'Chief Justice A. Thorne', 'Final written submissions filed by Solicitor General and Petitioners.')
ON CONFLICT (case_detail_id) DO NOTHING;

-- ==============================================================================
-- 7. SAMPLE CLIENT VAULT DOCUMENTS (case_documents)
-- ==============================================================================
INSERT INTO public.case_documents (document_id, case_id, title, category, file_name, file_size, file_url, uploaded_by)
VALUES
    (1, 1, 'Verified Complaint & Petition for Injunction', 'Pleading', 'DelRosario_Verified_Complaint_2025.pdf', '2.4 MB', 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/sample-pleading.pdf', 1),
    (2, 1, 'Master Energy Distribution Agreement Exhibit A', 'Contract', 'Master_Energy_Exhibit_A.pdf', '4.8 MB', 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/sample-contract.pdf', 1),
    (3, 2, 'Executive Employment & Stock Option Agreement', 'Contract', 'KPatel_Executive_Agreement.pdf', '1.7 MB', 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/sample-agreement.pdf', 1),
    (4, 3, 'Amicus Curiae Brief on Regulatory Jurisdiction', 'Pleading', 'Amicus_Curiae_Brief_Maritime.pdf', '3.1 MB', 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/sample-brief.pdf', 1)
ON CONFLICT (document_id) DO NOTHING;

-- ==============================================================================
-- 8. SAMPLE WEBSITE CONSULTATION INQUIRIES (contacts)
-- ==============================================================================
INSERT INTO public.contacts (id, name, email, phone, service, message, status)
VALUES
    ('cnt-001', 'Alexander Wright', 'a.wright@wrightventures.com', '+1-800-555-0301', 'Corporate & Commercial Litigation', 'Seeking legal representation for Series B equity restructuring and founder voting rights.', 'New'),
    ('cnt-002', 'Dr. Beatrice Campbell', 'b.campbell@biocaremed.org', '+1-800-555-0302', 'Intellectual Property & Patents', 'Urgent consultation requested regarding international patent filing for biotech device.', 'Contacted')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 9. SAMPLE SUBSCRIPTION PLAN (Admin Enterprise Retainer)
-- ==============================================================================
INSERT INTO public.subscriptions (user_id, subscription_plan, start_date, end_date, status, amount)
VALUES (
    1,
    'Enterprise Retainer Suite',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    'active',
    0.00
) ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 10. RESET ALL SEQUENCE COUNTERS
-- ==============================================================================
SELECT setval(pg_get_serial_sequence('public.users',         'user_id'),        COALESCE(MAX(user_id),        1)) FROM public.users;
SELECT setval(pg_get_serial_sequence('public.court',         'court_id'),       COALESCE(MAX(court_id),       1)) FROM public.court;
SELECT setval(pg_get_serial_sequence('public.case_type',     'case_type_id'),   COALESCE(MAX(case_type_id),   1)) FROM public.case_type;
SELECT setval(pg_get_serial_sequence('public.assistant',     'assistant_id'),   COALESCE(MAX(assistant_id),   1)) FROM public.assistant;
SELECT setval(pg_get_serial_sequence('public.practice_areas','id'),            COALESCE(MAX(id),            1)) FROM public.practice_areas;
SELECT setval(pg_get_serial_sequence('public.attorneys',     'id'),            COALESCE(MAX(id),            1)) FROM public.attorneys;
SELECT setval(pg_get_serial_sequence('public.site_content',  'id'),            COALESCE(MAX(id),            1)) FROM public.site_content;
SELECT setval(pg_get_serial_sequence('public.cases',         'case_id'),        COALESCE(MAX(case_id),        1)) FROM public.cases;
SELECT setval(pg_get_serial_sequence('public.case_detail',   'case_detail_id'), COALESCE(MAX(case_detail_id), 1)) FROM public.case_detail;
SELECT setval(pg_get_serial_sequence('public.case_documents','document_id'),    COALESCE(MAX(document_id),    1)) FROM public.case_documents;
SELECT setval(pg_get_serial_sequence('public.subscriptions', 'subscription_id'),COALESCE(MAX(subscription_id), 1)) FROM public.subscriptions;

-- ==============================================================================
-- 11. DEMO CLIENT & CASE REFERENCE (Datasheet / Audit Verification)
-- ==============================================================================
-- Demo case used by the datasheet (client verifies with case number + mobile number)
INSERT INTO public.cases (court_id, case_no, under_section, filing_date, plaintiff_name, defendants_name, assistant_id, client_mobile, user_id, note, on_behalf, case_type_id, case_no_note, status)
SELECT 1, 'NEX-2026-001', 'Corporate Acquisition Filing', CURRENT_DATE, 'Demo Client', 'Demo Respondent Ltd.', 1, '+1-800-555-0100', 1, 'Demo record for datasheet verification', 'Plaintiff', 1, 'Corporate legal review', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.cases WHERE case_no = 'NEX-2026-001');

-- ------------------------------------------------------------------------------
-- Demo timeline, client account, case access and notification for NEX-2026-001
-- (the demo client cannot sign in until `npm run seed-demo` sets a password)
-- ------------------------------------------------------------------------------
INSERT INTO public.case_events (case_id, event_type, title, description, event_date, client_visible)
SELECT c.case_id, v.event_type, v.title, v.description, v.event_date, v.client_visible
FROM public.cases c
CROSS JOIN (VALUES
    ('filing',   'Case filed',                  'Corporate acquisition filing submitted to the tribunal.',      CURRENT_DATE - 21, TRUE),
    ('hearing',  'First hearing held',          'Preliminary hearing completed; directions issued to parties.', CURRENT_DATE - 10, TRUE),
    ('document', 'Disclosure bundle received',  'Respondent disclosure bundle reviewed by counsel.',            CURRENT_DATE - 5,  TRUE),
    ('note',     'Internal strategy note',      'Settlement range discussed with partners (internal only).',    CURRENT_DATE - 4,  FALSE),
    ('hearing',  'Next hearing scheduled',      'Substantive hearing listed in two weeks.',                     CURRENT_DATE + 14, TRUE)
) AS v(event_type, title, description, event_date, client_visible)
WHERE c.case_no = 'NEX-2026-001'
  AND NOT EXISTS (SELECT 1 FROM public.case_events e WHERE e.case_id = c.case_id);

INSERT INTO public.client_accounts (email, full_name, mobile, password_hash, is_active)
SELECT 'demo.client@example.com', 'Demo Client', '+1-800-555-0100', '!login-disabled', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.client_accounts WHERE lower(email) = 'demo.client@example.com');

INSERT INTO public.client_case_access (client_id, case_id)
SELECT a.client_id, c.case_id
FROM public.client_accounts a, public.cases c
WHERE lower(a.email) = 'demo.client@example.com' AND c.case_no = 'NEX-2026-001'
ON CONFLICT DO NOTHING;

INSERT INTO public.notifications (client_id, case_id, subject, body, email_status)
SELECT a.client_id, c.case_id, 'Next hearing scheduled', 'The substantive hearing for case NEX-2026-001 has been listed.', 'not_configured'
FROM public.client_accounts a, public.cases c
WHERE lower(a.email) = 'demo.client@example.com' AND c.case_no = 'NEX-2026-001'
  AND NOT EXISTS (SELECT 1 FROM public.notifications n WHERE n.client_id = a.client_id);
