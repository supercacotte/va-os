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
        <label htmlFor="name" className="text-[13px] font-bold text-ink">
          Nom du client
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={client?.name}
          placeholder="Marie Dupont"
          className="rounded-[10px] bg-paper px-4 py-3 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30"
        />
        {state?.errors?.name && (
          <p className="text-xs font-semibold text-ink/70">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="company" className="text-[13px] font-bold text-ink">
          Entreprise <span className="font-medium opacity-60">(optionnel)</span>
        </label>
        <input
          id="company"
          name="company"
          defaultValue={client?.company ?? ""}
          placeholder="Studio Bloom"
          className="rounded-[10px] bg-paper px-4 py-3 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30"
        />
        {state?.errors?.company && (
          <p className="text-xs font-semibold text-ink/70">{state.errors.company[0]}</p>
        )}
      </div>

      {state?.message && <p className="text-[13px] font-semibold text-ink">{state.message}</p>}

      <button
        disabled={pending}
        type="submit"
        className="self-start rounded-xl bg-orange px-5 py-3 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95 disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : client ? "Enregistrer" : "Créer le client"}
      </button>
    </form>
  );
}
