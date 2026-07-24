import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getVaProfile } from "@/lib/data/profile";
import ProfileForm from "@/components/app/ProfileForm";

export default async function ProfilPage() {
  const session = await auth();
  if (session?.user.role !== "VA") redirect("/");

  const profile = await getVaProfile(session.user.id);

  return (
    <main className="flex-1 px-8 py-10">
      <div className="mb-2 flex items-center gap-4">
        <h1 className="font-bowlby text-[44px] leading-none text-ink">Mon profil</h1>
        {profile?.published ? (
          <span className="-rotate-3 rounded-[10px] bg-lime px-3 py-1.5 text-xs font-bold text-ink shadow-sticker">
            visible dans l&apos;annuaire ✓
          </span>
        ) : (
          <span className="-rotate-3 rounded-[10px] bg-sand px-3 py-1.5 text-xs font-bold text-ink shadow-sticker">
            non publié
          </span>
        )}
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

      <div className="max-w-2xl rounded-[18px] bg-sand p-6">
        <ProfileForm
          profile={
            profile
              ? {
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
                  published: profile.published,
                }
              : null
          }
        />
      </div>
    </main>
  );
}
