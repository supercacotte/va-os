"use client";

import { useActionState } from "react";
import Link from "next/link";

import { login, loginWithMagicLink, type MagicLinkState } from "@/lib/actions/auth";

const initialMagicState: MagicLinkState = { status: "idle" };

const FIELD =
  "rounded-[10px] bg-sand px-4 py-3 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30";
const LABEL = "text-[13px] font-bold text-ink";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [magicState, magicAction, magicPending] = useActionState(
    loginWithMagicLink,
    initialMagicState,
  );

  if (magicState.status === "sent") {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-[19px] font-bold text-ink">Vérifie ta boîte mail</h1>
        <p className="mt-2 max-w-sm text-[13px] font-medium text-ink opacity-70">
          On vient de t&apos;envoyer un lien magique. Clique dessus pour te connecter.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="text-center">
        <h1 className="text-[19px] font-bold text-ink">Connexion</h1>
        <p className="mt-1 text-[13px] font-medium text-ink opacity-70">
          Contente de te revoir.
        </p>
      </div>

      <form action={action} className="flex flex-col gap-4" autoComplete="on">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={LABEL}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="toi@exemple.com"
            className={FIELD}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className={LABEL}>
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={FIELD}
          />
        </div>

        {state?.message && (
          <p className="text-[13px] font-semibold text-ink">{state.message}</p>
        )}

        <button
          disabled={pending}
          type="submit"
          className="mt-1 rounded-xl bg-orange px-5 py-3 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-ink/15" />
        <span className="text-xs font-bold text-ink/60">ou</span>
        <div className="h-px flex-1 bg-ink/15" />
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
          className={FIELD}
        />

        {magicState.message && (
          <p className="text-[13px] font-semibold text-ink">{magicState.message}</p>
        )}

        <button
          disabled={magicPending}
          type="submit"
          className="rounded-xl bg-sand px-5 py-3 text-sm font-bold text-ink transition hover:bg-ink/10 disabled:opacity-60"
        >
          {magicPending ? "Envoi…" : "Recevoir un lien magique"}
        </button>
      </form>

      <p className="text-center text-[13px] font-medium text-ink opacity-80">
        Pas encore de compte ?{" "}
        <Link
          href="/inscription"
          prefetch={false}
          className="font-semibold underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
        >
          Créer mon compte
        </Link>
      </p>
    </div>
  );
}
