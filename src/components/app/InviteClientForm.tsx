"use client";

import { useActionState } from "react";

import { inviteClientUser } from "@/lib/actions/clients";

export default function InviteClientForm({ clientId }: { clientId: string }) {
  const [state, action, pending] = useActionState(inviteClientUser, undefined);

  return (
    <form action={action}>
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
          className="min-w-0 flex-1 rounded-[10px] bg-paper px-4 py-2.5 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30"
        />
        <button
          disabled={pending}
          type="submit"
          className="rounded-xl bg-orange px-4 py-2.5 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Invitation…" : "Inviter au portail"}
        </button>
      </div>
      {state?.message && (
        <p className="mt-2 text-xs font-semibold text-ink/70">{state.message}</p>
      )}
    </form>
  );
}
