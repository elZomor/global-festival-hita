import type { MetadataRoute } from 'next'
import { festivalConfig } from '@/src/config/festival'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX ?? festivalConfig.apiPrefix

async function fetchIds(path: string): Promise<number[]> {
  try {
    const res = await fetch(`${apiBase}${apiPrefix}${path}?page_size=1000`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.results ?? []).map((item: { id: number }) => item.id)
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [showIds, festivalIds, articleIds] = await Promise.all([
    fetchIds('/shows'),
    fetchIds('/festivals'),
    fetchIds('/articles'),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, priority: 1 },
    { url: `${siteUrl}/festival`, priority: 0.9 },
    { url: `${siteUrl}/articles`, priority: 0.8 },
    { url: `${siteUrl}/symposia`, priority: 0.8 },
    { url: `${siteUrl}/creativity`, priority: 0.7 },
    { url: `${siteUrl}/about`, priority: 0.5 },
  ]

  const showRoutes: MetadataRoute.Sitemap = showIds.map(id => ({
    url: `${siteUrl}/shows/${id}`,
    priority: 0.9,
  }))

  const festivalRoutes: MetadataRoute.Sitemap = festivalIds.map(id => ({
    url: `${siteUrl}/festival/${id}`,
    priority: 0.8,
  }))

  const articleRoutes: MetadataRoute.Sitemap = articleIds.map(id => ({
    url: `${siteUrl}/articles/${id}`,
    priority: 0.7,
  }))

  return [...staticRoutes, ...showRoutes, ...festivalRoutes, ...articleRoutes]
}
