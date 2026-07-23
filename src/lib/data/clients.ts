import "server-only";

import { prisma } from "@/lib/prisma";

// D12 : le filtre par vaId (ou par l'utilisateur portail) vit dans la clause
// where de la fonction data, jamais dans le composant appelant.
export async function getClientsOverview(vaId: string) {
  return prisma.client.findMany({
    where: { vaId },
    orderBy: { createdAt: "asc" },
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

export async function getClientForPortalUser(userId: string) {
  return prisma.client.findFirst({
    where: { portalUser: { id: userId } },
    include: {
      va: { select: { name: true, lastName: true, email: true } },
    },
  });
}
