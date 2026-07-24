"use client";

import { useState } from "react";
import { useActionState } from "react";

import ProcedureEditor from "@/components/app/ProcedureEditor";
import {
  createProcedureAction,
  updateProcedureAction,
  type ProcedureFormState,
} from "@/lib/actions/procedures";
import { BLANK_TEMPLATE_HTML, CADENCE_OPTIONS, SLC_TEMPLATES } from "@/lib/sop-templates";

type ExistingProcedure = {
  id: string;
  title: string;
  steps: string;
  cadence: string | null;
  estimatedMinutes: number | null;
  visibleToClient: boolean;
};

const FIELD =
  "w-full rounded-[10px] bg-paper px-4 py-2.5 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30";
const LABEL = "text-[13px] font-bold text-ink";

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border-2 transition ${
        checked ? "border-ink bg-lime" : "border-ink/30 bg-paper"
      }`}
    >
      <span
        className={`absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full transition-all ${
          checked ? "left-[calc(100%-20px)] bg-ink" : "left-0.5 bg-ink/30"
        }`}
      />
    </button>
  );
}

// Formulaire de création / édition d'une procédure (maquette 33a). En
// création, un sélecteur de modèle (Vierge / templates SLC) pré-remplit titre,
// contenu, cadence et durée — les templates SLC ne sont que des points de
// départ, jamais des procédures stockées (D22).
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

  const [templateKey, setTemplateKey] = useState("blank");
  const [title, setTitle] = useState(procedure?.title ?? "");
  const [cadence, setCadence] = useState(procedure?.cadence ?? "");
  const [minutes, setMinutes] = useState(
    procedure?.estimatedMinutes != null ? String(procedure.estimatedMinutes) : "",
  );
  const [visible, setVisible] = useState(procedure?.visibleToClient ?? true);

  function pickTemplate(key: string) {
    setTemplateKey(key);
    const template = SLC_TEMPLATES.find((t) => t.key === key);
    setTitle(template?.title ?? "");
    setCadence(template?.cadence ?? "");
    setMinutes(template ? String(template.estimatedMinutes) : "");
  }

  const editorDefault = isEdit
    ? procedure!.steps
    : SLC_TEMPLATES.find((t) => t.key === templateKey)?.html ?? BLANK_TEMPLATE_HTML;

  return (
    <form action={action} className="flex flex-col gap-4 rounded-[16px] bg-sand p-5">
      <input type="hidden" name="clientId" value={clientId} />
      {isEdit && <input type="hidden" name="procedureId" value={procedure!.id} />}
      {visible && <input type="hidden" name="visibleToClient" value="on" />}

      {!isEdit && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="template" className={LABEL}>
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
        <label htmlFor="procedure-title" className={LABEL}>
          Titre de la procédure
        </label>
        <input
          id="procedure-title"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Publier un épisode de podcast"
          className={FIELD}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cadence" className={LABEL}>
            Cadence <span className="font-medium opacity-60">(optionnel)</span>
          </label>
          <select
            id="cadence"
            name="cadence"
            value={cadence}
            onChange={(e) => setCadence(e.target.value)}
            className={FIELD}
          >
            <option value="">—</option>
            {CADENCE_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="estimatedMinutes" className={LABEL}>
            Durée estimée <span className="font-medium opacity-60">(min, optionnel)</span>
          </label>
          <input
            id="estimatedMinutes"
            name="estimatedMinutes"
            inputMode="numeric"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="45"
            className={FIELD}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-[12px] bg-paper px-4 py-3">
        <div>
          <p className={LABEL}>Visible sur le portail du client</p>
          <p className="text-[11px] font-medium text-ink opacity-60">
            {visible ? "Le client verra cette procédure, en lecture seule." : "Masquée du portail — visible seulement par toi."}
          </p>
        </div>
        <Switch checked={visible} onChange={setVisible} label="Visible sur le portail" />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={LABEL}>Contenu</span>
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
