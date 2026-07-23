import Link from "next/link";

export default async function EmailConfirmePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const success = status === "ok";

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <h1 className="font-display text-3xl text-ink">
        {success ? "Email confirmé !" : "Lien invalide ou expiré"}
      </h1>
      <p className="max-w-md font-body text-sm text-muted-2">
        {success
          ? "Ton adresse email est bien confirmée. Bon travail !"
          : "Ce lien de confirmation n'est plus valide. Connecte-toi puis redemande un email si besoin."}
      </p>
      <Link
        href="/"
        className="rounded-full bg-corail px-5 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
