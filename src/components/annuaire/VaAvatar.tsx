import { clientColorVar, CLIENT_COLOR_COUNT } from "@/lib/client-colors";

// Avatar annuaire (maquette home-annuaire) : initiales sur pastel rayé,
// liseré paper + ombre sticker. Couleur stable dérivée du nom.
function colorIndexFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return (hash % CLIENT_COLOR_COUNT) + 1;
}

export default function VaAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const dimensions = { sm: "h-12 w-12 text-sm", md: "h-20 w-20 text-xl", lg: "h-28 w-28 text-3xl" }[
    size
  ];
  const radius = { sm: "rounded-[10px]", md: "rounded-[16px]", lg: "rounded-[20px]" }[size];

  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center border-4 border-paper font-bold text-ink shadow-sticker ${dimensions} ${radius}`}
      style={{
        backgroundColor: clientColorVar(colorIndexFor(name)),
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(251,251,249,0.35) 0 10px, transparent 10px 20px)",
      }}
    >
      {initials}
    </span>
  );
}
