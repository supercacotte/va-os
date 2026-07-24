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
  region: string | null;
  languages: string[];
  availability: string;
  availabilityNote: string | null;
  contactEmail: string | null;
  website: string | null;
  published: boolean;
};

export type DirectoryFilters = {
  q?: string;
  ville?: string;
  specialties?: string[];
  dispo?: boolean;
  region?: string;
};

const PUBLIC_SELECT = {
  id: true,
  displayName: true,
  headline: true,
  bio: true,
  specialties: true,
  location: true,
  region: true,
  languages: true,
  availability: true,
  availabilityNote: true,
  contactEmail: true,
  website: true,
} as const;

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

export async function getPublishedVaProfiles(filters: DirectoryFilters = {}) {
  const q = filters.q?.trim();
  const ville = filters.ville?.trim();

  return prisma.vaProfile.findMany({
    where: {
      published: true,
      ...(filters.region ? { region: filters.region } : {}),
      ...(filters.dispo ? { availability: "available" } : {}),
      ...(ville ? { location: { contains: ville, mode: "insensitive" } } : {}),
      ...(filters.specialties?.length
        ? { specialties: { hasSome: filters.specialties } }
        : {}),
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
    select: PUBLIC_SELECT,
  });
}

export async function getPublishedVaProfileById(id: string) {
  return prisma.vaProfile.findFirst({
    where: { id, published: true },
    select: PUBLIC_SELECT,
  });
}

// Agrégats pour la sidebar (spécialités fréquentes) et la carte (par région).
export async function getDirectoryAggregates() {
  const profiles = await prisma.vaProfile.findMany({
    where: { published: true },
    select: { specialties: true, region: true },
  });

  const specialtyCounts = new Map<string, number>();
  const regionCounts = new Map<string, number>();
  for (const profile of profiles) {
    for (const specialty of profile.specialties) {
      specialtyCounts.set(specialty, (specialtyCounts.get(specialty) ?? 0) + 1);
    }
    if (profile.region) {
      regionCounts.set(profile.region, (regionCounts.get(profile.region) ?? 0) + 1);
    }
  }

  return {
    total: profiles.length,
    topSpecialties: Array.from(specialtyCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name),
    regionCounts: Object.fromEntries(regionCounts),
  };
}
