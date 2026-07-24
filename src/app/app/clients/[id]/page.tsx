import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getClientDetailForVa } from "@/lib/data/clients";
import {
  getOtherClientsForVa,
  getProceduresWithStepsForClient,
} from "@/lib/data/procedures";
import { getActiveTimeEntryForVa } from "@/lib/data/timeEntries";
import { getClientRevenue } from "@/lib/data/revenue";
import { clientColorVar } from "@/lib/client-colors";
import ClientForm from "@/components/app/ClientForm";
import InviteClientForm from "@/components/app/InviteClientForm";
import RevokePortalButton from "@/components/app/RevokePortalButton";
import AddMissionForm from "@/components/app/AddMissionForm";
import MissionCard from "@/components/app/MissionCard";
import RevenueBlock from "@/components/app/RevenueBlock";
import AddTaskForm from "@/components/app/AddTaskForm";
import TaskRow from "@/components/app/TaskRow";
import ProceduresSection from "@/components/app/ProceduresSection";
import { stopRecurringAction } from "@/lib/actions/tasks";

const SECTION_LABEL = "text-[13px] font-bold uppercase tracking-[1.5px] text-ink";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "VA") redirect("/");

  const { id } = await params;
  const [client, activeEntry, procedures, otherClients, revenue] = await Promise.all([
    getClientDetailForVa(session.user.id, id),
    getActiveTimeEntryForVa(session.user.id),
    getProceduresWithStepsForClient(session.user.id, id),
    getOtherClientsForVa(session.user.id, id),
    getClientRevenue(session.user.id, id),
  ]);
  if (!client) notFound();

  return (
    <main className="flex-1 px-8 py-10">
      <Link
        href="/app/clients"
        className="text-sm font-semibold text-ink underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
      >
        ← Mes clients
      </Link>

      <div className="mb-8 mt-3 flex items-center gap-4">
        <span
          className="h-10 w-10 shrink-0 rounded-full shadow-sticker"
          style={{ backgroundColor: clientColorVar(client.color) }}
          aria-hidden
        />
        <div>
          <h1 className="font-bowlby text-[44px] leading-none text-ink">{client.name}</h1>
          {client.company && (
            <p className="mt-1 text-[13px] font-semibold text-ink opacity-70">
              {client.company}
            </p>
          )}
        </div>
      </div>

      {revenue && (
        <div className="mb-8">
          <RevenueBlock clientId={client.id} revenue={revenue} />
        </div>
      )}

      <div className="grid gap-7 lg:grid-cols-[380px_minmax(0,1fr)]">
        <section className="flex flex-col gap-3">
          <h2 className={SECTION_LABEL}>Infos du client</h2>
          <div className="rounded-[18px] bg-sand p-6">
            <ClientForm
              client={{ id: client.id, name: client.name, company: client.company }}
            />
            <div className="mt-6 border-t border-ink/15 pt-4">
              <p className="mb-2 text-[13px] font-bold uppercase tracking-[1.5px] text-ink">
                Accès au portail
              </p>
              {client.portalUser ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="min-w-0 text-[13px] font-semibold text-ink">
                    Activé pour {client.portalUser.email}{" "}
                    <span className="ml-1 inline-block rounded-full bg-lime px-2 py-0.5 text-[11px] font-bold">
                      actif ✓
                    </span>
                  </p>
                  <RevokePortalButton
                    clientId={client.id}
                    email={client.portalUser.email}
                  />
                </div>
              ) : (
                <>
                  <p className="mb-2 text-[13px] font-medium text-ink opacity-70">
                    Donne à ce client l&apos;accès à son portail (lecture seule de
                    l&apos;avancement, des rapports et des procédures) :
                  </p>
                  <InviteClientForm clientId={client.id} />
                </>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className={SECTION_LABEL}>Missions</h2>

          {client.missions.length === 0 && (
            <p className="rounded-[14px] border-2 border-dashed border-ink/30 p-5 text-[13px] font-medium text-ink opacity-70">
              Pas encore de mission pour {client.name}. Une mission = un chantier récurrent ou
              ponctuel — crée la première ci-dessous.
            </p>
          )}

          {client.missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={{
                id: mission.id,
                name: mission.name,
                status: mission.status,
                clientId: client.id,
              }}
              clientColor={client.color}
            >
              {mission.tasks.length === 0 ? (
                <p className="text-[13px] font-medium text-ink opacity-70">
                  Aucune tâche — ajoute la première ci-dessous.
                </p>
              ) : (
                <ul className="flex flex-col">
                  {mission.tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={{
                        id: task.id,
                        title: task.title,
                        done: task.done,
                        source: task.source,
                        recurring: task.recurringTask?.cadence ?? null,
                        due: task.dueDate?.toISOString() ?? null,
                      }}
                      clientId={client.id}
                      clientColor={client.color}
                      timerActive={activeEntry?.task.id === task.id}
                      timerStartedAt={
                        activeEntry ? activeEntry.startedAt.toISOString() : null
                      }
                    />
                  ))}
                </ul>
              )}
              <AddTaskForm missionId={mission.id} clientId={client.id} />
              {mission.recurringTasks.length > 0 && (
                <div className="mt-3 flex flex-col gap-1 border-t border-ink/15 pt-2.5">
                  {mission.recurringTasks.map((recurring) => (
                    <div
                      key={recurring.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <p className="min-w-0 flex-1 truncate text-xs font-semibold text-ink/70">
                        {recurring.title} —{" "}
                        {recurring.cadence === "weekly" ? "chaque semaine" : "chaque mois"}
                      </p>
                      <form action={stopRecurringAction}>
                        <input type="hidden" name="recurringTaskId" value={recurring.id} />
                        <input type="hidden" name="clientId" value={client.id} />
                        <button
                          type="submit"
                          className="text-xs font-semibold text-ink/50 transition hover:text-ink"
                        >
                          Arrêter la récurrence
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </MissionCard>
          ))}

          <AddMissionForm clientId={client.id} />
        </section>
      </div>

      <div className="mt-10 border-t border-ink/15 pt-8">
        <ProceduresSection
          clientId={client.id}
          procedures={procedures.map((procedure) => ({
            id: procedure.id,
            title: procedure.title,
            steps: procedure.steps,
            updatedAt: procedure.updatedAt.toISOString(),
          }))}
          otherClients={otherClients}
        />
      </div>
    </main>
  );
}
