"use client";

import { useState } from "react";
import { useRef } from "react";
import { useActionState } from "react";
import Link from "next/link";

import Chronometer from "@/components/app/Chronometer";
import { startTimerAction, stopTimerAction } from "@/lib/actions/timeEntries";

type Task = { id: string; title: string; done: boolean; source: string };
type Mission = { id: string; name: string; status: string; tasks: Task[] };
export type WorkspaceClient = {
  id: string;
  name: string;
  company: string | null;
  missions: Mission[];
};

export type ActiveTimer = {
  startedAt: string;
  label: string | null;
  taskId: string;
  taskTitle: string;
  missionName: string;
  clientId: string;
  clientName: string;
};

type Props = {
  clients: WorkspaceClient[];
  activeTimer: ActiveTimer | null;
};

export default function DashboardBoard({ clients, activeTimer }: Props) {
  const [selectedClientId, setSelectedClientId] = useState(
    () => activeTimer?.clientId ?? clients[0]?.id,
  );
  const [expandedMissions, setExpandedMissions] = useState<Set<string>>(new Set());
  const startFormRef = useRef<HTMLFormElement>(null);
  const [startState, startAction, startPending] = useActionState(
    async (...args: Parameters<typeof startTimerAction>) => {
      const result = await startTimerAction(...args);
      if (!result?.error) startFormRef.current?.reset();
      return result;
    },
    undefined,
  );

  const selectedClient = clients.find((client) => client.id === selectedClientId);
  const activeMissions =
    selectedClient?.missions.filter((mission) => mission.status === "active") ?? [];
  const openTasks = activeMissions
    .flatMap((mission) => mission.tasks.map((task) => ({ ...task, missionName: mission.name })))
    .filter((task) => !task.done);

  function toggleMission(missionId: string) {
    setExpandedMissions((prev) => {
      const next = new Set(prev);
      if (next.has(missionId)) next.delete(missionId);
      else next.add(missionId);
      return next;
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
      {/* Colonne clients */}
      <aside className="flex flex-col gap-2">
        <h2 className="font-label text-[11px] uppercase tracking-widest text-muted">
          Clients
        </h2>
        {clients.map((client) => {
          const selected = client.id === selectedClientId;
          const missionCount = client.missions.filter((m) => m.status === "active").length;
          return (
            <button
              key={client.id}
              type="button"
              onClick={() => setSelectedClientId(client.id)}
              aria-pressed={selected}
              className={`rounded-2xl border p-4 text-left transition ${
                selected
                  ? "border-corail bg-corail/10"
                  : "border-line bg-paper hover:border-corail/40"
              }`}
            >
              <p className="truncate font-display text-base text-ink">{client.name}</p>
              {client.company && (
                <p className="truncate font-label text-[10px] uppercase tracking-wide text-muted">
                  {client.company}
                </p>
              )}
              <p className="mt-1 font-body text-xs text-muted-2">
                {missionCount} mission{missionCount > 1 ? "s" : ""} active
                {missionCount > 1 ? "s" : ""}
              </p>
            </button>
          );
        })}
        <Link
          href="/app/clients/new"
          className="rounded-2xl border border-dashed border-line p-4 text-center font-label text-xs uppercase tracking-wide text-muted transition hover:border-corail hover:text-corail"
        >
          + Nouveau client
        </Link>
      </aside>

      {/* Colonne missions & tâches */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-label text-[11px] uppercase tracking-widest text-muted">
            Missions actives
          </h2>
          {selectedClient && (
            <Link
              href={`/app/clients/${selectedClient.id}`}
              className="font-label text-[11px] uppercase tracking-wide text-corail transition hover:text-ink"
            >
              Ouvrir la fiche →
            </Link>
          )}
        </div>

        {activeMissions.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line bg-paper p-5 font-body text-sm text-muted-2">
            Pas de mission active pour {selectedClient?.name ?? "ce client"} — crée-la depuis
            sa fiche.
          </p>
        )}

        {activeMissions.map((mission) => {
          const expanded = expandedMissions.has(mission.id);
          const openCount = mission.tasks.filter((task) => !task.done).length;
          return (
            <div key={mission.id} className="rounded-2xl border border-line bg-paper">
              <button
                type="button"
                onClick={() => toggleMission(mission.id)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-base text-ink">{mission.name}</p>
                  <p className="font-body text-xs text-muted-2">
                    {openCount === 0
                      ? "Tout est fait ✓"
                      : `${openCount} tâche${openCount > 1 ? "s" : ""} à faire`}
                  </p>
                </div>
                <span className="shrink-0 text-muted">{expanded ? "▾" : "▸"}</span>
              </button>
              {expanded && (
                <ul className="flex flex-col gap-1 border-t border-line px-4 py-3">
                  {mission.tasks.length === 0 && (
                    <li className="font-body text-xs text-muted">Aucune tâche.</li>
                  )}
                  {mission.tasks.map((task) => (
                    <li
                      key={task.id}
                      className={`font-body text-sm ${
                        task.done ? "text-muted line-through" : "text-ink"
                      }`}
                    >
                      {task.done ? "✓" : "•"} {task.title}
                      {task.source === "client_request" && (
                        <span className="ml-2 rounded-full bg-soleil/20 px-2 py-0.5 font-label text-[10px] uppercase tracking-wide text-muted-2">
                          Demande client
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </section>

      {/* Colonne chrono */}
      <aside className="flex flex-col gap-2">
        <h2 className="font-label text-[11px] uppercase tracking-widest text-muted">Chrono</h2>
        {activeTimer ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-corail/40 bg-paper p-5">
            <p className="flex items-center gap-2 font-label text-[11px] uppercase tracking-wide text-corail">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-corail" />
              En cours
            </p>
            <div className="min-w-0">
              <p className="truncate font-display text-base text-ink">
                {activeTimer.label ?? activeTimer.taskTitle}
              </p>
              <p className="truncate font-body text-xs text-muted-2">
                {activeTimer.clientName} — {activeTimer.missionName}
              </p>
            </div>
            <Chronometer startedAt={activeTimer.startedAt} />
            <form action={stopTimerAction}>
              <input type="hidden" name="clientId" value={activeTimer.clientId} />
              <button
                type="submit"
                className="w-full rounded-full bg-ink px-4 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-corail"
              >
                ■ Stop
              </button>
            </form>
          </div>
        ) : (
          <form
            ref={startFormRef}
            action={startAction}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-5"
          >
            <label htmlFor="board-task" className="sr-only">
              Tâche
            </label>
            <select
              id="board-task"
              name="taskId"
              required
              defaultValue=""
              key={selectedClientId}
              className="w-full rounded-full border border-line bg-cream px-4 py-2.5 font-body text-sm text-ink outline-none transition focus:border-corail"
            >
              <option value="" disabled>
                {openTasks.length === 0 ? "Aucune tâche à faire" : "Choisis une tâche…"}
              </option>
              {openTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.missionName} — {task.title}
                </option>
              ))}
            </select>
            <input type="hidden" name="clientId" value={selectedClientId ?? ""} />
            <label htmlFor="board-label" className="sr-only">
              Label (optionnel)
            </label>
            <input
              id="board-label"
              name="label"
              placeholder="Label (optionnel)"
              className="w-full rounded-full border border-line bg-cream px-4 py-2.5 font-body text-sm text-ink outline-none transition focus:border-corail"
            />
            <button
              disabled={startPending || openTasks.length === 0}
              type="submit"
              className="w-full rounded-full bg-corail px-4 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink disabled:opacity-60"
            >
              {startPending ? "Démarrage…" : "▶ Démarrer"}
            </button>
            {startState?.error && (
              <p className="font-body text-xs text-corail">{startState.error}</p>
            )}
          </form>
        )}
      </aside>
    </div>
  );
}
