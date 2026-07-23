"use client";

import { useActionState } from "react";
import Link from "next/link";

import { login, loginWithMagicLink, type MagicLinkState } from "@/lib/actions/auth";

const initialMagicState: MagicLinkState = { status: "idle" };

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [magicState, magicAction, magicPending] = useActionState(
    loginWithMagicLink,
    initialMagicState,
  );

  if (magicState.status === "sent") {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-display text-2xl text-ink">Vérifie ta boîte mail</h1>
        <p className="mt-2 max-w-sm font-body text-sm text-muted-2">
          On vient de t&apos;envoyer un lien magique. Clique dessus pour te connecter.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <div className="text-center">
        <h1 className="font-display text-2xl text-ink">Connexion</h1>
        <p className="mt-2 font-body text-sm text-muted-2">Contente de te revoir.</p>
      </div>

      <form action={action} className="flex flex-col gap-4" autoComplete="on">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="font-label text-xs uppercase tracking-wide text-ink/70">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="toi@exemple.com"
            className="rounded-full border border-line bg-paper px-5 py-3 font-body text-sm text-ink outline-none transition focus:border-corail"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="font-label text-xs uppercase tracking-wide text-ink/70">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="rounded-full border border-line bg-paper px-5 py-3 font-body text-sm text-ink outline-none transition focus:border-corail"
          />
        </div>

        {state?.message && (
          <p className="font-body text-sm text-corail">{state.message}</p>
        )}

        <button
          disabled={pending}
          type="submit"
          className="mt-2 rounded-full bg-corail px-5 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink disabled:opacity-60"
        >
          {pending ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-muted">
        <div className="h-px flex-1 bg-line" />
        <span className="font-label text-xs uppercase tracking-wide">ou</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <form action={magicAction} className="flex flex-col gap-3" autoComplete="on">
        <label htmlFor="magic-email" className="sr-only">
          Email
        </label>
        <input
          id="magic-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="toi@exemple.com"
          className="rounded-full border border-line bg-paper px-5 py-3 font-body text-sm text-ink outline-none transition focus:border-corail"
        />

        {magicState.message && (
          <p className="font-body text-sm text-corail">{magicState.message}</p>
        )}

        <button
          disabled={magicPending}
          type="submit"
          className="rounded-full border border-ink px-5 py-3 font-label text-xs uppercase tracking-wide text-ink transition hover:border-corail hover:text-corail disabled:opacity-60"
        >
          {magicPending ? "Envoi…" : "Recevoir un lien magique →"}
        </button>
      </form>

      <p className="text-center font-body text-sm text-muted-2">
        Pas encore de compte ?{" "}
        <Link href="/inscription" prefetch={false} className="text-corail transition hover:text-ink">
          Créer mon compte
        </Link>
      </p>
    </div>
  );
}
