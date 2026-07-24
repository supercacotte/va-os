import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getProceduresForPortalUser } from "@/lib/data/procedures";
import ProcedureContent from "@/components/app/ProcedureContent";

function daysAgo(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  return `il y a ${days} jours`;
}

function formatMinutes(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

function metaLine(p: {
  cadence: string | null;
  estimatedMinutes: number | null;
  updatedAt: Date;
}) {
  const parts: string[] = [];
  if (p.cadence) parts.push(p.cadence);
  if (p.estimatedMinutes != null) parts.push(formatMinutes(p.estimatedMinutes));
  parts.push(`mise à jour ${daysAgo(p.updatedAt)}`);
  return parts.join(" · ");
}

// 4e capacité du portail (D22) : le client consulte les procédures de SON
// compte, en lecture seule. Étanchéité : la data part du compte connecté,
// jamais d'un clientId en paramètre.
export default async function PortailProceduresPage() {
  const session = await auth();
  if (session?.user.role !== "CLIENT") redirect("/");

  const procedures = await getProceduresForPortalUser(session.user.id);

  return (
    <main className="flex-1 px-8 py-10">
      <h1 className="font-bowlby text-[44px] leading-none text-ink">Procédures</h1>
      <p className="mb-8 mt-3 text-[13px] font-medium text-ink opacity-70">
        Les modes d&apos;emploi de ton assistante — comment chaque chose est faite, étape
        par étape.
      </p>

      {procedures.length === 0 ? (
        <p className="max-w-2xl rounded-[18px] border-2 border-dashed border-ink/30 p-6 text-[13px] font-medium text-ink opacity-70">
          Pas encore de procédure partagée. Elles apparaîtront ici dès que ton assistante
          en documentera une.
        </p>
      ) : (
        <ul className="flex max-w-2xl flex-col gap-2.5">
          {procedures.map((procedure) => (
            <li key={procedure.id}>
              <details className="group rounded-[16px] bg-sand">
                <summary className="flex cursor-pointer items-center justify-between gap-3 rounded-[16px] px-5 py-4 [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0">
                    <p className="truncate text-[16px] font-bold text-ink">
                      {procedure.title}
                    </p>
                    <p className="text-[12px] font-semibold text-ink opacity-50">
                      {metaLine(procedure)}
                    </p>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-[16px] font-bold leading-none text-ink shadow-sticker">
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:inline">−</span>
                  </span>
                </summary>
                <div className="border-t border-ink/15 px-5 pb-5 pt-4">
                  <div className="rounded-[12px] bg-paper p-5 ring-1 ring-ink/10">
                    <ProcedureContent steps={procedure.steps} />
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
