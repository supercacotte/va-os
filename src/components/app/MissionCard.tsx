"use client";

import { useState } from "react";
import { useActionState } from "react";

import {
  deleteMissionAction,
  renameMissionAction,
  setMissionStatusAction,
} from "@/lib/actions/missions";
import { clientColorVar } from "@/lib/client-colors";

type Props = {
  mission: { id: string; name: string; status: string; clientId: string };
  clientColor: number;
  children: React.ReactNode;
};

export default function MissionCard({ mission, clientColor, children }: Props) {
  const [editing, setEditing] = useState(false);
  const [renameState, renameAction, renamePending] = useActionState(
    async (...args: Parameters<typeof renameMissionAction>) => {
      const result = await renameMissionAction(...args);
      if (!result?.error) setEditing(false);
      return result;
    },
    undefined,
  );

  const isDone = mission.status === "done";

  return (
    <article className={`rounded-[14px] bg-sand ${isDone ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <span
          className="h-9 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: clientColorVar(clientColor) }}
          aria-hidden
        />
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
            <p className={`min-w-0 flex-1 truncate text-[17px] font-semibold text-ink ${isDone ? "line-through" : ""}`}>
              {mission.name}
            </p>
            {isDone && (
              <span className="shrink-0 rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink">
                terminée ✓
              </span>
            )}
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-full px-2.5 py-1 text-xs font-semibold text-ink/50 transition hover:text-ink"
              >
                Renommer
              </button>
              <form action={setMissionStatusAction}>
                <input type="hidden" name="missionId" value={mission.id} />
                <input type="hidden" name="clientId" value={mission.clientId} />
                <input type="hidden" name="status" value={isDone ? "active" : "done"} />
                <button
                  type="submit"
                  className="rounded-full px-2.5 py-1 text-xs font-semibold text-ink/50 transition hover:text-ink"
                >
                  {isDone ? "Réactiver" : "Terminer"}
                </button>
              </form>
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
                <button
                  type="submit"
                  className="rounded-full px-2.5 py-1 text-xs font-semibold text-ink/50 transition hover:text-ink"
                >
                  Supprimer
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {renameState?.error && (
        <p className="px-5 pb-2 text-xs font-semibold text-ink/70">{renameState.error}</p>
      )}

      <div className="border-t border-ink/15 px-5 pb-4 pt-3">{children}</div>
    </article>
  );
}
