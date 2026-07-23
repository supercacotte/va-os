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

// Stats de la page temps (maquette 14a) : aujourd'hui / semaine / mois +
// répartition du mois par client. Bornes en heure locale du serveur.
export async function getTimeStatsForVa(vaId: string) {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - ((todayStart.getDay() + 6) % 7));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const since = weekStart < monthStart ? weekStart : monthStart;

  const entries = await prisma.timeEntry.findMany({
    where: { endedAt: { not: null }, startedAt: { gte: since }, ...entryOwnedBy(vaId) },
    select: {
      startedAt: true,
      endedAt: true,
      task: {
        select: {
          mission: {
            select: { client: { select: { id: true, name: true, color: true } } },
          },
        },
      },
    },
  });

  let todayMs = 0;
  let weekMs = 0;
  let monthMs = 0;
  const perClient = new Map<
    string,
    { id: string; name: string; color: number; totalMs: number }
  >();

  for (const entry of entries) {
    const ms = entry.endedAt!.getTime() - entry.startedAt.getTime();
    if (entry.startedAt >= todayStart) todayMs += ms;
    if (entry.startedAt >= weekStart) weekMs += ms;
    if (entry.startedAt >= monthStart) {
      monthMs += ms;
      const client = entry.task.mission.client;
      const agg = perClient.get(client.id) ?? { ...client, totalMs: 0 };
      agg.totalMs += ms;
      perClient.set(client.id, agg);
    }
  }

  return {
    todayMs,
    weekMs,
    monthMs,
    perClient: Array.from(perClient.values()).sort((a, b) => b.totalMs - a.totalMs),
  };
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
