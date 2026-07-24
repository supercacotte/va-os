import "server-only";

import { prisma } from "@/lib/prisma";
import { ensureRecurringTasksForVa } from "@/lib/data/recurring";
import { CLIENT_COLOR_COUNT } from "@/lib/client-colors";

// D12 : chaque fonction filtre par vaId (ou par l'utilisateur portail) dans sa
// propre clause where — jamais dans le composant appelant. Les écritures
// passent par updateMany/deleteMany avec le filtre tenant : count === 0
// signifie « introuvable ou pas à toi », sans requête préalable.

export type ClientInput = {
  name: string;
  company: string | null;
};

export async function getVaDashboard(vaId: string) {
  const [clientCount, activeMissionCount, openTaskCount] = await Promise.all([
    prisma.client.count({ where: { vaId } }),
    prisma.mission.count({ where: { client: { vaId }, status: "active" } }),
    prisma.task.count({ where: { mission: { client: { vaId } }, done: false } }),
  ]);

  return { clientCount, activeMissionCount, openTaskCount };
}

export async function getClientsForVa(vaId: string) {
  return prisma.client.findMany({
    where: { vaId },
    orderBy: { createdAt: "asc" },
    include: {
      portalUser: { select: { email: true } },
      missions: {
        select: {
          id: true,
          status: true,
          tasks: { select: { done: true } },
        },
      },
    },
  });
}

// Tout l'espace de travail de la VA pour le dashboard : clients → missions
// → tâches, en un aller-retour.
export async function getVaWorkspace(vaId: string) {
  await ensureRecurringTasksForVa(vaId);
  return prisma.client.findMany({
    where: { vaId },
    orderBy: { createdAt: "asc" },
    include: {
      missions: {
        orderBy: { createdAt: "asc" },
        include: {
          tasks: {
            // D19 : les tâches datées d'abord, par échéance croissante.
            orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
            select: {
              id: true,
              title: true,
              done: true,
              source: true,
              dueDate: true,
              recurringTask: { select: { cadence: true } },
            },
          },
        },
      },
    },
  });
}

// Version allégée pour les selects (rapports, rattachements).
export async function getClientOptionsForVa(vaId: string) {
  return prisma.client.findMany({
    where: { vaId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, company: true, color: true },
  });
}

export async function getClientDetailForVa(vaId: string, clientId: string) {
  await ensureRecurringTasksForVa(vaId);
  return prisma.client.findFirst({
    where: { id: clientId, vaId },
    include: {
      portalUser: { select: { email: true } },
      missions: {
        orderBy: { createdAt: "asc" },
        include: {
          tasks: {
            orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
            include: { recurringTask: { select: { cadence: true } } },
          },
          recurringTasks: {
            where: { active: true },
            orderBy: { createdAt: "asc" },
            select: { id: true, title: true, cadence: true },
          },
        },
      },
    },
  });
}

// La couleur est choisie à la création (DESIGN.md §1) : premier numéro libre
// dans l'ordre 1-20 chez cette VA, recyclage au-delà. Stockée, jamais
// recalculée ensuite.
export async function createClientForVa(vaId: string, data: ClientInput) {
  const existing = await prisma.client.findMany({
    where: { vaId },
    select: { color: true },
  });
  const used = new Set(existing.map((client) => client.color));

  let color = (existing.length % CLIENT_COLOR_COUNT) + 1;
  for (let n = 1; n <= CLIENT_COLOR_COUNT; n++) {
    if (!used.has(n)) {
      color = n;
      break;
    }
  }

  return prisma.client.create({ data: { vaId, color, ...data } });
}

export async function updateClientForVa(vaId: string, clientId: string, data: ClientInput) {
  const { count } = await prisma.client.updateMany({
    where: { id: clientId, vaId },
    data,
  });
  return count > 0;
}

export async function deleteClientForVa(vaId: string, clientId: string) {
  const { count } = await prisma.client.deleteMany({
    where: { id: clientId, vaId },
  });
  return count > 0;
}

export async function getOwnedClientWithPortal(vaId: string, clientId: string) {
  return prisma.client.findFirst({
    where: { id: clientId, vaId },
    include: { portalUser: { select: { id: true } } },
  });
}
