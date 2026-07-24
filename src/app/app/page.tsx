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

  const openTaskCount = clients
    .flatMap((client) => client.missions)
    .filter((mission) => mission.status === "active")
    .flatMap((mission) => mission.tasks)
    .filter((task) => !task.done).length;

  return (
    <main className="flex-1 px-8 py-10">
      <div className="mb-8 flex items-center gap-4">
        <h1 className="font-bowlby text-[44px] leading-none text-ink">
          Bonjour {session.user.name?.split(" ")[0] ?? ""} !
        </h1>
        {openTaskCount > 0 && (
          <span className="-rotate-3 rounded-[10px] bg-lime px-3 py-1.5 text-xs font-bold text-ink shadow-sticker">
            {openTaskCount} tâche{openTaskCount > 1 ? "s" : ""} à faire
          </span>
        )}
      </div>

      {clients.length === 0 ? (
        <div className="flex max-w-xl flex-col items-start gap-4 rounded-[18px] border-2 border-dashed border-ink/30 p-8">
          <h2 className="text-[19px] font-bold text-ink">Bienvenue sur VA Desk</h2>
          <p className="text-[13px] leading-relaxed text-ink opacity-70">
            Tout commence par un client : ajoute ta première fiche, puis crée ses missions et
            leurs tâches. Le chrono et les rapports viendront s&apos;y brancher tout seuls.
          </p>
          <Link
            href="/app/clients/new"
            className="rounded-xl bg-orange px-5 py-3 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95"
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
            color: client.color,
            missions: client.missions.map((mission) => ({
              id: mission.id,
              name: mission.name,
              status: mission.status,
              tasks: mission.tasks.map((task) => ({
                id: task.id,
                title: task.title,
                done: task.done,
                source: task.source,
                recurring: task.recurringTask?.cadence ?? null,
                due: task.dueDate?.toISOString() ?? null,
              })),
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
                  clientColor: activeEntry.task.mission.client.color,
                }
              : null
          }
        />
      )}
    </main>
  );
}
