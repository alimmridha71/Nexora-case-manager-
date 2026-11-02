'use server';

import { getClientSupabase } from '@/lib/supabase';
import { z } from 'zod';

export interface IntakeResult {
  success: boolean;
  message: string;
  inquiryId?: string;
}

const IntakeActionSchema = z.object({
  name: z.string().trim().min(2, 'Name must have at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Invalid email address').max(120).optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  service: z.string().trim().max(100).default('General Legal Inquiry'),
  message: z.string().trim().max(2000, 'Message cannot exceed 2000 characters').optional().or(z.literal('')),
  website_url: z.string().optional(), // Honeypot field - must be empty
}).refine((data) => Boolean(data.email || data.phone), {
  message: 'Please provide either a phone number or email address for our counsel to respond.',
  path: ['email'],
});

// In-memory rate limiting map for server action
const actionRateLimit = new Map<string, { count: number; resetTime: number }>();
const MAX_SUBMISSIONS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Server Action: Public Legal Consultation Intake
 * Uses public anon client that respects the 'contacts' table anon INSERT-only RLS policy.
 * Protected by honeypot anti-bot check, rate limiting, and Zod input validation.
 */
export async function submitConsultationIntake(formData: FormData): Promise<IntakeResult> {
  const rawData = {
    name: formData.get('name')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    phone: formData.get('phone')?.toString() || '',
    service: formData.get('service')?.toString() || 'General Legal Inquiry',
    message: formData.get('message')?.toString() || '',
    website_url: formData.get('website_url')?.toString() || '',
  };

  // Bot mitigation: Honeypot check
  if (rawData.website_url && rawData.website_url.trim().length > 0) {
    // Silently reject spam submissions
    return {
      success: true,
      message: 'Your consultation brief has been securely transmitted. A partner will contact you shortly.',
    };
  }

  const validation = IntakeActionSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || 'Please check your submitted intake form fields.',
    };
  }

  const { name, email, phone, service, message } = validation.data;
  const identifier = email || phone || 'anonymous';
  const now = Date.now();
  const rate = actionRateLimit.get(identifier);

  if (rate && now < rate.resetTime) {
    if (rate.count >= MAX_SUBMISSIONS) {
      return {
        success: false,
        message: 'Submission limit reached. Please call our chambers directly or retry in 10 minutes.',
      };
    }
    rate.count += 1;
  } else {
    actionRateLimit.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
  }

  const recordId = 'cnt_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

  // Uses public anon client enforcing contacts anon INSERT-only RLS policy
  const supabase = getClientSupabase();

  try {
    const { error } = await supabase.from('contacts').insert([
      {
        id: recordId,
        name,
        email: email || null,
        phone: phone || null,
        service: service || 'General Legal Inquiry',
        message: message || null,
        status: 'New',
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Supabase intake insert failed:', error.message);
      return {
        success: false,
        message: 'We could not record your inquiry right now. Please call our chambers directly.',
      };
    }

    return {
      success: true,
      message: `Thank you, ${name}. Your consultation brief has been securely transmitted. A partner will contact you shortly.`,
      inquiryId: recordId,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Transmission encountered an error. Please contact our chambers directly.',
    };
  }
}
