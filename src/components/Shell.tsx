import Link from "next/link";

import { auth } from "@/auth";
import Footer from "@/components/Footer";
import NavPills, { type NavItem } from "@/components/NavPills";
import UserMenu from "@/components/UserMenu";

type Props = {
  badge: string;
  homeHref: string;
  navItems: NavItem[];
  footerTone?: "pink" | "ink";
  children: React.ReactNode;
};

// Conteneur d'écran DA (DESIGN.md §3) : carte paper élevée sur fond sand —
// seule ombre floutée autorisée. Header : logo die-cut (citron, liseré
// paper, −3°) + label espace en majuscules + nav pills (actif = ink).
export default async function Shell({
  badge,
  homeHref,
  navItems,
  footerTone = "pink",
  children,
}: Props) {
  const session = await auth();

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-4 py-6 lg:px-8">
      <div className="flex flex-1 flex-col rounded-3xl bg-paper shadow-screen">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 px-8 py-5">
          <div className="flex items-center gap-4">
            <Link
              href={homeHref}
              className="-rotate-3 rounded-[10px] border-[5px] border-paper bg-lime px-3 py-1 font-bowlby text-base leading-none tracking-wide text-ink shadow-sticker"
            >
              VA DESK
            </Link>
            <span className="text-[13px] font-bold uppercase tracking-[1.5px] text-ink">
              {badge}
            </span>
          </div>

          <div className="flex items-center gap-5">
            <NavPills items={navItems} />
            {session?.user && (
              <UserMenu name={session.user.name} email={session.user.email} />
            )}
          </div>
        </header>
        {children}
        <Footer tone={footerTone} />
      </div>
    </div>
  );
}
