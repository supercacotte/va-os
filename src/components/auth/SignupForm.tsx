"use client";

import { useActionState } from "react";
import Link from "next/link";

import { signup } from "@/lib/actions/auth";

export default function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <form action={action} className="flex flex-col gap-4" autoComplete="on">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="font-label text-xs uppercase tracking-wide text-ink/70">
            Prénom
          </label>
          <input
            id="name"
            name="name"
            autoComplete="given-name"
            placeholder="Ton prénom"
            className="rounded-full border border-line bg-paper px-5 py-3 font-body text-sm text-ink outline-none transition focus:border-corail"
          />
          {state?.errors?.name && (
            <p className="font-body text-xs text-corail">{state.errors.name[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="lastName" className="font-label text-xs uppercase tracking-wide text-ink/70">
            Nom
          </label>
          <input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            placeholder="Ton nom"
            className="rounded-full border border-line bg-paper px-5 py-3 font-body text-sm text-ink outline-none transition focus:border-corail"
          />
          {state?.errors?.lastName && (
            <p className="font-body text-xs text-corail">{state.errors.lastName[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="font-label text-xs uppercase tracking-wide text-ink/70">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="toi@exemple.com"
            className="rounded-full border border-line bg-paper px-5 py-3 font-body text-sm text-ink outline-none transition focus:border-corail"
          />
          {state?.errors?.email && (
            <p className="font-body text-xs text-corail">{state.errors.email[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="font-label text-xs uppercase tracking-wide text-ink/70">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className="rounded-full border border-line bg-paper px-5 py-3 font-body text-sm text-ink outline-none transition focus:border-corail"
          />
          {state?.errors?.password && (
            <p className="font-body text-xs text-corail">{state.errors.password[0]}</p>
          )}
        </div>

        {state?.message && (
          <p className="font-body text-sm text-corail">{state.message}</p>
        )}

        <button
          disabled={pending}
          type="submit"
          className="mt-2 rounded-full bg-corail px-5 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink disabled:opacity-60"
        >
          {pending ? "Création…" : "Créer mon compte →"}
        </button>
      </form>

      <p className="text-center font-body text-sm text-muted-2">
        Déjà un compte ?{" "}
        <Link href="/connexion" prefetch={false} className="text-corail transition hover:text-ink">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
