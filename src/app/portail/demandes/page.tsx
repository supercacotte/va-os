import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getPortalRequests } from "@/lib/data/portal";
import RequestForm from "@/components/portal/RequestForm";

export default async function DemandesPage() {
  const session = await auth();
  if (session?.user.role !== "CLIENT") redirect("/");

  const requests = await getPortalRequests(session.user.id);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="font-display text-3xl text-ink">Nouvelle demande</h1>
        <p className="mt-1 font-body text-sm text-muted-2">
          Une tâche à confier ? Décris-la en une phrase — elle atterrit
          directement dans le plan de travail de ton assistante.
        </p>
      </div>

      <RequestForm />

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">Tes demandes</h2>
        {requests.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line bg-paper p-6 font-body text-sm text-muted-2">
            Aucune demande pour l&apos;instant — la première arrive dans la boîte de ton
            assistante dès que tu cliques sur « Envoyer ».
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {requests.map((request) => (
              <li
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-5 py-3"
              >
                <p
                  className={`min-w-0 flex-1 font-body text-sm ${
                    request.done ? "text-muted line-through" : "text-ink"
                  }`}
                >
                  {request.title}
                </p>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 font-label text-[11px] uppercase tracking-wide ${
                    request.done ? "bg-mer/15 text-mer" : "bg-soleil/20 text-muted-2"
                  }`}
                >
                  {request.done ? "Traitée" : "À traiter"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
