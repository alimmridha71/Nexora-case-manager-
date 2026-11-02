'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { markNotificationsReadAction } from '@/app/actions/client';

export default function MarkReadButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => { await markNotificationsReadAction(); router.refresh(); })}
      className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-gold text-[11px] font-semibold border border-neutral-800 disabled:opacity-60"
    >
      {pending ? 'Updating…' : 'Mark all as read'}
    </button>
  );
}
