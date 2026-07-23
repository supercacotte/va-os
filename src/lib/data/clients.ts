import "server-only";

import { prisma } from "@/lib/prisma";

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

// Version allégée pour les selects (rapports, rattachements).
export async function getClientOptionsForVa(vaId: string) {
  return prisma.client.findMany({
    where: { vaId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, company: true },
  });
}

export async function getClientDetailForVa(vaId: string, clientId: string) {
  return prisma.client.findFirst({
    where: { id: clientId, vaId },
    include: {
      portalUser: { select: { email: true } },
      missions: {
        orderBy: { createdAt: "asc" },
        include: {
          tasks: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });
}

export async function createClientForVa(vaId: string, data: ClientInput) {
  return prisma.client.create({ data: { vaId, ...data } });
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
