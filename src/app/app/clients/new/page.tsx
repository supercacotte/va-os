import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import ClientForm from "@/components/app/ClientForm";

export default async function NewClientPage() {
  const session = await auth();
  if (session?.user.role !== "VA") redirect("/");

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <Link
          href="/app/clients"
          className="font-label text-xs uppercase tracking-wide text-muted transition hover:text-corail"
        >
          ← Mes clients
        </Link>
        <h1 className="mt-2 font-display text-3xl text-ink">Nouveau client</h1>
        <p className="mt-1 font-body text-sm text-muted-2">
          Une fiche créée = un endroit unique pour ses missions, ses tâches et bientôt ses
          rapports.
        </p>
      </div>

      <ClientForm />
    </main>
  );
}
