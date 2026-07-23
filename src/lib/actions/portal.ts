"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { createPortalRequest } from "@/lib/data/portal";

const TitleSchema = z
  .string()
  .trim()
  .min(3, "Décris ta demande en quelques mots (3 caractères minimum).")
  .max(200, "Garde ta demande courte (200 caractères max) — les détails par email !");

export type PortalRequestState = { error?: string; ok?: boolean } | undefined;

export async function createRequestAction(
  _state: PortalRequestState,
  formData: FormData,
): Promise<PortalRequestState> {
  const session = await auth();
  if (session?.user.role !== "CLIENT") {
    return { error: "Accès refusé." };
  }

  const title = TitleSchema.safeParse(formData.get("title"));
  if (!title.success) return { error: title.error.issues[0].message };

  const task = await createPortalRequest(session.user.id, title.data);
  if (!task) return { error: "Compte portail introuvable." };

  revalidatePath("/portail/demandes");
  revalidatePath("/portail");
  return { ok: true };
}
