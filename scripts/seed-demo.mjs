#!/usr/bin/env node
// Prepares the demo client so a reviewer or buyer can sign in at /client.
// Run AFTER database/schema.sql + database/seed.sql (or migrations 001-003 + the seed).
//
//   NEXT_PUBLIC_SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...  \
//   DEMO_CLIENT_PASSWORD='a long password'  npm run seed-demo
//
// Optional: DEMO_CLIENT_EMAIL (default demo.client@example.com). The password is never stored in
// readable form and never written to the repository; put it in your datasheet instead.
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.DEMO_CLIENT_EMAIL || 'demo.client@example.com').toLowerCase();
const password = process.env.DEMO_CLIENT_PASSWORD;

if (!url || !key || !password || password.length < 10) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and DEMO_CLIENT_PASSWORD (10+ characters).');
  process.exit(1);
}

const salt = crypto.randomBytes(16);
const hash = `scrypt:${salt.toString('base64')}:${crypto.scryptSync(password, salt, 64).toString('base64')}`;
const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: demoCase } = await supabase.from('cases').select('case_id').eq('case_no', 'NEX-2026-001').maybeSingle();
if (!demoCase) {
  console.error('Demo case NEX-2026-001 not found. Run database/seed.sql first.');
  process.exit(1);
}

let { data: client } = await supabase.from('client_accounts').select('client_id').ilike('email', email).maybeSingle();
if (client) {
  await supabase.from('client_accounts').update({ password_hash: hash, is_active: true }).eq('client_id', client.client_id);
} else {
  const { data, error } = await supabase
    .from('client_accounts')
    .insert([{ email, full_name: 'Demo Client', mobile: '+1-800-555-0100', password_hash: hash }])
    .select('client_id')
    .single();
  if (error) {
    console.error('Could not create the demo client:', error.message);
    process.exit(1);
  }
  client = data;
}

await supabase.from('client_case_access').upsert([{ client_id: client.client_id, case_id: demoCase.case_id }], { onConflict: 'client_id,case_id' });
console.log(`Demo client ready: ${email}  (sign in at /client with the password you set; add it to your datasheet)`);
