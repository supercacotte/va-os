import { generateMetadata as genMeta } from '@/lib/metadata'
import { BreadcrumbSchema } from '@/components/json-ld'
import { notFound } from 'next/navigation'

const outils = [
  { slug: 'make', name: 'Make', cat: 'Automatisation', desc: "Plateforme d'automatisation no-code leader.",
    prix: 'Gratuit à Pro $9/mois', avis: 'Le meilleur outil pour connecter tes apps sans coder. Idéal pour VA.',
    alternatives: ['n8n', 'Zapier'], tutos: ['/automatisation-va/workflows-ia-va'] },
  { slug: 'n8n', name: 'n8n', cat: 'Automatisation', desc: "Alternative open-source à Make.",
    prix: 'Gratuit (self-hosted) à $20/mois (cloud)', avis: 'Parfait si tu veux du contrôle et pas de limites de tâches.',
    alternatives: ['Make', 'Zapier'], tutos: [] },
  { slug: 'notion', name: 'Notion', cat: 'Productivité', desc: "Espace de travail tout-en-un.",
    prix: 'Gratuit à $10/mois (Plus)', avis: 'Le cerveau de ton activité. Wikis, bases clients, suivi de projets.',
    alternatives: ['ClickUp'], tutos: [] },
  { slug: 'clickup', name: 'ClickUp', cat: 'Productivité', desc: "Gestion de projet et productivité.",
    prix: 'Gratuit à $10/mois (Unlimited)', avis: 'Plus orienté équipe que Notion. Idéal si tu gères des projets clients.',
    alternatives: ['Notion'], tutos: [] },
  { slug: 'calendly', name: 'Calendly', cat: 'Calendrier', desc: "Prise de rendez-vous automatisée.",
    prix: 'Gratuit à $16/mois (Teams)', avis: 'Indispensable. Fini les allers-retours de mails pour caler un rendez-vous.',
    alternatives: ['Cal.com'], tutos: [] },
  { slug: 'cal-dot-com', name: 'Cal.com', cat: 'Calendrier', desc: "Alternative open-source à Calendly.",
    prix: 'Gratuit (self-hosted) à $12/mois', avis: 'Solution solide, surtout si tu veux le contrôle des données.',
    alternatives: ['Calendly'], tutos: [] },
  { slug: 'qonto', name: 'Qonto', cat: 'Finance', desc: "Banque en ligne pour pros et freelances.",
    prix: 'À partir de 9€/mois', avis: "La référence pour les freelances en France. IBAN français, carte, compta intégrée.",
    alternatives: ['Pennylane'], tutos: [] },
  { slug: 'pennylane', name: 'Pennylane', cat: 'Finance', desc: "Comptabilité et facturation connectée.",
    prix: 'À partir de 10€/mois', avis: "Idéal en complément de Qonto. Facturation, relances, compta auto.",
    alternatives: ['Qonto', 'Tiime'], tutos: [] },
  { slug: 'fathom', name: 'Fathom', cat: 'Productivité', desc: "Assistant de réunions IA.",
    prix: 'Gratuit (14j) à $19/mois', avis: 'Gagne 1h par jour de réunion. Transcription, résumé, actions auto.',
    alternatives: ['Otter.ai', 'Granola'], tutos: [] },
  { slug: 'attio', name: 'Attio', cat: 'CRM', desc: "CRM moderne et flexible.",
    prix: 'Gratuit à $29/mois (Pro)', avis: 'CRM puissant pour suivre tes prospects et clients. Plus flexible que HubSpot.',
    alternatives: ['HubSpot', 'Pipedrive'], tutos: [] },
]

export async function generateStaticParams() {
  return outils.map(o => ({ slug: o.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const outil = outils.find(o => o.slug === params.slug)
  if (!outil) return {}
  return genMeta({
    title: `${outil.name} : Avis, Prix et Alternatives 2026 | Smart Lazy Club`,
    description: `Découvre ${outil.name} — ${outil.desc} ${outil.prix}. Notre avis, cas d'usage pour VA et meilleures alternatives.`,
    path: `/outils/${outil.slug}`,
  })
}

export default function OutilPage({ params }: { params: { slug: string } }) {
  const outil = outils.find(o => o.slug === params.slug)
  if (!outil) notFound()

  const breadcrumbItems = [
    { name: 'Accueil', url: '/' },
    { name: 'Outils VA', url: '/outils' },
    { name: outil.name, url: `/outils/${outil.slug}` },
  ]

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <BreadcrumbSchema items={breadcrumbItems} />

      <span className="text-sm text-yellow-600 font-medium">{outil.cat}</span>
      <h1 className="text-3xl font-bold mt-1">{outil.name}</h1>
      <p className="text-lg text-muted-foreground mt-2">{outil.desc}</p>

      <div className="grid grid-cols-2 gap-4 mt-8 p-4 bg-gray-50 rounded-lg">
        <div>
          <span className="text-sm text-muted-foreground">💰 Prix</span>
          <p className="font-medium">{outil.prix}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">🔀 Alternatives</span>
          <p className="font-medium">{outil.alternatives.join(', ')}</p>
        </div>
      </div>

      <section className="mt-8">
        <h2>Notre avis</h2>
        <p>{outil.avis}</p>
      </section>

      <section className="mt-8">
        <h2>Pourquoi les VA utilisent {outil.name}</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Gain de temps sur les tâches répétitives</li>
          <li>Interface intuitive</li>
          <li>Intégrations avec les autres outils de ta stack</li>
        </ul>
      </section>

      <section className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold">💡 Le conseil Caro</h3>
        <p>Commence par la version gratuite pour tester. Si tu vois que ça te fait gagner du temps, passe à la formule payante — l&apos;investissement est rentabilisé en 2 semaines.</p>
      </section>
    </main>
  )
}
