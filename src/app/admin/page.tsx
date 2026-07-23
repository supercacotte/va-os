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
    <main className="flex-1 px-8 py-10">
      <div className="mb-2">
        <h1 className="font-bowlby text-[44px] leading-none text-ink">Espace admin</h1>
      </div>
      <p className="mb-8 text-[13px] font-medium text-ink opacity-70">
        {session.user.name ?? session.user.email} — vue d&apos;ensemble de la plateforme.
      </p>

      <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[14px] bg-sand px-5 py-4">
            <p className="text-[26px] font-bold leading-tight tabular-nums text-ink">
              {stat.value}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-ink/60">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
