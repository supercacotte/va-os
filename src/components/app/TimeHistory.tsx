"use client";

import { useMemo, useState } from "react";

import TimeEntryRow, { type HistoryEntry } from "@/components/app/TimeEntryRow";
import type { TaskOption } from "@/components/app/StartTimerForm";

type Props = {
  entries: HistoryEntry[];
  tasks: TaskOption[];
};

function dayLabel(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function TimeHistory({ entries, tasks }: Props) {
  const [filter, setFilter] = useState<string>("all");

  const clients = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of entries) map.set(entry.clientId, entry.clientName);
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [entries]);

  const filtered = filter === "all" ? entries : entries.filter((e) => e.clientId === filter);

  const groups: { key: string; label: string; items: HistoryEntry[] }[] = [];
  for (const entry of filtered) {
    const key = dayKey(entry.startedAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(entry);
    else groups.push({ key, label: dayLabel(entry.startedAt), items: [entry] });
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[13px] font-bold uppercase tracking-[1.5px] text-ink">
          Historique
        </h2>
        {clients.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                filter === "all" ? "bg-ink text-paper" : "bg-sand text-ink hover:bg-ink/10"
              }`}
            >
              Tous
            </button>
            {clients.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => setFilter(client.id)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  filter === client.id ? "bg-ink text-paper" : "bg-sand text-ink hover:bg-ink/10"
                }`}
              >
                {client.name.split(" ")[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-[14px] border-2 border-dashed border-ink/30 p-5 text-[13px] font-medium text-ink opacity-70">
          Aucun temps suivi pour l&apos;instant. Lance ton premier chrono ci-contre, ou depuis
          le bouton ▶ d&apos;une tâche.
        </p>
      ) : (
        groups.map((group) => (
          <div key={group.key} className="flex flex-col gap-2">
            <p
              suppressHydrationWarning
              className="mt-1 text-[11px] font-bold uppercase tracking-[1.5px] text-ink/60"
            >
              {group.label}
            </p>
            <ul className="flex flex-col gap-2">
              {group.items.map((entry) => (
                <TimeEntryRow key={entry.id} entry={entry} tasks={tasks} />
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
