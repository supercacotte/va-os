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

// Révoque l'accès portail d'un client : supprime le compte CLIENT rattaché.
// D12 : on ne supprime que si le client appartient à la VA (filtre via la
// relation). Les données métier (client, missions, tâches…) appartiennent au
// Client, pas au User — rien n'est perdu, l'email redevient réinvitable.
export async function revokePortalUserForVa(vaId: string, clientId: string) {
  const { count } = await prisma.user.deleteMany({
    where: { role: "CLIENT", client: { id: clientId, vaId } },
  });
  return count > 0;
}
