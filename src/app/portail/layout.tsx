import SpaceHeader from "@/components/SpaceHeader";

export default function PortailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SpaceHeader badge="Portail" homeHref="/portail" />
      {children}
    </>
  );
}
