"use client";

import { useRef } from "react";
import { useActionState } from "react";

import { createRequestAction } from "@/lib/actions/portal";
import { clientColorVar } from "@/lib/client-colors";

type Request = { id: string; title: string; done: boolean };

type Props = {
  clientColor: number;
  vaFirstName: string;
  requests: Request[];
};

// Panneau vedette du portail (DESIGN.md §6) : aplat couleur client, titre
// display, gros bouton orange — et le suivi des demandes vit DEDANS.
export default function RequestForm({ clientColor, vaFirstName, requests }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    async (...args: Parameters<typeof createRequestAction>) => {
      const result = await createRequestAction(...args);
      if (result?.ok) formRef.current?.reset();
      return result;
    },
    undefined,
  );

  return (
    <div
      className="flex flex-col gap-4 rounded-[18px] p-6 shadow-sticker"
      style={{ backgroundColor: clientColorVar(clientColor) }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[15px] font-bold text-ink">Un truc à déléguer ?</p>
        <span className="rotate-2 rounded-full bg-lime px-2.5 py-1 text-xs font-bold text-ink shadow-sticker">
          go
        </span>
      </div>
      <h2 className="font-bowlby text-[32px] leading-tight text-ink">
        Demande à {vaFirstName}.
      </h2>

      <form ref={formRef} action={action} className="flex flex-col gap-3">
        <label htmlFor="title" className="sr-only">
          Ta demande
        </label>
        <textarea
          id="title"
          name="title"
          required
          rows={3}
          placeholder="Décris ce dont tu as besoin…"
          className="w-full resize-none rounded-[10px] bg-paper/70 px-4 py-3 text-[13px] font-medium text-ink outline-none transition focus:bg-paper focus:ring-2 focus:ring-ink/30"
        />
        <button
          disabled={pending}
          type="submit"
          className="w-full rounded-xl bg-orange px-5 py-3.5 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Envoi…" : `Envoyer à ${vaFirstName}`}
        </button>
        {state?.error && <p className="text-xs font-semibold text-ink/70">{state.error}</p>}
        {state?.ok && (
          <p className="text-xs font-bold text-ink">
            C&apos;est transmis ✓ — {vaFirstName} la voit déjà dans son cockpit.
          </p>
        )}
      </form>

      {requests.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-ink/15 pt-3">
          {requests.map((request) => (
            <div key={request.id} className="flex items-center justify-between gap-3">
              <p
                className={`min-w-0 flex-1 truncate text-[13px] font-semibold text-ink ${
                  request.done ? "line-through opacity-60" : ""
                }`}
              >
                « {request.title} »
              </p>
              {request.done ? (
                <span className="shrink-0 rounded-full bg-lime px-2.5 py-0.5 text-[11px] font-bold text-ink">
                  traitée ✓
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-paper px-2.5 py-0.5 text-[11px] font-bold text-ink">
                  chez {vaFirstName}
                </span>
              )}
            </div>
          ))}
          <p className="text-[11px] font-semibold text-ink opacity-60">
            {vaFirstName} répond en général sous 24 h.
          </p>
        </div>
      )}
    </div>
  );
}
