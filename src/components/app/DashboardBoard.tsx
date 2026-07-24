"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import Chronometer from "@/components/app/Chronometer";
import StartTimerForm from "@/components/app/StartTimerForm";
import TaskRow from "@/components/app/TaskRow";
import AddTaskForm from "@/components/app/AddTaskForm";
import { stopTimerAction } from "@/lib/actions/timeEntries";
import { clientColorVar } from "@/lib/client-colors";

type Task = { id: string; title: string; done: boolean; source: string; recurring?: string | null };
type Mission = { id: string; name: string; status: string; tasks: Task[] };
export type WorkspaceClient = {
  id: string;
  name: string;
  company: string | null;
  color: number;
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
  clientColor: number;
};

type Props = {
  clients: WorkspaceClient[];
  activeTimer: ActiveTimer | null;
};

const SECTION_LABEL = "text-[13px] font-bold uppercase tracking-[1.5px] text-ink";

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

  function toggleMission(missionId: string) {
    setExpandedMissions((prev) => {
      const next = new Set(prev);
      if (next.has(missionId)) next.delete(missionId);
      else next.add(missionId);
      return next;
    });
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

  return (
    <div className="grid gap-7 lg:grid-cols-[300px_minmax(0,1fr)_340px]">
      {/* Colonne clients */}
      <aside className="flex flex-col gap-3">
        <h2 className={SECTION_LABEL}>Clients</h2>
        {clients.map((client) => {
          const selected = client.id === selectedClientId;
          const missionCount = client.missions.filter((m) => m.status === "active").length;
          return (
            <button
              key={client.id}
              type="button"
              onClick={() => selectClient(client.id)}
              aria-pressed={selected}
              className={`rounded-[16px] p-5 text-left transition ${
                selected
                  ? "border-2 border-ink shadow-sticker-strong"
                  : "shadow-sticker hover:-translate-y-0.5"
              }`}
              style={{ backgroundColor: clientColorVar(client.color) }}
            >
              <p className="truncate text-[19px] font-bold text-ink">{client.name}</p>
              {client.company && (
                <p className="truncate text-[13px] font-semibold text-ink opacity-70">
                  {client.company}
                </p>
              )}
              <span className="mt-3 inline-block rounded-full bg-paper px-3 py-1 text-xs font-bold text-ink">
                {missionCount} mission{missionCount > 1 ? "s" : ""} active
                {missionCount > 1 ? "s" : ""}
              </span>
            </button>
          );
        })}
        <Link
          href="/app/clients/new"
          className="flex min-h-[64px] items-center justify-center rounded-[16px] border-2 border-dashed border-ink/30 text-sm font-semibold text-ink/70 transition hover:border-ink/60 hover:text-ink"
        >
          + Nouveau client
        </Link>
      </aside>

      {/* Colonne missions & tâches */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className={SECTION_LABEL}>Missions actives</h2>
          {selectedClient && (
            <Link
              href={`/app/clients/${selectedClient.id}`}
              className="text-sm font-semibold text-ink underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
            >
              Ouvrir la fiche →
            </Link>
          )}
        </div>

        {activeMissions.length === 0 && (
          <p className="rounded-[14px] border-2 border-dashed border-ink/30 p-5 text-[13px] font-medium text-ink opacity-70">
            Pas de mission active pour {selectedClient?.name ?? "ce client"} — crée-la depuis
            sa fiche.
          </p>
        )}

        {activeMissions.map((mission) => {
          const expanded = expandedMissions.has(mission.id);
          const openCount = mission.tasks.filter((task) => !task.done).length;
          return (
            <div key={mission.id} className="rounded-[14px] bg-sand">
              <button
                type="button"
                onClick={() => toggleMission(mission.id)}
                aria-expanded={expanded}
                className="flex w-full items-center gap-3 rounded-[14px] px-5 py-4 text-left"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink"
                  style={{ backgroundColor: clientColorVar(selectedClient?.color ?? 1) }}
                >
                  <ChevronRight
                    size={16}
                    className={`transition-transform ${expanded ? "rotate-90" : ""}`}
                  />
                </span>
                <p className="min-w-0 flex-1 truncate text-[17px] font-semibold text-ink">
                  {mission.name}
                </p>
                {openCount > 0 ? (
                  <span className="shrink-0 rounded-full bg-orange px-3 py-1 text-xs font-bold text-ink">
                    {openCount} à faire
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink">
                    tout est fait ✓
                  </span>
                )}
              </button>
              {expanded && (
                <div className="border-t border-ink/15 px-5 pb-4 pt-3">
                  {mission.tasks.length === 0 ? (
                    <p className="text-[13px] font-medium text-ink opacity-70">
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
      <aside className="flex flex-col gap-3">
        <h2 className={SECTION_LABEL}>Chrono</h2>
        {activeTimer ? (
          <div
            className="flex flex-col gap-4 rounded-[18px] p-6 shadow-sticker"
            style={{ backgroundColor: clientColorVar(activeTimer.clientColor) }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[19px] font-bold text-ink">En cours</p>
              <span className="rotate-2 rounded-full border-4 border-paper bg-lime px-2.5 py-1 text-xs font-bold text-ink shadow-sticker">
                ● rec
              </span>
            </div>
            <Chronometer startedAt={activeTimer.startedAt} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-ink">
                {activeTimer.clientName} — {activeTimer.missionName}
              </p>
              <p className="truncate text-[13px] font-semibold text-ink opacity-70">
                {activeTimer.label ?? activeTimer.taskTitle}
              </p>
            </div>
            <form action={stopTimerAction}>
              <input type="hidden" name="clientId" value={activeTimer.clientId} />
              <button
                type="submit"
                className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-bold text-paper shadow-sticker transition hover:opacity-90"
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
