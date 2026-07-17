import { generateMetadata as genMeta } from '@/lib/metadata'

export const metadata = genMeta({
  title: 'Devenir Assistante Virtuelle - Le Guide Complet',
  description:
    'Guide complet pour devenir assistante virtuelle en 2026. Formation, outils, TJM, compétences requises. Par Caroline Franquet, VA premium depuis 5+ ans.',
  path: '/devenir-assistante-virtuelle',
})

// Hub page — contenu statique enrichi
export default function DevenirVAPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1>Devenir Assistante Virtuelle en 2026 : Le Guide Complet</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Tu veux devenir VA mais tu sais pas par où commencer ? Formation, outils, TJM, clients…
        Voici tout ce qu&apos;il faut savoir, par une VA qui le fait depuis 5 ans.
      </p>

      <section>
        <h2>Qu&apos;est-ce qu&apos;une assistante virtuelle ?</h2>
        <p>…</p>
      </section>

      <section>
        <h2>Les compétences indispensables</h2>
        <p>…</p>
      </section>

      <section>
        <h2>Quels outils pour commencer ?</h2>
        <p>…</p>
      </section>

      <section>
        <h2>Combien gagne une assistante virtuelle ?</h2>
        <p>…</p>
      </section>

      <section>
        <h2>FAQ</h2>
        {/* FAQ avec schema JSON-LD */}
      </section>
    </main>
  )
}
