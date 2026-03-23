import type { Metadata } from 'next'
import { FestivalList } from '@/src/views/FestivalList'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
export const metadata: Metadata = { title: 'Festivals', alternates: { canonical: `${siteUrl}/festival` } }
export default function FestivalListPage() { return <FestivalList /> }
