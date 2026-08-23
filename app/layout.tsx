import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import './globals.css'
import { Providers } from '@/src/components/layout/Providers'
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
