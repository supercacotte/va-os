import Shell from "@/components/Shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell
      badge="Admin"
      homeHref="/admin"
      navItems={[{ href: "/admin", label: "Tableau de bord", exact: true }]}
      footerTone="ink"
    >
      {children}
    </Shell>
  );
}
