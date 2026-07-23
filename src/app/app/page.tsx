import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getVaWorkspace } from "@/lib/data/clients";
import { getActiveTimeEntryForVa } from "@/lib/data/timeEntries";
import DashboardBoard from "@/components/app/DashboardBoard";

export default async function AppPage() {
  const session = await auth();
  if (session?.user.role !== "VA") redirect("/");

  const [clients, activeEntry] = await Promise.all([
    getVaWorkspace(session.user.id),
    getActiveTimeEntryForVa(session.user.id),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="font-display text-3xl text-ink">
          Bonjour {session.user.name?.split(" ")[0] ?? ""} !
        </h1>
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-3xl border border-dashed border-line bg-paper p-8">
          <h2 className="font-display text-xl text-ink">Bienvenue sur VA Desk ✨</h2>
          <p className="max-w-md font-body text-sm text-muted-2">
            Tout commence par un client : ajoute ta première fiche, puis crée ses missions et
            leurs tâches. Le chrono et les rapports viendront s&apos;y brancher tout seuls.
          </p>
          <Link
            href="/app/clients/new"
            className="rounded-full bg-corail px-5 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink"
          >
            + Ajouter mon premier client
          </Link>
        </div>
      ) : (
        <DashboardBoard
          clients={clients.map((client) => ({
            id: client.id,
            name: client.name,
            company: client.company,
            missions: client.missions.map((mission) => ({
              id: mission.id,
              name: mission.name,
              status: mission.status,
              tasks: mission.tasks,
            })),
          }))}
          activeTimer={
            activeEntry
              ? {
                  startedAt: activeEntry.startedAt.toISOString(),
                  label: activeEntry.label,
                  taskId: activeEntry.task.id,
                  taskTitle: activeEntry.task.title,
                  missionName: activeEntry.task.mission.name,
                  clientId: activeEntry.task.mission.client.id,
                  clientName: activeEntry.task.mission.client.name,
                }
              : null
          }
        />
      )}
    </main>
  );
}
