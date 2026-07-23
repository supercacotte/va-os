import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getActiveTimeEntryForVa, getTimeEntriesForVa } from "@/lib/data/timeEntries";
import { getTasksForVa } from "@/lib/data/tasks";
import ActiveTimerBanner from "@/components/app/ActiveTimerBanner";
import StartTimerForm from "@/components/app/StartTimerForm";
import TimeEntryRow from "@/components/app/TimeEntryRow";

const SECTION_LABEL = "text-[13px] font-bold uppercase tracking-[1.5px] text-ink";

export default async function TempsPage() {
  const session = await auth();
  if (session?.user.role !== "VA") redirect("/");

  const [active, entries, tasks] = await Promise.all([
    getActiveTimeEntryForVa(session.user.id),
    getTimeEntriesForVa(session.user.id),
    getTasksForVa(session.user.id),
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

  return (
    <main className="flex-1 px-8 py-10">
      <div className="mb-8">
        <h1 className="font-bowlby text-[44px] leading-none text-ink">Mes temps</h1>
        <p className="mt-3 text-[13px] font-medium text-ink opacity-70">
          Chaque minute suivie ici nourrit tes rapports d&apos;activité.
        </p>
      </div>

      <div className="flex flex-col gap-7">
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
          <StartTimerForm clients={timerClients} />
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-[18px] border-2 border-dashed border-ink/30 p-8">
            <h2 className="text-[19px] font-bold text-ink">
              Rien à chronométrer pour l&apos;instant
            </h2>
            <p className="max-w-md text-[13px] font-medium leading-relaxed text-ink opacity-70">
              Le chrono se rattache toujours à une tâche. Crée d&apos;abord un client, une
              mission et au moins une tâche — et reviens ici lancer le compteur.
            </p>
            <Link
              href="/app/clients"
              className="rounded-xl bg-orange px-5 py-3 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95"
            >
              Aller à mes clients
            </Link>
          </div>
        )}

        <section className="flex flex-col gap-3">
          <h2 className={SECTION_LABEL}>Historique</h2>
          {entries.length === 0 ? (
            <p className="rounded-[14px] border-2 border-dashed border-ink/30 p-5 text-[13px] font-medium text-ink opacity-70">
              Aucun temps suivi pour l&apos;instant. Lance ton premier chrono ci-dessus, ou
              depuis le bouton ▶ d&apos;une tâche.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {entries.map((entry) => (
                <TimeEntryRow
                  key={entry.id}
                  entry={{
                    id: entry.id,
                    label: entry.label,
                    startedAt: entry.startedAt.toISOString(),
                    endedAt: entry.endedAt!.toISOString(),
                    taskId: entry.task.id,
                    taskTitle: entry.task.title,
                    missionName: entry.task.mission.name,
                    clientName: entry.task.mission.client.name,
                  }}
                  tasks={tasks}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
