"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { upsertVaProfile } from "@/lib/data/profile";

const ProfileSchema = z.object({
  displayName: z.string().trim().min(2, "Le nom affiché doit faire au moins 2 caractères."),
  headline: z
    .string()
    .trim()
    .max(80, "L'accroche est trop longue (80 caractères max).")
    .transform((v) => v || null),
  bio: z
    .string()
    .trim()
    .min(20, "Présente-toi en quelques phrases (20 caractères minimum).")
    .max(600, "La bio est trop longue (600 caractères max)."),
  specialties: z
    .string()
    .trim()
    .transform((v) =>
      v
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 8),
    ),
  location: z
    .string()
    .trim()
    .max(60, "La localisation est trop longue.")
    .transform((v) => v || null),
  contactEmail: z
    .string()
    .trim()
    .transform((v) => v || null)
    .pipe(z.email("Adresse email invalide.").nullable()),
  website: z
    .string()
    .trim()
    .transform((v) => (v && !/^https?:\/\//.test(v) ? `https://${v}` : v || null))
    .pipe(z.url("URL invalide.").nullable()),
  region: z
    .string()
    .trim()
    .transform((v) => v || null),
  languages: z
    .string()
    .trim()
    .transform((v) =>
      v
        .split(",")
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean)
        .slice(0, 5),
    ),
  availabilityNote: z
    .string()
    .trim()
    .max(40, "La note de disponibilité est trop longue (40 caractères max).")
    .transform((v) => v || null),
});

export type ProfileFormState =
  | {
      errors?: Partial<Record<keyof z.infer<typeof ProfileSchema>, string[]>>;
      message?: string;
      ok?: boolean;
    }
  | undefined;

export async function upsertProfileAction(
  _state: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await auth();
  if (session?.user.role !== "VA") {
    return { message: "Accès refusé." };
  }

  const validated = ProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    headline: formData.get("headline") ?? "",
    bio: formData.get("bio"),
    specialties: formData.get("specialties") ?? "",
    location: formData.get("location") ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
    website: formData.get("website") ?? "",
    region: formData.get("region") ?? "",
    languages: formData.get("languages") ?? "",
    availabilityNote: formData.get("availabilityNote") ?? "",
  });
  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors };
  }

  await upsertVaProfile(session.user.id, {
    ...validated.data,
    availability: formData.get("availability") === "full" ? "full" : "available",
    published: formData.get("published") === "on",
  });

  revalidatePath("/app/profil");
  revalidatePath("/annuaire");
  return { ok: true, message: "Profil enregistré." };
}
