import Link from "next/link";

import {
  getDirectoryAggregates,
  getPublishedVaProfiles,
} from "@/lib/data/profile";
import { regionLabel } from "@/lib/regions";
import Footer from "@/components/Footer";
import VaAvatar from "@/components/annuaire/VaAvatar";
import FranceMap from "@/components/annuaire/FranceMap";

export const metadata = {
  title: "Annuaire des assistantes virtuelles — VA Desk",
  description:
    "Trouvez une assistante virtuelle indépendante : profils, spécialités, disponibilité et contact direct. Référencement gratuit pour les VA sur VA Desk.",
};

const PAGE_SIZE = 8;
const FIELD =
  "w-full rounded-[10px] bg-sand px-4 py-2.5 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30";
const SIDE_LABEL = "text-[13px] font-bold text-ink";

type Params = {
  q?: string;
  ville?: string;
  spec?: string | string[];
  dispo?: string;
  region?: string;
  tri?: string;
  page?: string;
};

function buildQuery(params: Params, overrides: Record<string, string | null>) {
  const entries = new URLSearchParams();
  const flat: Record<string, string | string[] | undefined> = { ...params, ...overrides };
  for (const [key, value] of Object.entries(flat)) {
    if (value === null || value === undefined || value === "") continue;
    if (Array.isArray(value)) value.forEach((v) => entries.append(key, v));
    else entries.set(key, value);
  }
  const qs = entries.toString();
  return qs ? `/annuaire?${qs}` : "/annuaire";
}

// Page publique (D17, maquette home-annuaire) — filtres | liste | carte.
export default async function AnnuairePage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const selectedSpecs = [params.spec ?? []].flat();
  const page = Math.max(1, Number(params.page) || 1);

  const [profiles, aggregates] = await Promise.all([
    getPublishedVaProfiles({
      q: params.q,
      ville: params.ville,
      specialties: selectedSpecs,
      dispo: params.dispo === "1",
      region: params.region,
    }),
    getDirectoryAggregates(),
  ]);

  const sorted =
    params.tri === "az"
      ? [...profiles].sort((a, b) => a.displayName.localeCompare(b.displayName, "fr"))
      : profiles;
  const visible = sorted.slice(0, page * PAGE_SIZE);
  const hasMore = sorted.length > visible.length;

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
            href="/#fonctionnalites"
            className="text-sm font-semibold text-ink/80 transition hover:text-ink"
          >
            Fonctionnalités
          </Link>
          <span className="text-sm font-bold text-ink underline decoration-orange decoration-2 underline-offset-4">
            Annuaire
          </span>
          <Link
            href="/connexion"
            prefetch={false}
            className="text-sm font-semibold text-ink/80 transition hover:text-ink"
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

      <main className="flex-1 bg-paper">
        <div className="grid lg:grid-cols-[260px_minmax(0,1fr)_360px]">
          {/* Sidebar filtres */}
          <aside className="border-b border-ink/10 px-6 py-8 lg:border-b-0 lg:border-r">
            <form method="GET" className="flex flex-col gap-5">
              <h2 className="text-[13px] font-bold uppercase tracking-[1.5px] text-ink">
                Filtres
              </h2>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="q" className={SIDE_LABEL}>
                  Recherche
                </label>
                <input
                  id="q"
                  name="q"
                  defaultValue={params.q ?? ""}
                  placeholder="Nom, spécialité…"
                  className={FIELD}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="ville" className={SIDE_LABEL}>
                  Ville
                </label>
                <input
                  id="ville"
                  name="ville"
                  defaultValue={params.ville ?? ""}
                  placeholder="Ex : Nantes, Lyon…"
                  className={FIELD}
                />
              </div>

              {aggregates.topSpecialties.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className={SIDE_LABEL}>Spécialités</p>
                  {aggregates.topSpecialties.map((specialty) => (
                    <label
                      key={specialty}
                      className="flex items-center gap-2.5 text-[13px] font-medium text-ink"
                    >
                      <input
                        type="checkbox"
                        name="spec"
                        value={specialty}
                        defaultChecked={selectedSpecs.includes(specialty)}
                        className="h-4 w-4 accent-ink"
                      />
                      {specialty}
                    </label>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <p className={SIDE_LABEL}>Disponibilité</p>
                <label className="flex items-center gap-2.5 text-[13px] font-medium text-ink">
                  <input
                    type="checkbox"
                    name="dispo"
                    value="1"
                    defaultChecked={params.dispo === "1"}
                    className="h-4 w-4 accent-ink"
                  />
                  Dispo maintenant
                </label>
              </div>

              {params.region && (
                <input type="hidden" name="region" value={params.region} />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-orange px-4 py-2.5 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95"
                >
                  Filtrer
                </button>
                <Link
                  href="/annuaire"
                  className="text-xs font-semibold text-ink/60 transition hover:text-ink"
                >
                  Réinitialiser
                </Link>
              </div>
            </form>

            <div className="relative mt-10 rounded-[16px] border-2 border-dashed border-ink/30 p-5">
              <span className="absolute -top-3 left-4 -rotate-3 rounded-[8px] bg-lime px-2.5 py-1 text-xs font-bold text-ink shadow-sticker">
                toi, ici ?
              </span>
              <p className="mt-1 text-[15px] font-bold text-ink">
                Tu es assistante virtuelle ?
              </p>
              <p className="mt-1 text-[13px] font-medium leading-relaxed text-ink opacity-70">
                Crée ton profil en 5 minutes et reçois des demandes de clients.
              </p>
              <Link
                href="/inscription"
                prefetch={false}
                className="mt-3 inline-block rounded-xl bg-orange px-4 py-2.5 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95"
              >
                + S&apos;ajouter à l&apos;annuaire
              </Link>
            </div>
          </aside>

          {/* Liste */}
          <section className="px-6 py-8 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-[19px] font-bold text-ink">
                {sorted.length} assistante{sorted.length > 1 ? "s" : ""}
                {params.region && regionLabel(params.region)
                  ? ` — ${regionLabel(params.region)}`
                  : ""}
              </h1>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-ink/60">Trier :</span>
                <Link
                  href={buildQuery(params, { tri: null, page: null })}
                  className={`rounded-full px-3 py-1 ${!params.tri ? "bg-ink text-paper" : "bg-sand text-ink hover:bg-ink/10"}`}
                >
                  pertinence
                </Link>
                <Link
                  href={buildQuery(params, { tri: "az", page: null })}
                  className={`rounded-full px-3 py-1 ${params.tri === "az" ? "bg-ink text-paper" : "bg-sand text-ink hover:bg-ink/10"}`}
                >
                  A–Z
                </Link>
              </div>
            </div>

            {visible.length === 0 ? (
              <div className="mt-8 rounded-[18px] border-2 border-dashed border-ink/30 p-8">
                <h2 className="text-[19px] font-bold text-ink">
                  {params.q || params.ville || selectedSpecs.length || params.region
                    ? "Aucun profil ne correspond"
                    : "L'annuaire se remplit"}
                </h2>
                <p className="mt-2 max-w-md text-[13px] font-medium leading-relaxed text-ink opacity-70">
                  {params.q || params.ville || selectedSpecs.length || params.region
                    ? "Élargis tes filtres, ou parcours tous les profils en les réinitialisant."
                    : "Les premières VA arrivent — reviens bientôt, ou crée ton compte pour être parmi les premières référencées."}
                </p>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-4">
                {visible.map((profile) => (
                  <article
                    key={profile.id}
                    className="flex items-start gap-5 rounded-[18px] bg-paper p-5 shadow-sticker ring-1 ring-ink/5"
                  >
                    <VaAvatar name={profile.displayName} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-[19px] font-bold text-ink">
                          {profile.displayName}
                        </h2>
                        {profile.availability === "available" ? (
                          <span className="rounded-full bg-lime px-2.5 py-1 text-[11px] font-bold text-ink">
                            dispo ✓
                          </span>
                        ) : (
                          <span className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold text-ink">
                            complète{profile.availabilityNote ? ` — ${profile.availabilityNote}` : ""}
                          </span>
                        )}
                      </div>
                      {(profile.location || profile.languages.length > 0) && (
                        <p className="mt-0.5 text-[13px] font-semibold text-ink opacity-70">
                          {[profile.location, profile.languages.join(", ")]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                      {profile.headline && (
                        <p className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-relaxed text-ink opacity-80">
                          {profile.headline}
                        </p>
                      )}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        {profile.specialties.slice(0, 4).map((specialty) => (
                          <span
                            key={specialty}
                            className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold text-ink"
                          >
                            {specialty}
                          </span>
                        ))}
                        <Link
                          href={`/annuaire/${profile.id}`}
                          className="ml-auto rounded-xl bg-orange px-4 py-2.5 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95"
                        >
                          Voir le profil
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}

                {hasMore && (
                  <Link
                    href={buildQuery(params, { page: String(page + 1) })}
                    className="mx-auto mt-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-paper transition hover:opacity-90"
                  >
                    Voir plus d&apos;assistantes ▾
                  </Link>
                )}
              </div>
            )}
          </section>

          {/* Carte */}
          <aside className="hidden px-6 py-8 lg:block">
            <FranceMap
              regionCounts={aggregates.regionCounts}
              activeRegion={params.region}
              buildHref={(region) => buildQuery(params, { region, page: null })}
            />
          </aside>
        </div>
      </main>

      <Footer variant="ink" />
    </div>
  );
}
