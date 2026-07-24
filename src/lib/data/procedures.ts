import "server-only";

import { prisma } from "@/lib/prisma";
import { sanitizeStepsHtml } from "@/lib/sanitize";

// D22 : procédures rattachées au client. D12 : côté VA on filtre par vaId
// (via la relation client) ; côté portail on filtre par le compte connecté
// (relation portalUser) — jamais de clientId venant d'un paramètre.

export type ProcedureInput = {
  title: string;
  steps: string;
  cadence: string | null;
  estimatedMinutes: number | null;
  visibleToClient: boolean;
};

const CARD_SELECT = {
  id: true,
  title: true,
  steps: true,
  cadence: true,
  estimatedMinutes: true,
  visibleToClient: true,
  updatedAt: true,
} as const;

// --- Côté VA (/app) -------------------------------------------------------

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
    select: CARD_SELECT,
  });
}

export async function createProcedureForVa(
  vaId: string,
  clientId: string,
  data: ProcedureInput,
) {
  const client = await prisma.client.findFirst({
    where: { id: clientId, vaId },
    select: { id: true },
  });
  if (!client) return null;

  return prisma.procedure.create({
    data: {
      vaId,
      clientId,
      title: data.title,
      steps: sanitizeStepsHtml(data.steps),
      cadence: data.cadence,
      estimatedMinutes: data.estimatedMinutes,
      visibleToClient: data.visibleToClient,
    },
    select: { id: true, clientId: true },
  });
}

export async function updateProcedureForVa(
  vaId: string,
  procedureId: string,
  data: ProcedureInput,
) {
  const { count } = await prisma.procedure.updateMany({
    where: { id: procedureId, vaId },
    data: {
      title: data.title,
      steps: sanitizeStepsHtml(data.steps),
      cadence: data.cadence,
      estimatedMinutes: data.estimatedMinutes,
      visibleToClient: data.visibleToClient,
    },
  });
  return count > 0;
}

// Bascule la visibilité portail d'une procédure (toggle « portail », 33a).
export async function setProcedureVisibilityForVa(
  vaId: string,
  procedureId: string,
  visibleToClient: boolean,
) {
  const { count } = await prisma.procedure.updateMany({
    where: { id: procedureId, vaId },
    data: { visibleToClient },
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
      select: {
        title: true,
        steps: true,
        cadence: true,
        estimatedMinutes: true,
        visibleToClient: true,
      },
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
      cadence: source.cadence,
      estimatedMinutes: source.estimatedMinutes,
      visibleToClient: source.visibleToClient,
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
// clientId fourni. Le client ne voit que SES procédures ET seulement celles
// marquées visibles sur le portail (33a).
export async function getProceduresForPortalUser(userId: string) {
  return prisma.procedure.findMany({
    where: {
      visibleToClient: true,
      client: { portalUser: { id: userId } },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      steps: true,
      cadence: true,
      estimatedMinutes: true,
      updatedAt: true,
    },
  });
}
