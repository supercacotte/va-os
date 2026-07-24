import "server-only";

import { prisma } from "@/lib/prisma";
import { ensureRecurringTasksForVa } from "@/lib/data/recurring";

// D12 règle 4 : côté portail, TOUT est filtré par l'utilisateur connecté
// (relation portalUser) — le clientId ne vient jamais d'un paramètre, et
// aucune donnée d'un autre client de la VA ne transite.

export const REQUEST_MISSION_NAME = "Demandes du portail";

export async function getPortalOverview(userId: string) {
  const base = await prisma.client.findFirst({
    where: { portalUser: { id: userId } },
    select: { vaId: true },
  });
  if (!base) return null;
  // D16 : le client voit l'occurrence de la période même si sa VA n'a pas
  // encore ouvert l'app.
  await ensureRecurringTasksForVa(base.vaId);

  return prisma.client.findFirst({
    where: { portalUser: { id: userId } },
    include: {
      va: { select: { name: true, lastName: true, email: true } },
      missions: {
        orderBy: { createdAt: "asc" },
        include: {
          tasks: {
            orderBy: { createdAt: "asc" },
            select: { id: true, title: true, done: true, source: true },
          },
        },
      },
    },
  });
}

export async function getPortalRequests(userId: string) {
  return prisma.task.findMany({
    where: {
      source: "client_request",
      mission: { client: { portalUser: { id: userId } } },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, done: true, createdAt: true },
  });
}

export async function createPortalRequest(userId: string, title: string) {
  const client = await prisma.client.findFirst({
    where: { portalUser: { id: userId } },
    select: { id: true },
  });
  if (!client) return null;

  let mission = await prisma.mission.findFirst({
    where: { clientId: client.id, name: REQUEST_MISSION_NAME },
    select: { id: true },
  });
  if (!mission) {
    mission = await prisma.mission.create({
      data: { clientId: client.id, name: REQUEST_MISSION_NAME },
      select: { id: true },
    });
  }

  return prisma.task.create({
    data: { missionId: mission.id, title, source: "client_request" },
  });
}
