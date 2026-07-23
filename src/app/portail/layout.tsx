import Link from "next/link";

import SpaceHeader from "@/components/SpaceHeader";

export default function PortailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SpaceHeader badge="Portail" homeHref="/portail" />
      <nav className="border-b border-line bg-paper/60 px-6 lg:px-10">
        <div className="flex h-11 items-center gap-6">
          <Link
            href="/portail"
            className="font-label text-xs uppercase tracking-wide text-ink/70 transition hover:text-corail"
          >
            Avancement
          </Link>
          <Link
            href="/portail/demandes"
            className="font-label text-xs uppercase tracking-wide text-ink/70 transition hover:text-corail"
          >
            Nouvelle demande
          </Link>
          <Link
            href="/portail/rapports"
            className="font-label text-xs uppercase tracking-wide text-ink/70 transition hover:text-corail"
          >
            Rapports
          </Link>
        </div>
      </nav>
      {children}
    </>
  );
}
