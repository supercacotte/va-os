"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { generateReport, setPortalReportsEnabled } from "@/lib/data/reports";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

async function requireVa() {
  const session = await auth();
  if (session?.user.role !== "VA") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function togglePortalReportsAction(formData: FormData) {
  const session = await requireVa();

  const clientId = formData.get("clientId");
  const enabled = formData.get("enabled");
  if (typeof clientId !== "string" || (enabled !== "true" && enabled !== "false")) return;

  await setPortalReportsEnabled(session.user.id, clientId, enabled === "true");
  revalidatePath("/app/rapports");
}

export type GenerateReportState = { error?: string; ok?: boolean } | undefined;

export async function generateReportAction(
  _state: GenerateReportState,
  formData: FormData,
): Promise<GenerateReportState> {
  const session = await requireVa();

  const clientId = formData.get("clientId");
  const month = formData.get("month");
  if (typeof clientId !== "string" || !clientId) return { error: "Choisis un client." };
  if (typeof month !== "string" || !MONTH_RE.test(month)) return { error: "Mois invalide." };

  const result = await generateReport(session.user.id, clientId, month);
  if ("error" in result) return { error: result.error };

  revalidatePath("/app/rapports");
  return { ok: true };
}
