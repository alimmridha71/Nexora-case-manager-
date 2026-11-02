import { NextResponse } from 'next/server';
import { getClientSupabase } from '@/lib/supabase';
import { z } from 'zod';

// Zod validation schema for public consultation intake
const IntakeSchema = z.object({
  name: z.string().trim().min(2, 'Name must have at least 2 characters').max(100, 'Name max 100 characters'),
  email: z.string().trim().email('Invalid email format').max(120).optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  service: z.string().trim().max(100).default('General Legal Consultation'),
  message: z.string().trim().max(2000, 'Message max 2000 characters').optional().or(z.literal('')),
  website_url: z.string().optional(), // Anti-bot honeypot field
}).refine((data) => Boolean(data.email || data.phone), {
  message: 'Either email address or telephone number is required.',
  path: ['email'],
});

// In-memory rate limiter: max 10 submissions per 5 minutes per IP
const intakeRateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 5 * 60 * 1000;

export async function POST(request: Request) {
  try {
    // Rate limit check
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
    const now = Date.now();
    const rateRecord = intakeRateLimit.get(clientIp);

    if (rateRecord && now < rateRecord.resetTime) {
      if (rateRecord.count >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: 'Too many intake requests. Please wait a few minutes before submitting again.' },
          { status: 429 }
        );
      }
      rateRecord.count += 1;
    } else {
      intakeRateLimit.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    const rawBody = await request.json();

    // Bot mitigation: Honeypot check
    if (rawBody.website_url && String(rawBody.website_url).trim().length > 0) {
      return NextResponse.json(
        {
          success: true,
          inquiryId: 'cnt_filtered',
          message: 'Your consultation inquiry has been submitted to firm counsel.',
        },
        { status: 200 }
      );
    }

    const normalizedBody = {
      ...rawBody,
      name: rawBody.name || rawBody.client_name,
      service: rawBody.service || rawBody.case_type || 'General Legal Consultation',
    };

    const parseResult = IntakeSchema.safeParse(normalizedBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid intake submission.' },
        { status: 400 }
      );
    }

    const { name, email, phone, service, message } = parseResult.data;
    const recordId = 'cnt_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    // Uses public anon client to adhere to contacts anon INSERT-only RLS policy
    const supabase = getClientSupabase();
    const { error } = await supabase.from('contacts').insert([
      {
        id: recordId,
        name,
        email: email || null,
        phone: phone || null,
        service: service || 'General Legal Consultation',
        message: message || null,
        status: 'New',
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Intake insert failed:', error.message);
      return NextResponse.json({ error: 'Unable to record your inquiry right now. Please call our chambers directly.' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        inquiryId: recordId,
        message: 'Your consultation inquiry has been submitted to firm counsel.',
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Intake route error:', err?.message);
    return NextResponse.json({ error: 'Server error processing intake' }, { status: 500 });
  }
}
