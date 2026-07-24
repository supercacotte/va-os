import Link from "next/link";

import { REGIONS } from "@/lib/regions";

// Carte de France stylisée (maquette home-annuaire) : contour simplifié +
// bulles par région, cliquables pour filtrer. Illustration, pas de la carto.
const FRANCE_PATH =
  "M 48 4 L 62 10 L 78 16 L 74 30 L 80 44 L 74 58 L 78 70 L 70 78 L 54 78 L 46 84 L 24 80 L 26 62 L 18 48 L 6 34 L 14 24 L 30 22 L 34 12 Z";
const CORSICA_PATH = "M 88 74 L 92 78 L 90 90 L 86 86 Z";

type Props = {
  regionCounts: Record<string, number>;
  activeRegion?: string;
  buildHref: (region: string | null) => string;
};

export default function FranceMap({ regionCounts, activeRegion, buildHref }: Props) {
  return (
    <div className="relative overflow-hidden rounded-[18px] bg-[#E2EAE3]">
      <svg viewBox="0 0 100 100" className="block w-full" aria-hidden>
        <path d={FRANCE_PATH} fill="var(--paper)" stroke="rgba(32,34,33,0.15)" strokeWidth="0.6" />
        <path d={CORSICA_PATH} fill="var(--paper)" stroke="rgba(32,34,33,0.15)" strokeWidth="0.6" />
      </svg>

      {REGIONS.filter((region) => regionCounts[region.code]).map((region) => {
        const active = activeRegion === region.code;
        return (
          <Link
            key={region.code}
            href={buildHref(active ? null : region.code)}
            title={`${region.label} — ${regionCounts[region.code]} profil${regionCounts[region.code] > 1 ? "s" : ""}`}
            className={`absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm font-bold text-ink shadow-sticker transition hover:scale-110 ${
              active ? "border-2 border-ink bg-orange" : "bg-orange"
            }`}
            style={{ left: `${region.x}%`, top: `${region.y}%` }}
          >
            {regionCounts[region.code]}
          </Link>
        );
      })}

      <p className="absolute bottom-2 right-3 text-[10px] font-medium text-ink opacity-50">
        Carte illustrative — clique une bulle pour filtrer
      </p>
    </div>
  );
}
