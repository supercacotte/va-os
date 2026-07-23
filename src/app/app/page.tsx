import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getVaDashboard } from "@/lib/data/clients";

export default async function AppPage() {
  const session = await auth();
  if (session?.user.role !== "VA") redirect("/");

  const { clientCount, activeMissionCount, openTaskCount } = await getVaDashboard(
    session.user.id,
  );

  const stats = [
    { label: "Clients", value: clientCount },
    { label: "Missions en cours", value: activeMissionCount },
    { label: "Tâches à faire", value: openTaskCount },
  ];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="font-display text-3xl text-ink">
          Bonjour {session.user.name?.split(" ")[0] ?? ""} !
        </h1>
        <p className="mt-1 font-body text-sm text-muted-2">
          Voilà où en est ton activité aujourd&apos;hui.
        </p>
      </div>

      {clientCount === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-3xl border border-dashed border-line bg-paper p-8">
          <h2 className="font-display text-xl text-ink">Bienvenue dans ton cockpit ✨</h2>
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
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-line bg-paper p-6 text-center"
              >
                <p className="font-display text-3xl text-ink">{stat.value}</p>
                <p className="mt-1 font-label text-[11px] uppercase tracking-wide text-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          <Link
            href="/app/clients"
            className="self-start rounded-full bg-corail px-5 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink"
          >
            Voir mes clients →
          </Link>
        </>
      )}
    </main>
  );
}
