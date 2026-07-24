"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateUserSettings } from "@/lib/data/settings";

export type AccountFormState = { message?: string; ok?: boolean } | undefined;

const TIMEZONES = ["Europe/Paris", "Europe/Brussels", "Europe/Zurich", "America/Montreal", "Indian/Reunion", "Pacific/Noumea"];
const ROUNDINGS = ["none", "quarter", "half"];
const WEEK_STARTS = ["monday", "sunday"];
const LOCALES = ["fr", "en"];

// Notifications + préférences (un seul « Enregistrer », maquette 30b).
export async function updateSettingsAction(
  _state: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const session = await auth();
  if (session?.user.role !== "VA") return { message: "Accès refusé." };

  const pick = (name: string, allowed: string[], fallback: string) => {
    const value = String(formData.get(name) ?? "");
    return allowed.includes(value) ? value : fallback;
  };

  await updateUserSettings(session.user.id, {
    notifyClientRequest: formData.get("notifyClientRequest") === "on",
    notifyDirectoryContact: formData.get("notifyDirectoryContact") === "on",
    notifyLongTimer: formData.get("notifyLongTimer") === "on",
    notifyWeeklyDigest: formData.get("notifyWeeklyDigest") === "on",
    timezone: pick("timezone", TIMEZONES, "Europe/Paris"),
    timerRounding: pick("timerRounding", ROUNDINGS, "quarter"),
    weekStart: pick("weekStart", WEEK_STARTS, "monday"),
    locale: pick("locale", LOCALES, "fr"),
  });

  revalidatePath("/app/profil/compte");
  return { ok: true, message: "Réglages enregistrés." };
}

const PasswordSchema = z.object({
  newPassword: z.string().min(8, "8 caractères minimum."),
  confirm: z.string(),
});

export async function changePasswordAction(
  _state: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const session = await auth();
  if (!session?.user) return { message: "Accès refusé." };

  const validated = PasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirm: formData.get("confirm"),
  });
  if (!validated.success) {
    return { message: z.flattenError(validated.error).fieldErrors.newPassword?.[0] ?? "Mot de passe invalide." };
  }
  if (validated.data.newPassword !== validated.data.confirm) {
    return { message: "Les deux mots de passe ne correspondent pas." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });
  if (!user) return { message: "Compte introuvable." };

  // Si un mot de passe existe déjà, l'ancien est exigé.
  if (user.password) {
    const current = String(formData.get("currentPassword") ?? "");
    if (!current || !(await bcrypt.compare(current, user.password))) {
      return { message: "Mot de passe actuel incorrect." };
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: await bcrypt.hash(validated.data.newPassword, 10) },
  });

  return { ok: true, message: "Mot de passe changé ✓" };
}

// Zone sensible : retire la fiche de l'annuaire (l'espace continue de tourner).
export async function unpublishProfileAction(): Promise<void> {
  const session = await auth();
  if (session?.user.role !== "VA") return;

  await prisma.vaProfile.updateMany({
    where: { userId: session.user.id },
    data: { published: false },
  });

  revalidatePath("/app/profil/compte");
  revalidatePath("/app/profil");
  revalidatePath("/annuaire");
}

// Zone sensible : suppression définitive. Le mot « SUPPRIMER » est exigé côté
// serveur aussi — pas seulement dans l'UI.
export async function deleteAccountAction(
  _state: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const session = await auth();
  if (session?.user.role !== "VA") return { message: "Accès refusé." };

  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "SUPPRIMER") {
    return { message: "Écris SUPPRIMER pour confirmer." };
  }

  // Supprime aussi les comptes portail des clientes (sinon orphelins),
  // puis le compte VA — clients/missions/tâches/temps suivent en cascade.
  await prisma.$transaction([
    prisma.user.deleteMany({
      where: { role: "CLIENT", client: { vaId: session.user.id } },
    }),
    prisma.user.delete({ where: { id: session.user.id } }),
  ]);

  await signOut({ redirectTo: "/" });
  return { ok: true };
}
