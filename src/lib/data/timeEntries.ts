import "server-only";

import { prisma } from "@/lib/prisma";

// D12 : TimeEntry n'a pas de vaId direct — le tenant est vérifié via la
// chaîne task → mission → client dans chaque clause where.

const entryOwnedBy = (vaId: string) => ({
  task: { mission: { client: { vaId } } },
});

const withTaskContext = {
  task: {
    select: {
      id: true,
      title: true,
      mission: {
        select: {
          name: true,
          client: { select: { id: true, name: true, color: true } },
        },
      },
    },
  },
} as const;

export async function getActiveTimeEntryForVa(vaId: string) {
  return prisma.timeEntry.findFirst({
    where: { endedAt: null, ...entryOwnedBy(vaId) },
    include: withTaskContext,
  });
}

export async function getTimeEntriesForVa(vaId: string, limit = 50) {
  return prisma.timeEntry.findMany({
    where: { endedAt: { not: null }, ...entryOwnedBy(vaId) },
    orderBy: { startedAt: "desc" },
    take: limit,
    include: withTaskContext,
  });
}

// Invariant « une seule entrée active par VA » : démarrer arrête d'abord
// toute entrée encore ouverte de la même VA, atomiquement côté data.
export async function startTimeEntryForVa(
  vaId: string,
  taskId: string,
  label: string | null,
) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, mission: { client: { vaId } } },
    select: { id: true },
  });
  if (!task) return null;

  await prisma.timeEntry.updateMany({
    where: { endedAt: null, ...entryOwnedBy(vaId) },
    data: { endedAt: new Date() },
  });

  return prisma.timeEntry.create({
    data: { taskId, label, startedAt: new Date() },
  });
}

export async function stopActiveTimeEntryForVa(vaId: string) {
  const { count } = await prisma.timeEntry.updateMany({
    where: { endedAt: null, ...entryOwnedBy(vaId) },
    data: { endedAt: new Date() },
  });
  return count > 0;
}

export async function updateTimeEntryForVa(
  vaId: string,
  entryId: string,
  data: { label?: string | null; taskId?: string; startedAt?: Date; endedAt?: Date },
) {
  if (data.taskId) {
    const task = await prisma.task.findFirst({
      where: { id: data.taskId, mission: { client: { vaId } } },
      select: { id: true },
    });
    if (!task) return false;
  }

  const { count } = await prisma.timeEntry.updateMany({
    where: { id: entryId, ...entryOwnedBy(vaId) },
    data,
  });
  return count > 0;
}

export async function deleteTimeEntryForVa(vaId: string, entryId: string) {
  const { count } = await prisma.timeEntry.deleteMany({
    where: { id: entryId, ...entryOwnedBy(vaId) },
  });
  return count > 0;
}
