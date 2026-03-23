import type { Metadata } from 'next'
import { Articles } from '@/src/views/Articles'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
export const metadata: Metadata = { title: 'Articles', alternates: { canonical: `${siteUrl}/articles` } }
export default function ArticlesPage() { return <Articles /> }
