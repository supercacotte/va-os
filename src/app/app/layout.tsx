import Shell from "@/components/Shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell
      badge="Mon espace"
      homeHref="/app"
      navItems={[
        { href: "/app", label: "Tableau de bord", exact: true },
        { href: "/app/clients", label: "Clients" },
        { href: "/app/temps", label: "Temps" },
        { href: "/app/rapports", label: "Rapports" },
      ]}
    >
      {children}
    </Shell>
  );
}
