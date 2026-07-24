import "server-only";

import { prisma } from "@/lib/prisma";

// Bloc « Chiffre d'affaires » de la fiche client (maquette 32a) — estimation
// = heures trackées × taux horaire du client. D12 : filtré par vaId.
// Ce n'est jamais une facture et ce n'est jamais montré au client.

const MONTH_LABELS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];
const MONTH_FULL = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export type RevenueBar = { label: string; ms: number; amount: number; isCurrent: boolean };
export type RevenueView = {
  featured: {
    label: string;
    ms: number;
    amount: number;
    deltaPct: number | null;
    deltaLabel: string;
  };
  bars: RevenueBar[];
  stats: {
    sinceLabel: string;
    sinceAmount: number;
    hoursLabel: string;
    hoursMs: number;
    avgLabel: string;
    avgAmount: number;
  };
};
export type ClientRevenue = {
  clientName: string;
  color: number;
  hourlyRate: number | null;
  mensuel: RevenueView;
  annuel: RevenueView;
};

const HOUR_MS = 3_600_000;
const amountOf = (ms: number, rate: number | null) =>
  rate ? (ms / HOUR_MS) * rate : 0;
const deltaPct = (current: number, prev: number) =>
  prev > 0 ? Math.round(((current - prev) / prev) * 100) : null;

export async function getClientRevenue(
  vaId: string,
  clientId: string,
): Promise<ClientRevenue | null> {
  const client = await prisma.client.findFirst({
    where: { id: clientId, vaId },
    select: { name: true, color: true, hourlyRate: true },
  });
  if (!client) return null;

  const entries = await prisma.timeEntry.findMany({
    where: {
      endedAt: { not: null },
      task: { mission: { clientId } },
    },
    select: { startedAt: true, endedAt: true },
  });

  const rate = client.hourlyRate;
  const monthMs = new Map<string, number>(); // "2026-07" -> ms
  const yearMs = new Map<number, number>(); // 2026 -> ms
  for (const entry of entries) {
    const ms = entry.endedAt!.getTime() - entry.startedAt.getTime();
    const d = entry.startedAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMs.set(key, (monthMs.get(key) ?? 0) + ms);
    yearMs.set(d.getFullYear(), (yearMs.get(d.getFullYear()) ?? 0) + ms);
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11

  // --- Vue mensuelle -------------------------------------------------------
  const msFor = (y: number, m: number) =>
    monthMs.get(`${y}-${String(m + 1).padStart(2, "0")}`) ?? 0;

  const bars: RevenueBar[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - i, 1);
    const ms = msFor(d.getFullYear(), d.getMonth());
    bars.push({
      label: MONTH_LABELS[d.getMonth()],
      ms,
      amount: amountOf(ms, rate),
      isCurrent: i === 0,
    });
  }

  const currentMs = msFor(year, month);
  const prevD = new Date(year, month - 1, 1);
  const prevMs = msFor(prevD.getFullYear(), prevD.getMonth());

  // Cumul de l'année en cours (janvier → mois courant).
  let ytdMs = 0;
  for (let m = 0; m <= month; m++) ytdMs += msFor(year, m);
  const monthsElapsed = month + 1;

  const mensuel: RevenueView = {
    featured: {
      label: `${MONTH_FULL[month]} ${year}`,
      ms: currentMs,
      amount: amountOf(currentMs, rate),
      deltaPct: deltaPct(amountOf(currentMs, rate), amountOf(prevMs, rate)),
      deltaLabel: MONTH_LABELS[prevD.getMonth()].replace(".", ""),
    },
    bars,
    stats: {
      sinceLabel: "depuis janvier",
      sinceAmount: amountOf(ytdMs, rate),
      hoursLabel: `trackées en ${year}`,
      hoursMs: ytdMs,
      avgLabel: "moyenne / mois",
      avgAmount: amountOf(ytdMs, rate) / monthsElapsed,
    },
  };

  // --- Vue annuelle --------------------------------------------------------
  const yBars: RevenueBar[] = [];
  for (let i = 5; i >= 0; i--) {
    const y = year - i;
    const ms = yearMs.get(y) ?? 0;
    yBars.push({
      label: String(y),
      ms,
      amount: amountOf(ms, rate),
      isCurrent: i === 0,
    });
  }
  const yearTotalMs = yearMs.get(year) ?? 0;
  const prevYearMs = yearMs.get(year - 1) ?? 0;
  const allTimeMs = [...yearMs.values()].reduce((a, b) => a + b, 0);
  const firstYear = yearMs.size > 0 ? Math.min(...yearMs.keys()) : year;
  const yearsElapsed = year - firstYear + 1;

  const annuel: RevenueView = {
    featured: {
      label: String(year),
      ms: yearTotalMs,
      amount: amountOf(yearTotalMs, rate),
      deltaPct: deltaPct(amountOf(yearTotalMs, rate), amountOf(prevYearMs, rate)),
      deltaLabel: String(year - 1),
    },
    bars: yBars,
    stats: {
      sinceLabel: "depuis le début",
      sinceAmount: amountOf(allTimeMs, rate),
      hoursLabel: "heures au total",
      hoursMs: allTimeMs,
      avgLabel: "moyenne / an",
      avgAmount: amountOf(allTimeMs, rate) / yearsElapsed,
    },
  };

  return {
    clientName: client.name,
    color: client.color,
    hourlyRate: rate,
    mensuel,
    annuel,
  };
}

export async function updateClientHourlyRateForVa(
  vaId: string,
  clientId: string,
  hourlyRate: number | null,
) {
  const { count } = await prisma.client.updateMany({
    where: { id: clientId, vaId },
    data: { hourlyRate },
  });
  return count > 0;
}
