import "server-only";

import { prisma } from "@/lib/prisma";

// D12 : le tenant (vaId) est vérifié dans la clause where de chaque fonction,
// via la relation client pour les missions.

export async function createMissionForVa(vaId: string, clientId: string, name: string) {
  const client = await prisma.client.findFirst({
    where: { id: clientId, vaId },
    select: { id: true },
  });
  if (!client) return null;

  return prisma.mission.create({ data: { clientId, name } });
}

export async function updateMissionForVa(
  vaId: string,
  missionId: string,
  data: { name?: string; status?: string },
) {
  const { count } = await prisma.mission.updateMany({
    where: { id: missionId, client: { vaId } },
    data,
  });
  return count > 0;
}

export async function deleteMissionForVa(vaId: string, missionId: string) {
  const { count } = await prisma.mission.deleteMany({
    where: { id: missionId, client: { vaId } },
  });
  return count > 0;
}
