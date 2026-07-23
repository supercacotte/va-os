// Palette clients VA Desk (design/DESIGN.md §1) — 20 pastels oklch de même
// luminosité/chroma, hex en secours. Le numéro (1-20) est stocké sur le
// Client ; les valeurs CSS vivent dans globals.css (--client-1 … --client-20,
// hex + override oklch via @supports).

export const CLIENT_COLOR_COUNT = 20;

export const CLIENT_COLORS: { oklch: string; hex: string }[] = [
  { oklch: "oklch(0.83 0.09 282)", hex: "#C5C4FF" },
  { oklch: "oklch(0.85 0.11 340)", hex: "#FFB6E3" },
  { oklch: "oklch(0.86 0.09 216)", hex: "#ACDDF8" },
  { oklch: "oklch(0.86 0.09 54)", hex: "#F8C79E" },
  { oklch: "oklch(0.86 0.09 90)", hex: "#DDD69A" },
  { oklch: "oklch(0.86 0.09 0)", hex: "#FFB9C6" },
  { oklch: "oklch(0.86 0.09 306)", hex: "#F0BCF0" },
  { oklch: "oklch(0.86 0.09 180)", hex: "#9CE5DE" },
  { oklch: "oklch(0.86 0.09 72)", hex: "#EBCF97" },
  { oklch: "oklch(0.86 0.09 36)", hex: "#FFC0A8" },
  { oklch: "oklch(0.86 0.09 108)", hex: "#CBDD9F" },
  { oklch: "oklch(0.86 0.09 126)", hex: "#B8E2AB" },
  { oklch: "oklch(0.86 0.09 144)", hex: "#A9E5BC" },
  { oklch: "oklch(0.86 0.09 162)", hex: "#9FE6CE" },
  { oklch: "oklch(0.86 0.09 198)", hex: "#A0E2EC" },
  { oklch: "oklch(0.86 0.09 234)", hex: "#BCD6FF" },
  { oklch: "oklch(0.86 0.09 252)", hex: "#CBCEFF" },
  { oklch: "oklch(0.86 0.09 288)", hex: "#E4C1FB" },
  { oklch: "oklch(0.86 0.09 324)", hex: "#F9B8E2" },
  { oklch: "oklch(0.86 0.09 18)", hex: "#FFBAB8" },
];

// Ramène n'importe quel numéro stocké sur 1-20 (recyclage au-delà de 20).
export function normalizeClientColor(n: number) {
  if (!Number.isFinite(n)) return 1;
  return ((Math.max(1, Math.trunc(n)) - 1) % CLIENT_COLOR_COUNT) + 1;
}

// À utiliser dans les styles : var CSS avec fallback hex intégré côté CSS.
export function clientColorVar(n: number) {
  return `var(--client-${normalizeClientColor(n)})`;
}
