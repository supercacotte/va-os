import { MetadataRoute } from 'next'

const BASE_URL = 'https://www.smartlazyclub.com'

// Données pour les pages programmatiques
const outils = [
  { slug: 'make', name: 'Make', updated: '2026-07-17' },
  { slug: 'n8n', name: 'n8n', updated: '2026-07-17' },
  { slug: 'notion', name: 'Notion', updated: '2026-07-17' },
  { slug: 'clickup', name: 'ClickUp', updated: '2026-07-17' },
  { slug: 'calendly', name: 'Calendly', updated: '2026-07-17' },
  { slug: 'cal-dot-com', name: 'Cal.com', updated: '2026-07-17' },
  { slug: 'qonto', name: 'Qonto', updated: '2026-07-17' },
  { slug: 'pennylane', name: 'Pennylane', updated: '2026-07-17' },
  { slug: 'fathom', name: 'Fathom', updated: '2026-07-17' },
  { slug: 'attio', name: 'Attio', updated: '2026-07-17' },
]

const glossaire = [
  'assistante-virtuelle',
  'automatisation',
  'workflow',
  'no-code',
  'tjm',
  'delegation',
  'freelance',
  'rpa',
  'api',
  'webhook',
]

const comparatifs = [
  'make-vs-n8n',
  'make-vs-zapier',
  'clickup-vs-notion',
  'calendly-vs-cal-dot-com',
  'qonto-vs-pennylane',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE_URL, lastModified: '2026-07-17', changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${BASE_URL}/templates`, lastModified: '2026-07-17', changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${BASE_URL}/devenir-assistante-virtuelle`, lastModified: '2026-07-17', changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE_URL}/automatisation-va`, lastModified: '2026-07-17', changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${BASE_URL}/guide-connecter-apps-make`, lastModified: '2026-07-17', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: '2026-07-17', changeFrequency: 'weekly' as const, priority: 0.7 },
  ]

  const outilsPages = outils.map(tool => ({
    url: `${BASE_URL}/outils/${tool.slug}`,
    lastModified: tool.updated,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const glossairePages = glossaire.map(terme => ({
    url: `${BASE_URL}/glossaire-va/${terme}`,
    lastModified: '2026-07-17',
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  const comparatifPages = comparatifs.map(comp => ({
    url: `${BASE_URL}/comparer/${comp}`,
    lastModified: '2026-07-17',
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    ...staticPages,
    ...outilsPages,
    ...glossairePages,
    ...comparatifPages,
  ]
}
