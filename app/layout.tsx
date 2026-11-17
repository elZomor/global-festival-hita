import type { Metadata } from 'next'
import { Lalezar, Readex_Pro } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import './globals.css'
import { Providers } from '@/src/components/layout/Providers'
import { festivalConfig } from '@/src/config/festival'

const display = Lalezar({
  weight: '400',
  subsets: ['arabic', 'latin'],
  variable: '--font-display',
  display: 'swap',
})

const sans = Readex_Pro({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['arabic', 'latin'],
  variable: '--font-sans',
  display: 'swap',
})

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

// Applies the stored theme before first paint (dark is the default) so the
// page never flashes the wrong ground.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'){document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})();`

const DIRECTION_CONTRACT = `<!--
THESIS: Each edition is fired once — the live edition still glows ember, past editions cool to soot and crackled glaze. Refuses the red-curtain-and-gold theatre site.
OWN-WORLD: Carbon ground with soot grain; crackled-glaze panels; hairline kiln frames; ember (per-festival raku flash) reserved for what is live now; brushed Lalezar display over austere Readex Pro.
STORY: Visitors see the current edition and what is live (book, apply) at once, then walk the archive as cooled editions.
FIRST VIEWPORT: Edition name brushed huge, cooling from ember to glaze; a hairline kiln-status frame with the edition's state and dates; live actions in ember; the festival stage strip below.
FORM: Raku firing (bold re-roll leader); seed 55ba21af.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`

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
      className={`${display.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute">
          <filter id="brush" x="-5%" y="-10%" width="110%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035 0.6" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
