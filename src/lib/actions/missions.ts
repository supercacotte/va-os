"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  createMissionForVa,
  deleteMissionForVa,
  updateMissionForVa,
} from "@/lib/data/missions";

const NameSchema = z
  .string()
  .trim()
  .min(2, "Le nom de la mission doit faire au moins 2 caractères.");

export type MissionFormState = { error?: string } | undefined;

async function requireVa() {
  const session = await auth();
  if (session?.user.role !== "VA") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createMissionAction(
  _state: MissionFormState,
  formData: FormData,
): Promise<MissionFormState> {
  const session = await requireVa();

  const clientId = formData.get("clientId");
  if (typeof clientId !== "string" || !clientId) return { error: "Client manquant." };

  const name = NameSchema.safeParse(formData.get("name"));
  if (!name.success) return { error: name.error.issues[0].message };

  const mission = await createMissionForVa(session.user.id, clientId, name.data);
  if (!mission) return { error: "Client introuvable." };

  revalidatePath(`/app/clients/${clientId}`);
  return undefined;
}

export async function renameMissionAction(
  _state: MissionFormState,
  formData: FormData,
): Promise<MissionFormState> {
  const session = await requireVa();

  const missionId = formData.get("missionId");
  const clientId = formData.get("clientId");
  if (typeof missionId !== "string" || typeof clientId !== "string") {
    return { error: "Mission manquante." };
  }

  const name = NameSchema.safeParse(formData.get("name"));
  if (!name.success) return { error: name.error.issues[0].message };

  const updated = await updateMissionForVa(session.user.id, missionId, { name: name.data });
  if (!updated) return { error: "Mission introuvable." };

  revalidatePath(`/app/clients/${clientId}`);
  return undefined;
}

export async function setMissionStatusAction(formData: FormData) {
  const session = await requireVa();

  const missionId = formData.get("missionId");
  const clientId = formData.get("clientId");
  const status = formData.get("status");
  if (
    typeof missionId !== "string" ||
    typeof clientId !== "string" ||
    (status !== "active" && status !== "done")
  ) {
    return;
  }

  await updateMissionForVa(session.user.id, missionId, { status });
  revalidatePath(`/app/clients/${clientId}`);
}

export async function deleteMissionAction(formData: FormData) {
  const session = await requireVa();

  const missionId = formData.get("missionId");
  const clientId = formData.get("clientId");
  if (typeof missionId !== "string" || typeof clientId !== "string") return;

  await deleteMissionForVa(session.user.id, missionId);
  revalidatePath(`/app/clients/${clientId}`);
}
