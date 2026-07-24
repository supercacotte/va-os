"use client";

import { useEffect, useState } from "react";

// « Demande à {prénom}. » — le prénom tourne. Commence par Julia (SSR stable).
// 8 caractères max pour éviter les sauts de mise en page.
const NAMES = [
  "Julia",
  "Camille",
  "Sarah",
  "Léa",
  "Chloé",
  "Manon",
  "Emma",
  "Lucie",
  "Marion",
  "Pauline",
  "Sophie",
  "Laura",
  "Mathilde",
  "Clara",
  "Élodie",
  "Anaïs",
  "Inès",
  "Juliette",
  "Amandine",
  "Margaux",
];

export default function RotatingName() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % NAMES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span key={index} className="inline-block animate-name-swap">
      {NAMES[index]}
    </span>
  );
}
