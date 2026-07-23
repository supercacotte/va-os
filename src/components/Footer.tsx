import Link from "next/link";

type Props = {
  variant?: "app" | "ink";
};

// Footer standard (DESIGN.md §5 bis). Variante « app » : bandeau discret en
// bas du conteneur paper des espaces connectés. Variante « ink » : bandeau
// sombre des pages publiques (landing, pages email).
export default function Footer({ variant = "app" }: Props) {
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
    <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-ink/15 px-8 py-4">
      <div className="flex items-center gap-3">
        <span className="font-bowlby text-xs tracking-wide text-ink">VA DESK</span>
        <span className="text-xs font-medium text-ink opacity-60">© 2026</span>
      </div>
      <div className="flex items-center gap-4 text-xs font-semibold text-ink/70">
        <a href="mailto:hello@vadesk.fr" className="transition hover:text-ink">
          Contact
        </a>
        <a
          href="https://vadesk.fr"
          className="underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
        >
          vadesk.fr
        </a>
      </div>
    </footer>
  );
}
