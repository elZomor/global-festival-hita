import type { Metadata } from 'next'
import { Symposia } from '@/src/views/Symposia'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
export const metadata: Metadata = { title: 'Symposia', alternates: { canonical: `${siteUrl}/symposia` } }
export default function SymposiaPage() { return <Symposia /> }
