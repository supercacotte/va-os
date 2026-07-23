import "server-only";

import { prisma } from "@/lib/prisma";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createPortalUser(client: { id: string; name: string }, email: string) {
  return prisma.user.create({
    data: {
      email,
      name: client.name,
      role: "CLIENT",
      clientId: client.id,
    },
  });
}
