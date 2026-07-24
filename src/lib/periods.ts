// Clés de période des tâches récurrentes (D16).
// Mensuel : "2026-07" — hebdo : "2026-W31" (semaine ISO, lundi).

export type Cadence = "weekly" | "monthly";

export function monthlyPeriod(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function weeklyPeriod(date = new Date()): string {
  // Semaine ISO 8601 : jeudi de la semaine courante → année ISO.
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function periodFor(cadence: Cadence, date = new Date()): string {
  return cadence === "weekly" ? weeklyPeriod(date) : monthlyPeriod(date);
}

export function cadenceLabel(cadence: string): string {
  return cadence === "weekly" ? "hebdo" : "mensuelle";
}

// D19 : échéance automatique d'une occurrence = fin de sa période, en date
// UTC minuit (la colonne est une DATE sans heure).
// Hebdo : dimanche de la semaine ISO — mensuel : dernier jour du mois.
export function periodEndFor(cadence: Cadence, date = new Date()): Date {
  if (cadence === "weekly") {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + (7 - day));
    return d;
  }
  return new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0));
}
