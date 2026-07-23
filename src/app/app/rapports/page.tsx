import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getClientOptionsForVa } from "@/lib/data/clients";
import { getActivityReport } from "@/lib/data/reports";
import { formatDuration } from "@/lib/format";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const FIELD =
  "rounded-[10px] bg-paper px-4 py-3 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthBounds(mois: string) {
  const [year, month] = mois.split("-").map(Number);
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

function monthLabel(mois: string) {
  const [year, month] = mois.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export default async function RapportsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; mois?: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "VA") redirect("/");

  const params = await searchParams;
  const clients = await getClientOptionsForVa(session.user.id);

  const mois = params.mois && MONTH_RE.test(params.mois) ? params.mois : currentMonth();
  const clientId = params.client && clients.some((c) => c.id === params.client)
    ? params.client
    : undefined;

  const report = clientId
    ? await getActivityReport(
        session.user.id,
        clientId,
        monthBounds(mois).start,
        monthBounds(mois).end,
      )
    : null;

  return (
    <main className="flex-1 px-8 py-10">
      <div className="mb-8">
        <h1 className="font-bowlby text-[44px] leading-none text-ink">Rapports</h1>
        <p className="mt-3 text-[13px] font-medium text-ink opacity-70">
          Le récap propre à envoyer à ton client : qui, quoi, combien de temps.
        </p>
      </div>

      {clients.length === 0 ? (
        <p className="max-w-xl rounded-[18px] border-2 border-dashed border-ink/30 p-6 text-[13px] font-medium text-ink opacity-70">
          Il te faut au moins un client (et des temps suivis) pour générer un rapport.
        </p>
      ) : (
        <form
          method="GET"
          className="mb-7 flex max-w-2xl flex-wrap items-end gap-3 rounded-[18px] bg-sand p-6"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label htmlFor="client" className="text-[13px] font-bold text-ink">
              Client
            </label>
            <select id="client" name="client" required defaultValue={clientId ?? ""} className={FIELD}>
              <option value="" disabled>
                Choisis un client…
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                  {client.company ? ` (${client.company})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="mois" className="text-[13px] font-bold text-ink">
              Mois
            </label>
            <input id="mois" name="mois" type="month" defaultValue={mois} required className={FIELD} />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-orange px-5 py-3 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95"
          >
            Afficher
          </button>
        </form>
      )}

      {report && (
        <section className="flex max-w-2xl flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[19px] font-bold capitalize text-ink">
                {report.client.name} — {monthLabel(mois)}
              </h2>
              <p className="text-[13px] font-medium text-ink opacity-70">
                {report.entryCount} entrée{report.entryCount > 1 ? "s" : ""} de temps — total{" "}
                {formatDuration(report.totalMs)}
              </p>
            </div>
            {report.entryCount > 0 && (
              <a
                href={`/api/rapports/pdf?client=${report.client.id}&mois=${mois}`}
                className="text-sm font-semibold text-ink underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
              >
                Télécharger le PDF ↓
              </a>
            )}
          </div>

          {report.entryCount === 0 ? (
            <p className="rounded-[14px] border-2 border-dashed border-ink/30 p-5 text-[13px] font-medium text-ink opacity-70">
              Aucun temps suivi pour {report.client.name} sur {monthLabel(mois)}. Lance le
              chrono sur ses tâches et le rapport se remplira tout seul.
            </p>
          ) : (
            <div className="overflow-hidden rounded-[18px] bg-paper shadow-sticker">
              {report.missions.map((mission) => (
                <div key={mission.id}>
                  <div className="flex items-center justify-between gap-3 bg-sand px-6 py-3">
                    <p className="text-[15px] font-bold text-ink">{mission.name}</p>
                    <p className="text-[15px] font-bold tabular-nums text-ink">
                      {formatDuration(mission.totalMs)}
                    </p>
                  </div>
                  {mission.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-3 border-b border-ink/15 px-6 py-2.5 last:border-b-0"
                    >
                      <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">
                        {task.title}
                        <span className="ml-2 opacity-60">
                          ({task.entryCount} entrée{task.entryCount > 1 ? "s" : ""})
                        </span>
                      </p>
                      <p className="text-[13px] font-medium tabular-nums text-ink opacity-70">
                        {formatDuration(task.totalMs)}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 bg-ink px-6 py-4">
                <p className="text-[13px] font-bold uppercase tracking-[1.5px] text-paper">
                  Total
                </p>
                <p className="text-[15px] font-bold tabular-nums text-paper">
                  {formatDuration(report.totalMs)}
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
