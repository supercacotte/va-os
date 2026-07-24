import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublishedVaProfileById, getVaPublicStats } from "@/lib/data/profile";
import { regionLabel } from "@/lib/regions";
import Footer from "@/components/Footer";
import VaAvatar from "@/components/annuaire/VaAvatar";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getPublishedVaProfileById(id);
  if (!profile) return { title: "Profil introuvable — VA Desk" };
  return {
    title: `${profile.displayName} — assistante virtuelle | VA Desk`,
    description: profile.headline ?? profile.bio.slice(0, 150),
  };
}

// Fiche publique d'une VA (D17) — uniquement si le profil est publié.
export default async function VaProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getPublishedVaProfileById(id);
  if (!profile) notFound();

  const region = regionLabel(profile.region);
  const stats = profile.showStats ? await getVaPublicStats(profile.userId) : null;

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
            href="/annuaire"
            className="text-sm font-bold text-ink underline decoration-orange decoration-2 underline-offset-4"
          >
            Annuaire
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
        <div className="mx-auto max-w-3xl">
          <Link
            href="/annuaire"
            className="text-sm font-semibold text-ink underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
          >
            ← Toutes les assistantes
          </Link>

          <div className="mt-6 rounded-[18px] bg-paper p-8 shadow-sticker">
            <div className="flex flex-wrap items-start gap-6">
              <VaAvatar name={profile.displayName} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-bowlby text-[36px] leading-tight text-ink">
                    {profile.displayName}
                  </h1>
                  {profile.availability === "available" ? (
                    <span className="rotate-2 rounded-full border-4 border-paper bg-lime px-3 py-1 text-xs font-bold text-ink shadow-sticker">
                      dispo ✓
                    </span>
                  ) : (
                    <span className="rotate-2 rounded-full border-4 border-paper bg-sand px-3 py-1 text-xs font-bold text-ink shadow-sticker">
                      complète{profile.availabilityNote ? ` — ${profile.availabilityNote}` : ""}
                    </span>
                  )}
                </div>
                {profile.headline && (
                  <p className="mt-2 text-[15px] font-semibold text-ink opacity-80">
                    {profile.headline}
                  </p>
                )}
                {(profile.location || region || profile.languages.length > 0) && (
                  <p className="mt-1 text-[13px] font-medium text-ink opacity-70">
                    {[profile.location, region, profile.languages.join(", ")]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
            </div>

            <p className="mt-6 whitespace-pre-line text-[15px] font-medium leading-relaxed text-ink">
              {profile.bio}
            </p>

            {profile.specialties.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {profile.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="rounded-full bg-sand px-3 py-1.5 text-xs font-bold text-ink"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            )}

            {(profile.hourlyRate || profile.capacityNote) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {profile.hourlyRate && (
                  <span className="rounded-full bg-sand px-3 py-1.5 text-xs font-bold text-ink">
                    {profile.hourlyRate} €/h
                  </span>
                )}
                {profile.capacityNote && (
                  <span className="rounded-full bg-sand px-3 py-1.5 text-xs font-bold text-ink">
                    capacité : {profile.capacityNote}
                  </span>
                )}
              </div>
            )}

            {stats && (
              <div className="mt-6 grid grid-cols-3 gap-3 rounded-[16px] bg-sand p-5 text-center">
                <div>
                  <p className="text-[26px] font-bold leading-tight text-ink">
                    {stats.clientCount}
                  </p>
                  <p className="text-[11px] font-semibold text-ink opacity-60">
                    client{stats.clientCount > 1 ? "s" : ""} actif
                    {stats.clientCount > 1 ? "s" : ""}
                  </p>
                </div>
                <div>
                  <p className="text-[26px] font-bold leading-tight text-ink">
                    {stats.missionCount}
                  </p>
                  <p className="text-[11px] font-semibold text-ink opacity-60">
                    mission{stats.missionCount > 1 ? "s" : ""} menée
                    {stats.missionCount > 1 ? "s" : ""}
                  </p>
                </div>
                <div>
                  <p className="text-[26px] font-bold leading-tight text-ink">
                    {stats.hoursTracked}
                  </p>
                  <p className="text-[11px] font-semibold text-ink opacity-60">
                    heures trackées
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-ink/15 pt-6">
              {profile.contactEmail && (
                <a
                  href={`mailto:${profile.contactEmail}`}
                  className="rounded-xl bg-orange px-6 py-3 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95"
                >
                  Contacter {profile.displayName.split(" ")[0]}
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
          </div>
        </div>
      </main>

      <Footer variant="ink" />
    </div>
  );
}
