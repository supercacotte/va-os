import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getVaProfile, getVaPublicStats } from "@/lib/data/profile";
import ProfileEditor from "@/components/app/ProfileEditor";
import ProfileTabs from "@/components/app/ProfileTabs";

export default async function ProfilPage() {
  const session = await auth();
  if (session?.user.role !== "VA") redirect("/");

  const [profile, stats] = await Promise.all([
    getVaProfile(session.user.id),
    getVaPublicStats(session.user.id),
  ]);

  return (
    <main className="flex-1 px-8 py-10">
      <div className="mb-5 flex items-center gap-4">
        <h1 className="font-bowlby text-[44px] leading-none text-ink">Mon profil</h1>
        {profile?.published && (
          <span className="-rotate-3 rounded-[10px] bg-lime px-3 py-1.5 text-xs font-bold text-ink shadow-sticker">
            visible dans l&apos;annuaire ✓
          </span>
        )}
      </div>

      <div className="mb-4">
        <ProfileTabs active="fiche" />
      </div>
      <p className="mb-8 text-[13px] font-medium text-ink opacity-70">
        Ta vitrine dans{" "}
        <Link
          href="/annuaire"
          className="font-semibold underline decoration-orange decoration-2 underline-offset-4"
        >
          l&apos;annuaire public
        </Link>{" "}
        — les personnes qui cherchent une VA t&apos;y trouvent et te contactent directement.
      </p>

      <ProfileEditor
        profile={
          profile
            ? {
                id: profile.id,
                displayName: profile.displayName,
                headline: profile.headline,
                bio: profile.bio,
                specialties: profile.specialties,
                location: profile.location,
                region: profile.region,
                languages: profile.languages,
                availability: profile.availability,
                availabilityNote: profile.availabilityNote,
                contactEmail: profile.contactEmail,
                website: profile.website,
                hourlyRate: profile.hourlyRate,
                capacityNote: profile.capacityNote,
                showStats: profile.showStats,
                published: profile.published,
                updatedAt: profile.updatedAt.toISOString(),
              }
            : null
        }
        stats={stats}
      />
    </main>
  );
}
