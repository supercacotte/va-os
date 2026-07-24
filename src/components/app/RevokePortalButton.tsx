"use client";

import { revokePortalAccess } from "@/lib/actions/clients";

// Révocation de l'accès portail — confirmation obligatoire. Réversible : la
// VA pourra réinviter le client ensuite (les données métier sont conservées).
export default function RevokePortalButton({
  clientId,
  email,
}: {
  clientId: string;
  email: string;
}) {
  return (
    <form
      action={revokePortalAccess}
      onSubmit={(e) => {
        if (
          !confirm(
            `Révoquer l'accès de ${email} au portail ? Il ne pourra plus se connecter. Tu pourras le réinviter plus tard.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="clientId" value={clientId} />
      <button
        type="submit"
        className="rounded-full bg-paper px-3 py-1.5 text-[11px] font-bold text-ink shadow-sticker transition hover:brightness-95"
      >
        Révoquer l&apos;accès
      </button>
    </form>
  );
}
