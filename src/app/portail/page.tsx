import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getPortalOverview } from "@/lib/data/portal";

export default async function PortailPage() {
  const session = await auth();
  if (session?.user.role !== "CLIENT") redirect("/");

  const client = await getPortalOverview(session.user.id);
  if (!client) redirect("/");

  const vaName = [client.va.name, client.va.lastName].filter(Boolean).join(" ") || client.va.email;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="font-display text-3xl text-ink">Bonjour {client.name} !</h1>
        <p className="mt-1 font-body text-sm text-muted-2">
          Voilà où en sont les missions que {vaName} mène pour toi.
        </p>
      </div>

      {client.missions.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-line bg-paper p-6 font-body text-sm text-muted-2">
          Rien à afficher pour l&apos;instant — {vaName} n&apos;a pas encore créé de mission.
          Tu peux déjà lui confier quelque chose via « Nouvelle demande ».
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {client.missions.map((mission) => {
            const doneCount = mission.tasks.filter((task) => task.done).length;
            const isDone = mission.status === "done";
            const pct =
              mission.tasks.length > 0
                ? Math.round((doneCount / mission.tasks.length) * 100)
                : 0;

            return (
              <article
                key={mission.id}
                className={`rounded-3xl border p-6 ${
                  isDone ? "border-dashed border-muted/50 bg-paper/60" : "border-line bg-paper"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className={`font-display text-lg ${isDone ? "text-muted" : "text-ink"}`}>
                    {mission.name}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 font-label text-[11px] uppercase tracking-wide ${
                      isDone ? "bg-muted/15 text-muted" : "bg-mer/15 text-mer"
                    }`}
                  >
                    {isDone ? "Terminée" : "En cours"}
                  </span>
                </div>

                {mission.tasks.length > 0 && (
                  <>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream">
                        <div
                          className="h-full rounded-full bg-mer transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="shrink-0 font-label text-xs text-muted">
                        {doneCount}/{mission.tasks.length}
                      </p>
                    </div>
                    <ul className="mt-4 flex flex-col gap-1">
                      {mission.tasks.map((task) => (
                        <li
                          key={task.id}
                          className={`font-body text-sm ${
                            task.done ? "text-muted line-through" : "text-ink"
                          }`}
                        >
                          {task.done ? "✓" : "•"} {task.title}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
