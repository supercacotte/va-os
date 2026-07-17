import { notFound } from 'next/navigation'
import { generateMetadata as genMeta } from '@/lib/metadata'
import { BreadcrumbSchema, FAQSchema } from '@/components/json-ld'

const comparatifs = [
  {
    slug: 'make-vs-n8n',
    name: 'Make vs n8n',
    desc: "Le match des outils d'automatisation. Lequel choisir pour ton activité de VA ?",
    a: { name: 'Make', prix: 'Gratuit à $9/mois', facilite: '⭐⭐⭐⭐⭐', puissance: '⭐⭐⭐⭐' },
    b: { name: 'n8n', prix: 'Gratuit (self) à $20/mois', facilite: '⭐⭐⭐', puissance: '⭐⭐⭐⭐⭐' },
    verdict: 'Débutante → Make. Technique ou gros volume → n8n. Les deux fonctionnent.',
    faq: [
      { q: 'Make ou n8n pour une VA débutante ?', a: 'Make. L\'interface visuelle est plus intuitive. n8n demande des notions techniques (savoir ce qu\'est une API, un webhook).' },
      { q: 'Lequel coûte le moins cher ?', a: 'n8n en self-hosted = gratuit (mais faut un serveur). Make à $9/mois est plus simple et inclut l\'hébergement.' },
    ],
  },
  {
    slug: 'make-vs-zapier',
    name: 'Make vs Zapier',
    desc: 'Quel outil no-code domine en 2026 ? Comparatif complet.',
    a: { name: 'Make', prix: 'Gratuit à $9/mois', facilite: '⭐⭐⭐⭐', puissance: '⭐⭐⭐⭐⭐' },
    b: { name: 'Zapier', prix: 'Gratuit à $29.99/mois', facilite: '⭐⭐⭐⭐', puissance: '⭐⭐⭐' },
    verdict: 'Make est moins cher et plus puissant. Zapier est plus simple mais limité. Make gagne.',
    faq: [
      { q: 'Make ou Zapier pour une VA ?', a: 'Make. Plus de scénarios au même prix, meilleure gestion des données.' },
    ],
  },
  {
    slug: 'clickup-vs-notion',
    name: 'ClickUp vs Notion',
    desc: 'Deux poids lourds de la productivité. Fais ton choix.',
    a: { name: 'ClickUp', prix: 'Gratuit à $10/mois', facilite: '⭐⭐⭐', puissance: '⭐⭐⭐⭐⭐' },
    b: { name: 'Notion', prix: 'Gratuit à $10/mois', facilite: '⭐⭐⭐⭐', puissance: '⭐⭐⭐⭐' },
    verdict: 'Team → ClickUp. Solo/VA → Notion. Les deux sont excellents.',
    faq: [
      { q: 'Notion ou ClickUp pour gérer mes clients VA ?', a: 'Notion si t\'es solo, ClickUp si tu collabores avec des clients dans l\'outil.' },
    ],
  },
  {
    slug: 'calendly-vs-cal-dot-com',
    name: 'Calendly vs Cal.com',
    desc: 'Prise de RDV : lequel choisir pour ta VA ?',
    a: { name: 'Calendly', prix: 'Gratuit à $16/mois', facilite: '⭐⭐⭐⭐⭐', puissance: '⭐⭐⭐⭐' },
    b: { name: 'Cal.com', prix: 'Gratuit (self) à $12/mois', facilite: '⭐⭐⭐⭐', puissance: '⭐⭐⭐⭐' },
    verdict: 'Simplicité → Calendly. Contrôle/budget → Cal.com.',
    faq: [],
  },
  {
    slug: 'qonto-vs-pennylane',
    name: 'Qonto vs Pennylane',
    desc: 'Banque vs compta : les deux sont connectés mais pas pareils.',
    a: { name: 'Qonto', prix: 'À partir de 9€/mois', facilite: '⭐⭐⭐⭐⭐', puissance: '⭐⭐⭐⭐' },
    b: { name: 'Pennylane', prix: 'À partir de 10€/mois', facilite: '⭐⭐⭐⭐', puissance: '⭐⭐⭐⭐⭐' },
    verdict: 'Les deux sont complémentaires. Qonto encaisse, Pennylane facture et comptabilise. Utilise les deux ensemble.',
    faq: [],
  },
]

export async function generateStaticParams() {
  return comparatifs.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const c = comparatifs.find(x => x.slug === params.slug)
  if (!c) return {}
  return genMeta({
    title: `${c.name} : Comparatif 2026 | Smart Lazy Club`,
    description: c.desc,
    path: `/comparer/${c.slug}`,
  })
}

export default function ComparerPage({ params }: { params: { slug: string } }) {
  const c = comparatifs.find(x => x.slug === params.slug)
  if (!c) notFound()

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <BreadcrumbSchema items={[
        { name: 'Accueil', url: '/' },
        { name: 'Comparaisons', url: '/comparer' },
        { name: c.name, url: `/comparer/${c.slug}` },
      ]} />

      {c.faq.length > 0 && <FAQSchema questions={c.faq.map(f => ({ q: f.q, a: f.a }))} />}

      <h1>{c.name}</h1>
      <p className="text-lg text-muted-foreground mt-2">{c.desc}</p>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="border rounded-lg p-4">
          <h2 className="font-bold text-xl">{c.a.name}</h2>
          <p className="text-sm mt-2">💰 {c.a.prix}</p>
          <p className="text-sm">Facilité : {c.a.facilite}</p>
          <p className="text-sm">Puissance : {c.a.puissance}</p>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="font-bold text-xl">{c.b.name}</h2>
          <p className="text-sm mt-2">💰 {c.b.prix}</p>
          <p className="text-sm">Facilité : {c.b.facilite}</p>
          <p className="text-sm">Puissance : {c.b.puissance}</p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="font-bold">⚡ Verdict</h2>
        <p className="mt-2">{c.verdict}</p>
      </div>

      {c.faq.length > 0 && (
        <section className="mt-8">
          <h2>FAQ</h2>
          {c.faq.map((f, i) => (
            <div key={i} className="mt-4">
              <h3 className="font-semibold">{f.q}</h3>
              <p className="text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </section>
      )}
    </main>
  )
}
