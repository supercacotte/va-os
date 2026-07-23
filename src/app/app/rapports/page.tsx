import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getReportsPageData } from "@/lib/data/reports";
import { clientColorVar } from "@/lib/client-colors";
import { formatDuration } from "@/lib/format";
import PortalReportsToggle from "@/components/app/PortalReportsToggle";
import GenerateReportPanel from "@/components/app/GenerateReportPanel";

const SECTION_LABEL = "text-[13px] font-bold uppercase tracking-[1.5px] text-ink";

function monthKeyOf(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(mois: string) {
  const [year, month] = mois.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function monthNameOnly(mois: string) {
  const [year, month] = mois.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", { month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}

function lastMonths(count: number) {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = monthKeyOf(d);
    return { key, label: monthLabel(key) };
  });
}

export default async function RapportsPage() {
  const session = await auth();
  if (session?.user.role !== "VA") redirect("/");

  const clients = await getReportsPageData(session.user.id);
  const currentKey = monthKeyOf(new Date());
  const currentName = monthNameOnly(currentKey);

  const toGenerate = clients.filter(
    (client) =>
      (client.monthAgg[currentKey]?.totalMs ?? 0) > 0 &&
      !client.reports.some((report) => report.month === currentKey),
  );

  // Carte « Rappel » : max 2 alertes actionnables (DESIGN-RAPPORTS.md §1).
  const alerts: string[] = [];
  for (const client of toGenerate) {
    alerts.push(
      client.portalReportsEnabled
        ? `Le rapport de ${client.name} n'est pas encore généré pour ${currentName}.`
        : `Le rapport de ${client.name} n'est pas encore généré — son portail est désactivé, il ne verra rien tant que tu n'actives pas le toggle.`,
    );
  }
  for (const client of clients) {
    if (!client.portalReportsEnabled && client.reports.length > 0) {
      alerts.push(
        `Le portail de ${client.name} est désactivé — ses rapports générés ne sont pas visibles.`,
      );
    }
  }

  return (
    <main className="flex-1 px-8 py-10">
      <div className="mb-2 flex items-center gap-4">
        <h1 className="font-bowlby text-[40px] leading-none text-ink">Rapports</h1>
        <span className="-rotate-3 rounded-[10px] bg-lime px-3 py-1.5 text-xs font-bold text-ink shadow-sticker">
          {toGenerate.length > 0
            ? `${currentName} prêt à générer`
            : `${currentName} à jour ✓`}
        </span>
      </div>
      <p className="mb-8 text-[15px] font-medium text-ink opacity-70">
        Un rapport propre par client, nourri par tes temps trackés.
      </p>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Colonne gauche : état par client */}
        <section className="flex flex-col gap-4">
          <h2 className={SECTION_LABEL}>Par client</h2>

          {clients.length === 0 && (
            <p className="rounded-[16px] border-2 border-dashed border-ink/30 p-5 text-[13px] font-medium text-ink opacity-70">
              Il te faut au moins un client (et des temps suivis) pour générer un rapport.
            </p>
          )}

          {clients.map((client) => {
            const currentAgg = client.monthAgg[currentKey];
            const rows: {
              month: string;
              generated: boolean;
              generatedAt?: Date;
            }[] = client.reports.map((report) => ({
              month: report.month,
              generated: true,
              generatedAt: report.generatedAt,
            }));
            if (currentAgg && !client.reports.some((r) => r.month === currentKey)) {
              rows.unshift({ month: currentKey, generated: false });
            }

            return (
              <article key={client.id} className="rounded-[16px] bg-sand p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-sm font-bold text-ink"
                      style={{ backgroundColor: clientColorVar(client.color) }}
                    >
                      {client.name.trim()[0]?.toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[17px] font-bold text-ink">{client.name}</p>
                      <p className="truncate text-[13px] font-medium text-ink opacity-70">
                        {client.company ? `${client.company} · ` : ""}
                        {currentName} :{" "}
                        {currentAgg
                          ? `${formatDuration(currentAgg.totalMs)} · ${currentAgg.taskCount} tâche${currentAgg.taskCount > 1 ? "s" : ""}`
                          : "pas de temps suivi"}
                      </p>
                    </div>
                  </div>
                  <PortalReportsToggle
                    clientId={client.id}
                    enabled={client.portalReportsEnabled}
                  />
                </div>

                {rows.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2">
                    {rows.map((row) => {
                      const agg = client.monthAgg[row.month];
                      return (
                        <div
                          key={row.month}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-paper px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold capitalize text-ink">
                              {monthLabel(row.month)}
                            </p>
                            <p
                              suppressHydrationWarning
                              className="text-xs font-medium text-ink opacity-70"
                            >
                              {row.generated
                                ? `généré le ${new Intl.DateTimeFormat("fr-FR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                  }).format(row.generatedAt)}${agg ? ` · ${formatDuration(agg.totalMs)}` : ""}`
                                : `pas encore généré${agg ? ` · ${formatDuration(agg.totalMs)} trackées` : ""}`}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            {row.generated ? (
                              <>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold text-ink ${
                                    client.portalReportsEnabled ? "bg-lime" : "bg-lime"
                                  }`}
                                >
                                  {client.portalReportsEnabled
                                    ? "sur le portail ✓"
                                    : "généré ✓"}
                                </span>
                                <a
                                  href={`/api/rapports/pdf?client=${client.id}&mois=${row.month}`}
                                  className="text-[13px] font-semibold text-ink underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
                                >
                                  Télécharger ↓
                                </a>
                              </>
                            ) : (
                              <span className="rounded-full bg-orange px-2.5 py-1 text-[11px] font-bold text-ink">
                                à générer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </section>

        {/* Colonne droite : générer */}
        <aside className="flex flex-col gap-4">
          <h2 className={SECTION_LABEL}>Générer</h2>
          {clients.length > 0 && (
            <GenerateReportPanel
              clients={clients.map((client) => ({
                id: client.id,
                name: client.name,
                monthAgg: client.monthAgg,
              }))}
              months={lastMonths(6)}
              currentMonthLabel={currentName}
            />
          )}

          {alerts.length > 0 && (
            <div className="rounded-[16px] border-2 border-ink bg-paper p-5 shadow-sticker">
              <p className="text-[13px] font-bold uppercase tracking-[1.5px] text-ink">
                Rappel
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {alerts.slice(0, 2).map((alert) => (
                  <p key={alert} className="text-[13px] font-medium leading-relaxed text-ink">
                    {alert}
                  </p>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
