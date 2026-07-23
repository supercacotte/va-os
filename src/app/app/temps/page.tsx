import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  getActiveTimeEntryForVa,
  getTimeEntriesForVa,
  getTimeStatsForVa,
} from "@/lib/data/timeEntries";
import { getTasksForVa } from "@/lib/data/tasks";
import { quickStartTimerAction } from "@/lib/actions/timeEntries";
import { clientColorVar } from "@/lib/client-colors";
import { formatDuration } from "@/lib/format";
import ActiveTimerBanner from "@/components/app/ActiveTimerBanner";
import StartTimerForm from "@/components/app/StartTimerForm";
import TimeHistory from "@/components/app/TimeHistory";

const SECTION_LABEL = "text-[13px] font-bold uppercase tracking-[1.5px] text-ink";

export default async function TempsPage() {
  const session = await auth();
  if (session?.user.role !== "VA") redirect("/");

  const [active, entries, tasks, stats] = await Promise.all([
    getActiveTimeEntryForVa(session.user.id),
    getTimeEntriesForVa(session.user.id),
    getTasksForVa(session.user.id),
    getTimeStatsForVa(session.user.id),
  ]);

  const timerClients = Object.values(
    tasks
      .filter((task) => !task.done)
      .reduce<
        Record<
          string,
          { id: string; name: string; tasks: { id: string; title: string; missionName: string }[] }
        >
      >((acc, task) => {
        const client = task.mission.client;
        acc[client.id] ??= { id: client.id, name: client.name, tasks: [] };
        acc[client.id].tasks.push({
          id: task.id,
          title: task.title,
          missionName: task.mission.name,
        });
        return acc;
      }, {}),
  );

  const statTiles = [
    { value: stats.todayMs, label: "Aujourd'hui" },
    { value: stats.weekMs, label: "Cette semaine" },
    { value: stats.monthMs, label: "Ce mois-ci" },
  ];
  const maxClientMs = Math.max(1, ...stats.perClient.map((c) => c.totalMs));
  const monthName = new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(new Date());
  const lastEntry = entries[0];
  const lastEntryTask = lastEntry
    ? tasks.find((task) => task.id === lastEntry.task.id && !task.done)
    : undefined;

  const historyEntries = entries.map((entry) => ({
    id: entry.id,
    label: entry.label,
    startedAt: entry.startedAt.toISOString(),
    endedAt: entry.endedAt!.toISOString(),
    taskId: entry.task.id,
    taskTitle: entry.task.title,
    missionName: entry.task.mission.name,
    clientId: entry.task.mission.client.id,
    clientName: entry.task.mission.client.name,
    clientColor: entry.task.mission.client.color,
  }));

  return (
    <main className="flex-1 px-8 py-10">
      <div className="mb-2 flex items-center gap-4">
        <h1 className="font-bowlby text-[44px] leading-none text-ink">Mes temps</h1>
        {stats.todayMs > 0 && (
          <span className="-rotate-3 rounded-[10px] bg-lime px-3 py-1.5 text-xs font-bold text-ink shadow-sticker">
            {formatDuration(stats.todayMs)} aujourd&apos;hui
          </span>
        )}
      </div>
      <p className="mb-8 text-[13px] font-medium text-ink opacity-70">
        Chaque minute suivie ici nourrit tes rapports d&apos;activité.
      </p>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-7">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {statTiles.map((tile) => (
              <div key={tile.label} className="rounded-[14px] bg-sand px-5 py-4">
                <p className="text-[26px] font-bold leading-tight tabular-nums text-ink">
                  {tile.value > 0 ? formatDuration(tile.value) : "0 min"}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-ink/60">
                  {tile.label}
                </p>
              </div>
            ))}
          </div>

          {stats.perClient.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className={SECTION_LABEL}>Par client — {monthName}</h2>
              {stats.perClient.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center gap-4 rounded-[14px] bg-sand px-5 py-4"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-ink"
                    style={{ backgroundColor: clientColorVar(client.color) }}
                  >
                    {client.name.trim()[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-ink">{client.name}</p>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(4, Math.round((client.totalMs / maxClientMs) * 100))}%`,
                          backgroundColor: clientColorVar(client.color),
                        }}
                      />
                    </div>
                  </div>
                  <p className="shrink-0 text-[15px] font-bold tabular-nums text-ink">
                    {formatDuration(client.totalMs)}
                  </p>
                </div>
              ))}
            </section>
          )}

          <TimeHistory entries={historyEntries} tasks={tasks} />
        </div>

        <aside className="flex flex-col gap-3">
          <h2 className={SECTION_LABEL}>Chrono</h2>
          {active ? (
            <ActiveTimerBanner
              entry={{
                startedAt: active.startedAt.toISOString(),
                label: active.label,
                taskTitle: active.task.title,
                missionName: active.task.mission.name,
                clientName: active.task.mission.client.name,
                clientId: active.task.mission.client.id,
                clientColor: active.task.mission.client.color,
              }}
            />
          ) : timerClients.length > 0 ? (
            <StartTimerForm clients={timerClients} layout="column" />
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-[18px] border-2 border-dashed border-ink/30 p-6">
              <h3 className="text-[19px] font-bold text-ink">Rien à chronométrer</h3>
              <p className="text-[13px] font-medium leading-relaxed text-ink opacity-70">
                Le chrono se rattache toujours à une tâche. Crée d&apos;abord un client, une
                mission et au moins une tâche.
              </p>
              <Link
                href="/app/clients"
                className="rounded-xl bg-orange px-5 py-3 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95"
              >
                Aller à mes clients
              </Link>
            </div>
          )}

          {!active && lastEntry && lastEntryTask && (
            <div
              className="flex flex-col gap-2 rounded-[18px] p-5 shadow-sticker"
              style={{
                backgroundColor: clientColorVar(lastEntry.task.mission.client.color),
              }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-ink">
                Reprendre là où tu t&apos;es arrêtée
              </p>
              <p className="truncate text-[15px] font-bold text-ink">
                {lastEntry.label ?? lastEntry.task.title}
              </p>
              <p className="truncate text-[13px] font-semibold text-ink opacity-70">
                {lastEntry.task.mission.client.name} ·{" "}
                {formatDuration(lastEntry.endedAt!.getTime() - lastEntry.startedAt.getTime())}
              </p>
              <form action={quickStartTimerAction} className="mt-1">
                <input type="hidden" name="taskId" value={lastEntry.task.id} />
                <input type="hidden" name="clientId" value={lastEntry.task.mission.client.id} />
                {lastEntry.label && (
                  <input type="hidden" name="label" value={lastEntry.label} />
                )}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-paper px-4 py-2.5 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95"
                >
                  ▶ Relancer ce chrono
                </button>
              </form>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
