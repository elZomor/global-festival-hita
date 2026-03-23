import type { Metadata } from 'next'
import { Creativity } from '@/src/views/Creativity'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
export const metadata: Metadata = { title: 'Creativity', alternates: { canonical: `${siteUrl}/creativity` } }
export default function CreativityPage() { return <Creativity /> }
