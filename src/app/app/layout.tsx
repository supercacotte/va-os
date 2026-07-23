import Link from "next/link";

import SpaceHeader from "@/components/SpaceHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SpaceHeader badge="Mon espace" homeHref="/app" />
      <nav className="border-b border-line bg-paper/60 px-6 lg:px-10">
        <div className="flex h-11 items-center gap-6">
          <Link
            href="/app"
            className="font-label text-xs uppercase tracking-wide text-ink/70 transition hover:text-corail"
          >
            Tableau de bord
          </Link>
          <Link
            href="/app/clients"
            className="font-label text-xs uppercase tracking-wide text-ink/70 transition hover:text-corail"
          >
            Clients
          </Link>
        </div>
      </nav>
      {children}
    </>
  );
}
