"use client";

import { useRef } from "react";
import { useActionState } from "react";

import { createRequestAction } from "@/lib/actions/portal";

export default function RequestForm() {
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
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-3 rounded-3xl border border-line bg-paper p-6"
    >
      <label htmlFor="title" className="font-label text-xs uppercase tracking-wide text-ink/70">
        Ta demande
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          id="title"
          name="title"
          required
          placeholder="Ex. Relancer le fournisseur d'étiquettes"
          className="min-w-0 flex-1 rounded-full border border-line bg-cream px-5 py-3 font-body text-sm text-ink outline-none transition focus:border-corail"
        />
        <button
          disabled={pending}
          type="submit"
          className="rounded-full bg-corail px-5 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink disabled:opacity-60"
        >
          {pending ? "Envoi…" : "Envoyer"}
        </button>
      </div>
      {state?.error && <p className="font-body text-xs text-corail">{state.error}</p>}
      {state?.ok && (
        <p className="font-body text-xs text-mer">
          C&apos;est transmis ! Ta demande apparaît dans la liste ci-dessous.
        </p>
      )}
    </form>
  );
}
