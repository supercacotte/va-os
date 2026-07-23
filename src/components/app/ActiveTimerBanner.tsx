"use client";

import Chronometer from "@/components/app/Chronometer";
import { stopTimerAction } from "@/lib/actions/timeEntries";

type Props = {
  entry: {
    startedAt: string;
    label: string | null;
    taskTitle: string;
    missionName: string;
    clientName: string;
    clientId: string;
  };
};

export default function ActiveTimerBanner({ entry }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-corail/40 bg-paper p-6">
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-label text-[11px] uppercase tracking-wide text-corail">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-corail" />
          Chrono en cours
        </p>
        <p className="mt-1 truncate font-display text-lg text-ink">
          {entry.label ?? entry.taskTitle}
        </p>
        <p className="truncate font-body text-sm text-muted-2">
          {entry.clientName} — {entry.missionName}
          {entry.label ? ` — ${entry.taskTitle}` : ""}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Chronometer startedAt={entry.startedAt} />
        <form action={stopTimerAction}>
          <input type="hidden" name="clientId" value={entry.clientId} />
          <button
            type="submit"
            className="rounded-full bg-ink px-5 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-corail"
          >
            ■ Stop
          </button>
        </form>
      </div>
    </div>
  );
}
