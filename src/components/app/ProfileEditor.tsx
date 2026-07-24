"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";

import { upsertProfileAction, type ProfileFormState } from "@/lib/actions/profile";
import { REGIONS } from "@/lib/regions";
import VaAvatar from "@/components/annuaire/VaAvatar";

type Profile = {
  id: string;
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
  hourlyRate: number | null;
  capacityNote: string | null;
  showStats: boolean;
  published: boolean;
  updatedAt: string;
} | null;

type Stats = { clientCount: number; missionCount: number; hoursTracked: number };

const FIELD =
  "w-full rounded-[10px] bg-sand px-4 py-3 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30";
const LABEL = "text-[13px] font-bold text-ink";
const SECTION = "text-[13px] font-bold uppercase tracking-[1.5px] text-ink";
const CARD = "rounded-[18px] bg-paper p-6 shadow-sticker ring-1 ring-ink/5";
const ERROR = "text-xs font-semibold text-ink/70";

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border-2 transition ${
        checked ? "border-ink bg-lime" : "border-ink/30 bg-paper"
      }`}
    >
      <span
        className={`absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full transition-all ${
          checked ? "left-[calc(100%-20px)] bg-ink" : "left-0.5 bg-ink/30"
        }`}
      />
    </button>
  );
}

function daysAgo(iso: string) {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  return `il y a ${days} jours`;
}

// Éditeur « Ma fiche publique » (maquette 30a) : formulaire en sections à
// gauche, aperçu annuaire EN DIRECT + stats auto à droite. Un seul submit.
export default function ProfileEditor({
  profile,
  stats,
}: {
  profile: Profile;
  stats: Stats;
}) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(
    upsertProfileAction,
    undefined,
  );

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [headline, setHeadline] = useState(profile?.headline ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [languages, setLanguages] = useState(profile?.languages.join(", ") ?? "");
  const [available, setAvailable] = useState((profile?.availability ?? "available") === "available");
  const [availabilityNote, setAvailabilityNote] = useState(profile?.availabilityNote ?? "");
  const [specialties, setSpecialties] = useState<string[]>(profile?.specialties ?? []);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [published, setPublished] = useState(profile?.published ?? false);
  const [showStats, setShowStats] = useState(profile?.showStats ?? true);

  function addSpecialty() {
    const value = newSpecialty.trim();
    if (!value || specialties.length >= 8) return;
    if (specialties.some((item) => item.toLowerCase() === value.toLowerCase())) return;
    setSpecialties([...specialties, value]);
    setNewSpecialty("");
  }

  return (
    <form action={action} className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_400px]">
      {/* Champs contrôlés soumis en hidden */}
      <input type="hidden" name="specialties" value={specialties.join(", ")} />
      <input type="hidden" name="availability" value={available ? "available" : "full"} />
      {published && <input type="hidden" name="published" value="on" />}
      {showStats && <input type="hidden" name="showStats" value="on" />}

      <div className="flex flex-col gap-5">
        {/* Identité */}
        <section className={CARD}>
          <h2 className={SECTION}>Identité</h2>
          <div className="mt-4 flex flex-wrap items-start gap-5">
            <div className="flex flex-col items-center gap-2">
              <VaAvatar name={displayName || "VA"} />
              <p className="text-[11px] font-semibold text-ink opacity-50">initiales auto</p>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="displayName" className={LABEL}>
                  Nom affiché
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Julia Moreau"
                  className={FIELD}
                />
                {state?.errors?.displayName && (
                  <p className={ERROR}>{state.errors.displayName[0]}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="headline" className={LABEL}>
                  Accroche <span className="font-medium opacity-60">(80 caractères)</span>
                </label>
                <input
                  id="headline"
                  name="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Admin & orga pour solopreneurs débordés"
                  className={FIELD}
                />
                {state?.errors?.headline && <p className={ERROR}>{state.errors.headline[0]}</p>}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1.5">
            <label htmlFor="bio" className={LABEL}>
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              required
              rows={3}
              defaultValue={profile?.bio ?? ""}
              placeholder="Ce que tu fais, pour qui, comment tu travailles…"
              className={`${FIELD} resize-none`}
            />
            {state?.errors?.bio && <p className={ERROR}>{state.errors.bio[0]}</p>}
          </div>
        </section>

        {/* Spécialités */}
        <section className={CARD}>
          <h2 className={SECTION}>Spécialités</h2>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {specialties.map((specialty) => (
              <span
                key={specialty}
                className="flex items-center gap-1.5 rounded-full bg-sand px-3 py-1.5 text-xs font-bold text-ink"
              >
                {specialty}
                <button
                  type="button"
                  aria-label={`Retirer ${specialty}`}
                  onClick={() => setSpecialties(specialties.filter((item) => item !== specialty))}
                  className="text-ink/50 transition hover:text-ink"
                >
                  ×
                </button>
              </span>
            ))}
            {specialties.length < 8 && (
              <span className="flex items-center gap-1.5 rounded-full border-2 border-dashed border-ink/30 py-0.5 pl-3 pr-1">
                <input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSpecialty();
                    }
                  }}
                  placeholder={`Ajouter (${specialties.length}/8)`}
                  className="w-28 bg-transparent text-xs font-semibold text-ink outline-none"
                />
                <button
                  type="button"
                  onClick={addSpecialty}
                  className="rounded-full bg-sand px-2 py-1 text-xs font-bold text-ink transition hover:bg-ink/10"
                >
                  +
                </button>
              </span>
            )}
          </div>
        </section>

        {/* Où et comment */}
        <section className={CARD}>
          <h2 className={SECTION}>Où et comment</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="location" className={LABEL}>
                Ville
              </label>
              <input
                id="location"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Nantes / remote"
                className={FIELD}
              />
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
                Langues
              </label>
              <input
                id="languages"
                name="languages"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
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
          <div className="mt-4 flex flex-col gap-1.5">
            <label htmlFor="website" className={LABEL}>
              Site / portfolio <span className="font-medium opacity-60">(optionnel)</span>
            </label>
            <input
              id="website"
              name="website"
              defaultValue={profile?.website ?? ""}
              placeholder="https://…"
              className={FIELD}
            />
            {state?.errors?.website && <p className={ERROR}>{state.errors.website[0]}</p>}
          </div>
        </section>

        {/* Conditions */}
        <section className={CARD}>
          <h2 className={SECTION}>Conditions</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="hourlyRate" className={LABEL}>
                Tarif horaire <span className="font-medium opacity-60">(fiche seulement)</span>
              </label>
              <input
                id="hourlyRate"
                name="hourlyRate"
                inputMode="numeric"
                defaultValue={profile?.hourlyRate ?? ""}
                placeholder="38 €/h"
                className={FIELD}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="capacityNote" className={LABEL}>
                Capacité restante
              </label>
              <input
                id="capacityNote"
                name="capacityNote"
                defaultValue={profile?.capacityNote ?? ""}
                placeholder="10 h/mois"
                className={FIELD}
              />
              {state?.errors?.capacityNote && (
                <p className={ERROR}>{state.errors.capacityNote[0]}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={LABEL}>Disponible</span>
              <div className="flex items-center gap-2.5 pt-2">
                <Switch checked={available} onChange={setAvailable} label="Disponible" />
                <input
                  name="availabilityNote"
                  value={availabilityNote}
                  onChange={(e) => setAvailabilityNote(e.target.value)}
                  placeholder={available ? "maintenant" : "dès août"}
                  className="w-24 rounded-[10px] bg-sand px-3 py-2 text-xs font-semibold text-ink outline-none transition focus:ring-2 focus:ring-ink/30"
                />
              </div>
              {state?.errors?.availabilityNote && (
                <p className={ERROR}>{state.errors.availabilityNote[0]}</p>
              )}
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button
            disabled={pending}
            type="submit"
            className="rounded-xl bg-orange px-6 py-3 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95 disabled:opacity-60"
          >
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
          {profile && (
            <p className="text-[13px] font-medium text-ink opacity-60">
              Dernière modification {daysAgo(profile.updatedAt)}
            </p>
          )}
          {state?.ok && <p className="text-[13px] font-bold text-ink">Profil enregistré ✓</p>}
          {state?.message && !state.ok && (
            <p className="text-[13px] font-semibold text-ink opacity-70">{state.message}</p>
          )}
        </div>
      </div>

      {/* Sidebar : visibilité + aperçu live + stats auto */}
      <aside className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3 rounded-[18px] bg-sand px-5 py-4">
          <p className="text-[15px] font-bold text-ink">Visible dans l&apos;annuaire</p>
          <Switch checked={published} onChange={setPublished} label="Visible dans l'annuaire" />
        </div>

        <div className="rounded-[18px] bg-sand p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className={SECTION}>Aperçu dans l&apos;annuaire</h2>
            {profile && (
              <Link
                href={`/annuaire/${profile.id}`}
                className="shrink-0 text-xs font-semibold text-ink underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
              >
                Voir ma fiche →
              </Link>
            )}
          </div>

          <div className="mt-4 flex items-start gap-4 rounded-[16px] bg-paper p-4 shadow-sticker">
            <VaAvatar name={displayName || "VA"} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="truncate text-[15px] font-bold text-ink">
                  {displayName || "Ton nom"}
                </p>
                {available ? (
                  <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold text-ink">
                    dispo ✓
                  </span>
                ) : (
                  <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-bold text-ink">
                    complète{availabilityNote ? ` — ${availabilityNote}` : ""}
                  </span>
                )}
              </div>
              {(location || languages) && (
                <p className="truncate text-xs font-semibold text-ink opacity-70">
                  {[location, languages].filter(Boolean).join(" · ")}
                </p>
              )}
              {headline && (
                <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-relaxed text-ink opacity-80">
                  {headline}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {specialties.slice(0, 3).map((specialty) => (
                  <span
                    key={specialty}
                    className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-bold text-ink"
                  >
                    {specialty}
                  </span>
                ))}
                <span className="ml-auto rounded-lg bg-orange px-2.5 py-1 text-[10px] font-bold text-ink shadow-sticker">
                  Voir le profil
                </span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] font-medium text-ink opacity-60">
            La carte se met à jour en direct pendant que tu tapes.
          </p>
        </div>

        <div className="rounded-[18px] bg-sand p-5">
          <h2 className={SECTION}>Affiché automatiquement</h2>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[26px] font-bold leading-tight text-ink">{stats.clientCount}</p>
              <p className="text-[11px] font-semibold text-ink opacity-60">
                client{stats.clientCount > 1 ? "s" : ""} actif{stats.clientCount > 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <p className="text-[26px] font-bold leading-tight text-ink">{stats.missionCount}</p>
              <p className="text-[11px] font-semibold text-ink opacity-60">
                mission{stats.missionCount > 1 ? "s" : ""} menée{stats.missionCount > 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <p className="text-[26px] font-bold leading-tight text-ink">{stats.hoursTracked}</p>
              <p className="text-[11px] font-semibold text-ink opacity-60">heures trackées</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] font-medium leading-relaxed text-ink opacity-60">
            Ces chiffres viennent de ton espace VA Desk et rassurent tes futurs clients. Tu
            peux les masquer.
          </p>
          <div className="mt-3 flex items-center gap-2.5">
            <Switch checked={showStats} onChange={setShowStats} label="Afficher sur ma fiche" />
            <span className="text-xs font-bold text-ink">Afficher sur ma fiche</span>
          </div>
        </div>
      </aside>
    </form>
  );
}
