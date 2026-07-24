import Link from "next/link";

// Onglets pills de « Mon profil » (maquettes 30a/30b).
export default function ProfileTabs({ active }: { active: "fiche" | "compte" }) {
  const base = "rounded-full px-4 py-2 text-sm font-semibold transition";
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-sand p-1">
      <Link
        href="/app/profil"
        className={`${base} ${active === "fiche" ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"}`}
      >
        Ma fiche publique
      </Link>
      <Link
        href="/app/profil/compte"
        className={`${base} ${active === "compte" ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"}`}
      >
        Mon compte
      </Link>
    </div>
  );
}
