import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Footer from "@/components/Footer";
import RotatingName from "@/components/landing/RotatingName";
import TickingClock from "@/components/landing/TickingClock";

const SPACE_BY_ROLE = {
  VA: "/app",
  CLIENT: "/portail",
  ADMIN: "/admin",
} as const;

const MARQUEE = [
  "to-do list",
  "deadlines",
  "emails",
  "factures",
  "réseaux sociaux",
  "suivi du temps",
  "rapports clients",
  "relances devis",
];
const MARQUEE_COLORS = ["text-lime", "text-lilac", "text-pink", "text-orange"];

export default async function Home() {
  const session = await auth();
  // Connectée = directement dans son espace, pas d'étape intermédiaire.
  if (session?.user) redirect(SPACE_BY_ROLE[session.user.role]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-paper px-6 py-4 lg:px-12">
        <span className="-rotate-3 rounded-[10px] border-[5px] border-paper bg-lime px-3 py-1 font-bowlby text-base leading-none tracking-wide text-ink shadow-sticker">
          VA DESK
        </span>
        <nav className="flex items-center gap-5">
          <a
            href="#fonctionnalites"
            className="text-sm font-semibold text-ink/80 transition hover:text-ink"
          >
            Fonctionnalités
          </a>
          <Link
            href="/annuaire"
            className="text-sm font-semibold text-ink/80 transition hover:text-ink"
          >
            Annuaire
          </Link>
          <Link
            href="/connexion"
            prefetch={false}
            className="text-sm font-semibold text-ink underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
          >
            Se connecter
          </Link>
          <Link
            href="/inscription"
            prefetch={false}
            className="rounded-full bg-orange px-4 py-2 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95"
          >
            Créer mon compte
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-sand px-6 pb-16 pt-14 text-center">
        <span className="animate-float absolute left-[12%] top-16 hidden md:block" style={{ animationDelay: "0s" }}>
          <span className="inline-block -rotate-6 rounded-[8px] border-4 border-paper bg-lime px-3 py-1 text-xs font-bold text-ink shadow-sticker">
            to-do list
          </span>
        </span>
        <span className="animate-float absolute left-[6%] top-32 hidden md:block" style={{ animationDelay: "0.9s" }}>
          <span className="inline-block rotate-3 rounded-[8px] border-4 border-paper bg-lilac px-3 py-1 text-xs font-bold text-ink shadow-sticker">
            deadlines
          </span>
        </span>
        <span className="animate-float absolute right-[10%] top-14 hidden md:block" style={{ animationDelay: "1.7s" }}>
          <span className="inline-block rotate-2 rounded-[8px] border-4 border-paper bg-lime px-3 py-1 text-xs font-bold text-ink shadow-sticker">
            emails
          </span>
        </span>
        <span className="animate-float absolute right-[7%] top-32 hidden md:block" style={{ animationDelay: "2.5s" }}>
          <span className="inline-block -rotate-3 rounded-[8px] border-4 border-paper bg-pink px-3 py-1 text-xs font-bold text-ink shadow-sticker">
            factures
          </span>
        </span>
        <span className="animate-float absolute left-[18%] top-6 hidden md:block" style={{ animationDelay: "0.4s" }}>
          <span className="inline-block rotate-2 rounded-[8px] border-4 border-paper bg-orange px-3 py-1 text-xs font-bold text-ink shadow-sticker">
            réseaux sociaux
          </span>
        </span>
        <span className="animate-float absolute left-[10%] top-52 hidden md:block" style={{ animationDelay: "1.3s" }}>
          <span className="inline-block -rotate-2 rounded-[8px] border-4 border-paper bg-pink px-3 py-1 text-xs font-bold text-ink shadow-sticker">
            devis
          </span>
        </span>
        <span className="animate-float absolute left-[15%] top-72 hidden md:block" style={{ animationDelay: "2.1s" }}>
          <span className="inline-block rotate-3 rounded-[8px] border-4 border-paper bg-lime px-3 py-1 text-xs font-bold text-ink shadow-sticker">
            prospection
          </span>
        </span>
        <span className="animate-float absolute right-[13%] top-52 hidden md:block" style={{ animationDelay: "1.7s" }}>
          <span className="inline-block rotate-2 rounded-[8px] border-4 border-paper bg-lilac px-3 py-1 text-xs font-bold text-ink shadow-sticker">
            agenda
          </span>
        </span>
        <span className="animate-float absolute right-[6%] top-72 hidden md:block" style={{ animationDelay: "2.8s" }}>
          <span className="inline-block -rotate-3 rounded-[8px] border-4 border-paper bg-orange px-3 py-1 text-xs font-bold text-ink shadow-sticker">
            relances
          </span>
        </span>

        <p className="text-[13px] font-bold uppercase tracking-[1.5px] text-ink">
          Le cockpit des assistantes virtuelles
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl font-bowlby text-[44px] leading-[1.05] text-ink md:text-[64px]">
          Dix onglets.
          <br />
          Une seule <span className="text-pink">page</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-[15px] font-medium leading-relaxed text-ink opacity-80">
          Clients, missions, temps, facturation — VA Desk réunit tout ce que tu pilotes, avec
          un chrono qui transforme tes heures en rapports prêts à envoyer.
        </p>
        <div className="mt-8">
          <Link
            href="/inscription"
            prefetch={false}
            className="inline-block rounded-xl bg-orange px-6 py-3.5 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95"
          >
            Créer mon compte — c&apos;est gratuit
          </Link>
          <p className="mt-2 text-[11px] font-semibold text-ink opacity-60">
            Sans carte bancaire · prête en 5 minutes
          </p>
        </div>

        {/* Mockup produit */}
        <div className="relative mx-auto mt-12 max-w-3xl" aria-hidden>
          <span className="absolute -left-3 -top-3 z-10 -rotate-6 rounded-[8px] border-4 border-paper bg-pink px-3 py-1 text-xs font-bold text-ink shadow-sticker">
            ton espace
          </span>
          <div className="rounded-2xl bg-paper p-5 text-left shadow-screen">
            <div className="flex items-center justify-between border-b border-ink/15 pb-3">
              <div className="flex items-center gap-2">
                <span className="-rotate-3 rounded-[6px] border-2 border-paper bg-lime px-2 py-1 font-bowlby text-[10px] leading-none text-ink shadow-sticker">
                  VA DESK
                </span>
                <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-bold text-paper">
                  Tableau de bord
                </span>
              </div>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange text-xs font-bold text-ink">
                J
              </span>
            </div>
            <p className="mt-4 font-bowlby text-xl text-ink">Bonjour Julia !</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[160px_1fr_170px]">
              <div className="flex flex-col gap-2">
                <div className="rounded-[10px] border-2 border-ink bg-lilac p-2.5 shadow-sticker">
                  <p className="text-[12px] font-bold text-ink">Marie Dupont</p>
                  <p className="mt-1 inline-block rounded-full bg-paper px-2 py-0.5 text-[9px] font-bold text-ink">
                    4 missions actives
                  </p>
                </div>
                <div className="rounded-[10px] bg-pink p-2.5">
                  <p className="text-[12px] font-bold text-ink">Paul Martin</p>
                  <p className="mt-1 inline-block rounded-full bg-paper px-2 py-0.5 text-[9px] font-bold text-ink">
                    1 mission active
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { name: "Gestion des réseaux sociaux", badge: "2 à faire", lime: false },
                  { name: "Support administratif", badge: "tout est fait ✓", lime: true },
                  { name: "Demandes du portail", badge: "1 à faire", lime: false },
                ].map((mission) => (
                  <div
                    key={mission.name}
                    className="flex items-center justify-between gap-2 rounded-[10px] bg-sand px-3 py-2.5"
                  >
                    <p className="truncate text-[11px] font-semibold text-ink">{mission.name}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold text-ink ${
                        mission.lime ? "bg-lime" : "bg-orange"
                      }`}
                    >
                      {mission.badge}
                    </span>
                  </div>
                ))}
              </div>
              <div className="rounded-[10px] bg-lilac p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-ink">En cours</p>
                  <span className="rotate-2 rounded-full bg-lime px-1.5 py-0.5 text-[8px] font-bold text-ink">
                    <span className="animate-pulse">●</span> rec
                  </span>
                </div>
                <p className="mt-2 font-bowlby text-lg leading-none text-ink"><TickingClock /></p>
                <p className="mt-1 text-[9px] font-semibold text-ink opacity-70">
                  Marie — Réseaux sociaux
                </p>
                <div className="mt-2 flex gap-1.5">
                  <span className="rounded-[6px] bg-ink px-2 py-1 text-[9px] font-bold text-paper">
                    ⏸ Pause
                  </span>
                  <span className="rounded-[6px] bg-paper px-2 py-1 text-[9px] font-bold text-ink">
                    ■ Stop
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bandeau ink défilant */}
      <div className="marquee-mask overflow-hidden bg-ink py-4">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1}
              className="flex items-center gap-8 pr-8"
            >
              {MARQUEE.map((item, index) => (
                <span
                  key={item}
                  className="flex items-center gap-8 whitespace-nowrap text-sm font-bold text-paper"
                >
                  {item}
                  <span className={MARQUEE_COLORS[index % MARQUEE_COLORS.length]}>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Chrono. Suivi de mission. Rapport. */}
      <section id="fonctionnalites" className="bg-paper px-6 py-16 text-center lg:px-12">
        <h2 className="mx-auto max-w-3xl font-bowlby text-[32px] leading-tight text-ink md:text-[40px]">
          Chrono. Suivi de mission.{" "}
          <span className="inline-block -rotate-2 rounded-[12px] border-[5px] border-paper bg-lime px-3 py-0.5 shadow-sticker">
            Rapport.
          </span>
        </h2>
        <p className="mt-4 text-[15px] font-medium text-ink opacity-70">
          C&apos;est tout. Et c&apos;est exactement ce qu&apos;il te faut.
        </p>

        <div className="mx-auto mt-10 grid max-w-5xl gap-5 text-left md:grid-cols-3">
          {/* Le chrono qui facture */}
          <div className="rounded-[18px] bg-lilac/30 p-5">
            <div className="rounded-[14px] bg-lilac p-4 shadow-sticker" aria-hidden>
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold text-ink">En cours</p>
                <span className="rounded-full border-2 border-paper bg-lime px-2 py-0.5 text-[10px] font-bold text-ink">
                  <span className="animate-pulse">●</span> rec
                </span>
              </div>
              <p className="mt-2 font-bowlby text-[28px] leading-none text-ink"><TickingClock /></p>
              <div className="mt-3 flex gap-2">
                <span className="rounded-[8px] bg-ink px-3 py-1.5 text-xs font-bold text-paper">
                  ⏸ Pause
                </span>
                <span className="rounded-[8px] bg-paper px-3 py-1.5 text-xs font-bold text-ink">
                  ■ Stop
                </span>
              </div>
            </div>
            <p className="mt-5 text-[17px] font-bold text-ink">Le chrono qui facture</p>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-ink opacity-80">
              Un clic pour tracker chaque client. Tes heures s&apos;additionnent toutes seules,
              mission par mission.
            </p>
          </div>

          {/* Le portail client */}
          <div className="rounded-[18px] bg-pink/25 p-5">
            <div className="flex flex-col gap-3 rounded-[14px] bg-paper p-4 shadow-sticker" aria-hidden>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-bold text-ink">Newsletter mensuelle</p>
                  <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold text-ink">
                    fait ✓
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
                  <div className="h-full w-full rounded-full bg-lilac" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-bold text-ink">Shooting photo</p>
                  <span className="rounded-full bg-orange px-2 py-0.5 text-[10px] font-bold text-ink">
                    2 à faire
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
                  <div className="h-full w-[38%] rounded-full bg-pink" />
                </div>
              </div>
            </div>
            <p className="mt-5 text-[17px] font-bold text-ink">Le portail client</p>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-ink opacity-80">
              Tes clients suivent l&apos;avancement et déposent leurs demandes au même endroit
              — fini les « ça en est où ? » par email.
            </p>
          </div>

          {/* Le rapport mensuel */}
          <div className="rounded-[18px] bg-lime/25 p-5">
            <div className="rounded-[14px] bg-paper p-4 shadow-sticker" aria-hidden>
              <div className="flex items-center justify-between border-b-2 border-ink pb-2">
                <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-ink">
                  Juillet 2026
                </p>
                <p className="text-[15px] font-bold text-ink">9 h 30</p>
              </div>
              <div className="mt-2 flex items-center justify-between text-[12px] font-medium text-ink">
                <span className="opacity-70">Newsletter</span>
                <span className="font-bold">4 h 10</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[12px] font-medium text-ink">
                <span className="opacity-70">Support admin</span>
                <span className="font-bold">2 h 35</span>
              </div>
              <div className="mt-3 rounded-[8px] bg-orange px-3 py-2 text-center text-xs font-bold text-ink shadow-sticker">
                ▶ Générer le rapport
              </div>
            </div>
            <p className="mt-5 text-[17px] font-bold text-ink">Le rapport mensuel</p>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-ink opacity-80">
              Temps passé, tâches faites, répartition : un rapport propre par client, prêt à
              envoyer chaque fin de mois.
            </p>
          </div>
        </div>
      </section>

      {/* Côté client */}
      <section className="bg-paper px-6 pb-16 lg:px-12">
        <div className="mx-auto grid max-w-4xl items-center gap-10 md:grid-cols-[1fr_340px]">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[1.5px] text-ink">
              Côté client
            </p>
            <h2 className="mt-3 font-bowlby text-[32px] leading-tight text-ink">
              Tes clients délèguent sans t&apos;interrompre.
            </h2>
            <p className="mt-4 max-w-md text-[13px] font-medium leading-relaxed text-ink opacity-80">
              Chaque client a son portail : il voit l&apos;avancement de ses missions et envoie
              ses demandes au même endroit. Toi, tu les acceptes quand tu veux — et elles
              deviennent des missions.
            </p>
          </div>
          <div className="relative" aria-hidden>
            <span className="absolute -right-2 -top-3 z-10 rotate-3 rounded-[8px] border-4 border-paper bg-pink px-3 py-1 text-xs font-bold text-ink shadow-sticker">
              nouvelle demande
            </span>
            <div className="rounded-[18px] bg-lilac p-5 shadow-sticker">
              <p className="text-[13px] font-bold text-ink">Un truc à déléguer ?</p>
              <p className="mt-1 font-bowlby text-[24px] leading-tight text-ink">
                Demande à <RotatingName />.
              </p>
              <div className="mt-3 rounded-[10px] bg-paper/70 px-3 py-2.5 text-[12px] font-medium text-ink opacity-70">
                Décris ce dont tu as besoin…
              </div>
              <div className="mt-3 rounded-[10px] bg-orange px-4 py-2.5 text-center text-[13px] font-bold text-ink shadow-sticker">
                Envoyer
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignage */}
      <section className="bg-sand px-6 py-16 text-center">
        <p className="text-pink">✦</p>
        <blockquote className="mx-auto mt-3 max-w-xl text-[19px] font-bold leading-relaxed text-ink">
          « J&apos;ai fermé six onglets le jour où j&apos;ai ouvert VA Desk. Mes clients voient
          où j&apos;en suis, et mon rapport de fin de mois part en deux clics. »
        </blockquote>
        <p className="mt-3 text-[13px] font-medium text-ink opacity-70">
          Julia — assistante virtuelle, 4 clients
        </p>
      </section>

      {/* CTA final */}
      <section className="bg-paper px-6 py-16 text-center">
        <h2 className="mx-auto max-w-xl font-bowlby text-[36px] leading-tight text-ink">
          Prête à tout mettre au <span className="text-pink">même endroit</span> ?
        </h2>
        <div className="mt-6">
          <Link
            href="/inscription"
            prefetch={false}
            className="inline-block rounded-xl bg-orange px-6 py-3.5 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95"
          >
            Créer mon compte — c&apos;est gratuit
          </Link>
          <p className="mt-2 text-[11px] font-semibold text-ink opacity-60">
            Sans carte bancaire · prête en 5 minutes
          </p>
        </div>
      </section>

      <Footer variant="ink" />
    </div>
  );
}
