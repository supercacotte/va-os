import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getAdminOverview } from "@/lib/data/admin";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const { vaCount, clientAccountCount, clientCount, missionCount } = await getAdminOverview();

  const stats = [
    { label: "VA inscrites", value: vaCount },
    { label: "Comptes portail", value: clientAccountCount },
    { label: "Clients", value: clientCount },
    { label: "Missions", value: missionCount },
  ];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="font-display text-3xl text-ink">Espace admin</h1>
        <p className="mt-1 font-body text-sm text-muted-2">
          {session.user.name ?? session.user.email} — vue d&apos;ensemble de la plateforme.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-line bg-paper p-6 text-center">
            <p className="font-display text-3xl text-ink">{stat.value}</p>
            <p className="mt-1 font-label text-[11px] uppercase tracking-wide text-muted">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
