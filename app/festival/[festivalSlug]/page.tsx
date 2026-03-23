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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { festivalSlug } = await params
  const festival = await fetchFestival(festivalSlug)
  if (!festival) return {}

  const title = festival.name
  const imageUrl = buildOgImageUrl(festival.logo)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  return {
    title,
    alternates: { canonical: `${siteUrl}/festival/${festivalSlug}` },
    openGraph: {
      title,
      url: `${siteUrl}/festival/${festivalSlug}`,
      type: 'website',
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: title }]
        : [],
    },
  }
}

export default function FestivalEditionPage() { return <FestivalEdition /> }
