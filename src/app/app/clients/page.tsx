import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getClientsForVa } from "@/lib/data/clients";
import ClientRowActions from "@/components/app/ClientRowActions";

export default async function ClientsPage() {
  const session = await auth();
  if (session?.user.role !== "VA") redirect("/");

  const clients = await getClientsForVa(session.user.id);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Mes clients</h1>
          <p className="mt-1 font-body text-sm text-muted-2">
            {clients.length === 0
              ? "C'est encore calme par ici."
              : `${clients.length} client${clients.length > 1 ? "s" : ""} au compteur.`}
          </p>
        </div>
        <Link
          href="/app/clients/new"
          className="rounded-full bg-corail px-5 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink"
        >
          + Nouveau client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-3xl border border-dashed border-line bg-paper p-8">
          <h2 className="font-display text-xl text-ink">Ajoute ton premier client</h2>
          <p className="max-w-md font-body text-sm text-muted-2">
            Un nom, une entreprise si besoin, et c&apos;est parti : tu pourras ensuite créer ses
            missions, leurs tâches, et l&apos;inviter sur son portail.
          </p>
          <Link
            href="/app/clients/new"
            className="rounded-full border border-ink px-5 py-3 font-label text-xs uppercase tracking-wide text-ink transition hover:border-corail hover:text-corail"
          >
            Créer la première fiche →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {clients.map((client) => {
            const activeMissions = client.missions.filter((m) => m.status === "active").length;
            const openTasks = client.missions
              .flatMap((m) => m.tasks)
              .filter((t) => !t.done).length;

            return (
              <div
                key={client.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-paper p-5"
              >
                <Link href={`/app/clients/${client.id}`} className="group min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg text-ink transition group-hover:text-corail">
                      {client.name}
                    </h2>
                    {client.company && (
                      <span className="font-label text-xs uppercase tracking-wide text-muted">
                        {client.company}
                      </span>
                    )}
                    {client.portalUser && (
                      <span className="rounded-full bg-mer/15 px-3 py-1 font-label text-[11px] uppercase tracking-wide text-mer">
                        Portail actif
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-body text-sm text-muted-2">
                    {activeMissions} mission{activeMissions > 1 ? "s" : ""} en cours —{" "}
                    {openTasks} tâche{openTasks > 1 ? "s" : ""} à faire
                  </p>
                </Link>

                <ClientRowActions clientId={client.id} name={client.name} />
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
