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

function currentMonthKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function PortailRapportsPage() {
  const session = await auth();
  if (session?.user.role !== "CLIENT") redirect("/");

  const months = await getReportMonthsForPortalUser(session.user.id);
  const currentKey = currentMonthKey();

  return (
    <main className="flex-1 px-8 py-10">
      <h1 className="font-bowlby text-[44px] leading-none text-ink">Rapports</h1>
      <p className="mb-8 mt-3 text-[13px] font-medium text-ink opacity-70">
        Le détail du temps passé pour toi, mois par mois, à télécharger en PDF.
      </p>

      {months.length === 0 ? (
        <p className="max-w-xl rounded-[18px] border-2 border-dashed border-ink/30 p-6 text-[13px] font-medium text-ink opacity-70">
          Pas encore de rapport — ils apparaîtront ici dès que du temps aura été suivi sur
          tes missions.
        </p>
      ) : (
        <ul className="flex max-w-xl flex-col gap-2.5">
          {months.map(({ mois, totalMs }) => {
            const isCurrent = mois === currentKey;
            return (
              <li
                key={mois}
                className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 ${
                  isCurrent
                    ? "rounded-[18px] border-2 border-ink bg-paper"
                    : "rounded-[14px] bg-sand"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-[15px] font-bold capitalize text-ink">
                      {monthLabel(mois)}
                    </p>
                    <p className="text-[13px] font-medium text-ink opacity-70">
                      {formatDuration(totalMs)}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold text-ink">
                      en cours
                    </span>
                  )}
                </div>
                <a
                  href={`/api/portail/rapports/pdf?mois=${mois}`}
                  className="text-sm font-semibold text-ink underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
                >
                  Télécharger ↓
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
