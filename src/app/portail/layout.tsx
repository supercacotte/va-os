import Shell from "@/components/Shell";

export default function PortailLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell
      badge="Portail"
      homeHref="/portail"
      navItems={[
        { href: "/portail", label: "Tableau de bord", exact: true },
        { href: "/portail/demandes", label: "Demandes" },
        { href: "/portail/rapports", label: "Rapports" },
      ]}
    >
      {children}
    </Shell>
  );
}
