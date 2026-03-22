import type { Metadata } from 'next'
import { Playfair_Display, Roboto, Noto_Naskh_Arabic } from 'next/font/google'
import './globals.css'
import { Providers } from '@/src/components/layout/Providers'
import { I18nInitializer } from '@/src/components/layout/I18nInitializer'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-display',
  display: 'swap',
})

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Global Theatre Festival',
    template: '%s | Global Theatre Festival',
  },
  description: 'Theatre shows, articles, and booking.',
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
      className={`${playfairDisplay.variable} ${roboto.variable} ${notoNaskhArabic.variable}`}
    >
      <body>
        <I18nInitializer />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
