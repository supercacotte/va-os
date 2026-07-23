import Link from "next/link";

import { auth } from "@/auth";
import UserMenu from "@/components/UserMenu";

const SPACE_BY_ROLE = {
  VA: { href: "/app", label: "Ouvrir mon espace →" },
  CLIENT: { href: "/portail", label: "Ouvrir mon portail →" },
  ADMIN: { href: "/admin", label: "Ouvrir l'admin →" },
} as const;

export default async function Home() {
  const session = await auth();
  const space = session?.user ? SPACE_BY_ROLE[session.user.role] : null;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <p className="font-label text-xs uppercase tracking-widest text-muted">
        Smart Lazy VA OS
      </p>
      <h1 className="max-w-2xl font-display text-4xl text-ink">
        Le cockpit d&apos;opérations des assistantes virtuelles
      </h1>
      <p className="max-w-md font-body text-sm text-muted-2">
        Clients → missions → tâches → chrono → rapport d&apos;activité → facture.
      </p>

      {session?.user && space ? (
        <div className="flex items-center gap-4">
          <Link
            href={space.href}
            className="rounded-full bg-corail px-5 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink"
          >
            {space.label}
          </Link>
          <UserMenu name={session.user.name} email={session.user.email} />
        </div>
      ) : (
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
      )}
    </main>
  );
}
