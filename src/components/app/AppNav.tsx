"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/app", label: "Tableau de bord", exact: true },
  { href: "/app/clients", label: "Clients", exact: false },
  { href: "/app/temps", label: "Temps", exact: false },
  { href: "/app/rapports", label: "Rapports", exact: false },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active ? "bg-ink text-paper" : "text-ink/70 hover:bg-sand hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
