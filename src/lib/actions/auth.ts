"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import { sendEmail } from "@/lib/mailer";
import { verifyEmailHtml } from "@/lib/email-templates";

// L'inscription libre crée toujours une VA (défaut du schéma). Les comptes
// CLIENT sont créés par invitation de la VA (phase 1), jamais ici.
// Maquette signin : prénom + email + mot de passe, rien d'autre.
const SignupSchema = z.object({
  name: z.string().trim().min(2, "Le prénom doit faire au moins 2 caractères."),
  email: z.email("Adresse email invalide.").trim(),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères."),
});

async function sendAccountVerificationEmail(email: string) {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  const host = (await headers()).get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const verifyUrl = `${protocol}://${host}/api/verifier-email?token=${token}`;

  try {
    await sendEmail({
      to: email,
      subject: "Confirme ton adresse email VA Desk",
      html: verifyEmailHtml(verifyUrl),
      text: `Confirme ton adresse email : ${verifyUrl}`,
    });
  } catch (error) {
    console.error("Failed to send account verification email", error);
  }
}

export type SignupState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string;
} | undefined;

export async function signup(_state: SignupState, formData: FormData): Promise<SignupState> {
  const validatedFields = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: z.flattenError(validatedFields.error).fieldErrors };
  }

  const { name, email, password } = validatedFields.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: ["Un compte existe déjà avec cet email."] } };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  await sendAccountVerificationEmail(email);

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Compte créé, mais la connexion automatique a échoué. Connecte-toi manuellement." };
    }
    throw error;
  }
}

export type LoginState = { message?: string } | undefined;

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Email ou mot de passe incorrect." };
    }
    throw error;
  }
}

export type MagicLinkState = { status: "idle" | "sent"; message?: string };

export async function loginWithMagicLink(
  _state: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  const email = formData.get("email");
  if (typeof email !== "string" || !email) {
    return { status: "idle", message: "Adresse email invalide." };
  }

  try {
    await signIn("resend", { email, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "idle", message: "Impossible d'envoyer le lien magique. Réessaie." };
    }
    throw error;
  }

  return { status: "sent" };
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
