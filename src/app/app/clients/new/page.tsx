import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import ClientForm from "@/components/app/ClientForm";

export default async function NewClientPage() {
  const session = await auth();
  if (session?.user.role !== "VA") redirect("/");

  return (
    <main className="flex-1 px-8 py-10">
      <Link
        href="/app/clients"
        className="text-sm font-semibold text-ink underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
      >
        ← Mes clients
      </Link>

      <div className="mb-8 mt-3">
        <h1 className="font-bowlby text-[44px] leading-none text-ink">Nouveau client</h1>
        <p className="mt-3 text-[13px] font-medium text-ink opacity-70">
          Une fiche créée = un endroit unique pour ses missions, ses tâches et bientôt ses
          rapports.
        </p>
      </div>

      <div className="max-w-xl rounded-[18px] bg-sand p-6">
        <ClientForm />
      </div>
    </main>
  );
}
