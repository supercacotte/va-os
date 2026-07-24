"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  createTaskForVa,
  deleteTaskForVa,
  toggleTaskForVa,
  updateTaskForVa,
} from "@/lib/data/tasks";
import {
  createRecurringTaskForVa,
  stopRecurringTaskForVa,
} from "@/lib/data/recurring";

const TitleSchema = z
  .string()
  .trim()
  .min(2, "Le titre de la tâche doit faire au moins 2 caractères.");

export type TaskFormState = { error?: string } | undefined;

async function requireVa() {
  const session = await auth();
  if (session?.user.role !== "VA") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createTaskAction(
  _state: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const session = await requireVa();

  const missionId = formData.get("missionId");
  const clientId = formData.get("clientId");
  if (typeof missionId !== "string" || typeof clientId !== "string") {
    return { error: "Mission manquante." };
  }

  const title = TitleSchema.safeParse(formData.get("title"));
  if (!title.success) return { error: title.error.issues[0].message };

  // D16 : récurrence optionnelle à la création.
  const recurrence = formData.get("recurrence");
  if (recurrence === "weekly" || recurrence === "monthly") {
    const template = await createRecurringTaskForVa(
      session.user.id,
      missionId,
      title.data,
      recurrence,
    );
    if (!template) return { error: "Mission introuvable." };
  } else {
    const task = await createTaskForVa(session.user.id, missionId, title.data);
    if (!task) return { error: "Mission introuvable." };
  }

  revalidatePath("/app");
  revalidatePath(`/app/clients/${clientId}`);
  return undefined;
}

export async function stopRecurringAction(formData: FormData) {
  const session = await requireVa();

  const recurringTaskId = formData.get("recurringTaskId");
  const clientId = formData.get("clientId");
  if (typeof recurringTaskId !== "string" || typeof clientId !== "string") return;

  await stopRecurringTaskForVa(session.user.id, recurringTaskId);
  revalidatePath("/app");
  revalidatePath(`/app/clients/${clientId}`);
}

export async function renameTaskAction(
  _state: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const session = await requireVa();

  const taskId = formData.get("taskId");
  const clientId = formData.get("clientId");
  if (typeof taskId !== "string" || typeof clientId !== "string") {
    return { error: "Tâche manquante." };
  }

  const title = TitleSchema.safeParse(formData.get("title"));
  if (!title.success) return { error: title.error.issues[0].message };

  const updated = await updateTaskForVa(session.user.id, taskId, { title: title.data });
  if (!updated) return { error: "Tâche introuvable." };

  revalidatePath("/app");
  revalidatePath(`/app/clients/${clientId}`);
  return undefined;
}

export async function toggleTaskAction(formData: FormData) {
  const session = await requireVa();

  const taskId = formData.get("taskId");
  const clientId = formData.get("clientId");
  if (typeof taskId !== "string" || typeof clientId !== "string") return;

  await toggleTaskForVa(session.user.id, taskId);
  revalidatePath("/app");
  revalidatePath(`/app/clients/${clientId}`);
}

export async function deleteTaskAction(formData: FormData) {
  const session = await requireVa();

  const taskId = formData.get("taskId");
  const clientId = formData.get("clientId");
  if (typeof taskId !== "string" || typeof clientId !== "string") return;

  await deleteTaskForVa(session.user.id, taskId);
  revalidatePath("/app");
  revalidatePath(`/app/clients/${clientId}`);
}
