// Régions françaises pour la carte de l'annuaire (maquette home-annuaire).
// Positions en % du viewBox — projetées depuis les centres géographiques
// avec la même projection que le tracé Natural Earth de FranceMap.

export const REGIONS: { code: string; label: string; x: number; y: number }[] = [
  { code: "idf", label: "Île-de-France", x: 50.7, y: 26.8 },
  { code: "hdf", label: "Hauts-de-France", x: 52.6, y: 12.5 },
  { code: "ge", label: "Grand Est", x: 70.6, y: 27.7 },
  { code: "nor", label: "Normandie", x: 36.5, y: 23.0 },
  { code: "bre", label: "Bretagne", x: 16.0, y: 32.0 },
  { code: "pdl", label: "Pays de la Loire", x: 28.8, y: 38.1 },
  { code: "cvl", label: "Centre-Val de Loire", x: 45.5, y: 38.1 },
  { code: "bfc", label: "Bourgogne-Franche-Comté", x: 65.4, y: 40.9 },
  { code: "naq", label: "Nouvelle-Aquitaine", x: 35.2, y: 60.8 },
  { code: "ara", label: "Auvergne-Rhône-Alpes", x: 64.8, y: 57.9 },
  { code: "occ", label: "Occitanie", x: 48.7, y: 74.0 },
  { code: "pac", label: "Provence-Alpes-Côte d'Azur", x: 74.4, y: 72.2 },
  { code: "cor", label: "Corse", x: 93.1, y: 88.3 },
];

export function regionLabel(code: string | null | undefined): string | null {
  return REGIONS.find((region) => region.code === code)?.label ?? null;
}
