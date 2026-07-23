import "server-only";

import { prisma } from "@/lib/prisma";

export async function getAdminOverview() {
  const [vaCount, clientAccountCount, clientCount, missionCount] = await Promise.all([
    prisma.user.count({ where: { role: "VA" } }),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.client.count(),
    prisma.mission.count(),
  ]);

  return { vaCount, clientAccountCount, clientCount, missionCount };
}
