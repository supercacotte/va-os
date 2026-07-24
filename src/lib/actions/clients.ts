"use server";

import * as z from "zod";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";
import {
  createClientForVa,
  deleteClientForVa,
  getOwnedClientWithPortal,
  updateClientForVa,
} from "@/lib/data/clients";
import {
  createPortalUser,
  findUserByEmail,
  revokePortalUserForVa,
} from "@/lib/data/users";

const ClientSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit faire au moins 2 caractères."),
  company: z
    .string()
    .trim()
    .max(120, "Le nom de l'entreprise est trop long (120 caractères max).")
    .transform((value) => value || null),
});

export type ClientFormState =
  | {
      errors?: { name?: string[]; company?: string[] };
      message?: string;
    }
  | undefined;

async function requireVa() {
  const session = await auth();
  if (session?.user.role !== "VA") {
    throw new Error("Unauthorized");
  }
  return session;
}

function parseClientForm(formData: FormData) {
  const validated = ClientSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company") ?? "",
  });
  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors };
  }
  return { data: validated.data };
}

export async function createClientAction(
  _state: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const session = await requireVa();

  const parsed = parseClientForm(formData);
  if (parsed.errors) return { errors: parsed.errors };

  const client = await createClientForVa(session.user.id, parsed.data);
  revalidatePath("/app");
  redirect(`/app/clients/${client.id}`);
}

export async function updateClientAction(
  clientId: string,
  _state: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const session = await requireVa();

  const parsed = parseClientForm(formData);
  if (parsed.errors) return { errors: parsed.errors };

  const updated = await updateClientForVa(session.user.id, clientId, parsed.data);
  if (!updated) return { message: "Client introuvable." };

  revalidatePath("/app");
  return { message: "Modifications enregistrées." };
}

export async function deleteClientAction(formData: FormData) {
  const session = await requireVa();
  const clientId = formData.get("clientId");
  if (typeof clientId !== "string" || !clientId) return;

  await deleteClientForVa(session.user.id, clientId);
  revalidatePath("/app");
  redirect("/app/clients");
}

const InviteSchema = z.object({
  clientId: z.string().min(1),
  email: z.email("Adresse email invalide.").trim(),
});

export type InviteClientState = { ok?: boolean; message?: string } | undefined;

// Les comptes CLIENT n'existent que par invitation : la VA rattache un email
// à un de SES clients, le compte est créé avec le rôle CLIENT et reçoit un
// magic link. Pas d'inscription libre côté client.
export async function inviteClientUser(
  _state: InviteClientState,
  formData: FormData,
): Promise<InviteClientState> {
  const session = await auth();
  if (session?.user.role !== "VA") {
    return { message: "Accès refusé." };
  }

  const validated = InviteSchema.safeParse({
    clientId: formData.get("clientId"),
    email: formData.get("email"),
  });
  if (!validated.success) {
    return { message: z.flattenError(validated.error).fieldErrors.email?.[0] ?? "Formulaire invalide." };
  }

  const { clientId, email } = validated.data;

  // D12 : vérification de propriété de la ressource avant toute mutation.
  const client = await getOwnedClientWithPortal(session.user.id, clientId);
  if (!client) {
    return { message: "Client introuvable." };
  }
  if (client.portalUser) {
    return { message: "Ce client a déjà un accès portail." };
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return { message: "Un compte existe déjà avec cet email." };
  }

  await createPortalUser(client, email);
  revalidatePath(`/app/clients/${clientId}`);

  try {
    await signIn("resend", { email, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: true,
        message: "Compte créé, mais l'email d'invitation n'est pas parti (Resend configuré ?).",
      };
    }
    throw error;
  }

  return { ok: true, message: `Invitation envoyée à ${email}.` };
}

// Révoque l'accès du client à son portail (supprime son compte). Réversible :
// la VA peut réinviter le même email ensuite.
export async function revokePortalAccess(formData: FormData) {
  const session = await auth();
  if (session?.user.role !== "VA") return;

  const clientId = formData.get("clientId");
  if (typeof clientId !== "string" || !clientId) return;

  await revokePortalUserForVa(session.user.id, clientId);
  revalidatePath(`/app/clients/${clientId}`);
}
