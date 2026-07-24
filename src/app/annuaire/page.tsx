import Link from "next/link";

import { getPublishedVaProfiles } from "@/lib/data/profile";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Annuaire des assistantes virtuelles — VA Desk",
  description:
    "Trouvez une assistante virtuelle indépendante : profils, spécialités et contact direct. Référencement gratuit pour les VA sur VA Desk.",
};

// Page publique (D17) — aucune connexion requise, profils opt-in uniquement.
export default async function AnnuairePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const profiles = await getPublishedVaProfiles(q);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 bg-paper px-6 py-4 lg:px-12">
        <Link
          href="/"
          className="-rotate-3 rounded-[10px] border-[5px] border-paper bg-lime px-3 py-1 font-bowlby text-base leading-none tracking-wide text-ink shadow-sticker"
        >
          VA DESK
        </Link>
        <nav className="flex items-center gap-5">
          <Link
            href="/connexion"
            prefetch={false}
            className="text-sm font-semibold text-ink underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
          >
            Se connecter
          </Link>
          <Link
            href="/inscription"
            prefetch={false}
            className="rounded-full bg-orange px-4 py-2 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95"
          >
            Créer mon compte
          </Link>
        </nav>
      </header>

      <main className="flex-1 bg-sand px-6 py-14 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="font-bowlby text-[44px] leading-none text-ink">
              L&apos;annuaire des VA
            </h1>
            {profiles.length > 0 && (
              <span className="-rotate-3 rounded-[10px] bg-lime px-3 py-1.5 text-xs font-bold text-ink shadow-sticker">
                {profiles.length} profil{profiles.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="mt-3 max-w-lg text-[15px] font-medium leading-relaxed text-ink opacity-80">
            Des assistantes virtuelles indépendantes, à contacter directement. Tu es VA ?{" "}
            <Link
              href="/inscription"
              prefetch={false}
              className="font-semibold underline decoration-orange decoration-2 underline-offset-4"
            >
              Crée ton compte
            </Link>{" "}
            et publie ton profil gratuitement.
          </p>

          <form method="GET" className="mt-8 flex max-w-xl flex-wrap gap-2">
            <label htmlFor="q" className="sr-only">
              Rechercher
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Rechercher : réseaux sociaux, admin, une ville…"
              className="min-w-0 flex-1 rounded-[10px] bg-paper px-4 py-3 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30"
            />
            <button
              type="submit"
              className="rounded-xl bg-orange px-5 py-3 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95"
            >
              Rechercher
            </button>
          </form>

          {profiles.length === 0 ? (
            <div className="mt-10 max-w-xl rounded-[18px] border-2 border-dashed border-ink/30 p-8">
              <h2 className="text-[19px] font-bold text-ink">
                {q ? "Aucun profil ne correspond" : "L'annuaire se remplit"}
              </h2>
              <p className="mt-2 text-[13px] font-medium leading-relaxed text-ink opacity-70">
                {q
                  ? "Essaie avec un autre mot-clé, ou parcours tous les profils en vidant la recherche."
                  : "Les premières VA arrivent — reviens bientôt, ou crée ton compte pour être parmi les premières référencées."}
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {profiles.map((profile) => (
                <article
                  key={profile.id}
                  className="flex flex-col gap-3 rounded-[18px] bg-paper p-6 shadow-sticker"
                >
                  <div>
                    <h2 className="text-[19px] font-bold text-ink">{profile.displayName}</h2>
                    {profile.headline && (
                      <p className="text-[13px] font-semibold text-ink opacity-70">
                        {profile.headline}
                      </p>
                    )}
                  </div>

                  <p className="line-clamp-4 text-[13px] font-medium leading-relaxed text-ink opacity-80">
                    {profile.bio}
                  </p>

                  {(profile.specialties.length > 0 || profile.location) && (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold text-ink"
                        >
                          {specialty}
                        </span>
                      ))}
                      {profile.location && (
                        <span className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold text-ink opacity-70">
                          {profile.location}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
                    {profile.contactEmail && (
                      <a
                        href={`mailto:${profile.contactEmail}`}
                        className="rounded-xl bg-orange px-4 py-2.5 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95"
                      >
                        Contacter
                      </a>
                    )}
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-ink underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
                      >
                        Voir le site →
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer variant="ink" />
    </div>
  );
}
