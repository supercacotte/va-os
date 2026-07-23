import "server-only";

import { prisma } from "@/lib/prisma";

// D12 : le filtre par vaId vit dans la clause where de la fonction data,
// jamais dans le composant appelant.
export async function getClientsOverview(vaId: string) {
  return prisma.client.findMany({
    where: { vaId },
    orderBy: { createdAt: "asc" },
    include: {
      missions: {
        orderBy: { createdAt: "asc" },
        include: {
          tasks: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });
}
