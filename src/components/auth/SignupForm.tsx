"use client";

import { useActionState } from "react";
import Link from "next/link";

import { signup } from "@/lib/actions/auth";

const FIELD =
  "rounded-[10px] bg-sand px-4 py-3 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30";
const LABEL = "text-[13px] font-bold text-ink";
const ERROR = "text-xs font-semibold text-ink/70";

export default function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <form action={action} className="flex flex-col gap-4" autoComplete="on">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={LABEL}>
            Prénom
          </label>
          <input
            id="name"
            name="name"
            autoComplete="given-name"
            placeholder="Ton prénom"
            className={FIELD}
          />
          {state?.errors?.name && <p className={ERROR}>{state.errors.name[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="lastName" className={LABEL}>
            Nom
          </label>
          <input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            placeholder="Ton nom"
            className={FIELD}
          />
          {state?.errors?.lastName && <p className={ERROR}>{state.errors.lastName[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={LABEL}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="toi@exemple.com"
            className={FIELD}
          />
          {state?.errors?.email && <p className={ERROR}>{state.errors.email[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className={LABEL}>
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className={FIELD}
          />
          {state?.errors?.password && <p className={ERROR}>{state.errors.password[0]}</p>}
        </div>

        {state?.message && (
          <p className="text-[13px] font-semibold text-ink">{state.message}</p>
        )}

        <button
          disabled={pending}
          type="submit"
          className="mt-1 rounded-xl bg-orange px-5 py-3 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Création…" : "Créer mon compte"}
        </button>
      </form>

      <p className="text-center text-[13px] font-medium text-ink opacity-80">
        Déjà un compte ?{" "}
        <Link
          href="/connexion"
          prefetch={false}
          className="font-semibold underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
