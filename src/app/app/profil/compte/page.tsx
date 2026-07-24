import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getVaProfile } from "@/lib/data/profile";
import { getAccountInfo, getUserSettings } from "@/lib/data/settings";
import AccountSettings from "@/components/app/AccountSettings";
import ProfileTabs from "@/components/app/ProfileTabs";

// Onglet « Mon compte » (maquette 30b) — réglages privés de l'appli.
export default async function ComptePage() {
  const session = await auth();
  if (session?.user.role !== "VA") redirect("/");

  const [account, settings, profile] = await Promise.all([
    getAccountInfo(session.user.id),
    getUserSettings(session.user.id),
    getVaProfile(session.user.id),
  ]);
  if (!account) redirect("/");

  return (
    <main className="flex-1 px-8 py-10">
      <h1 className="mb-5 font-bowlby text-[44px] leading-none text-ink">Mon profil</h1>

      <div className="mb-4">
        <ProfileTabs active="compte" />
      </div>
      <p className="mb-8 text-[13px] font-medium text-ink opacity-70">
        Tes réglages privés — rien de tout ça n&apos;est visible dans l&apos;annuaire ni par
        tes clients.
      </p>

      <AccountSettings
        email={account.email}
        hasPassword={account.hasPassword}
        published={profile?.published ?? false}
        settings={{
          notifyClientRequest: settings.notifyClientRequest,
          notifyDirectoryContact: settings.notifyDirectoryContact,
          notifyLongTimer: settings.notifyLongTimer,
          notifyWeeklyDigest: settings.notifyWeeklyDigest,
          timezone: settings.timezone,
          timerRounding: settings.timerRounding,
          weekStart: settings.weekStart,
          locale: settings.locale,
        }}
      />
    </main>
  );
}
