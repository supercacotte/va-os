// Régions françaises pour la carte de l'annuaire (maquette home-annuaire).
// Positions en % du viewBox de la carte SVG simplifiée.

export const REGIONS: { code: string; label: string; x: number; y: number }[] = [
  { code: "idf", label: "Île-de-France", x: 52, y: 26 },
  { code: "hdf", label: "Hauts-de-France", x: 52, y: 12 },
  { code: "ge", label: "Grand Est", x: 72, y: 22 },
  { code: "nor", label: "Normandie", x: 38, y: 20 },
  { code: "bre", label: "Bretagne", x: 18, y: 28 },
  { code: "pdl", label: "Pays de la Loire", x: 28, y: 38 },
  { code: "cvl", label: "Centre-Val de Loire", x: 46, y: 38 },
  { code: "bfc", label: "Bourgogne-Franche-Comté", x: 66, y: 38 },
  { code: "naq", label: "Nouvelle-Aquitaine", x: 34, y: 58 },
  { code: "ara", label: "Auvergne-Rhône-Alpes", x: 62, y: 54 },
  { code: "occ", label: "Occitanie", x: 46, y: 74 },
  { code: "pac", label: "Provence-Alpes-Côte d'Azur", x: 70, y: 72 },
  { code: "cor", label: "Corse", x: 88, y: 84 },
];

export function regionLabel(code: string | null | undefined): string | null {
  return REGIONS.find((region) => region.code === code)?.label ?? null;
}
