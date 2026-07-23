import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getClientOptionsForVa } from "@/lib/data/clients";
import { getActivityReport } from "@/lib/data/reports";
import { formatDuration } from "@/lib/format";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="font-display text-3xl text-ink">Rapports d&apos;activité</h1>
        <p className="mt-1 font-body text-sm text-muted-2">
          Le récap propre à envoyer à ton client : qui, quoi, combien de temps.
        </p>
      </div>

      {clients.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-line bg-paper p-6 font-body text-sm text-muted-2">
          Il te faut au moins un client (et des temps suivis) pour générer un rapport.
        </p>
      ) : (
        <form method="GET" className="flex flex-wrap items-end gap-3 rounded-3xl border border-line bg-paper p-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label htmlFor="client" className="font-label text-xs uppercase tracking-wide text-ink/70">
              Client
            </label>
            <select
              id="client"
              name="client"
              required
              defaultValue={clientId ?? ""}
              className="rounded-full border border-line bg-cream px-4 py-3 font-body text-sm text-ink outline-none transition focus:border-corail"
            >
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
            <label htmlFor="mois" className="font-label text-xs uppercase tracking-wide text-ink/70">
              Mois
            </label>
            <input
              id="mois"
              name="mois"
              type="month"
              defaultValue={mois}
              required
              className="rounded-full border border-line bg-cream px-4 py-3 font-body text-sm text-ink outline-none transition focus:border-corail"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-corail px-5 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink"
          >
            Afficher
          </button>
        </form>
      )}

      {report && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-ink">
                {report.client.name} — {monthLabel(mois)}
              </h2>
              <p className="font-body text-sm text-muted-2">
                {report.entryCount} entrée{report.entryCount > 1 ? "s" : ""} de temps —{" "}
                total {formatDuration(report.totalMs)}
              </p>
            </div>
            {report.entryCount > 0 && (
              <a
                href={`/api/rapports/pdf?client=${report.client.id}&mois=${mois}`}
                className="rounded-full border border-ink px-5 py-3 font-label text-xs uppercase tracking-wide text-ink transition hover:border-corail hover:text-corail"
              >
                Télécharger le PDF ↓
              </a>
            )}
          </div>

          {report.entryCount === 0 ? (
            <p className="rounded-3xl border border-dashed border-line bg-paper p-6 font-body text-sm text-muted-2">
              Aucun temps suivi pour {report.client.name} sur {monthLabel(mois)}. Lance le
              chrono sur ses tâches et le rapport se remplira tout seul.
            </p>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-line bg-paper">
              {report.missions.map((mission) => (
                <div key={mission.id} className="border-b border-line last:border-b-0">
                  <div className="flex items-center justify-between gap-3 bg-cream/70 px-6 py-3">
                    <p className="font-display text-base text-ink">{mission.name}</p>
                    <p className="font-label text-sm tabular-nums text-ink">
                      {formatDuration(mission.totalMs)}
                    </p>
                  </div>
                  {mission.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-3 px-6 py-2.5"
                    >
                      <p className="min-w-0 flex-1 truncate font-body text-sm text-ink">
                        {task.title}
                        <span className="ml-2 font-body text-xs text-muted">
                          ({task.entryCount} entrée{task.entryCount > 1 ? "s" : ""})
                        </span>
                      </p>
                      <p className="font-body text-sm tabular-nums text-muted-2">
                        {formatDuration(task.totalMs)}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 bg-ink px-6 py-4">
                <p className="font-label text-xs uppercase tracking-wide text-paper">Total</p>
                <p className="font-label text-base tabular-nums text-paper">
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
