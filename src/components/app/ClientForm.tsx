"use client";

import { useActionState } from "react";

import {
  createClientAction,
  updateClientAction,
  type ClientFormState,
} from "@/lib/actions/clients";

type Props = {
  client?: { id: string; name: string; company: string | null };
};

export default function ClientForm({ client }: Props) {
  const action = client ? updateClientAction.bind(null, client.id) : createClientAction;
  const [state, formAction, pending] = useActionState<ClientFormState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="font-label text-xs uppercase tracking-wide text-ink/70">
          Nom du client
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={client?.name}
          placeholder="Marie Dupont"
          className="rounded-full border border-line bg-cream px-5 py-3 font-body text-sm text-ink outline-none transition focus:border-corail"
        />
        {state?.errors?.name && (
          <p className="font-body text-xs text-corail">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="company"
          className="font-label text-xs uppercase tracking-wide text-ink/70"
        >
          Entreprise <span className="normal-case text-muted">(optionnel)</span>
        </label>
        <input
          id="company"
          name="company"
          defaultValue={client?.company ?? ""}
          placeholder="Studio Bloom"
          className="rounded-full border border-line bg-cream px-5 py-3 font-body text-sm text-ink outline-none transition focus:border-corail"
        />
        {state?.errors?.company && (
          <p className="font-body text-xs text-corail">{state.errors.company[0]}</p>
        )}
      </div>

      {state?.message && <p className="font-body text-sm text-mer">{state.message}</p>}

      <button
        disabled={pending}
        type="submit"
        className="self-start rounded-full bg-corail px-5 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : client ? "Enregistrer" : "Créer le client"}
      </button>
    </form>
  );
}
