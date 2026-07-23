import SpaceHeader from "@/components/SpaceHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SpaceHeader badge="Mon espace" homeHref="/app" />
      {children}
    </>
  );
}
