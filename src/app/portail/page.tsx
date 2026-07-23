import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getPortalOverview, getPortalRequests } from "@/lib/data/portal";
import { getReportMonthsForPortalUser } from "@/lib/data/reports";
import { clientColorVar } from "@/lib/client-colors";
import { formatDuration } from "@/lib/format";
import RequestForm from "@/components/portal/RequestForm";

const SECTION_LABEL = "text-[13px] font-bold uppercase tracking-[1.5px] text-ink";

function monthLabel(mois: string) {
  const [year, month] = mois.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function PortailPage() {
  const session = await auth();
  if (session?.user.role !== "CLIENT") redirect("/");

  const [client, requests, months] = await Promise.all([
    getPortalOverview(session.user.id),
    getPortalRequests(session.user.id),
    getReportMonthsForPortalUser(session.user.id),
  ]);
  if (!client) redirect("/");

  const vaFirstName = client.va.name ?? client.va.email;
  const activeMissionCount = client.missions.filter((m) => m.status === "active").length;
  const currentKey = currentMonthKey();
  const currentMonth = months.find((m) => m.mois === currentKey);
  const pastMonths = months.filter((m) => m.mois !== currentKey);

  return (
    <main className="flex-1 px-8 py-10">
      <div className="mb-2 flex items-center gap-4">
        <h1 className="font-bowlby text-[44px] leading-none text-ink">
          Bonjour {client.name.split(" ")[0]} !
        </h1>
        {activeMissionCount > 0 && (
          <span className="-rotate-3 rounded-[10px] bg-lime px-3 py-1.5 text-xs font-bold text-ink shadow-sticker">
            {activeMissionCount} mission{activeMissionCount > 1 ? "s" : ""} en cours
          </span>
        )}
      </div>
      <p className="mb-8 text-[13px] font-medium text-ink opacity-70">
        Voilà où en sont les missions que {vaFirstName} mène pour toi.
      </p>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Gauche : ce que la VA fait */}
        <section className="flex flex-col gap-3">
          <h2 className={SECTION_LABEL}>Missions en cours</h2>

          {client.missions.length === 0 && (
            <p className="rounded-[14px] border-2 border-dashed border-ink/30 p-5 text-[13px] font-medium text-ink opacity-70">
              Rien à afficher pour l&apos;instant — {vaFirstName} n&apos;a pas encore créé de
              mission. Tu peux déjà lui confier quelque chose ci-contre.
            </p>
          )}

          {client.missions.map((mission) => {
            const doneCount = mission.tasks.filter((task) => task.done).length;
            const total = mission.tasks.length;
            const isDone = mission.status === "done";
            const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
            const openCount = total - doneCount;

            return (
              <article key={mission.id} className="rounded-[18px] bg-sand p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-[17px] font-semibold text-ink">{mission.name}</h3>
                  {isDone || openCount === 0 ? (
                    <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink">
                      tout est fait ✓
                    </span>
                  ) : (
                    <span className="rounded-full bg-orange px-3 py-1 text-xs font-bold text-ink">
                      {openCount} à faire
                    </span>
                  )}
                </div>

                {total > 0 && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-paper">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${isDone ? 100 : pct}%`,
                          backgroundColor: clientColorVar(client.color),
                        }}
                      />
                    </div>
                    <p className="shrink-0 text-[13px] font-bold text-ink">
                      {doneCount}/{total}
                    </p>
                  </div>
                )}

                {/* Mission terminée : repliée, sans checklist (DESIGN.md §6) */}
                {!isDone && total > 0 && (
                  <ul className="mt-3 flex flex-col gap-1">
                    {mission.tasks.map((task) => (
                      <li
                        key={task.id}
                        className={`text-[13px] font-medium text-ink ${
                          task.done ? "line-through opacity-60" : ""
                        }`}
                      >
                        {task.done ? "✓" : "·"} {task.title}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </section>

        {/* Droite : ce que le client demande + rapports */}
        <aside className="flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            <h2 className={SECTION_LABEL}>Nouvelle demande</h2>
            <RequestForm
              clientColor={client.color}
              vaFirstName={vaFirstName}
              requests={requests.slice(0, 3)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <h2 className={SECTION_LABEL}>Rapports</h2>

            {months.length === 0 ? (
              <p className="rounded-[14px] border-2 border-dashed border-ink/30 p-5 text-[13px] font-medium text-ink opacity-70">
                Les rapports apparaîtront ici dès que du temps aura été suivi sur tes
                missions.
              </p>
            ) : (
              <>
                {currentMonth && (
                  <div className="rounded-[18px] border-2 border-ink bg-paper p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[15px] font-bold capitalize text-ink">
                        {monthLabel(currentMonth.mois)}
                      </p>
                      <span className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold text-ink">
                        en cours
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-[13px]">
                      <p className="font-medium text-ink opacity-70">Temps passé</p>
                      <p className="font-bold text-ink">{formatDuration(currentMonth.totalMs)}</p>
                    </div>
                    <a
                      href={`/api/portail/rapports/pdf?mois=${currentMonth.mois}`}
                      className="mt-3 inline-block text-sm font-semibold text-ink underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
                    >
                      Télécharger ↓
                    </a>
                  </div>
                )}
                {pastMonths.map(({ mois, totalMs }) => (
                  <div
                    key={mois}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-sand px-5 py-4"
                  >
                    <div>
                      <p className="text-[15px] font-semibold capitalize text-ink">
                        {monthLabel(mois)}
                      </p>
                      <p className="text-[13px] font-medium text-ink opacity-70">
                        {formatDuration(totalMs)}
                      </p>
                    </div>
                    <a
                      href={`/api/portail/rapports/pdf?mois=${mois}`}
                      className="text-sm font-semibold text-ink underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
                    >
                      Télécharger ↓
                    </a>
                  </div>
                ))}
              </>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
