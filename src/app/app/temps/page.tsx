import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getActiveTimeEntryForVa, getTimeEntriesForVa } from "@/lib/data/timeEntries";
import { getTasksForVa } from "@/lib/data/tasks";
import ActiveTimerBanner from "@/components/app/ActiveTimerBanner";
import StartTimerForm from "@/components/app/StartTimerForm";
import TimeEntryRow from "@/components/app/TimeEntryRow";

export default async function TempsPage() {
  const session = await auth();
  if (session?.user.role !== "VA") redirect("/");

  const [active, entries, tasks] = await Promise.all([
    getActiveTimeEntryForVa(session.user.id),
    getTimeEntriesForVa(session.user.id),
    getTasksForVa(session.user.id),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="font-display text-3xl text-ink">Mes temps</h1>
        <p className="mt-1 font-body text-sm text-muted-2">
          Chaque minute suivie ici nourrira tes rapports d&apos;activité (phase 4).
        </p>
      </div>

      {active ? (
        <ActiveTimerBanner
          entry={{
            startedAt: active.startedAt.toISOString(),
            label: active.label,
            taskTitle: active.task.title,
            missionName: active.task.mission.name,
            clientName: active.task.mission.client.name,
            clientId: active.task.mission.client.id,
          }}
        />
      ) : tasks.some((task) => !task.done) ? (
        <StartTimerForm tasks={tasks} />
      ) : (
        <div className="flex flex-col items-start gap-4 rounded-3xl border border-dashed border-line bg-paper p-8">
          <h2 className="font-display text-xl text-ink">Rien à chronométrer pour l&apos;instant</h2>
          <p className="max-w-md font-body text-sm text-muted-2">
            Le chrono se rattache toujours à une tâche. Crée d&apos;abord un client, une mission
            et au moins une tâche — et reviens ici lancer le compteur.
          </p>
          <Link
            href="/app/clients"
            className="rounded-full bg-corail px-5 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink"
          >
            Aller à mes clients →
          </Link>
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">Historique</h2>
        {entries.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line bg-paper p-6 font-body text-sm text-muted-2">
            Aucun temps suivi pour l&apos;instant. Lance ton premier chrono ci-dessus, ou
            depuis le bouton ▶ d&apos;une tâche sur une fiche client.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
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
    </main>
  );
}
