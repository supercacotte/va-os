import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getPortalOverview, getPortalRequests } from "@/lib/data/portal";
import RequestForm from "@/components/portal/RequestForm";

const SECTION_LABEL = "text-[13px] font-bold uppercase tracking-[1.5px] text-ink";

export default async function DemandesPage() {
  const session = await auth();
  if (session?.user.role !== "CLIENT") redirect("/");

  const [client, requests] = await Promise.all([
    getPortalOverview(session.user.id),
    getPortalRequests(session.user.id),
  ]);
  if (!client) redirect("/");

  const vaFirstName = client.va.name ?? client.va.email;

  return (
    <main className="flex-1 px-8 py-10">
      <h1 className="mb-8 font-bowlby text-[44px] leading-none text-ink">Demandes</h1>

      <div className="grid gap-7 lg:grid-cols-[380px_minmax(0,1fr)]">
        <RequestForm
          clientColor={client.color}
          vaFirstName={vaFirstName}
          requests={requests.slice(0, 3)}
        />

        <section className="flex flex-col gap-3">
          <h2 className={SECTION_LABEL}>Toutes tes demandes</h2>
          {requests.length === 0 ? (
            <p className="rounded-[14px] border-2 border-dashed border-ink/30 p-5 text-[13px] font-medium text-ink opacity-70">
              Aucune demande pour l&apos;instant — la première arrive chez {vaFirstName} dès
              que tu cliques sur « Envoyer ».
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {requests.map((request) => (
                <li
                  key={request.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-sand px-5 py-3.5"
                >
                  <p
                    className={`min-w-0 flex-1 text-[13px] font-semibold text-ink ${
                      request.done ? "line-through opacity-60" : ""
                    }`}
                  >
                    {request.title}
                  </p>
                  {request.done ? (
                    <span className="shrink-0 rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink">
                      traitée ✓
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-orange px-3 py-1 text-xs font-bold text-ink">
                      à traiter
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
