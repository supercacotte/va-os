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

// D15 : côté portail, un rapport n'existe que s'il a été GÉNÉRÉ par la VA et
// que le toggle « visible sur son portail » du client est actif.
export async function getActivityReportForPortalUser(
  userId: string,
  monthKey: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<ActivityReport | null> {
  const client = await prisma.client.findFirst({
    where: {
      portalUser: { id: userId },
      portalReportsEnabled: true,
      reports: { some: { month: monthKey } },
    },
    select: CLIENT_SELECT,
  });
  if (!client) return null;

  return buildActivityReport(client, periodStart, periodEnd);
}

// Rapports générés visibles sur le portail, avec le temps total du mois.
export async function getReportMonthsForPortalUser(userId: string) {
  const client = await prisma.client.findFirst({
    where: { portalUser: { id: userId } },
    select: {
      id: true,
      portalReportsEnabled: true,
      reports: { orderBy: { month: "desc" }, select: { month: true } },
    },
  });
  if (!client || !client.portalReportsEnabled || client.reports.length === 0) return [];

  const entries = await prisma.timeEntry.findMany({
    where: { endedAt: { not: null }, task: { mission: { clientId: client.id } } },
    select: { startedAt: true, endedAt: true },
  });

  const totals = new Map<string, number>();
  for (const entry of entries) {
    const key = monthKeyOf(entry.startedAt);
    totals.set(
      key,
      (totals.get(key) ?? 0) + (entry.endedAt!.getTime() - entry.startedAt.getTime()),
    );
  }

  return client.reports.map((report) => ({
    mois: report.month,
    totalMs: totals.get(report.month) ?? 0,
  }));
}

function monthKeyOf(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

// Page Rapports VA (15a) : état par client — toggle, rapports générés,
// agrégats par mois (temps / tâches / missions couvertes).
export async function getReportsPageData(vaId: string) {
  const clients = await prisma.client.findMany({
    where: { vaId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      company: true,
      color: true,
      portalReportsEnabled: true,
      reports: {
        orderBy: { month: "desc" },
        select: { month: true, generatedAt: true },
      },
    },
  });

  const entries = await prisma.timeEntry.findMany({
    where: { endedAt: { not: null }, task: { mission: { client: { vaId } } } },
    select: {
      startedAt: true,
      endedAt: true,
      task: { select: { id: true, mission: { select: { id: true, clientId: true } } } },
    },
  });

  const aggregates = new Map<
    string,
    { totalMs: number; tasks: Set<string>; missions: Set<string> }
  >();
  for (const entry of entries) {
    const key = `${entry.task.mission.clientId}|${monthKeyOf(entry.startedAt)}`;
    const agg = aggregates.get(key) ?? { totalMs: 0, tasks: new Set(), missions: new Set() };
    agg.totalMs += entry.endedAt!.getTime() - entry.startedAt.getTime();
    agg.tasks.add(entry.task.id);
    agg.missions.add(entry.task.mission.id);
    aggregates.set(key, agg);
  }

  return clients.map((client) => {
    const monthAgg: Record<
      string,
      { totalMs: number; taskCount: number; missionCount: number }
    > = {};
    for (const [key, agg] of aggregates) {
      const [clientId, month] = key.split("|");
      if (clientId !== client.id) continue;
      monthAgg[month] = {
        totalMs: agg.totalMs,
        taskCount: agg.tasks.size,
        missionCount: agg.missions.size,
      };
    }
    return { ...client, monthAgg };
  });
}

export async function setPortalReportsEnabled(
  vaId: string,
  clientId: string,
  enabled: boolean,
) {
  const { count } = await prisma.client.updateMany({
    where: { id: clientId, vaId },
    data: { portalReportsEnabled: enabled },
  });
  return count > 0;
}

// Génère (ou régénère) le rapport d'un client × mois — refuse si aucun temps.
export async function generateReport(vaId: string, clientId: string, month: string) {
  const [year, monthNum] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, monthNum - 1, 1));
  const end = new Date(Date.UTC(year, monthNum, 1));

  const client = await prisma.client.findFirst({
    where: { id: clientId, vaId },
    select: { id: true },
  });
  if (!client) return { error: "Client introuvable." as const };

  const entryCount = await prisma.timeEntry.count({
    where: {
      endedAt: { not: null },
      startedAt: { gte: start, lt: end },
      task: { mission: { clientId: client.id } },
    },
  });
  if (entryCount === 0) {
    return { error: "Aucun temps suivi pour ce client sur ce mois." as const };
  }

  await prisma.report.upsert({
    where: { clientId_month: { clientId: client.id, month } },
    create: { clientId: client.id, month },
    update: { generatedAt: new Date() },
  });
  return { ok: true as const };
}
