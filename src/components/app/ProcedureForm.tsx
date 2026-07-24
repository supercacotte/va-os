"use client";

import { useState } from "react";
import { useActionState } from "react";

import ProcedureEditor from "@/components/app/ProcedureEditor";
import {
  createProcedureAction,
  updateProcedureAction,
  type ProcedureFormState,
} from "@/lib/actions/procedures";
import { BLANK_TEMPLATE_HTML, SLC_TEMPLATES } from "@/lib/sop-templates";

type ExistingProcedure = { id: string; title: string; steps: string };

// Formulaire de création / édition d'une procédure. En création, un sélecteur
// de modèle (Vierge / templates SLC) pré-remplit titre + contenu — les
// templates SLC ne sont que des points de départ, jamais des procédures
// stockées (D22).
export default function ProcedureForm({
  clientId,
  procedure,
  onDone,
}: {
  clientId: string;
  procedure?: ExistingProcedure;
  onDone: () => void;
}) {
  const isEdit = Boolean(procedure);
  const [state, action, pending] = useActionState<ProcedureFormState, FormData>(
    async (prev, formData) => {
      const result = isEdit
        ? await updateProcedureAction(prev, formData)
        : await createProcedureAction(prev, formData);
      if (result?.ok) onDone();
      return result;
    },
    undefined,
  );

  // Modèle sélectionné (création seulement). "blank" = squelette vierge.
  const [templateKey, setTemplateKey] = useState("blank");
  const [title, setTitle] = useState(procedure?.title ?? "");

  function pickTemplate(key: string) {
    setTemplateKey(key);
    const template = SLC_TEMPLATES.find((t) => t.key === key);
    setTitle(template?.title ?? "");
  }

  const editorDefault = isEdit
    ? procedure!.steps
    : SLC_TEMPLATES.find((t) => t.key === templateKey)?.html ?? BLANK_TEMPLATE_HTML;

  return (
    <form action={action} className="flex flex-col gap-4 rounded-[16px] bg-sand p-5">
      <input type="hidden" name="clientId" value={clientId} />
      {isEdit && <input type="hidden" name="procedureId" value={procedure!.id} />}

      {!isEdit && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="template" className="text-[13px] font-bold text-ink">
            Partir d&apos;un modèle
          </label>
          <select
            id="template"
            value={templateKey}
            onChange={(e) => pickTemplate(e.target.value)}
            className="w-full rounded-[10px] bg-paper px-4 py-2.5 text-[13px] font-semibold text-ink outline-none transition focus:ring-2 focus:ring-ink/30"
          >
            <option value="blank">Procédure vierge (structure guidée)</option>
            {SLC_TEMPLATES.map((template) => (
              <option key={template.key} value={template.key}>
                {template.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="procedure-title" className="text-[13px] font-bold text-ink">
          Titre de la procédure
        </label>
        <input
          id="procedure-title"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Publier un épisode de podcast"
          className="w-full rounded-[10px] bg-paper px-4 py-2.5 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-ink">Contenu</span>
        {/* key force le remontage de l'éditeur quand on change de modèle */}
        <ProcedureEditor key={isEdit ? procedure!.id : templateKey} defaultValue={editorDefault} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          disabled={pending}
          type="submit"
          className="rounded-xl bg-orange px-6 py-3 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer la procédure"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="text-[13px] font-semibold text-ink opacity-60 transition hover:opacity-100"
        >
          Annuler
        </button>
        {state?.error && (
          <p className="text-[13px] font-semibold text-ink opacity-70">{state.error}</p>
        )}
      </div>
    </form>
  );
}
