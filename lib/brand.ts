// Brand theming: turns two hex colors from the environment into the CSS variables Tailwind uses.
const HEX = /^#?([0-9a-f]{6})$/i;

export function hexToRgb(hex: string, fallback: [number, number, number]): [number, number, number] {
  const m = HEX.exec(hex.trim());
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Mix a color with white (amount > 0) or black (amount < 0). */
export function shade([r, g, b]: [number, number, number], amount: number): [number, number, number] {
  const target = amount >= 0 ? 255 : 0;
  const t = Math.min(1, Math.abs(amount));
  const mix = (c: number) => Math.round(c + (target - c) * t);
  return [mix(r), mix(g), mix(b)];
}

const triplet = (c: [number, number, number]) => c.join(' ');

export function brandCssVars(primaryHex: string, accentHex: string): Record<string, string> {
  const primary = hexToRgb(primaryHex, [107, 29, 47]);
  const accent = hexToRgb(accentHex, [197, 160, 89]);
  return {
    '--c-burgundy': triplet(primary),
    '--c-burgundy-light': triplet(shade(primary, 0.18)),
    '--c-burgundy-dark': triplet(shade(primary, -0.3)),
    '--c-gold': triplet(accent),
    '--c-gold-light': triplet(shade(accent, 0.25)),
    '--c-gold-dark': triplet(shade(accent, -0.25)),
  };
}
