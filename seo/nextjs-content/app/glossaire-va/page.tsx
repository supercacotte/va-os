import Link from 'next/link'
import { generateMetadata as genMeta } from '@/lib/metadata'
import { BreadcrumbSchema } from '@/components/json-ld'

export const metadata = genMeta({
  title: 'Glossaire VA - Définitions des termes de l\'assistanat virtuel',
  description: 'Tout le vocabulaire de l\'assistanat virtuel : définition de VA, TJM, workflow, automatisation, no-code, RPA, et plus.',
  path: '/glossaire-va',
})

const termes = [
  { slug: 'assistante-virtuelle', nom: 'Assistante Virtuelle (VA)', def: 'Professionnelle qui fournit des services administratifs, techniques ou créatifs à distance.' },
  { slug: 'automatisation', nom: 'Automatisation', def: 'Utilisation d\'outils pour exécuter des tâches répétitives sans intervention manuelle.' },
  { slug: 'workflow', nom: 'Workflow', def: 'Suite d\'actions automatisées qui s\'exécutent dans un ordre défini.' },
  { slug: 'no-code', nom: 'No-code', def: 'Création d\'applications et d\'automatisations sans écrire de code.' },
  { slug: 'tjm', nom: 'TJM (Taux Journalier Moyen)', def: 'Montant facturé par jour de travail. Indicateur clé pour les VA freelances.' },
  { slug: 'delegation', nom: 'Délégation', def: 'Transfert de tâches à une VA ou à un outil automatisé pour libérer du temps.' },
  { slug: 'freelance', nom: 'Freelance', def: 'Travailleur indépendant qui facture ses services à des clients sans contrat salarié.' },
  { slug: 'rpa', nom: 'RPA (Robotic Process Automation)', def: 'Automatisation de processus répétitifs via des robots logiciels.' },
  { slug: 'api', nom: 'API', def: 'Interface qui permet à deux applications de communiquer entre elles automatiquement.' },
  { slug: 'webhook', nom: 'Webhook', def: 'Mécanisme qui envoie des données en temps réel d\'une app à une autre suite à un événement.' },
]

export default function GlossairePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <BreadcrumbSchema items={[
        { name: 'Accueil', url: '/' },
        { name: 'Glossaire VA', url: '/glossaire-va' },
      ]} />

      <h1>Glossaire de l&apos;Assistanat Virtuel</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Tous les termes du métier expliqués simplement, par une vraie VA.
      </p>

      <div className="grid gap-4">
        {termes.map(terme => (
          <Link
            key={terme.slug}
            href={`/glossaire-va/${terme.slug}`}
            className="block border rounded-lg p-4 hover:border-yellow-500 transition"
          >
            <h2 className="font-semibold">{terme.nom}</h2>
            <p className="text-sm text-muted-foreground mt-1">{terme.def}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
