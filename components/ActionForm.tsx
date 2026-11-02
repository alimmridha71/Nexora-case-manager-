'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export type ActionResult = { success: boolean; error?: string; message?: string };

interface ActionFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  children?: React.ReactNode;
  submitLabel: string;
  className?: string;
  buttonClassName?: string;
  confirmMessage?: string;
  resetOnSuccess?: boolean;
}

/** Small client wrapper: runs a server action, shows its message, refreshes the page data. */
export default function ActionForm({
  action,
  children,
  submitLabel,
  className = 'space-y-3',
  buttonClassName = 'px-4 py-2 rounded-xl bg-gradient-to-r from-burgundy to-burgundy-light hover:brightness-110 text-white font-bold text-xs border border-gold/40 transition-all disabled:opacity-60',
  confirmMessage,
  resetOnSuccess = true,
}: ActionFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const res = await action(data);
      setResult(res);
      if (res.success) {
        if (resetOnSuccess) form.reset();
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
      <button type="submit" disabled={pending} className={buttonClassName}>
        {pending ? 'Working…' : submitLabel}
      </button>
      {result && (
        <p
          role="status"
          className={`text-xs break-words ${result.success ? 'text-emerald-400' : 'text-red-400'}`}
        >
          {result.success ? result.message || 'Done.' : result.error || 'Something went wrong.'}
        </p>
      )}
    </form>
  );
}
