"use client";

import { useState } from "react";

import ProcedureContent from "@/components/app/ProcedureContent";
import ProcedureForm from "@/components/app/ProcedureForm";
import {
  deleteProcedureAction,
  duplicateProcedureAction,
} from "@/lib/actions/procedures";

type Procedure = { id: string; title: string; steps: string; updatedAt: string };
type OtherClient = { id: string; name: string };

function daysAgo(iso: string) {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  return `il y a ${days} jours`;
}

// Section « Procédures » de la fiche client (VA) : liste, création, édition,
// suppression, duplication vers un autre client (D22). Lecture seule côté
// portail (composant séparé).
export default function ProceduresSection({
  clientId,
  procedures,
  otherClients,
}: {
  clientId: string;
  procedures: Procedure[];
  otherClients: OtherClient[];
}) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-bold uppercase tracking-[1.5px] text-ink">
          Procédures
        </h2>
        {!creating && (
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditingId(null);
            }}
            className="rounded-full bg-orange px-4 py-2 text-[13px] font-bold text-ink shadow-sticker transition hover:brightness-95"
          >
            + Nouvelle procédure
          </button>
        )}
      </div>

      <p className="text-[13px] font-medium text-ink opacity-70">
        Les procédures de ce client — visibles par lui sur son portail, en lecture seule.
      </p>

      {creating && (
        <ProcedureForm clientId={clientId} onDone={() => setCreating(false)} />
      )}

      {procedures.length === 0 && !creating && (
        <p className="rounded-[14px] border-2 border-dashed border-ink/30 p-5 text-[13px] font-medium text-ink opacity-70">
          Pas encore de procédure pour ce client. Documente un process récurrent —
          il apparaîtra ici et sur le portail du client.
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        {procedures.map((procedure) =>
          editingId === procedure.id ? (
            <ProcedureForm
              key={procedure.id}
              clientId={clientId}
              procedure={procedure}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <article key={procedure.id} className="rounded-[16px] bg-sand p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[16px] font-bold text-ink">{procedure.title}</p>
                  <p className="text-[12px] font-semibold text-ink opacity-50">
                    Modifié {daysAgo(procedure.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === procedure.id ? null : procedure.id)}
                    className="rounded-full bg-paper px-3 py-1 text-[11px] font-bold text-ink shadow-sticker transition hover:brightness-95"
                  >
                    {openId === procedure.id ? "masquer" : "voir"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(procedure.id);
                      setCreating(false);
                    }}
                    className="rounded-full bg-ink px-3 py-1 text-[11px] font-bold text-paper transition hover:opacity-85"
                  >
                    éditer
                  </button>
                  {otherClients.length > 0 && (
                    <form action={duplicateProcedureAction} className="flex items-center gap-1">
                      <input type="hidden" name="procedureId" value={procedure.id} />
                      <input type="hidden" name="clientId" value={clientId} />
                      <label htmlFor={`dup-${procedure.id}`} className="sr-only">
                        Dupliquer vers un autre client
                      </label>
                      <select
                        id={`dup-${procedure.id}`}
                        name="targetClientId"
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) e.target.form?.requestSubmit();
                        }}
                        className="rounded-full bg-paper px-3 py-1 text-[11px] font-bold text-ink shadow-sticker outline-none transition focus:ring-2 focus:ring-ink/30"
                      >
                        <option value="" disabled>
                          dupliquer vers…
                        </option>
                        {otherClients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    </form>
                  )}
                  <form
                    action={deleteProcedureAction}
                    onSubmit={(e) => {
                      if (!confirm(`Supprimer la procédure « ${procedure.title} » ?`)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="procedureId" value={procedure.id} />
                    <input type="hidden" name="clientId" value={clientId} />
                    <button
                      type="submit"
                      className="rounded-full bg-paper px-3 py-1 text-[11px] font-bold text-ink shadow-sticker transition hover:brightness-95"
                    >
                      suppr.
                    </button>
                  </form>
                </div>
              </div>

              {openId === procedure.id && (
                <div className="mt-4 rounded-[12px] bg-paper p-5 ring-1 ring-ink/10">
                  <ProcedureContent steps={procedure.steps} />
                </div>
              )}
            </article>
          ),
        )}
      </div>
    </section>
  );
}
