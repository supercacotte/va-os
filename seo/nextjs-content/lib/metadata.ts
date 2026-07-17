import type { Metadata } from 'next'

export const siteConfig = {
  name: 'Smart Lazy Club',
  description:
    'Bibliothèque de templates Make & n8n pour freelances et assistantes virtuelles. Automatise ton quotidien avec des workflows prêts à l\'emploi.',
  url: 'https://www.smartlazyclub.com',
  ogImage: 'https://www.smartlazyclub.com/og-image.jpg',
  author: 'Caroline Franquet',
  locale: 'fr_FR',
}

export function generateMetadata({
  title,
  description,
  path,
  ogImage,
}: {
  title: string
  description: string
  path: string
  ogImage?: string
}): Metadata {
  const url = `${siteConfig.url}${path}`

  return {
    title: `${title} | Smart Lazy Club`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | Smart Lazy Club`,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: 'website',
      images: [
        {
          url: ogImage || siteConfig.ogImage,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Smart Lazy Club`,
      description,
      images: [ogImage || siteConfig.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}
