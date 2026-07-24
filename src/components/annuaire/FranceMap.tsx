import Link from "next/link";

import { REGIONS } from "@/lib/regions";
import VaAvatar from "@/components/annuaire/VaAvatar";

// Carte de France (maquette home-annuaire) : tracé métropole + Corse dérivé
// des données Natural Earth (domaine public), simplifié. Bulles par région
// cliquables (filtre), carte du premier profil en superposition.
const FRANCE_PATH =
  "M 83.5 36.6 L 81.8 38.0 L 80.9 38.0 L 80.4 37.5 L 79.4 37.9 L 78.9 38.4 L 79.6 39.1 L 77.4 41.8 L 76.1 42.5 L 75.8 44.3 L 74.2 45.7 L 73.6 47.1 L 73.8 48.8 L 73.0 49.4 L 73.2 50.0 L 74.4 49.6 L 74.9 49.0 L 74.7 48.3 L 75.9 47.4 L 78.1 47.6 L 78.1 49.8 L 79.7 52.0 L 78.3 53.1 L 78.2 53.8 L 80.6 56.9 L 80.1 58.4 L 78.6 59.4 L 77.2 59.5 L 77.9 61.4 L 79.4 62.1 L 79.8 63.3 L 78.6 65.2 L 78.8 66.3 L 80.5 68.1 L 82.0 68.7 L 83.7 68.4 L 83.9 69.2 L 82.7 71.2 L 82.7 72.1 L 80.7 73.1 L 76.3 77.6 L 73.9 78.5 L 71.9 78.3 L 69.3 77.1 L 68.8 76.0 L 67.2 75.8 L 67.1 75.1 L 64.9 75.8 L 61.7 74.8 L 60.6 73.7 L 59.7 74.0 L 55.5 77.4 L 54.2 80.0 L 54.5 83.0 L 55.2 84.5 L 53.2 84.3 L 52.0 84.7 L 51.6 85.3 L 48.7 84.6 L 47.4 85.2 L 45.6 83.8 L 45.6 82.9 L 44.2 82.5 L 43.8 83.0 L 43.3 82.1 L 39.5 80.7 L 38.9 80.7 L 38.7 82.1 L 37.9 82.1 L 34.3 82.1 L 32.7 80.8 L 30.8 81.1 L 29.7 79.8 L 27.0 79.0 L 26.2 78.3 L 25.8 78.9 L 25.2 78.7 L 25.5 77.0 L 23.6 76.4 L 23.1 75.4 L 24.1 75.2 L 25.1 74.0 L 26.6 64.7 L 27.7 63.5 L 27.2 62.8 L 26.6 63.7 L 27.7 55.7 L 29.3 57.1 L 30.5 59.8 L 29.5 56.3 L 26.9 54.0 L 26.8 53.5 L 28.0 53.8 L 27.2 48.5 L 25.7 48.1 L 23.1 46.6 L 21.2 43.3 L 21.6 41.7 L 20.5 40.5 L 20.8 40.0 L 21.6 39.5 L 23.4 40.1 L 21.9 39.2 L 18.5 39.2 L 18.3 38.5 L 19.0 37.7 L 18.2 37.2 L 16.8 37.3 L 16.7 36.3 L 15.6 36.5 L 14.3 35.6 L 12.5 35.5 L 9.5 34.3 L 6.9 34.4 L 6.1 33.1 L 4.5 32.4 L 6.8 31.2 L 5.2 30.1 L 7.3 30.0 L 6.4 29.4 L 4.3 29.4 L 4.0 28.6 L 4.3 27.8 L 5.5 27.0 L 10.7 26.2 L 13.8 25.0 L 15.3 25.4 L 17.3 27.8 L 18.9 26.7 L 21.2 26.8 L 21.7 27.4 L 22.4 26.3 L 22.9 26.9 L 25.8 26.7 L 24.5 25.3 L 24.4 21.6 L 22.9 18.9 L 22.7 17.1 L 26.5 17.2 L 27.3 19.9 L 33.5 20.7 L 37.3 19.3 L 35.4 18.8 L 35.8 17.0 L 38.6 15.5 L 42.6 14.2 L 43.6 13.4 L 44.8 11.8 L 44.9 6.6 L 46.9 5.0 L 50.8 4.0 L 51.3 6.1 L 52.3 7.2 L 52.8 7.6 L 54.6 7.0 L 55.6 9.3 L 57.7 9.8 L 58.3 11.3 L 60.0 11.1 L 61.4 11.9 L 61.4 14.6 L 63.8 14.6 L 65.6 12.8 L 65.4 14.6 L 65.9 16.2 L 68.5 17.2 L 70.0 18.7 L 71.8 18.5 L 73.2 19.3 L 74.7 18.9 L 76.6 19.8 L 77.9 22.0 L 78.9 21.6 L 79.8 22.4 L 82.5 22.1 L 83.5 22.9 L 86.9 23.7 L 86.9 24.5 L 85.0 26.9 L 83.5 31.3 L 83.0 35.8 Z";
const CORSICA_PATH = "M 95.5 81.0 L 96.0 87.3 L 93.6 94.2 L 91.2 92.3 L 91.7 91.3 L 90.6 90.7 L 90.8 89.2 L 90.0 88.9 L 90.5 88.1 L 89.6 86.5 L 90.3 85.9 L 89.6 85.2 L 90.6 83.4 L 93.3 81.7 L 94.3 82.1 L 94.8 79.1 L 95.4 79.4 Z";

type Featured = {
  id: string;
  displayName: string;
  location: string | null;
  available: boolean;
} | null;

type Props = {
  regionCounts: Record<string, number>;
  activeRegion?: string;
  buildHref: (region: string | null) => string;
  featured?: Featured;
};

export default function FranceMap({ regionCounts, activeRegion, buildHref, featured }: Props) {
  return (
    <div className="relative overflow-hidden rounded-[18px] bg-[#E2EAE3] pt-2">
      {featured && (
        <div className="absolute inset-x-3 top-3 z-10 flex items-center gap-3 rounded-[16px] bg-paper p-3 shadow-sticker">
          <VaAvatar name={featured.displayName} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{featured.displayName}</p>
            <p className="truncate text-xs font-medium text-ink opacity-70">
              {[featured.location, featured.available ? "dispo ✓" : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <Link
            href={`/annuaire/${featured.id}`}
            className="shrink-0 rounded-xl bg-orange px-3 py-2 text-xs font-bold text-ink shadow-sticker transition hover:brightness-95"
          >
            Voir le profil
          </Link>
        </div>
      )}

      <svg viewBox="0 0 100 98.2" className="block w-full" aria-hidden>
        <path d={FRANCE_PATH} fill="var(--paper)" stroke="rgba(32,34,33,0.18)" strokeWidth="0.5" />
        <path d={CORSICA_PATH} fill="var(--paper)" stroke="rgba(32,34,33,0.18)" strokeWidth="0.5" />
      </svg>

      {REGIONS.filter((region) => regionCounts[region.code]).map((region) => {
        const active = activeRegion === region.code;
        return (
          <Link
            key={region.code}
            href={buildHref(active ? null : region.code)}
            title={`${region.label} — ${regionCounts[region.code]} profil${regionCounts[region.code]! > 1 ? "s" : ""}`}
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
        Données : Natural Earth
      </p>
    </div>
  );
}
