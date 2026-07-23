import "server-only";

import { prisma } from "@/lib/prisma";

// D12 : le rapport ne s'assemble que pour un client dont l'appelant est
// légitime — la VA propriétaire (filtre vaId) ou l'utilisateur portail du
// client (filtre portalUser). Le moteur d'agrégation est commun.

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
    entries: {
      id: string;
      startedAt: Date;
      label: string | null;
      taskTitle: string;
      durationMs: number;
    }[];
  }[];
  totalMs: number;
  entryCount: number;
  coveredTaskCount: number;
};

type ReportClient = {
  id: string;
  name: string;
  company: string | null;
  va: { name: string | null; lastName: string | null; email: string };
};

const CLIENT_SELECT = {
  id: true,
  name: true,
  company: true,
  color: true,
  va: { select: { name: true, lastName: true, email: true } },
} as const;

async function buildActivityReport(
  client: ReportClient,
  periodStart: Date,
  periodEnd: Date,
): Promise<ActivityReport> {
  const entries = await prisma.timeEntry.findMany({
    where: {
      endedAt: { not: null },
      startedAt: { gte: periodStart, lt: periodEnd },
      task: { mission: { clientId: client.id } },
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
      entries: {
        id: string;
        startedAt: Date;
        label: string | null;
        taskTitle: string;
        durationMs: number;
      }[];
    }
  >();
  let totalMs = 0;
  const coveredTasks = new Set<string>();

  for (const entry of entries) {
    const ms = entry.endedAt!.getTime() - entry.startedAt.getTime();
    totalMs += ms;
    coveredTasks.add(entry.task.id);

    const mission = entry.task.mission;
    let missionAgg = missionMap.get(mission.id);
    if (!missionAgg) {
      missionAgg = {
        id: mission.id,
        name: mission.name,
        totalMs: 0,
        tasks: new Map(),
        entries: [],
      };
      missionMap.set(mission.id, missionAgg);
    }
    missionAgg.totalMs += ms;
    missionAgg.entries.push({
      id: entry.id,
      startedAt: entry.startedAt,
      label: entry.label,
      taskTitle: entry.task.title,
      durationMs: ms,
    });

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
    coveredTaskCount: coveredTasks.size,
  };
}

export async function getActivityReport(
  vaId: string,
  clientId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<ActivityReport | null> {
  const client = await prisma.client.findFirst({
    where: { id: clientId, vaId },
    select: CLIENT_SELECT,
  });
  if (!client) return null;

  return buildActivityReport(client, periodStart, periodEnd);
}

export async function getActivityReportForPortalUser(
  userId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<ActivityReport | null> {
  const client = await prisma.client.findFirst({
    where: { portalUser: { id: userId } },
    select: CLIENT_SELECT,
  });
  if (!client) return null;

  return buildActivityReport(client, periodStart, periodEnd);
}

// Mois (UTC) où du temps a été suivi pour le client du portail, du plus
// récent au plus ancien, avec le total suivi.
export async function getReportMonthsForPortalUser(userId: string) {
  const entries = await prisma.timeEntry.findMany({
    where: {
      endedAt: { not: null },
      task: { mission: { client: { portalUser: { id: userId } } } },
    },
    select: { startedAt: true, endedAt: true },
  });

  const months = new Map<string, number>();
  for (const entry of entries) {
    const key = `${entry.startedAt.getUTCFullYear()}-${String(
      entry.startedAt.getUTCMonth() + 1,
    ).padStart(2, "0")}`;
    months.set(
      key,
      (months.get(key) ?? 0) + (entry.endedAt!.getTime() - entry.startedAt.getTime()),
    );
  }

  return Array.from(months.entries())
    .map(([mois, totalMs]) => ({ mois, totalMs }))
    .sort((a, b) => b.mois.localeCompare(a.mois));
}
