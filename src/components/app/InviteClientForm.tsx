"use client";

import { useActionState } from "react";

import { inviteClientUser } from "@/lib/actions/clients";

export default function InviteClientForm({ clientId }: { clientId: string }) {
  const [state, action, pending] = useActionState(inviteClientUser, undefined);

  return (
    <form action={action} className="mt-4 border-t border-line pt-4">
      <input type="hidden" name="clientId" value={clientId} />
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`invite-${clientId}`} className="sr-only">
          Email du client
        </label>
        <input
          id={`invite-${clientId}`}
          name="email"
          type="email"
          required
          placeholder="email@client.com"
          className="min-w-0 flex-1 rounded-full border border-line bg-cream px-4 py-2 font-body text-sm text-ink outline-none transition focus:border-corail"
        />
        <button
          disabled={pending}
          type="submit"
          className="rounded-full border border-ink px-4 py-2 font-label text-xs uppercase tracking-wide text-ink transition hover:border-corail hover:text-corail disabled:opacity-60"
        >
          {pending ? "Invitation…" : "Inviter au portail"}
        </button>
      </div>
      {state?.message && (
        <p className={`mt-2 font-body text-xs ${state.ok ? "text-mer" : "text-corail"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
