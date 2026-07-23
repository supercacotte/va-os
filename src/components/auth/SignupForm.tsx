"use client";

import { useActionState } from "react";
import Link from "next/link";

import { loginWithMagicLink, signup, type MagicLinkState } from "@/lib/actions/auth";

const initialMagicState: MagicLinkState = { status: "idle" };

const FIELD =
  "w-full rounded-[10px] bg-sand px-4 py-3 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30";
const LABEL = "text-[13px] font-bold text-ink";
const ERROR = "text-xs font-semibold text-ink/70";

export default function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  const [magicState, magicAction, magicPending] = useActionState(
    loginWithMagicLink,
    initialMagicState,
  );

  if (magicState.status === "sent") {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-[19px] font-bold text-ink">Vérifie ta boîte mail</h2>
        <p className="mt-2 max-w-sm text-[13px] font-medium text-ink opacity-70">
          On vient de t&apos;envoyer un lien magique. Clique dessus pour créer ton compte et
          te connecter.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <form action={action} className="flex flex-col gap-4" autoComplete="on">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={LABEL}>
            Prénom
          </label>
          <input
            id="name"
            name="name"
            autoComplete="given-name"
            placeholder="Julia"
            className={FIELD}
          />
          {state?.errors?.name && <p className={ERROR}>{state.errors.name[0]}</p>}
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
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="password" className={LABEL}>
              Mot de passe
            </label>
            <span className="text-xs font-medium text-ink opacity-60">8 caractères min.</span>
          </div>
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
          className="mt-1 w-full rounded-xl bg-orange px-5 py-3 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Création…" : "Créer mon compte"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-ink/15" />
        <span className="text-xs font-bold text-ink/60">ou</span>
        <div className="h-px flex-1 bg-ink/15" />
      </div>

      <form action={magicAction} autoComplete="on" className="flex flex-col gap-2">
        <label htmlFor="signup-magic-email" className="sr-only">
          Email pour le lien magique
        </label>
        <input
          id="signup-magic-email"
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
          className="w-full rounded-xl bg-sand px-5 py-3 text-sm font-bold text-ink transition hover:bg-ink/10 disabled:opacity-60"
        >
          {magicPending ? "Envoi…" : "Recevoir un lien magique"}
        </button>
      </form>

      <p className="text-center text-[13px] font-medium text-ink opacity-80">
        Déjà un compte ?{" "}
        <Link
          href="/connexion"
          prefetch={false}
          className="font-bold underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
        >
          Se connecter
        </Link>
      </p>

      <div className="text-center text-[11px] font-medium leading-relaxed text-ink opacity-60">
        <p>En créant un compte tu acceptes les CGU.</p>
        <p>Ton portail client se configure ensuite, à ton rythme.</p>
      </div>
    </div>
  );
}
