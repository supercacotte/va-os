import Link from "next/link";

import Footer from "@/components/Footer";

export default async function EmailConfirmePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const success = status === "ok";

  return (
    <>
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <h1 className="font-bowlby text-[44px] leading-none text-ink">
        {success ? "Email confirmé !" : "Lien invalide ou expiré"}
      </h1>
      <p className="max-w-md text-[13px] font-medium text-ink opacity-70">
        {success
          ? "Ton adresse email est bien confirmée. Bon travail avec VA Desk !"
          : "Ce lien de confirmation n'est plus valide. Connecte-toi puis redemande un email si besoin."}
      </p>
      <Link
        href="/"
        className="rounded-xl bg-orange px-5 py-3 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
    <Footer variant="ink" />
    </>
  );
}
