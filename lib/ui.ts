// Shared Tailwind class strings for the admin and client portal screens.
export const inputCls =
  'w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 placeholder-neutral-600 text-xs focus:outline-none focus:border-gold';
export const labelCls = 'block text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-1';
export const panelCls = 'glass-panel rounded-2xl border border-neutral-800 p-6';
export const smallBtnCls =
  'px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-gold text-[11px] font-semibold border border-neutral-800 transition-colors disabled:opacity-60';
export const statusBadgeCls = (status: string | null | undefined) =>
  `px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
    status === 'inactive'
      ? 'bg-neutral-900 text-neutral-400 border-neutral-700'
      : 'bg-emerald-950/80 text-emerald-400 border-emerald-700/50'
  }`;
