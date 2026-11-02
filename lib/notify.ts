// Client notifications: always stored (shown in the portal); email is sent too when Resend is configured.
// Emails are deliberately generic (no case details) because email is not a confidential channel.
import { getServiceSupabase } from './supabase';
import { CONFIG } from './config';

export type EmailStatus = 'not_configured' | 'sent' | 'failed';

export function buildEmailText(firmName: string, caseNo: string, siteUrl: string): { subject: string; text: string } {
  return {
    subject: `${firmName}: update on your case ${caseNo}`,
    text: `There is a new update on your case ${caseNo}.\n\nFor confidentiality, details are only shown after you sign in to the client portal:\n${siteUrl.replace(/\/$/, '')}/client\n\n${firmName}`,
  };
}

async function sendEmail(to: string, subject: string, text: string): Promise<EmailStatus> {
  const { resendApiKey, fromEmail } = CONFIG.notify;
  if (!resendApiKey || !fromEmail) return 'not_configured';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromEmail, to: [to], subject, text }),
    });
    if (!res.ok) {
      console.error('Notification email failed with HTTP', res.status);
      return 'failed';
    }
    return 'sent';
  } catch (err) {
    console.error('Notification email error:', err instanceof Error ? err.message : err);
    return 'failed';
  }
}

/** Notify every active client linked to the case. Returns how many clients were notified. */
export async function notifyCaseClients(caseId: number, caseNo: string, subject: string, body: string): Promise<number> {
  const supabase = getServiceSupabase();
  const { data: links, error } = await supabase
    .from('client_case_access')
    .select('client_accounts(client_id, email, is_active)')
    .eq('case_id', caseId);
  if (error) {
    console.error('notify: access lookup failed:', error.message);
    return 0;
  }

  const clients = (links || [])
    .map((l: any) => l.client_accounts)
    .filter((c: any) => c && c.is_active) as { client_id: number; email: string }[];

  let notified = 0;
  for (const client of clients) {
    const mail = buildEmailText(CONFIG.firm.name, caseNo, CONFIG.firm.siteUrl);
    const emailStatus = await sendEmail(client.email, mail.subject, mail.text);
    const { error: insertError } = await supabase.from('notifications').insert([
      { client_id: client.client_id, case_id: caseId, subject: subject.slice(0, 200), body: body.slice(0, 1000), email_status: emailStatus },
    ]);
    if (insertError) {
      console.error('notify: insert failed:', insertError.message);
      continue;
    }
    notified += 1;
  }
  return notified;
}
