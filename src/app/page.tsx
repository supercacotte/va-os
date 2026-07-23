import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

const SPACE_BY_ROLE = {
  VA: "/app",
  CLIENT: "/portail",
  ADMIN: "/admin",
} as const;

export default async function Home() {
  const session = await auth();
  // Connectée = directement dans son espace, pas d'étape intermédiaire.
  if (session?.user) redirect(SPACE_BY_ROLE[session.user.role]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <p className="font-label text-xs uppercase tracking-widest text-muted">VA Desk</p>
      <h1 className="max-w-2xl font-display text-4xl text-ink">
        Le logiciel de gestion des assistantes virtuelles indépendantes
      </h1>
      <p className="max-w-md font-body text-sm text-muted-2">
        Tout votre business, au même endroit.
      </p>

      <div className="flex gap-3">
        <Link
          href="/connexion"
          prefetch={false}
          className="rounded-full border border-ink px-5 py-3 font-label text-xs uppercase tracking-wide text-ink transition hover:border-corail hover:text-corail"
        >
          Se connecter
        </Link>
        <Link
          href="/inscription"
          prefetch={false}
          className="rounded-full bg-corail px-5 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink"
        >
          Créer mon compte
        </Link>
      </div>
    </main>
  );
}
