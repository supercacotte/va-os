"use client";

import Chronometer from "@/components/app/Chronometer";
import { stopTimerAction } from "@/lib/actions/timeEntries";
import { clientColorVar } from "@/lib/client-colors";

type Props = {
  entry: {
    startedAt: string;
    label: string | null;
    taskTitle: string;
    missionName: string;
    clientName: string;
    clientId: string;
    clientColor: number;
  };
};

export default function ActiveTimerBanner({ entry }: Props) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-5 rounded-[18px] p-6 shadow-sticker"
      style={{ backgroundColor: clientColorVar(entry.clientColor) }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <p className="text-[19px] font-bold text-ink">En cours</p>
          <span className="rotate-2 rounded-full border-4 border-paper bg-lime px-2.5 py-1 text-xs font-bold text-ink shadow-sticker">
            ● rec
          </span>
        </div>
        <p className="mt-2 truncate text-[13px] font-bold text-ink">
          {entry.clientName} — {entry.missionName}
        </p>
        <p className="truncate text-[13px] font-semibold text-ink opacity-70">
          {entry.label ?? entry.taskTitle}
        </p>
      </div>

      <div className="flex items-center gap-5">
        <Chronometer startedAt={entry.startedAt} />
        <form action={stopTimerAction}>
          <input type="hidden" name="clientId" value={entry.clientId} />
          <button
            type="submit"
            className="rounded-xl bg-ink px-5 py-3 text-sm font-bold text-paper shadow-sticker transition hover:opacity-90"
          >
            ■ Stop
          </button>
        </form>
      </div>
    </div>
  );
}
