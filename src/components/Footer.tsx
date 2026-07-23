import Link from "next/link";

type Props = {
  variant?: "app" | "ink";
  /* Couleur du wordmark selon le contexte (DESIGN.md §5 bis) :
     rose pour l'espace VA et le portail, ink pour l'admin. */
  tone?: "pink" | "ink";
};

export default function Footer({ variant = "app", tone = "pink" }: Props) {
  if (variant === "ink") {
    return (
      <footer className="flex flex-wrap items-center justify-between gap-4 bg-ink px-6 py-5 lg:px-12">
        <span className="font-bowlby text-sm tracking-wide text-pink">VA DESK</span>
        <div className="flex items-center gap-5 text-[13px] font-semibold text-paper/80">
          <Link href="/" className="transition hover:text-paper">
            Accueil
          </Link>
          <a href="mailto:hello@vadesk.fr" className="transition hover:text-paper">
            Contact
          </a>
          <span className="opacity-60">© 2026</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-ink/13 px-8 py-5">
      <span
        className={`font-bowlby text-[13px] tracking-wide ${
          tone === "pink" ? "text-pink" : "text-ink"
        }`}
      >
        VA DESK
      </span>
      <div className="flex items-center gap-4 text-xs font-semibold text-ink/70">
        <a href="mailto:hello@vadesk.fr" className="transition hover:text-ink">
          Aide
        </a>
        <a href="mailto:hello@vadesk.fr" className="transition hover:text-ink">
          Contact
        </a>
        <span className="opacity-60">© 2026</span>
      </div>
    </footer>
  );
}
