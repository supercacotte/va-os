import Link from "next/link";

import { auth } from "@/auth";
import UserMenu from "@/components/UserMenu";
import { getClientsOverview } from "@/lib/data/clients";

export default async function Home() {
  const session = await auth();
  // Listing temporaire Phase 0 (preuve du seed) — remplacé par le dashboard
  // VA de la phase 2.
  const clients =
    session?.user.role === "VA" ? await getClientsOverview(session.user.id) : [];

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <p className="font-label text-xs uppercase tracking-widest text-muted">
        Smart Lazy VA OS — Phase 0
      </p>
      <h1 className="max-w-2xl font-display text-4xl text-ink">
        Le cockpit d&apos;opérations des assistantes virtuelles
      </h1>
      <p className="max-w-md font-body text-sm text-muted-2">
        Clients → missions → tâches → chrono → rapport d&apos;activité → facture.
      </p>

      {session?.user ? (
        <>
          <div className="flex items-center gap-4">
            <p className="font-body text-sm text-ink">
              Connectée en tant que {session.user.name ?? session.user.email} ({session.user.role})
            </p>
            <UserMenu name={session.user.name} email={session.user.email} />
          </div>

          {clients.length > 0 && (
            <section className="mt-8 w-full max-w-2xl text-left">
              <h2 className="mb-4 text-center font-label text-xs uppercase tracking-widest text-muted">
                Tes clients
              </h2>
              <div className="flex flex-col gap-4">
                {clients.map((client) => (
                  <article
                    key={client.id}
                    className="rounded-3xl border border-line bg-paper p-6"
                  >
                    <h3 className="font-display text-xl text-ink">{client.name}</h3>
                    {client.company && (
                      <p className="font-label text-xs uppercase tracking-wide text-muted">
                        {client.company}
                      </p>
                    )}
                    <div className="mt-4 flex flex-col gap-3">
                      {client.missions.map((mission) => (
                        <div key={mission.id}>
                          <p className="font-body text-sm font-medium text-mer">
                            {mission.name}
                          </p>
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
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="flex gap-3">
          <Link
            href="/connexion"
            prefetch={false}
            className="rounded-full border border-ink px-5 py-3 font-label text-xs uppercase tracking-wide text-ink transition hover:border-corail hover:text-corail"
          >
            Se connecter
          </Link>
          <Link
            href="/inscription"
            prefetch={false}
            className="rounded-full bg-corail px-5 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink"
          >
            Créer mon compte
          </Link>
        </div>
      )}
    </main>
  );
}
