"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import Chronometer from "@/components/app/Chronometer";
import StartTimerForm from "@/components/app/StartTimerForm";
import TaskRow from "@/components/app/TaskRow";
import AddTaskForm from "@/components/app/AddTaskForm";
import { stopTimerAction } from "@/lib/actions/timeEntries";

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
  // La première mission active du client sélectionné arrive dépliée.
  const firstActiveMissionOf = (clientId: string | undefined) =>
    clients
      .find((client) => client.id === clientId)
      ?.missions.find((mission) => mission.status === "active")?.id;
  const [expandedMissions, setExpandedMissions] = useState<Set<string>>(() => {
    const first = firstActiveMissionOf(activeTimer?.clientId ?? clients[0]?.id);
    return new Set(first ? [first] : []);
  });

  function selectClient(clientId: string) {
    setSelectedClientId(clientId);
    const first = firstActiveMissionOf(clientId);
    setExpandedMissions(new Set(first ? [first] : []));
  }

  const selectedClient = clients.find((client) => client.id === selectedClientId);
  const activeMissions =
    selectedClient?.missions.filter((mission) => mission.status === "active") ?? [];

  const timerClients = clients.map((client) => ({
    id: client.id,
    name: client.name,
    tasks: client.missions
      .filter((mission) => mission.status === "active")
      .flatMap((mission) =>
        mission.tasks
          .filter((task) => !task.done)
          .map((task) => ({ id: task.id, title: task.title, missionName: mission.name })),
      ),
  }));

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
              onClick={() => selectClient(client.id)}
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
            <div
              key={mission.id}
              className={`rounded-2xl border bg-paper transition ${
                expanded ? "border-corail/40 shadow-sm" : "border-line"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleMission(mission.id)}
                aria-expanded={expanded}
                className="group flex w-full items-center gap-3 rounded-2xl p-4 text-left transition hover:bg-cream/60"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
                    expanded
                      ? "rotate-90 border-corail bg-corail text-paper"
                      : "border-line bg-cream text-ink/60 group-hover:border-corail group-hover:text-corail"
                  }`}
                >
                  <ChevronRight size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base text-ink">{mission.name}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 font-label text-[11px] uppercase tracking-wide ${
                    openCount === 0 ? "bg-mer/15 text-mer" : "bg-cream text-muted-2"
                  }`}
                >
                  {openCount === 0 ? "Tout est fait ✓" : `${openCount} à faire`}
                </span>
              </button>
              {expanded && (
                <div className="border-t border-line px-4 py-3">
                  {mission.tasks.length === 0 ? (
                    <p className="font-body text-xs text-muted">
                      Aucune tâche — ajoute la première ci-dessous.
                    </p>
                  ) : (
                    <ul className="flex flex-col">
                      {mission.tasks.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          clientId={selectedClient!.id}
                          timerActive={activeTimer?.taskId === task.id}
                        />
                      ))}
                    </ul>
                  )}
                  <AddTaskForm missionId={mission.id} clientId={selectedClient!.id} />
                </div>
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
          <StartTimerForm
            key={selectedClientId}
            clients={timerClients}
            defaultClientId={selectedClientId}
            layout="column"
          />
        )}
      </aside>
    </div>
  );
}
