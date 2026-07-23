import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getClientDetailForVa } from "@/lib/data/clients";
import { getActiveTimeEntryForVa } from "@/lib/data/timeEntries";
import ClientForm from "@/components/app/ClientForm";
import InviteClientForm from "@/components/app/InviteClientForm";
import AddMissionForm from "@/components/app/AddMissionForm";
import MissionCard from "@/components/app/MissionCard";
import AddTaskForm from "@/components/app/AddTaskForm";
import TaskRow from "@/components/app/TaskRow";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "VA") redirect("/");

  const { id } = await params;
  const [client, activeEntry] = await Promise.all([
    getClientDetailForVa(session.user.id, id),
    getActiveTimeEntryForVa(session.user.id),
  ]);
  if (!client) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <div>
        <Link
          href="/app/clients"
          className="font-label text-xs uppercase tracking-wide text-muted transition hover:text-corail"
        >
          ← Mes clients
        </Link>
        <h1 className="mt-2 font-display text-3xl text-ink">{client.name}</h1>
        {client.company && (
          <p className="mt-1 font-label text-xs uppercase tracking-wide text-muted">
            {client.company}
          </p>
        )}
      </div>

      <section className="rounded-3xl border border-line bg-paper p-6">
        <h2 className="mb-4 font-display text-lg text-ink">Infos du client</h2>
        <ClientForm
          client={{ id: client.id, name: client.name, company: client.company }}
        />
        <div className="mt-6 border-t border-line pt-4">
          {client.portalUser ? (
            <p className="font-body text-sm text-mer">
              Portail activé pour {client.portalUser.email}
            </p>
          ) : (
            <>
              <p className="mb-2 font-body text-sm text-muted-2">
                Invite ce client sur son portail (lecture seule de l&apos;avancement) :
              </p>
              <InviteClientForm clientId={client.id} />
            </>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl text-ink">Missions</h2>

        {client.missions.length === 0 && (
          <p className="rounded-3xl border border-dashed border-line bg-paper p-6 font-body text-sm text-muted-2">
            Pas encore de mission pour {client.name}. Une mission = un chantier récurrent ou
            ponctuel (ex. « Gestion des réseaux sociaux ») — crée la première ci-dessous.
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
          >
            {mission.tasks.length === 0 ? (
              <p className="font-body text-xs text-muted">
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
                    }}
                    clientId={client.id}
                    timerActive={activeEntry?.task.id === task.id}
                  />
                ))}
              </ul>
            )}
            <AddTaskForm missionId={mission.id} clientId={client.id} />
          </MissionCard>
        ))}

        <AddMissionForm clientId={client.id} />
      </section>
    </main>
  );
}
