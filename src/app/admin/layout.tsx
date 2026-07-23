import SpaceHeader from "@/components/SpaceHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SpaceHeader badge="Admin" homeHref="/admin" />
      {children}
    </>
  );
}
