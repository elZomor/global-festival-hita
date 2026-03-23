import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ShowDetail } from '@/src/views/ShowDetail'
import { LoadingState } from '@/src/components/common'
import { festivalConfig } from '@/src/config/festival'

type Props = { params: Promise<{ pk: string }> }

async function fetchShow(pk: string) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
  try {
    const res = await fetch(`${apiBase}${festivalConfig.apiPrefix}/shows/${pk}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function buildOgImageUrl(poster?: string | null): string | undefined {
  if (!poster) return undefined
  if (/^https?:\/\//i.test(poster)) return poster
  return `https://media.play-cast.com/${poster}?w=1200&h=630&fit=pad&bg=ffffff&q=75&fmt=jpg`
}

function buildDescription(show: Record<string, string>): string {
  const parts = [show.name]
  if (show.director) parts.push(`إخراج ${show.director}`)
  if (show.festival_name) parts.push(show.festival_name)
  return parts.join(' — ')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pk } = await params
  const show = await fetchShow(pk)
  if (!show) return {}

  const title = `The Show: ${show.name}`
  const description = buildDescription(show)
  const imageUrl = buildOgImageUrl(show.poster)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/shows/${pk}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/shows/${pk}`,
      type: 'article',
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: `Poster of ${show.name}` }]
        : [],
    },
  }
}

export default async function ShowDetailPage({ params }: Props) {
  const { pk } = await params
  const show = await fetchShow(pk)

  const jsonLd = show
    ? {
        '@context': 'https://schema.org',
        '@type': 'TheaterEvent',
        name: show.name,
        director: show.director ? { '@type': 'Person', name: show.director } : undefined,
        performer: Array.isArray(show.cast)
          ? show.cast.map((c: { text: string }) => ({ '@type': 'Person', name: c.text }))
          : undefined,
        location:
          show.venue_name
            ? {
                '@type': 'Place',
                name: show.venue_name,
                address: show.venue_location ?? undefined,
              }
            : undefined,
        startDate: show.date ?? undefined,
        image: buildOgImageUrl(show.poster) ?? undefined,
        organizer: show.festival_name
          ? { '@type': 'Organization', name: show.festival_name }
          : undefined,
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
      <Suspense fallback={<LoadingState />}>
        <ShowDetail />
      </Suspense>
    </>
  )
}
