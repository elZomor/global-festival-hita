import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DynamicForm } from '@/src/views/DynamicForm'
import { festivalConfig } from '@/src/config/festival'

type Props = {
  params: Promise<{ slug: string }>
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

/** Server-side schema fetch for metadata and the 404; the view refetches with the user's session. */
async function fetchForm(slug: string): Promise<{ title: string; description: string } | null | undefined> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
  try {
    const res = await fetch(`${apiBase}${festivalConfig.apiPrefix}/forms/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    })
    if (res.status === 404) return null
    if (!res.ok) return undefined
    const body = await res.json()
    return body.data
  } catch {
    // Backend unreachable: let the client view show its own error state.
    return undefined
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const form = await fetchForm(slug)
  if (!form) return {}
  return {
    title: form.title,
    description: form.description || undefined,
    alternates: { canonical: `${siteUrl}/forms/${slug}` },
    openGraph: { title: form.title, description: form.description || undefined, url: `${siteUrl}/forms/${slug}` },
  }
}

export default async function FormPage({ params }: Props) {
  const { slug } = await params
  if ((await fetchForm(slug)) === null) notFound()
  return <DynamicForm slug={slug} />
}
