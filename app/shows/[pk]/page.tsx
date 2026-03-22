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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pk } = await params
  const show = await fetchShow(pk)
  if (!show) return {}

  const title = `The Show: ${show.name}`
  const imageUrl = buildOgImageUrl(show.poster)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  return {
    title,
    openGraph: {
      title,
      url: `${siteUrl}/shows/${pk}`,
      type: 'website',
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: `Poster of ${show.name}` }]
        : [],
    },
  }
}

export default function ShowDetailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ShowDetail />
    </Suspense>
  )
}
