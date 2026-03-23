import type { Metadata } from 'next'
import { FestivalEdition } from '@/src/views/FestivalEdition'
import { festivalConfig } from '@/src/config/festival'

type Props = { params: Promise<{ festivalSlug: string }> }

async function fetchFestival(festivalSlug: string) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
  try {
    const res = await fetch(`${apiBase}${festivalConfig.apiPrefix}/festivals/${festivalSlug}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function buildOgImageUrl(logo?: string | null): string | undefined {
  if (!logo) return undefined
  if (/^https?:\/\//i.test(logo)) return logo
  return `https://media.play-cast.com/${logo}?w=1200&h=630&fit=pad&bg=ffffff&q=75&fmt=jpg`
}

function buildDescription(festival: Record<string, string>): string {
  if (festival.description) return festival.description
  const parts = [festival.name]
  if (festival.start_date) parts.push(festival.start_date.slice(0, 4))
  return parts.join(' — ')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { festivalSlug } = await params
  const festival = await fetchFestival(festivalSlug)
  if (!festival) return {}

  const title = festival.name
  const description = buildDescription(festival)
  const imageUrl = buildOgImageUrl(festival.logo)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/festival/${festivalSlug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/festival/${festivalSlug}`,
      type: 'website',
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: title }]
        : [],
    },
  }
}

export default async function FestivalEditionPage({ params }: Props) {
  const { festivalSlug } = await params
  const festival = await fetchFestival(festivalSlug)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  const jsonLd = festival
    ? {
        '@context': 'https://schema.org',
        '@type': 'Festival',
        name: festival.name,
        description: festival.description ?? undefined,
        startDate: festival.start_date ?? undefined,
        endDate: festival.end_date ?? undefined,
        image: buildOgImageUrl(festival.logo) ?? undefined,
        url: `${siteUrl}/festival/${festivalSlug}`,
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'Place',
          name: 'المعهد العالي للفنون المسرحية',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'القاهرة',
            addressCountry: 'EG',
          },
        },
        organizer: {
          '@type': 'Organization',
          name: festival.organizer ?? 'أكاديمية الفنون - المعهد العالي للفنون المسرحية',
          url: 'https://hita.play-cast.com',
        },
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <FestivalEdition />
    </>
  )
}
