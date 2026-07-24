"use client";

import { useState } from "react";

import ProcedureContent from "@/components/app/ProcedureContent";
import ProcedureForm from "@/components/app/ProcedureForm";
import KebabMenu from "@/components/app/KebabMenu";
import {
  deleteProcedureAction,
  duplicateProcedureAction,
  toggleProcedureVisibilityAction,
} from "@/lib/actions/procedures";

type Procedure = {
  id: string;
  title: string;
  steps: string;
  cadence: string | null;
  estimatedMinutes: number | null;
  visibleToClient: boolean;
  updatedAt: string;
};
type OtherClient = { id: string; name: string };

function daysAgo(iso: string) {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  return `il y a ${days} jours`;
}

function formatMinutes(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

function metaLine(p: Procedure) {
  const parts: string[] = [];
  if (p.cadence) parts.push(p.cadence);
  if (p.estimatedMinutes != null) parts.push(formatMinutes(p.estimatedMinutes));
  parts.push(`modifiée ${daysAgo(p.updatedAt)}`);
  return parts.join(" · ");
}

function PortalToggle({ procedure, clientId }: { procedure: Procedure; clientId: string }) {
  const on = procedure.visibleToClient;
  return (
    <form action={toggleProcedureVisibilityAction} className="flex items-center gap-2">
      <input type="hidden" name="procedureId" value={procedure.id} />
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="visible" value={on ? "false" : "true"} />
      <button
        type="submit"
        role="switch"
        aria-checked={on}
        aria-label="Visible sur le portail"
        className={`relative h-6 w-11 shrink-0 rounded-full border-2 transition ${
          on ? "border-ink bg-lime" : "border-ink/30 bg-paper"
        }`}
      >
        <span
          className={`absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full transition-all ${
            on ? "left-[calc(100%-20px)] bg-ink" : "left-0.5 bg-ink/30"
          }`}
        />
      </button>
      <span className={`text-[12px] font-bold ${on ? "text-ink" : "text-ink/40"}`}>
        {on ? "portail" : "masquée"}
      </span>
    </form>
  );
}

const MENU_ITEM =
  "w-full rounded-[10px] px-3 py-2 text-left text-[13px] font-semibold text-ink transition hover:bg-sand";

// Section « Procédures » de la fiche client (maquette 33a) : compte, création,
// visibilité portail par procédure, cadence/durée, actions en kebab.
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
        <div className="flex items-center gap-2.5">
          <h2 className="text-[13px] font-bold uppercase tracking-[1.5px] text-ink">
            Procédures
          </h2>
          {procedures.length > 0 && (
            <span className="rounded-full bg-lilac px-2 py-0.5 text-[11px] font-bold text-ink">
              {procedures.length}
            </span>
          )}
        </div>
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
        Les procédures de ce client — celles marquées « portail » sont visibles par lui, en
        lecture seule.
      </p>

      {creating && <ProcedureForm clientId={clientId} onDone={() => setCreating(false)} />}

      {procedures.length === 0 && !creating && (
        <p className="rounded-[14px] border-2 border-dashed border-ink/30 p-5 text-[13px] font-medium text-ink opacity-70">
          Pas encore de procédure pour ce client. Documente un process récurrent — il
          apparaîtra ici et, si tu l&apos;actives, sur le portail du client.
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
            <article key={procedure.id} className="rounded-[16px] bg-sand p-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  aria-label={openId === procedure.id ? "Replier" : "Déplier"}
                  aria-expanded={openId === procedure.id}
                  onClick={() => setOpenId(openId === procedure.id ? null : procedure.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lilac text-[12px] text-ink transition hover:brightness-95"
                >
                  <span className={openId === procedure.id ? "rotate-90" : ""}>▶</span>
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-bold text-ink">{procedure.title}</p>
                  <p className="text-[12px] font-semibold text-ink opacity-50">
                    {metaLine(procedure)}
                  </p>
                </div>

                <PortalToggle procedure={procedure} clientId={clientId} />

                <KebabMenu label={`Actions pour ${procedure.title}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(procedure.id);
                      setCreating(false);
                    }}
                    className={MENU_ITEM}
                  >
                    Éditer
                  </button>

                  {otherClients.length > 0 && (
                    <div className="mt-1 border-t border-ink/10 pt-1">
                      <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink/40">
                        Dupliquer vers
                      </p>
                      {otherClients.map((client) => (
                        <form key={client.id} action={duplicateProcedureAction}>
                          <input type="hidden" name="procedureId" value={procedure.id} />
                          <input type="hidden" name="clientId" value={clientId} />
                          <input type="hidden" name="targetClientId" value={client.id} />
                          <button type="submit" className={MENU_ITEM}>
                            → {client.name}
                          </button>
                        </form>
                      ))}
                    </div>
                  )}

                  <div className="mt-1 border-t border-ink/10 pt-1">
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
                        className={`${MENU_ITEM} hover:bg-tomato/40`}
                      >
                        Supprimer
                      </button>
                    </form>
                  </div>
                </KebabMenu>
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
