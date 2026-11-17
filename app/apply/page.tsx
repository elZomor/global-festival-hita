import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Apply } from '@/src/views/Apply'
import { festivalConfig } from '@/src/config/festival'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

export const metadata: Metadata = {
  title: 'التقديم للمشاركة',
  alternates: { canonical: `${siteUrl}/apply` },
}

export default function ApplyPage() {
  if (!festivalConfig.applicationsEnabled) notFound()
  return <Apply />
}
