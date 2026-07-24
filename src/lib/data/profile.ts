import "server-only";

import { prisma } from "@/lib/prisma";

// D17 : le profil s'écrit uniquement pour la session courante (userId),
// et la lecture publique ne renvoie QUE les profils publiés (opt-in).

export type VaProfileInput = {
  displayName: string;
  headline: string | null;
  bio: string;
  specialties: string[];
  location: string | null;
  contactEmail: string | null;
  website: string | null;
  published: boolean;
};

export async function getVaProfile(userId: string) {
  return prisma.vaProfile.findUnique({ where: { userId } });
}

export async function upsertVaProfile(userId: string, data: VaProfileInput) {
  return prisma.vaProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

export async function getPublishedVaProfiles(query?: string) {
  const q = query?.trim();
  return prisma.vaProfile.findMany({
    where: {
      published: true,
      ...(q
        ? {
            OR: [
              { displayName: { contains: q, mode: "insensitive" } },
              { headline: { contains: q, mode: "insensitive" } },
              { bio: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
              { specialties: { hasSome: [q, q.toLowerCase()] } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      displayName: true,
      headline: true,
      bio: true,
      specialties: true,
      location: true,
      contactEmail: true,
      website: true,
    },
  });
}
