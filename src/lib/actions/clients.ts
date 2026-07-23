"use server";

import * as z from "zod";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { auth, signIn } from "@/auth";

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
  const client = await prisma.client.findFirst({
    where: { id: clientId, vaId: session.user.id },
    include: { portalUser: { select: { id: true } } },
  });
  if (!client) {
    return { message: "Client introuvable." };
  }
  if (client.portalUser) {
    return { message: "Ce client a déjà un accès portail." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { message: "Un compte existe déjà avec cet email." };
  }

  await prisma.user.create({
    data: {
      email,
      name: client.name,
      role: "CLIENT",
      clientId: client.id,
    },
  });
  revalidatePath("/app");

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
