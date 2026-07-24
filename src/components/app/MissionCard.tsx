"use client";

import { useState } from "react";
import { useActionState } from "react";

import KebabMenu from "@/components/app/KebabMenu";
import {
  deleteMissionAction,
  renameMissionAction,
  setMissionStatusAction,
} from "@/lib/actions/missions";
import { clientColorVar } from "@/lib/client-colors";

type Props = {
  mission: { id: string; name: string; status: string; clientId: string };
  clientColor: number;
  openCount: number;
  children: React.ReactNode;
};

const MENU_ITEM =
  "w-full rounded-[10px] px-3 py-2 text-left text-[13px] font-semibold text-ink transition hover:bg-sand";

// Carte mission de la fiche client (maquette 33a) : chevron ▶/▼ pour
// déplier/replier, pastille de compte, actions en kebab « ··· ».
export default function MissionCard({ mission, clientColor, openCount, children }: Props) {
  const isDone = mission.status === "done";
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(!isDone && openCount > 0);
  const [renameState, renameAction, renamePending] = useActionState(
    async (...args: Parameters<typeof renameMissionAction>) => {
      const result = await renameMissionAction(...args);
      if (!result?.error) setEditing(false);
      return result;
    },
    undefined,
  );

  return (
    <article className={`rounded-[14px] bg-sand ${isDone ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        {editing ? (
          <form action={renameAction} className="flex min-w-0 flex-1 items-center gap-2">
            <input type="hidden" name="missionId" value={mission.id} />
            <input type="hidden" name="clientId" value={mission.clientId} />
            <label htmlFor={`rename-${mission.id}`} className="sr-only">
              Nouveau nom
            </label>
            <input
              id={`rename-${mission.id}`}
              name="name"
              defaultValue={mission.name}
              autoFocus
              required
              className="min-w-0 flex-1 rounded-[10px] bg-paper px-4 py-2 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30"
            />
            <button
              disabled={renamePending}
              type="submit"
              className="rounded-lg bg-orange px-3 py-1.5 text-xs font-bold text-ink shadow-sticker disabled:opacity-60"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs font-semibold text-ink/60 transition hover:text-ink"
            >
              Annuler
            </button>
          </form>
        ) : (
          <>
            <button
              type="button"
              aria-label={open ? "Replier la mission" : "Déplier la mission"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] text-ink transition hover:brightness-95"
              style={{ backgroundColor: clientColorVar(clientColor) }}
            >
              <span className={open ? "rotate-90" : ""}>▶</span>
            </button>
            <p className={`min-w-0 flex-1 truncate text-[17px] font-semibold text-ink ${isDone ? "line-through" : ""}`}>
              {mission.name}
            </p>
            {isDone ? (
              <span className="shrink-0 rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink">
                terminée ✓
              </span>
            ) : openCount > 0 ? (
              <span className="shrink-0 rounded-full bg-orange px-3 py-1 text-xs font-bold text-ink">
                {openCount} à faire
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink">
                tout est fait ✓
              </span>
            )}
            <KebabMenu label={`Actions pour ${mission.name}`}>
              <button type="button" onClick={() => setEditing(true)} className={MENU_ITEM}>
                Renommer
              </button>
              <form action={setMissionStatusAction}>
                <input type="hidden" name="missionId" value={mission.id} />
                <input type="hidden" name="clientId" value={mission.clientId} />
                <input type="hidden" name="status" value={isDone ? "active" : "done"} />
                <button type="submit" className={MENU_ITEM}>
                  {isDone ? "Réactiver" : "Terminer"}
                </button>
              </form>
              <div className="mt-1 border-t border-ink/10 pt-1">
                <form
                  action={deleteMissionAction}
                  onSubmit={(e) => {
                    if (
                      !confirm(
                        `Supprimer la mission « ${mission.name} » et toutes ses tâches ? Cette action est irréversible.`,
                      )
                    ) {
                      e.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="missionId" value={mission.id} />
                  <input type="hidden" name="clientId" value={mission.clientId} />
                  <button type="submit" className={`${MENU_ITEM} hover:bg-tomato/40`}>
                    Supprimer
                  </button>
                </form>
              </div>
            </KebabMenu>
          </>
        )}
      </div>

      {renameState?.error && (
        <p className="px-5 pb-2 text-xs font-semibold text-ink/70">{renameState.error}</p>
      )}

      {open && <div className="border-t border-ink/15 px-5 pb-4 pt-3">{children}</div>}
    </article>
  );
}
