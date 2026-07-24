import "server-only";

import { prisma } from "@/lib/prisma";
import { sanitizeStepsHtml } from "@/lib/sanitize";

// D22 : procédures rattachées au client. D12 : côté VA on filtre par vaId
// (via la relation client) ; côté portail on filtre par le compte connecté
// (relation portalUser) — jamais de clientId venant d'un paramètre.

const LIST_SELECT = {
  id: true,
  title: true,
  updatedAt: true,
} as const;

// --- Côté VA (/app) -------------------------------------------------------

export async function getProceduresForClient(vaId: string, clientId: string) {
  // Vérifie l'appartenance du client à la VA avant de lister.
  const client = await prisma.client.findFirst({
    where: { id: clientId, vaId },
    select: { id: true },
  });
  if (!client) return null;

  return prisma.procedure.findMany({
    where: { clientId, vaId },
    orderBy: { updatedAt: "desc" },
    select: LIST_SELECT,
  });
}

// Section fiche client : contenu inclus pour permettre aperçu et édition
// inline sans aller-retour (peu de procédures par client, données de la VA).
export async function getProceduresWithStepsForClient(vaId: string, clientId: string) {
  const client = await prisma.client.findFirst({
    where: { id: clientId, vaId },
    select: { id: true },
  });
  if (!client) return [];

  return prisma.procedure.findMany({
    where: { clientId, vaId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, steps: true, updatedAt: true },
  });
}

export async function createProcedureForVa(
  vaId: string,
  clientId: string,
  title: string,
  steps: string,
) {
  const client = await prisma.client.findFirst({
    where: { id: clientId, vaId },
    select: { id: true },
  });
  if (!client) return null;

  return prisma.procedure.create({
    data: { vaId, clientId, title, steps: sanitizeStepsHtml(steps) },
    select: { id: true, clientId: true },
  });
}

export async function updateProcedureForVa(
  vaId: string,
  procedureId: string,
  title: string,
  steps: string,
) {
  const { count } = await prisma.procedure.updateMany({
    where: { id: procedureId, vaId },
    data: { title, steps: sanitizeStepsHtml(steps) },
  });
  return count > 0;
}

export async function deleteProcedureForVa(vaId: string, procedureId: string) {
  const { count } = await prisma.procedure.deleteMany({
    where: { id: procedureId, vaId },
  });
  return count > 0;
}

// Duplique une procédure vers un autre client de la MÊME VA. Les deux
// appartenances (source et cible) sont vérifiées via le filtre vaId.
export async function duplicateProcedureForVa(
  vaId: string,
  procedureId: string,
  targetClientId: string,
) {
  const [source, target] = await Promise.all([
    prisma.procedure.findFirst({
      where: { id: procedureId, vaId },
      select: { title: true, steps: true },
    }),
    prisma.client.findFirst({
      where: { id: targetClientId, vaId },
      select: { id: true },
    }),
  ]);
  if (!source || !target) return null;

  return prisma.procedure.create({
    data: {
      vaId,
      clientId: targetClientId,
      title: source.title,
      steps: source.steps,
    },
    select: { id: true, clientId: true },
  });
}

// Clients de la VA pour le menu « Dupliquer vers… » (on exclut le client courant).
export async function getOtherClientsForVa(vaId: string, exceptClientId: string) {
  return prisma.client.findMany({
    where: { vaId, id: { not: exceptClientId } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

// --- Côté portail (client, lecture seule) ---------------------------------

// Étanchéité (D12) : on part du compte connecté (portalUser), jamais d'un
// clientId fourni. Un client ne peut donc voir que SES procédures.
export async function getProceduresForPortalUser(userId: string) {
  return prisma.procedure.findMany({
    where: { client: { portalUser: { id: userId } } },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, steps: true, updatedAt: true },
  });
}
