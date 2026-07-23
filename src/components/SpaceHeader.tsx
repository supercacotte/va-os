import Link from "next/link";

import { auth } from "@/auth";
import UserMenu from "@/components/UserMenu";

type Props = {
  badge: string;
  homeHref: string;
};

export default async function SpaceHeader({ badge, homeHref }: Props) {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-6 px-6 lg:px-10">
        <Link href={homeHref} className="flex items-center gap-3">
          <span className="whitespace-nowrap font-display text-xl text-ink">
            VA Desk
          </span>
          <span className="rounded-full bg-ink px-3 py-1 font-label text-[11px] uppercase tracking-wide text-paper">
            {badge}
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {session?.user && (
            <UserMenu name={session.user.name} email={session.user.email} />
          )}
        </div>
      </div>
    </header>
  );
}
