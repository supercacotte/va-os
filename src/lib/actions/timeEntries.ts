"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  deleteTimeEntryForVa,
  startTimeEntryForVa,
  stopActiveTimeEntryForVa,
  updateTimeEntryForVa,
} from "@/lib/data/timeEntries";

async function requireVa() {
  const session = await auth();
  if (session?.user.role !== "VA") {
    throw new Error("Unauthorized");
  }
  return session;
}

function revalidateTimerPaths(clientId?: string) {
  revalidatePath("/app/temps");
  revalidatePath("/app");
  if (clientId) revalidatePath(`/app/clients/${clientId}`);
}

export type TimerFormState = { error?: string } | undefined;

export async function startTimerAction(
  _state: TimerFormState,
  formData: FormData,
): Promise<TimerFormState> {
  const session = await requireVa();

  const taskId = formData.get("taskId");
  if (typeof taskId !== "string" || !taskId) return { error: "Choisis une tâche." };

  const labelRaw = formData.get("label");
  const label =
    typeof labelRaw === "string" && labelRaw.trim() ? labelRaw.trim().slice(0, 200) : null;

  const entry = await startTimeEntryForVa(session.user.id, taskId, label);
  if (!entry) return { error: "Tâche introuvable." };

  const clientId = formData.get("clientId");
  revalidateTimerPaths(typeof clientId === "string" ? clientId : undefined);
  return undefined;
}

// Variante sans état pour le bouton ▶ des lignes de tâches.
export async function quickStartTimerAction(formData: FormData) {
  const session = await requireVa();

  const taskId = formData.get("taskId");
  if (typeof taskId !== "string" || !taskId) return;

  await startTimeEntryForVa(session.user.id, taskId, null);

  const clientId = formData.get("clientId");
  revalidateTimerPaths(typeof clientId === "string" ? clientId : undefined);
}

export async function stopTimerAction(formData: FormData) {
  const session = await requireVa();

  await stopActiveTimeEntryForVa(session.user.id);

  const clientId = formData.get("clientId");
  revalidateTimerPaths(typeof clientId === "string" ? clientId : undefined);
}

const DATETIME_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const UpdateEntrySchema = z.object({
  entryId: z.string().min(1),
  taskId: z.string().min(1, "Choisis une tâche."),
  label: z
    .string()
    .trim()
    .max(200, "Le label est trop long (200 caractères max).")
    .transform((value) => value || null),
  startedAt: z.string().regex(DATETIME_LOCAL, "Date de début invalide."),
  durationMin: z.coerce
    .number()
    .int("Durée invalide.")
    .min(1, "La durée minimale est d'une minute.")
    .max(1440, "Une entrée ne peut pas dépasser 24 h."),
  tzOffset: z.coerce.number().int().min(-840).max(840),
});

export type EditEntryState = { error?: string; ok?: boolean } | undefined;

export async function updateTimeEntryAction(
  _state: EditEntryState,
  formData: FormData,
): Promise<EditEntryState> {
  const session = await requireVa();

  const validated = UpdateEntrySchema.safeParse({
    entryId: formData.get("entryId"),
    taskId: formData.get("taskId"),
    label: formData.get("label") ?? "",
    startedAt: formData.get("startedAt"),
    durationMin: formData.get("durationMin"),
    tzOffset: formData.get("tzOffset"),
  });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { entryId, taskId, label, durationMin, tzOffset } = validated.data;
  // datetime-local envoie l'heure murale locale sans fuseau ; tzOffset
  // (getTimezoneOffset du navigateur) permet de retomber sur l'instant UTC
  // exact quel que soit le fuseau du serveur.
  const startedAt = new Date(
    Date.parse(`${validated.data.startedAt}:00Z`) + tzOffset * 60_000,
  );
  const endedAt = new Date(startedAt.getTime() + durationMin * 60_000);

  const updated = await updateTimeEntryForVa(session.user.id, entryId, {
    label,
    taskId,
    startedAt,
    endedAt,
  });
  if (!updated) return { error: "Entrée introuvable." };

  revalidateTimerPaths();
  return { ok: true };
}

export async function deleteTimeEntryAction(formData: FormData) {
  const session = await requireVa();

  const entryId = formData.get("entryId");
  if (typeof entryId !== "string" || !entryId) return;

  await deleteTimeEntryForVa(session.user.id, entryId);
  revalidateTimerPaths();
}
