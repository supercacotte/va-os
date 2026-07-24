// Échéances de tâches (D19) — helpers d'affichage, utilisables côté client.
// L'échéance est une date seule (UTC minuit en base) ; « aujourd'hui » se
// juge dans le fuseau de la personne qui regarde.

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysUntil(iso: string): number {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  const due = new Date(year, month - 1, day);
  return Math.round((due.getTime() - startOfToday().getTime()) / 86_400_000);
}

export function isOverdue(iso: string): boolean {
  return daysUntil(iso) < 0;
}

// « aujourd'hui », « demain », « dimanche » (dans la semaine qui vient),
// sinon « le 12 août » (+ année si différente). Toujours des mots (29a).
export function duePhrase(iso: string): string {
  const diff = daysUntil(iso);
  if (diff === 0) return "aujourd'hui";
  if (diff === 1) return "demain";
  if (diff === -1) return "hier";

  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  const due = new Date(year, month - 1, day);
  if (diff > 1 && diff < 7) {
    return due.toLocaleDateString("fr-FR", { weekday: "long" });
  }
  const label = due.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return year === startOfToday().getFullYear() ? `le ${label}` : `le ${label} ${year}`;
}
