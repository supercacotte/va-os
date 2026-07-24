"use client";

import { useActionState } from "react";

import { upsertProfileAction, type ProfileFormState } from "@/lib/actions/profile";
import { REGIONS } from "@/lib/regions";

type Profile = {
  displayName: string;
  headline: string | null;
  bio: string;
  specialties: string[];
  location: string | null;
  region: string | null;
  languages: string[];
  availability: string;
  availabilityNote: string | null;
  contactEmail: string | null;
  website: string | null;
  published: boolean;
} | null;

const FIELD =
  "w-full rounded-[10px] bg-paper px-4 py-3 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30";
const LABEL = "text-[13px] font-bold text-ink";
const ERROR = "text-xs font-semibold text-ink/70";

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(
    upsertProfileAction,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className={LABEL}>
          Nom affiché
        </label>
        <input
          id="displayName"
          name="displayName"
          required
          defaultValue={profile?.displayName ?? ""}
          placeholder="Julia Test"
          className={FIELD}
        />
        {state?.errors?.displayName && <p className={ERROR}>{state.errors.displayName[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="headline" className={LABEL}>
          Accroche <span className="font-medium opacity-60">(optionnel, 80 caractères)</span>
        </label>
        <input
          id="headline"
          name="headline"
          defaultValue={profile?.headline ?? ""}
          placeholder="VA spécialisée réseaux sociaux & admin"
          className={FIELD}
        />
        {state?.errors?.headline && <p className={ERROR}>{state.errors.headline[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className={LABEL}>
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          required
          rows={4}
          defaultValue={profile?.bio ?? ""}
          placeholder="Ce que tu fais, pour qui, comment tu travailles…"
          className={`${FIELD} resize-none`}
        />
        {state?.errors?.bio && <p className={ERROR}>{state.errors.bio[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="specialties" className={LABEL}>
          Spécialités{" "}
          <span className="font-medium opacity-60">(séparées par des virgules, 8 max)</span>
        </label>
        <input
          id="specialties"
          name="specialties"
          defaultValue={profile?.specialties.join(", ") ?? ""}
          placeholder="Réseaux sociaux, Admin, Newsletter"
          className={FIELD}
        />
        {state?.errors?.specialties && <p className={ERROR}>{state.errors.specialties[0]}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="location" className={LABEL}>
            Ville <span className="font-medium opacity-60">(optionnel)</span>
          </label>
          <input
            id="location"
            name="location"
            defaultValue={profile?.location ?? ""}
            placeholder="Lyon — full remote"
            className={FIELD}
          />
          {state?.errors?.location && <p className={ERROR}>{state.errors.location[0]}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="region" className={LABEL}>
            Région <span className="font-medium opacity-60">(pour la carte)</span>
          </label>
          <select
            id="region"
            name="region"
            defaultValue={profile?.region ?? ""}
            className={FIELD}
          >
            <option value="">—</option>
            {REGIONS.map((region) => (
              <option key={region.code} value={region.code}>
                {region.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="languages" className={LABEL}>
            Langues <span className="font-medium opacity-60">(FR, EN…)</span>
          </label>
          <input
            id="languages"
            name="languages"
            defaultValue={profile?.languages.join(", ") ?? ""}
            placeholder="FR, EN"
            className={FIELD}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contactEmail" className={LABEL}>
            Email de contact <span className="font-medium opacity-60">(public !)</span>
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={profile?.contactEmail ?? ""}
            placeholder="contact@tondomaine.fr"
            className={FIELD}
          />
          {state?.errors?.contactEmail && (
            <p className={ERROR}>{state.errors.contactEmail[0]}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="website" className={LABEL}>
          Site / portfolio <span className="font-medium opacity-60">(optionnel)</span>
        </label>
        <input
          id="website"
          name="website"
          defaultValue={profile?.website ?? ""}
          placeholder="tondomaine.fr"
          className={FIELD}
        />
        {state?.errors?.website && <p className={ERROR}>{state.errors.website[0]}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="availability" className={LABEL}>
            Disponibilité
          </label>
          <select
            id="availability"
            name="availability"
            defaultValue={profile?.availability ?? "available"}
            className={FIELD}
          >
            <option value="available">dispo maintenant ✓</option>
            <option value="full">complète (préciser à côté)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="availabilityNote" className={LABEL}>
            Précision <span className="font-medium opacity-60">(« dès sept. »…)</span>
          </label>
          <input
            id="availabilityNote"
            name="availabilityNote"
            defaultValue={profile?.availabilityNote ?? ""}
            placeholder="dès sept."
            className={FIELD}
          />
          {state?.errors?.availabilityNote && (
            <p className={ERROR}>{state.errors.availabilityNote[0]}</p>
          )}
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-[14px] bg-paper px-4 py-3">
        <input
          type="checkbox"
          name="published"
          defaultChecked={profile?.published ?? false}
          className="h-4 w-4 accent-ink"
        />
        <span className="text-[13px] font-bold text-ink">
          Publier mon profil dans l&apos;annuaire public
        </span>
      </label>
      <p className="-mt-2 text-xs font-medium text-ink opacity-60">
        Tant que cette case est décochée, personne ne voit ton profil. En la cochant, ton
        nom, ta bio et ton contact deviennent visibles par tous les visiteurs.
      </p>

      {state?.message && (
        <p className={`text-[13px] font-semibold text-ink ${state.ok ? "" : "opacity-70"}`}>
          {state.message}
        </p>
      )}

      <button
        disabled={pending}
        type="submit"
        className="self-start rounded-xl bg-orange px-5 py-3 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95 disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Enregistrer mon profil"}
      </button>
    </form>
  );
}
