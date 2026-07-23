import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getClientsForVa } from "@/lib/data/clients";
import { clientColorVar } from "@/lib/client-colors";
import ClientRowActions from "@/components/app/ClientRowActions";

export default async function ClientsPage() {
  const session = await auth();
  if (session?.user.role !== "VA") redirect("/");

  const clients = await getClientsForVa(session.user.id);

  return (
    <main className="flex-1 px-8 py-10">
      <div className="mb-8 flex items-center gap-4">
        <h1 className="font-bowlby text-[44px] leading-none text-ink">Mes clients</h1>
        {clients.length > 0 && (
          <span className="-rotate-3 rounded-[10px] bg-lime px-3 py-1.5 text-xs font-bold text-ink shadow-sticker">
            {clients.length} client{clients.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {clients.length === 0 ? (
        <div className="flex max-w-xl flex-col items-start gap-4 rounded-[18px] border-2 border-dashed border-ink/30 p-8">
          <h2 className="text-[19px] font-bold text-ink">Ajoute ton premier client</h2>
          <p className="text-[13px] leading-relaxed text-ink opacity-70">
            Un nom, une entreprise si besoin, et c&apos;est parti : tu pourras ensuite créer
            ses missions, leurs tâches, et l&apos;inviter sur son portail.
          </p>
          <Link
            href="/app/clients/new"
            className="rounded-xl bg-orange px-5 py-3 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95"
          >
            Créer la première fiche
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => {
            const activeMissions = client.missions.filter((m) => m.status === "active").length;
            const openTasks = client.missions
              .flatMap((m) => m.tasks)
              .filter((t) => !t.done).length;

            return (
              <div
                key={client.id}
                className="relative rounded-[18px] p-6 shadow-sticker"
                style={{ backgroundColor: clientColorVar(client.color) }}
              >
                <div className="absolute right-4 top-4">
                  <ClientRowActions clientId={client.id} name={client.name} />
                </div>

                <Link href={`/app/clients/${client.id}`} className="block">
                  <p className="pr-8 text-[19px] font-bold text-ink">{client.name}</p>
                  {client.company && (
                    <p className="text-[13px] font-semibold text-ink opacity-70">
                      {client.company}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-ink">
                      {activeMissions} mission{activeMissions > 1 ? "s" : ""} active
                      {activeMissions > 1 ? "s" : ""}
                    </span>
                    {openTasks > 0 ? (
                      <span className="rounded-full bg-orange px-3 py-1 text-xs font-bold text-ink">
                        {openTasks} à faire
                      </span>
                    ) : (
                      activeMissions > 0 && (
                        <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink">
                          tout est fait ✓
                        </span>
                      )
                    )}
                    {client.portalUser && (
                      <span className="rounded-full bg-paper/60 px-3 py-1 text-xs font-bold text-ink">
                        portail actif
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}

          <Link
            href="/app/clients/new"
            className="flex min-h-[150px] items-center justify-center rounded-[18px] border-2 border-dashed border-ink/30 text-sm font-semibold text-ink/70 transition hover:border-ink/60 hover:text-ink"
          >
            + Nouveau client
          </Link>
        </div>
      )}
    </main>
  );
}
