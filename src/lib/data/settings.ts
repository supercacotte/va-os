import "server-only";

import { prisma } from "@/lib/prisma";

// Réglages privés de l'appli (maquette 30b) — un enregistrement par user,
// créé à la volée avec les valeurs par défaut du schéma.

export type UserSettingsInput = {
  notifyClientRequest: boolean;
  notifyDirectoryContact: boolean;
  notifyLongTimer: boolean;
  notifyWeeklyDigest: boolean;
  timezone: string;
  timerRounding: string;
  weekStart: string;
  locale: string;
};

export async function getUserSettings(userId: string) {
  return prisma.userSettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function updateUserSettings(userId: string, data: UserSettingsInput) {
  return prisma.userSettings.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

export async function getAccountInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, password: true },
  });
  if (!user) return null;
  return { email: user.email, hasPassword: Boolean(user.password) };
}
