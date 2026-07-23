import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getReportMonthsForPortalUser } from "@/lib/data/reports";
import { formatDuration } from "@/lib/format";

function monthLabel(mois: string) {
  const [year, month] = mois.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export default async function PortailRapportsPage() {
  const session = await auth();
  if (session?.user.role !== "CLIENT") redirect("/");

  const months = await getReportMonthsForPortalUser(session.user.id);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="font-display text-3xl text-ink">Rapports d&apos;activité</h1>
        <p className="mt-1 font-body text-sm text-muted-2">
          Le détail du temps passé pour toi, mois par mois, à télécharger en PDF.
        </p>
      </div>

      {months.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-line bg-paper p-6 font-body text-sm text-muted-2">
          Pas encore de rapport — ils apparaîtront ici dès que du temps aura été suivi sur
          tes missions.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {months.map(({ mois, totalMs }) => (
            <li
              key={mois}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-5 py-4"
            >
              <div>
                <p className="font-display text-base capitalize text-ink">{monthLabel(mois)}</p>
                <p className="font-body text-xs text-muted-2">
                  {formatDuration(totalMs)} suivies
                </p>
              </div>
              <a
                href={`/api/portail/rapports/pdf?mois=${mois}`}
                className="rounded-full border border-ink px-4 py-2 font-label text-xs uppercase tracking-wide text-ink transition hover:border-corail hover:text-corail"
              >
                Télécharger le PDF ↓
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
