import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getClientsOverview } from "@/lib/data/clients";
import InviteClientForm from "@/components/app/InviteClientForm";

export default async function AppPage() {
  const session = await auth();
  if (session?.user.role !== "VA") redirect("/");

  const clients = await getClientsOverview(session.user.id);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="font-display text-3xl text-ink">
          Bonjour {session.user.name?.split(" ")[0] ?? ""} !
        </h1>
        <p className="mt-1 font-body text-sm text-muted-2">
          {clients.length} client{clients.length > 1 ? "s" : ""} — le CRUD complet arrive en
          phase 2.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {clients.map((client) => (
          <article key={client.id} className="rounded-3xl border border-line bg-paper p-6">
            <h2 className="font-display text-xl text-ink">{client.name}</h2>
            {client.company && (
              <p className="font-label text-xs uppercase tracking-wide text-muted">
                {client.company}
              </p>
            )}

            <div className="mt-4 flex flex-col gap-3">
              {client.missions.map((mission) => (
                <div key={mission.id}>
                  <p className="font-body text-sm font-medium text-mer">{mission.name}</p>
                  <ul className="mt-1 flex flex-col gap-1">
                    {mission.tasks.map((task) => (
                      <li
                        key={task.id}
                        className={`font-body text-sm ${
                          task.done ? "text-muted line-through" : "text-muted-2"
                        }`}
                      >
                        {task.done ? "✓" : "•"} {task.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {client.portalUser ? (
              <p className="mt-4 border-t border-line pt-4 font-body text-xs text-mer">
                Portail activé pour {client.portalUser.email}
              </p>
            ) : (
              <InviteClientForm clientId={client.id} />
            )}
          </article>
        ))}

        {clients.length === 0 && (
          <p className="font-body text-sm text-muted-2">
            Aucun client pour l&apos;instant. Le premier arrive en phase 2 !
          </p>
        )}
      </div>
    </main>
  );
}
