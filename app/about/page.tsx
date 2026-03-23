import type { Metadata } from 'next'
import { About } from '@/src/views/About'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
export const metadata: Metadata = { title: 'About', alternates: { canonical: `${siteUrl}/about` } }
export default function AboutPage() { return <About /> }
