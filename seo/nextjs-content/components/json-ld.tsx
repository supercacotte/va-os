// Composant JSON-LD structuré — Smart Lazy Club
// À intégrer dans app/layout.tsx

const siteUrl = 'https://www.smartlazyclub.com'

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Smart Lazy Club',
    url: siteUrl,
    description:
      'Bibliothèque de templates Make & n8n pour freelances et assistantes virtuelles.',
    founder: {
      '@type': 'Person',
      name: 'Caroline Franquet',
      jobTitle: 'Assistante Virtuelle & Fondatrice',
      url: 'https://www.linkedin.com/in/carolinefranquet',
    },
    sameAs: ['https://www.linkedin.com/in/carolinefranquet'],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function ArticleSchema({
  title,
  description,
  datePublished,
  dateModified,
  authorName = 'Caroline Franquet',
}: {
  title: string
  description: string
  datePublished: string
  dateModified?: string
  authorName?: string
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Smart Lazy Club',
    },
    datePublished,
    dateModified: dateModified || datePublished,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQSchema({ questions }: { questions: { q: string; a: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function HowToSchema({
  name,
  description,
  steps,
}: {
  name: string
  description: string
  steps: { text: string; url?: string }[]
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: step.text,
      ...(step.url ? { url: `${siteUrl}${step.url}` } : {}),
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
