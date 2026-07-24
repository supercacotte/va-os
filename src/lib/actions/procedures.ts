"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { htmlHasTextContent } from "@/lib/sanitize";
import {
  createProcedureForVa,
  deleteProcedureForVa,
  duplicateProcedureForVa,
  updateProcedureForVa,
} from "@/lib/data/procedures";

const TitleSchema = z
  .string()
  .trim()
  .min(2, "Le titre de la procédure doit faire au moins 2 caractères.")
  .max(120, "Le titre est trop long (120 caractères max).");

export type ProcedureFormState = { error?: string; ok?: boolean } | undefined;

async function requireVa() {
  const session = await auth();
  if (session?.user.role !== "VA") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createProcedureAction(
  _state: ProcedureFormState,
  formData: FormData,
): Promise<ProcedureFormState> {
  const session = await requireVa();

  const clientId = formData.get("clientId");
  if (typeof clientId !== "string" || !clientId) return { error: "Client manquant." };

  const title = TitleSchema.safeParse(formData.get("title"));
  if (!title.success) return { error: title.error.issues[0].message };

  const steps = String(formData.get("steps") ?? "");
  if (!htmlHasTextContent(steps)) return { error: "La procédure est vide." };

  const created = await createProcedureForVa(session.user.id, clientId, title.data, steps);
  if (!created) return { error: "Client introuvable." };

  revalidatePath(`/app/clients/${clientId}`);
  return { ok: true };
}

export async function updateProcedureAction(
  _state: ProcedureFormState,
  formData: FormData,
): Promise<ProcedureFormState> {
  const session = await requireVa();

  const procedureId = formData.get("procedureId");
  const clientId = formData.get("clientId");
  if (typeof procedureId !== "string" || typeof clientId !== "string") {
    return { error: "Procédure manquante." };
  }

  const title = TitleSchema.safeParse(formData.get("title"));
  if (!title.success) return { error: title.error.issues[0].message };

  const steps = String(formData.get("steps") ?? "");
  if (!htmlHasTextContent(steps)) return { error: "La procédure est vide." };

  const updated = await updateProcedureForVa(session.user.id, procedureId, title.data, steps);
  if (!updated) return { error: "Procédure introuvable." };

  revalidatePath(`/app/clients/${clientId}`);
  return { ok: true };
}

export async function deleteProcedureAction(formData: FormData) {
  const session = await requireVa();

  const procedureId = formData.get("procedureId");
  const clientId = formData.get("clientId");
  if (typeof procedureId !== "string" || typeof clientId !== "string") return;

  await deleteProcedureForVa(session.user.id, procedureId);
  revalidatePath(`/app/clients/${clientId}`);
}

export async function duplicateProcedureAction(formData: FormData) {
  const session = await requireVa();

  const procedureId = formData.get("procedureId");
  const sourceClientId = formData.get("clientId");
  const targetClientId = formData.get("targetClientId");
  if (
    typeof procedureId !== "string" ||
    typeof sourceClientId !== "string" ||
    typeof targetClientId !== "string" ||
    !targetClientId
  ) {
    return;
  }

  const duplicated = await duplicateProcedureForVa(
    session.user.id,
    procedureId,
    targetClientId,
  );
  if (!duplicated) return;

  revalidatePath(`/app/clients/${sourceClientId}`);
  revalidatePath(`/app/clients/${targetClientId}`);
}
