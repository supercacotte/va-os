"use client";

import { useState } from "react";
import { useActionState } from "react";

import {
  changePasswordAction,
  deleteAccountAction,
  unpublishProfileAction,
  updateSettingsAction,
  type AccountFormState,
} from "@/lib/actions/account";

type Settings = {
  notifyClientRequest: boolean;
  notifyDirectoryContact: boolean;
  notifyLongTimer: boolean;
  notifyWeeklyDigest: boolean;
  timezone: string;
  timerRounding: string;
  weekStart: string;
  locale: string;
};

const CARD = "rounded-[18px] bg-paper p-6 shadow-sticker ring-1 ring-ink/5";
const SECTION = "text-[13px] font-bold uppercase tracking-[1.5px] text-ink";
const LABEL = "text-[13px] font-bold text-ink";
const FIELD =
  "w-full rounded-[10px] bg-sand px-4 py-3 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30";

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

function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<AccountFormState, FormData>(
    changePasswordAction,
    undefined,
  );

  if (!open) {
    return (
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={LABEL}>Mot de passe</p>
          <p className="text-xs font-medium text-ink opacity-60">
            {hasPassword ? "••••••••" : "Pas encore de mot de passe (connexion par lien magique)"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-[10px] bg-sand px-4 py-2.5 text-[13px] font-bold text-ink transition hover:bg-ink/10"
        >
          {hasPassword ? "Changer" : "En créer un"}
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <p className={LABEL}>{hasPassword ? "Changer le mot de passe" : "Créer un mot de passe"}</p>
      {hasPassword && (
        <input
          name="currentPassword"
          type="password"
          required
          placeholder="Mot de passe actuel"
          autoComplete="current-password"
          className={FIELD}
        />
      )}
      <input
        name="newPassword"
        type="password"
        required
        minLength={8}
        placeholder="Nouveau mot de passe (8 caractères min.)"
        autoComplete="new-password"
        className={FIELD}
      />
      <input
        name="confirm"
        type="password"
        required
        placeholder="Confirme-le"
        autoComplete="new-password"
        className={FIELD}
      />
      <div className="flex items-center gap-3">
        <button
          disabled={pending}
          type="submit"
          className="rounded-[10px] bg-ink px-4 py-2.5 text-[13px] font-bold text-paper transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "…" : "Valider"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[13px] font-semibold text-ink opacity-60 transition hover:opacity-100"
        >
          Annuler
        </button>
        {state?.message && (
          <p className={`text-xs font-bold text-ink ${state.ok ? "" : "opacity-70"}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function DeleteAccountForm() {
  const [armed, setArmed] = useState(false);
  const [state, action, pending] = useActionState<AccountFormState, FormData>(
    deleteAccountAction,
    undefined,
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={LABEL}>Supprimer mon compte</p>
          <p className="text-xs font-medium text-ink opacity-60">
            Définitif — exporte tes données d&apos;abord
          </p>
        </div>
        {!armed && (
          <button
            type="button"
            onClick={() => setArmed(true)}
            className="rounded-[10px] bg-ink px-4 py-2.5 text-[13px] font-bold text-paper transition hover:opacity-90"
          >
            Supprimer
          </button>
        )}
      </div>
      {armed && (
        <form action={action} className="flex flex-wrap items-center gap-2">
          <input
            name="confirm"
            required
            placeholder="Écris SUPPRIMER"
            className="w-40 rounded-[10px] bg-sand px-3 py-2.5 text-[13px] font-semibold text-ink outline-none transition focus:ring-2 focus:ring-ink/30"
          />
          <button
            disabled={pending}
            type="submit"
            className="rounded-[10px] bg-ink px-4 py-2.5 text-[13px] font-bold text-paper transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Suppression…" : "Confirmer"}
          </button>
          <button
            type="button"
            onClick={() => setArmed(false)}
            className="text-[13px] font-semibold text-ink opacity-60 transition hover:opacity-100"
          >
            Annuler
          </button>
          {state?.message && (
            <p className="w-full text-xs font-bold text-ink opacity-70">{state.message}</p>
          )}
        </form>
      )}
    </div>
  );
}

// Onglet « Mon compte » (maquette 30b) : réglages privés — connexion,
// notifications, préférences à gauche ; abonnement, données, zone sensible à
// droite. Un seul « Enregistrer » pour notifications + préférences.
export default function AccountSettings({
  email,
  hasPassword,
  published,
  settings,
}: {
  email: string;
  hasPassword: boolean;
  published: boolean;
  settings: Settings;
}) {
  const [state, action, pending] = useActionState<AccountFormState, FormData>(
    updateSettingsAction,
    undefined,
  );

  const [notifs, setNotifs] = useState({
    notifyClientRequest: settings.notifyClientRequest,
    notifyDirectoryContact: settings.notifyDirectoryContact,
    notifyLongTimer: settings.notifyLongTimer,
    notifyWeeklyDigest: settings.notifyWeeklyDigest,
  });

  const NOTIF_ROWS: { key: keyof typeof notifs; label: string }[] = [
    { key: "notifyClientRequest", label: "Nouvelle demande d'un client" },
    { key: "notifyDirectoryContact", label: "Contact via l'annuaire" },
    { key: "notifyLongTimer", label: "Chrono oublié en route > 4 h" },
    { key: "notifyWeeklyDigest", label: "Récap hebdo par email" },
  ];

  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="flex flex-col gap-5">
        {/* Connexion — hors du form réglages (actions séparées) */}
        <section className={CARD}>
          <h2 className={SECTION}>Connexion</h2>
          <div className="mt-4 flex flex-col gap-1.5">
            <p className={LABEL}>
              Email de connexion <span className="font-medium opacity-60">(privé)</span>
            </p>
            <p className="w-full rounded-[10px] bg-sand px-4 py-3 text-[13px] font-medium text-ink opacity-80">
              {email}
            </p>
          </div>
          <div className="mt-5 border-t border-ink/10 pt-5">
            <PasswordForm hasPassword={hasPassword} />
          </div>
        </section>

        <form action={action} className="flex flex-col gap-5">
          {NOTIF_ROWS.map(({ key }) =>
            notifs[key] ? <input key={key} type="hidden" name={key} value="on" /> : null,
          )}

          {/* Notifications */}
          <section className={CARD}>
            <h2 className={SECTION}>Notifications</h2>
            <div className="mt-4 flex flex-col gap-4">
              {NOTIF_ROWS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <p className="text-[14px] font-semibold text-ink">{label}</p>
                  <Switch
                    checked={notifs[key]}
                    onChange={(value) => setNotifs({ ...notifs, [key]: value })}
                    label={label}
                  />
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] font-medium leading-relaxed text-ink opacity-50">
              Les emails arrivent avec la beta — tes choix sont déjà enregistrés.
            </p>
          </section>

          {/* Préférences */}
          <section className={CARD}>
            <h2 className={SECTION}>Préférences</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="timezone" className={LABEL}>
                  Fuseau horaire
                </label>
                <select id="timezone" name="timezone" defaultValue={settings.timezone} className={FIELD}>
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="Europe/Brussels">Europe/Bruxelles</option>
                  <option value="Europe/Zurich">Europe/Zurich</option>
                  <option value="America/Montreal">Amérique/Montréal</option>
                  <option value="Indian/Reunion">La Réunion</option>
                  <option value="Pacific/Noumea">Nouméa</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="timerRounding" className={LABEL}>
                  Arrondi du chrono
                </label>
                <select
                  id="timerRounding"
                  name="timerRounding"
                  defaultValue={settings.timerRounding}
                  className={FIELD}
                >
                  <option value="none">À la minute</option>
                  <option value="quarter">Au quart d&apos;heure</option>
                  <option value="half">À la demi-heure</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="weekStart" className={LABEL}>
                  Début de semaine
                </label>
                <select id="weekStart" name="weekStart" defaultValue={settings.weekStart} className={FIELD}>
                  <option value="monday">Lundi</option>
                  <option value="sunday">Dimanche</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="locale" className={LABEL}>
                  Langue de l&apos;interface
                </label>
                <select id="locale" name="locale" defaultValue={settings.locale} className={FIELD}>
                  <option value="fr">Français</option>
                  <option value="en">English (bientôt)</option>
                </select>
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
            {state?.ok && <p className="text-[13px] font-bold text-ink">Réglages enregistrés ✓</p>}
            {state?.message && !state.ok && (
              <p className="text-[13px] font-semibold text-ink opacity-70">{state.message}</p>
            )}
          </div>
        </form>
      </div>

      {/* Sidebar : abonnement, données, zone sensible */}
      <aside className="flex flex-col gap-5">
        <div className="rounded-[18px] bg-lilac p-6 shadow-sticker">
          <div className="flex items-center justify-between gap-3">
            <h2 className={SECTION}>Abonnement</h2>
            <span className="rotate-2 rounded-[10px] border-4 border-paper bg-lime px-3 py-1 text-xs font-bold text-ink shadow-sticker">
              Beta
            </span>
          </div>
          <p className="mt-4 font-bowlby text-[32px] leading-none text-ink">
            0 € <span className="text-base">/ mois pendant la beta</span>
          </p>
          <ul className="mt-5 flex flex-col gap-2.5">
            {["Clients & missions illimités", "Portail client + annuaire", "Rapports PDF"].map(
              (feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-[14px] font-semibold text-ink">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime text-[11px] font-bold">
                    ✓
                  </span>
                  {feature}
                </li>
              ),
            )}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-ink/15 pt-4">
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-[10px] bg-paper px-4 py-2.5 text-[13px] font-bold text-ink opacity-60"
            >
              Gérer la facturation
            </button>
            <p className="text-xs font-medium text-ink opacity-70">
              Les plans payants arrivent après la beta.
            </p>
          </div>
        </div>

        <div className="rounded-[18px] bg-pink p-6 shadow-sticker">
          <h2 className={SECTION}>Mes données</h2>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-[14px] font-bold text-ink">Exporter tout mon espace</p>
              <p className="text-xs font-medium text-ink opacity-70">
                Clients, missions, temps, rapports — en CSV. Tout est à toi.
              </p>
            </div>
            <a
              href="/api/export"
              download
              className="shrink-0 rounded-[10px] bg-paper px-4 py-2.5 text-[13px] font-bold text-ink shadow-sticker transition hover:brightness-95"
            >
              Exporter
            </a>
          </div>
        </div>

        <div className="rounded-[18px] border-2 border-dashed border-ink/30 p-6">
          <h2 className={SECTION}>Zone sensible</h2>
          <div className="mt-4 flex items-center justify-between gap-3 border-b border-ink/10 pb-4">
            <div>
              <p className={LABEL}>Retirer ma fiche de l&apos;annuaire</p>
              <p className="text-xs font-medium text-ink opacity-60">
                Ton espace continue de fonctionner
              </p>
            </div>
            {published ? (
              <form action={unpublishProfileAction}>
                <button
                  type="submit"
                  className="rounded-[10px] bg-sand px-4 py-2.5 text-[13px] font-bold text-ink transition hover:bg-ink/10"
                >
                  Retirer
                </button>
              </form>
            ) : (
              <p className="text-xs font-semibold text-ink opacity-50">Déjà retirée</p>
            )}
          </div>
          <div className="pt-4">
            <DeleteAccountForm />
          </div>
        </div>
      </aside>
    </div>
  );
}
