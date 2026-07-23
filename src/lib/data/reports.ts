import "server-only";

import { prisma } from "@/lib/prisma";

// D12 : le rapport ne s'assemble que si le client appartient à la VA, et les
// entrées de temps sont refiltrées par la chaîne mission → client → vaId.

export type ActivityReport = {
  client: { id: string; name: string; company: string | null };
  va: { name: string | null; lastName: string | null; email: string };
  periodStart: Date;
  periodEnd: Date;
  missions: {
    id: string;
    name: string;
    totalMs: number;
    tasks: { id: string; title: string; totalMs: number; entryCount: number }[];
  }[];
  totalMs: number;
  entryCount: number;
};

export async function getActivityReport(
  vaId: string,
  clientId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<ActivityReport | null> {
  const client = await prisma.client.findFirst({
    where: { id: clientId, vaId },
    select: {
      id: true,
      name: true,
      company: true,
      va: { select: { name: true, lastName: true, email: true } },
    },
  });
  if (!client) return null;

  const entries = await prisma.timeEntry.findMany({
    where: {
      endedAt: { not: null },
      startedAt: { gte: periodStart, lt: periodEnd },
      task: { mission: { clientId: client.id, client: { vaId } } },
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          mission: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { startedAt: "asc" },
  });

  const missionMap = new Map<
    string,
    {
      id: string;
      name: string;
      totalMs: number;
      tasks: Map<string, { id: string; title: string; totalMs: number; entryCount: number }>;
    }
  >();
  let totalMs = 0;

  for (const entry of entries) {
    const ms = entry.endedAt!.getTime() - entry.startedAt.getTime();
    totalMs += ms;

    const mission = entry.task.mission;
    let missionAgg = missionMap.get(mission.id);
    if (!missionAgg) {
      missionAgg = { id: mission.id, name: mission.name, totalMs: 0, tasks: new Map() };
      missionMap.set(mission.id, missionAgg);
    }
    missionAgg.totalMs += ms;

    let taskAgg = missionAgg.tasks.get(entry.task.id);
    if (!taskAgg) {
      taskAgg = { id: entry.task.id, title: entry.task.title, totalMs: 0, entryCount: 0 };
      missionAgg.tasks.set(entry.task.id, taskAgg);
    }
    taskAgg.totalMs += ms;
    taskAgg.entryCount += 1;
  }

  return {
    client: { id: client.id, name: client.name, company: client.company },
    va: client.va,
    periodStart,
    periodEnd,
    missions: Array.from(missionMap.values()).map((mission) => ({
      ...mission,
      tasks: Array.from(mission.tasks.values()),
    })),
    totalMs,
    entryCount: entries.length,
  };
}
