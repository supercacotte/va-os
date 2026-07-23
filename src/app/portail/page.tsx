import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getClientForPortalUser } from "@/lib/data/clients";

export default async function PortailPage() {
  const session = await auth();
  if (session?.user.role !== "CLIENT") redirect("/");

  const client = await getClientForPortalUser(session.user.id);
  if (!client) redirect("/");

  const vaName = [client.va.name, client.va.lastName].filter(Boolean).join(" ") || client.va.email;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <h1 className="font-display text-3xl text-ink">Bienvenue {client.name} !</h1>
      {client.company && (
        <p className="font-label text-xs uppercase tracking-wide text-muted">{client.company}</p>
      )}
      <p className="max-w-md font-body text-sm text-muted-2">
        Ton espace de suivi avec {vaName} : avancement des missions, nouvelles demandes et
        rapports d&apos;activité arrivent ici très bientôt (phase 5).
      </p>
    </main>
  );
}
