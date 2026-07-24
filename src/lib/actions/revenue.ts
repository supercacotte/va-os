"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { updateClientHourlyRateForVa } from "@/lib/data/revenue";

export type RateFormState = { error?: string; ok?: boolean } | undefined;

// Taux horaire d'un client (bloc CA, maquette 32a) : entier 1-9999 €/h, ou
// vide pour le retirer.
export async function updateClientHourlyRate(
  _state: RateFormState,
  formData: FormData,
): Promise<RateFormState> {
  const session = await auth();
  if (session?.user.role !== "VA") return { error: "Accès refusé." };

  const clientId = formData.get("clientId");
  if (typeof clientId !== "string" || !clientId) return { error: "Client manquant." };

  const raw = String(formData.get("hourlyRate") ?? "").replace(/[^0-9]/g, "");
  const hourlyRate = raw ? Math.min(Number(raw), 9999) : null;

  const updated = await updateClientHourlyRateForVa(session.user.id, clientId, hourlyRate);
  if (!updated) return { error: "Client introuvable." };

  revalidatePath(`/app/clients/${clientId}`);
  return { ok: true };
}
