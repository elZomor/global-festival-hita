import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/src/components/layout/Providers'
import { I18nInitializer } from '@/src/components/layout/I18nInitializer'
import { festivalConfig } from '@/src/config/festival'

const festivalTitle = festivalConfig.titleEn

export const metadata: Metadata = {
  title: {
    default: festivalTitle,
    template: `%s | ${festivalTitle}`,
  },
  description: 'Theatre shows, articles, and booking.',
  verification: {
    google: '488-BdVYHrBiOC_pfLNjFvzE0NO5deErJngnvuXh578',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
    >
      <body>
        <I18nInitializer />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
