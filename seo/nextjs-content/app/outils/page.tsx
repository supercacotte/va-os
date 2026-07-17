import { generateMetadata as genMeta } from '@/lib/metadata'
import { BreadcrumbSchema } from '@/components/json-ld'
import Link from 'next/link'

// Base de données des outils
const outils = [
  { slug: 'make', name: 'Make', cat: 'automatisation', desc: 'Plateforme d\'automatisation no-code. Crée des scénarios entre 2000+ apps.' },
  { slug: 'n8n', name: 'n8n', cat: 'automatisation', desc: 'Alternative open-source à Make. Hébergement auto ou cloud.' },
  { slug: 'notion', name: 'Notion', cat: 'productivite', desc: 'Espace de travail tout-en-un : notes, base de données, wikis.' },
  { slug: 'clickup', name: 'ClickUp', cat: 'productivite', desc: 'Outil de gestion de projet et productivité pour équipes.' },
  { slug: 'calendly', name: 'Calendly', cat: 'calendrier', desc: 'Prise de rendez-vous automatisée sans aller-retour d\'emails.' },
  { slug: 'cal-dot-com', name: 'Cal.com', cat: 'calendrier', desc: 'Alternative open-source à Calendly. Self-hosted possible.' },
  { slug: 'qonto', name: 'Qonto', cat: 'finance', desc: 'Banque en ligne pour pros et freelances.' },
  { slug: 'pennylane', name: 'Pennylane', cat: 'finance', desc: 'Comptabilité et facturation connectée.' },
  { slug: 'fathom', name: 'Fathom', cat: 'productivite', desc: 'Assistant de réunions IA : transcription, résumé, actions.' },
  { slug: 'attio', name: 'Attio', cat: 'crm', desc: 'CRM moderne et flexible pour startups.' },
]

export const metadata = genMeta({
  title: 'Outils pour Assistante Virtuelle - Répertoire Complet',
  description: 'Découvre les meilleurs outils pour ton activité d\'assistante virtuelle : Make, Notion, Calendly, ClickUp, Qonto et plus. Avis et prix.',
  path: '/outils',
})

export default function OutilsPage() {
  const breadcrumbItems = [
    { name: 'Accueil', url: '/' },
    { name: 'Outils VA', url: '/outils' },
  ]

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <BreadcrumbSchema items={breadcrumbItems} />

      <h1>Les outils essentiels pour ton activité de VA</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Le bon outil peut te faire gagner 10h par semaine. Voici ceux que j&apos;utilise
        au quotidien avec mes clients.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {outils.map(outil => (
          <Link
            key={outil.slug}
            href={`/outils/${outil.slug}`}
            className="border rounded-lg p-6 hover:border-yellow-500 transition"
          >
            <h2 className="font-semibold text-lg">{outil.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{outil.desc}</p>
            <span className="inline-block mt-2 text-xs bg-gray-100 px-2 py-1 rounded">
              {outil.cat}
            </span>
          </Link>
        ))}
      </div>
    </main>
  )
}
