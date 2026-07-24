import "server-only";

import { prisma } from "@/lib/prisma";
import { periodEndFor, periodFor, type Cadence } from "@/lib/periods";

// D16 : génération paresseuse — appelée en tête des lectures VA, elle crée
// l'occurrence de la période courante pour chaque récurrence active dont la
// mission est active. Idempotente (unique [recurringTaskId, recurringPeriod],
// skipDuplicates encaisse les courses).
export async function ensureRecurringTasksForVa(vaId: string) {
  const templates = await prisma.recurringTask.findMany({
    where: { active: true, mission: { status: "active", client: { vaId } } },
    select: { id: true, title: true, missionId: true, cadence: true },
  });
  if (templates.length === 0) return;

  await backfillDueDates(templates);

  const existing = await prisma.task.findMany({
    where: { recurringTaskId: { in: templates.map((t) => t.id) } },
    select: { recurringTaskId: true, recurringPeriod: true },
  });
  const have = new Set(existing.map((e) => `${e.recurringTaskId}|${e.recurringPeriod}`));

  const missing = templates.filter(
    (t) => !have.has(`${t.id}|${periodFor(t.cadence as Cadence)}`),
  );
  if (missing.length === 0) return;

  await prisma.task.createMany({
    data: missing.map((t) => ({
      missionId: t.missionId,
      title: t.title,
      source: "recurring",
      recurringTaskId: t.id,
      recurringPeriod: periodFor(t.cadence as Cadence),
      dueDate: periodEndFor(t.cadence as Cadence),
    })),
    skipDuplicates: true,
  });
}

// D19 : rattrapage des occurrences créées avant l'arrivée des échéances —
// celles de la période courante encore sans dueDate en reçoivent une.
// Idempotent, une requête par cadence présente.
async function backfillDueDates(templates: { id: string; cadence: string }[]) {
  for (const cadence of ["weekly", "monthly"] as const) {
    const ids = templates.filter((t) => t.cadence === cadence).map((t) => t.id);
    if (ids.length === 0) continue;
    await prisma.task.updateMany({
      where: {
        recurringTaskId: { in: ids },
        recurringPeriod: periodFor(cadence),
        dueDate: null,
      },
      data: { dueDate: periodEndFor(cadence) },
    });
  }
}

// Création d'une tâche récurrente : le modèle + l'occurrence de la période
// courante, en une transaction. Propriété de la mission vérifiée (D12).
export async function createRecurringTaskForVa(
  vaId: string,
  missionId: string,
  title: string,
  cadence: Cadence,
) {
  const mission = await prisma.mission.findFirst({
    where: { id: missionId, client: { vaId } },
    select: { id: true },
  });
  if (!mission) return null;

  return prisma.$transaction(async (tx) => {
    const template = await tx.recurringTask.create({
      data: { missionId, title, cadence },
    });
    await tx.task.create({
      data: {
        missionId,
        title,
        source: "recurring",
        recurringTaskId: template.id,
        recurringPeriod: periodFor(cadence),
        dueDate: periodEndFor(cadence),
      },
    });
    return template;
  });
}

export async function stopRecurringTaskForVa(vaId: string, recurringTaskId: string) {
  const { count } = await prisma.recurringTask.updateMany({
    where: { id: recurringTaskId, mission: { client: { vaId } } },
    data: { active: false },
  });
  return count > 0;
}
