# Next.js Migration Plan — Theatre Festival App
> **For Claude Code:** Execute every phase in order. Do not skip steps. Do not move to the next phase until the current one compiles and runs without errors. Ask before making any architectural decision not covered here.

---

## Context

Migrating a React 18 + Vite + TypeScript SPA to Next.js 15 (App Router).

**Source app:** Theatre festival website with show listings, booking, articles, symposia, and Google OAuth auth.  
**Goal:** SSG for public content (SEO), client-side for auth/booking flows.  
**Strategy:** App Router, hybrid rendering, keep all existing component logic intact.

---

## Pre-Flight Checklist

Before touching any code, confirm:

- [ ] You are in the root of the existing React/Vite project
- [ ] `git status` is clean (commit or stash any pending changes)
- [ ] Node.js >= 18 is installed
- [ ] Run `npm install` to ensure all deps are present

---

## Phase 1 — Initialize Next.js Project

### 1.1 Create Next.js app in a sibling directory

```bash
cd ..
npx create-next-app@latest theatre-next \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
cd theatre-next
```

### 1.2 Copy source files from the old project

```bash
# Copy all source code
cp -r ../[OLD_PROJECT_NAME]/src ./src

# Copy environment files
cp ../[OLD_PROJECT_NAME]/.env ./.env 2>/dev/null || true
cp ../[OLD_PROJECT_NAME]/.env.local ./.env.local 2>/dev/null || true
cp ../[OLD_PROJECT_NAME]/.env.example ./.env.example 2>/dev/null || true
```

> **Replace `[OLD_PROJECT_NAME]`** with the actual folder name of the original project.

### 1.3 Install all required dependencies

```bash
npm install \
  @tanstack/react-query@^5.90.10 \
  @react-oauth/google@^0.13.4 \
  framer-motion@^12.23.24 \
  i18next@^25.6.3 \
  react-i18next@^16.3.5 \
  lucide-react@^0.344.0 \
  date-fns@^4.1.0 \
  camelcase-keys@^10.0.1 \
  snakecase-keys@^9.0.2
```

```bash
# Remove packages that are replaced by Next.js
npm uninstall react-router-dom @supabase/supabase-js
```

### 1.4 Verify `package.json` does NOT contain:
- `react-router-dom`
- `@supabase/supabase-js`
- `vite`
- `@vitejs/plugin-react`

---

## Phase 2 — Configuration Files

### 2.1 Replace `tailwind.config.js` (CRITICAL — removes Vite dependency)

Delete the auto-generated `tailwind.config.ts` from create-next-app, then create `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */

// Read festival theme from plain env var (no Vite needed)
const festival = process.env.FESTIVAL ?? 'arabic';

const palettes = {
  arabic: {
    primary: {
      50: '#fdf8f0', 100: '#f9edd8', 200: '#f2d9ad', 300: '#e8be7a',
      400: '#dc9e45', 500: '#c8832a', 600: '#a86620', 700: '#87501c',
      800: '#6e401b', 900: '#5c3619', 950: '#321b0b',
    },
    secondary: {
      50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
      400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
      800: '#92400e', 900: '#78350f', 950: '#451a03',
    },
    accent: {
      50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af',
      400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c',
      800: '#9f1239', 900: '#881337', 950: '#4c0519',
    },
    theatre: {
      black: '#0a0a0a', curtain: '#1a0a0a', gold: '#d4af37',
      wood: '#8b4513', parchment: '#f4e4c1',
    },
    reservation: { 500: '#10b981', 600: '#059669' },
    waiting: { 500: '#f59e0b', 600: '#d97706' },
  },
  global: {
    primary: {
      50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
      400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
      800: '#1e293b', 900: '#0f172a', 950: '#020617',
    },
    secondary: {
      50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
      400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
      800: '#166534', 900: '#14532d', 950: '#052e16',
    },
    accent: {
      50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
      400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
      800: '#115e59', 900: '#134e4a', 950: '#042f2e',
    },
    theatre: {
      black: '#0a0a0a', curtain: '#0a1a0a', gold: '#d4af37',
      wood: '#8b4513', parchment: '#f4e4c1',
    },
    reservation: { 500: '#10b981', 600: '#059669' },
    waiting: { 500: '#f59e0b', 600: '#d97706' },
  },
};

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: palettes[festival] ?? palettes.arabic,
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-dark': '0 0 40px rgba(0,0,0,0.65)',
      },
    },
  },
  plugins: [],
};
```

### 2.2 Create `next.config.ts`

Replace the generated `next.config.ts` with:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: new URL(process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost').hostname,
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  experimental: {
    esmExternals: 'loose', // fixes camelcase-keys and snakecase-keys ESM-only packages
  },
}

export default nextConfig
```

### 2.3 Update `.env.local`

Rename all Vite-prefixed variables:

```bash
# .env.local

# API
NEXT_PUBLIC_API_BASE_URL=https://your-backend.com
NEXT_PUBLIC_API_PREFIX=/hita_arab_festival

# Auth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Festival theme (used by tailwind.config.js at build time — no NEXT_PUBLIC_ needed)
FESTIVAL=arabic

# Also expose to client components if needed
NEXT_PUBLIC_FESTIVAL=arabic
```

> **Important:** Copy all values from the original `.env` / `.env.local` files. Only the key names change.

### 2.4 Update `src/constants.ts`

Find and replace all `import.meta.env.VITE_*` references:

```ts
// Before:
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export const API_PREFIX = import.meta.env.VITE_API_PREFIX

// After:
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
export const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? ''
```

### 2.5 Update `src/config/festival.ts`

```ts
// Before:
const festival = import.meta.env.VITE_FESTIVAL

// After:
const festival = process.env.NEXT_PUBLIC_FESTIVAL ?? 'arabic'
```

### 2.6 Update `src/App.tsx` (if it references `import.meta.env`)

```ts
// Before:
import.meta.env.VITE_GOOGLE_CLIENT_ID

// After:
process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

### 2.7 Delete Vite-specific files

```bash
rm -f vite.config.ts vite-env.d.ts index.html src/vite-env.d.ts
```

---

## Phase 3 — Global Styles

### 3.1 Move global CSS

```bash
cp src/index.css app/globals.css
```

Open `app/globals.css` and verify it starts with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

The rest of the file (custom scrollbar, keyframes, @layer components/utilities) stays exactly as-is.

### 3.2 Verify `app/layout.tsx` imports globals

The auto-generated `app/layout.tsx` should already import `'./globals.css'`. Confirm this line exists.

---

## Phase 4 — Fix Core Infrastructure Files

### 4.1 Fix `src/contexts/AuthContext.tsx`

Add `'use client'` as the very first line:

```tsx
'use client'
// ... rest of file unchanged
```

### 4.2 Fix `src/contexts/ThemeContext.tsx`

Add `'use client'` as the very first line:

```tsx
'use client'
// ... rest of file unchanged
```

### 4.3 Fix `src/api/reactQueryClient.ts`

The `QueryClient` must NOT be created at module level (causes shared state across server requests). Also, token reads from `localStorage` must be guarded.

Find any line that does `const queryClient = new QueryClient(...)` at module scope and replace the export pattern with:

```ts
import { QueryClient } from '@tanstack/react-query'

let browserClient: QueryClient | null = null

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: new instance per request, never cached
    return makeQueryClient()
  }
  // Browser: singleton
  if (!browserClient) browserClient = makeQueryClient()
  return browserClient
}

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  })
}
```

Find any module-level `localStorage.getItem(...)` for tokens and wrap them:

```ts
// Before (module level — crashes on server):
const token = localStorage.getItem('gf_accessToken')

// After (safe):
const token = typeof window !== 'undefined'
  ? localStorage.getItem('gf_accessToken')
  : null
```

### 4.4 Fix `src/i18n/index.ts`

Wrap the entire initialization block in a browser guard:

```ts
// At the very top of the file, before i18next.init():
if (typeof window !== 'undefined') {
  // existing i18next initialization code goes here
  // (move all of it inside this block)
}
```

---

## Phase 5 — Create Client Provider Wrappers

### 5.1 Create `src/components/layout/Providers.tsx`

```tsx
'use client'

import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from '@/src/contexts/AuthContext'
import { ThemeProvider } from '@/src/contexts/ThemeContext'
import { getQueryClient } from '@/src/api/reactQueryClient'
import { MainLayout } from './MainLayout'

export function Providers({ children }: { children: React.ReactNode }) {
  // useState ensures QueryClient is not recreated on every render
  const [queryClient] = useState(() => getQueryClient())

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}
```

### 5.2 Create `src/components/layout/I18nInitializer.tsx`

```tsx
'use client'

import { useEffect } from 'react'
import '@/src/i18n'

export function I18nInitializer() {
  useEffect(() => {
    const lang = localStorage.getItem('language') || 'ar'
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [])

  return null
}
```

---

## Phase 6 — Create `app/layout.tsx`

Replace the entire auto-generated `app/layout.tsx` with:

```tsx
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
    default: 'Theatre Festival',
    template: '%s | Theatre Festival',
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
```

> `suppressHydrationWarning` on `<html>` is required because ThemeContext adds/removes the `dark` class client-side. Without it, React will warn about hydration mismatch.

---

## Phase 7 — Rename `src/pages/` to Avoid Conflict

```bash
mv src/pages src/views
```

Then update the barrel export if it exists:
```bash
# Update any import that references src/pages
# In your editor, do a global find-replace:
# from: from '@/src/pages/
# to:   from '@/src/views/
```

Also update `src/views/index.ts` if it exists — the file itself doesn't need to change, only its import path from other files.

---

## Phase 8 — Replace React Router Throughout the Codebase

### 8.1 Global find-replace (run these in your editor across all files in `src/`)

| Find | Replace |
|------|---------|
| `from 'react-router-dom'` | *(see per-import rules below)* |
| `import { Link } from 'react-router-dom'` | `import Link from 'next/link'` |
| `import { NavLink } from 'react-router-dom'` | `import Link from 'next/link'` |
| `import { useNavigate } from 'react-router-dom'` | `import { useRouter } from 'next/navigation'` |
| `import { useParams } from 'react-router-dom'` | `import { useParams } from 'next/navigation'` |
| `import { useLocation } from 'react-router-dom'` | `import { usePathname, useSearchParams } from 'next/navigation'` |
| `to="` | `href="` (on Link components only) |
| `navigate('` | `router.push('` |
| `navigate(-1)` | `router.back()` |

### 8.2 Pattern replacements

**useNavigate:**
```tsx
// Before:
const navigate = useNavigate()
navigate('/festival')

// After:
const router = useRouter()
router.push('/festival')
```

**useParams:**
```tsx
// Before:
const { festivalSlug } = useParams<{ festivalSlug: string }>()

// After:
const params = useParams()
const festivalSlug = params.festivalSlug as string
```

**Link:**
```tsx
// Before:
<Link to="/festival">Festivals</Link>

// After:
<Link href="/festival">Festivals</Link>
```

**NavLink (active state):**
```tsx
// Before:
<NavLink to="/festival" className={({ isActive }) => isActive ? 'active' : ''}>

// After (use usePathname):
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const pathname = usePathname()
<Link href="/festival" className={pathname === '/festival' ? 'active' : ''}>
```

### 8.3 Remove all remaining react-router-dom imports

After the replacements, search for any remaining `react-router-dom` imports:
```bash
grep -r "react-router-dom" src/
```
Fix any that still appear.

---

## Phase 9 — Add `'use client'` to Client Components

### 9.1 Components that MUST be client components

Add `'use client'` as the first line to each of these files:

**Auth & Google:**
- `src/components/auth/GoogleLoginButton.tsx`

**Contexts (already done in Phase 4, verify):**
- `src/contexts/AuthContext.tsx`
- `src/contexts/ThemeContext.tsx`

**Features with user interaction:**
- `src/features/reservations/ReservationModal.tsx`
- `src/features/reservations/ReservationSuccessModal.tsx`
- `src/features/reservations/SeatMapPicker.tsx`

**Pages with auth state / user interaction:**
- `src/views/MyTickets.tsx`
- `src/views/ShowDetail.tsx` *(has booking flow inside)*

**Layout (uses ThemeContext, auth state):**
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/MainLayout.tsx`

### 9.2 Find all Framer Motion components

```bash
grep -rl "framer-motion" src/
```

Add `'use client'` to every file found.

### 9.3 Find all components using hooks that need client

```bash
grep -rl "useState\|useEffect\|useContext\|useRef\|useCallback\|useMemo" src/components/ src/views/
```

Add `'use client'` to each file found (these cannot run on the server).

---

## Phase 10 — Create the `app/` Route Structure

Create the following directory and file structure. For each file, the pattern is described below.

### Directory structure to create:

```
app/
├── layout.tsx              ← already done in Phase 6
├── page.tsx                ← Home
├── globals.css             ← already done in Phase 3
├── festival/
│   ├── page.tsx
│   └── [festivalSlug]/
│       └── page.tsx
├── shows/
│   └── [pk]/
│       └── page.tsx
├── articles/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
├── symposia/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
├── creativity/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
├── about/
│   └── page.tsx
├── coming-soon/
│   └── page.tsx
└── my-tickets/
    └── page.tsx
```

### 10.1 `app/page.tsx` (Home — SSR)

```tsx
import { Home } from '@/src/views/Home'

export const revalidate = 3600 // revalidate every hour

export default function HomePage() {
  return <Home />
}
```

### 10.2 `app/festival/page.tsx` (Festival List — SSR)

```tsx
import { FestivalList } from '@/src/views/FestivalList'

export const metadata = { title: 'Festivals' }
export const revalidate = 3600

export default function FestivalListPage() {
  return <FestivalList />
}
```

### 10.3 `app/festival/[festivalSlug]/page.tsx` (Festival Detail — SSG)

```tsx
import { FestivalEdition } from '@/src/views/FestivalEdition'

interface Props {
  params: { festivalSlug: string }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_PREFIX}/festivals?page_size=200`,
      { next: { revalidate: 3600 } }
    )
    const data = await res.json()
    return (data.results ?? []).map((f: { slug?: string; id: string | number }) => ({
      festivalSlug: f.slug ?? String(f.id),
    }))
  } catch {
    return []
  }
}

export default function FestivalEditionPage({ params }: Props) {
  return <FestivalEdition festivalSlug={params.festivalSlug} />
}
```

### 10.4 `app/shows/[pk]/page.tsx` (Show Detail — SSG)

```tsx
import { ShowDetail } from '@/src/views/ShowDetail'

interface Props {
  params: { pk: string }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_PREFIX}/shows?page_size=200`,
      { next: { revalidate: 3600 } }
    )
    const data = await res.json()
    return (data.results ?? []).map((s: { id: number }) => ({
      pk: String(s.id),
    }))
  } catch {
    return []
  }
}

export default function ShowDetailPage({ params }: Props) {
  return <ShowDetail pk={params.pk} />
}
```

### 10.5 `app/articles/page.tsx`

```tsx
import { Articles } from '@/src/views/Articles'

export const metadata = { title: 'Articles' }
export const revalidate = 3600

export default function ArticlesPage() {
  return <Articles />
}
```

### 10.6 `app/articles/[slug]/page.tsx`

```tsx
import { ArticleDetail } from '@/src/views/ArticleDetail'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_PREFIX}/articles?type=ARTICLE&page_size=200`
    )
    const data = await res.json()
    return (data.results ?? []).map((a: { slug: string }) => ({ slug: a.slug }))
  } catch {
    return []
  }
}

export default function ArticleDetailPage({ params }: Props) {
  return <ArticleDetail slug={params.slug} />
}
```

### 10.7 `app/symposia/page.tsx`

```tsx
import { Symposia } from '@/src/views/Symposia'

export const metadata = { title: 'Symposia' }
export const revalidate = 3600

export default function SymposiaPage() {
  return <Symposia />
}
```

### 10.8 `app/symposia/[slug]/page.tsx`

```tsx
import { SymposiumDetail } from '@/src/views/SymposiumDetail'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_PREFIX}/articles?type=SYMPOSIA&page_size=200`
    )
    const data = await res.json()
    return (data.results ?? []).map((a: { slug: string }) => ({ slug: a.slug }))
  } catch {
    return []
  }
}

export default function SymposiumDetailPage({ params }: Props) {
  return <SymposiumDetail slug={params.slug} />
}
```

### 10.9 `app/creativity/page.tsx`

```tsx
import { Creativity } from '@/src/views/Creativity'

export const metadata = { title: 'Creativity' }
export const revalidate = 3600

export default function CreativityPage() {
  return <Creativity />
}
```

### 10.10 `app/creativity/[slug]/page.tsx`

```tsx
import { CreativityDetail } from '@/src/views/CreativityDetail'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_PREFIX}/articles?type=CREATIVITY&page_size=200`
    )
    const data = await res.json()
    return (data.results ?? []).map((a: { slug: string }) => ({ slug: a.slug }))
  } catch {
    return []
  }
}

export default function CreativityDetailPage({ params }: Props) {
  return <CreativityDetail slug={params.slug} />
}
```

### 10.11 `app/about/page.tsx`

```tsx
import { About } from '@/src/views/About'

export const metadata = { title: 'About' }

export default function AboutPage() {
  return <About />
}
```

### 10.12 `app/coming-soon/page.tsx`

```tsx
import { ComingSoon } from '@/src/views/ComingSoon'

export default function ComingSoonPage() {
  return <ComingSoon />
}
```

### 10.13 `app/my-tickets/page.tsx`

```tsx
import { MyTickets } from '@/src/views/MyTickets'

export const metadata = { title: 'My Tickets' }

export default function MyTicketsPage() {
  return <MyTickets />
}
```

---

## Phase 11 — Fix Page Component Props

Each page component in `src/views/` currently reads route params via `useParams()` from React Router. After the migration, these pages are rendered from `app/**/page.tsx` files which can pass params as props — but since the view components are client components, they should use `useParams()` from `next/navigation` instead.

### 11.1 Update `src/views/FestivalEdition.tsx`

```tsx
// Before:
import { useParams } from 'react-router-dom'
const { festivalSlug } = useParams<{ festivalSlug: string }>()

// After:
import { useParams } from 'next/navigation'
const params = useParams()
const festivalSlug = params.festivalSlug as string
```

### 11.2 Update `src/views/ShowDetail.tsx`

```tsx
// Before:
import { useParams } from 'react-router-dom'
const { pk } = useParams<{ pk: string }>()

// After:
import { useParams } from 'next/navigation'
const params = useParams()
const pk = params.pk as string
```

### 11.3 Update all other detail pages (ArticleDetail, SymposiumDetail, CreativityDetail)

Apply the same `useParams` swap in each file.

---

## Phase 12 — Fix `tsconfig.json`

Replace `tsconfig.json` with the Next.js-compatible version (create-next-app should have generated this already). Verify it contains:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Phase 13 — First Build Check

```bash
npm run build
```

### Expected errors and how to fix them:

**`'use client'` boundary errors** — A server component is importing a client component without the directive.
- Fix: Add `'use client'` to the file that uses browser APIs or React hooks.

**`localStorage is not defined`** — A file runs browser code on the server.
- Fix: Wrap in `typeof window !== 'undefined'` check or move inside `useEffect`.

**`import.meta.env` errors** — Remaining Vite env var references.
- Fix: Replace with `process.env.NEXT_PUBLIC_*`.

**Module not found for `react-router-dom`** — Remaining import.
- Fix: Run `grep -r "react-router-dom" src/` and fix each one.

**ESM package errors (camelcase-keys, snakecase-keys)** — If you see `require() of ES Module` errors.
- Fix: Ensure `experimental.esmExternals: 'loose'` is in `next.config.ts`.

---

## Phase 14 — Development Smoke Test

```bash
npm run dev
```

Verify each route works:

- [ ] `/` — Home page loads
- [ ] `/festival` — Festival list loads
- [ ] `/festival/[any-slug]` — Festival detail loads
- [ ] `/shows/[any-id]` — Show detail loads (with booking button)
- [ ] `/articles` — Articles list loads
- [ ] `/articles/[any-slug]` — Article detail loads
- [ ] `/symposia` — Symposia list loads
- [ ] `/creativity` — Creativity list loads
- [ ] `/about` — About page loads
- [ ] `/my-tickets` — Shows login prompt when not authenticated
- [ ] Google login flow — Completes and stores tokens
- [ ] Dark mode toggle — Applies/removes `dark` class on `<html>`
- [ ] Language toggle — Switches `dir` and `lang` on `<html>`
- [ ] Booking flow — Opens seat map modal, completes reservation

---

## Phase 15 — Cleanup

```bash
# Remove Vite-specific dev dependencies
npm uninstall vite @vitejs/plugin-react

# Remove the old project reference if migrated in-place
# (skip if you kept them in separate directories)
```

Remove from `package.json` devDependencies:
- `vite`
- `@vitejs/plugin-react`

---

## File Reference — What Happens to Each Source File

| Original path | Action |
|---|---|
| `src/main.tsx` | **Delete** — replaced by `app/layout.tsx` |
| `src/App.tsx` | **Delete** — routing replaced by `app/` structure, providers moved to `Providers.tsx` |
| `src/index.css` | **Move** to `app/globals.css` |
| `src/pages/*` | **Rename** directory to `src/views/` |
| `src/contexts/AuthContext.tsx` | **Add** `'use client'` at top |
| `src/contexts/ThemeContext.tsx` | **Add** `'use client'` at top |
| `src/api/reactQueryClient.ts` | **Refactor** QueryClient instantiation + token reads |
| `src/i18n/index.ts` | **Wrap** in `typeof window !== 'undefined'` guard |
| `src/constants.ts` | **Replace** `import.meta.env.VITE_*` with `process.env.NEXT_PUBLIC_*` |
| `src/config/festival.ts` | **Replace** `import.meta.env.VITE_FESTIVAL` |
| `src/components/layout/Header.tsx` | **Add** `'use client'` |
| `src/components/layout/Footer.tsx` | **Add** `'use client'` |
| `src/components/layout/MainLayout.tsx` | **Add** `'use client'` |
| `src/components/auth/GoogleLoginButton.tsx` | **Add** `'use client'` |
| `src/features/reservations/*` | **Add** `'use client'` to all three files |
| All files using `framer-motion` | **Add** `'use client'` |
| All files using `useState`/`useEffect` | **Add** `'use client'` |
| All other `src/components/`, `src/utils/`, `src/types/` | **No changes needed** |
| `vite.config.ts` | **Delete** |
| `vite-env.d.ts` | **Delete** |
| `index.html` | **Delete** |
| `tailwind.config.js` | **Full replacement** (Phase 2.1) |
| `tsconfig.json` | **Replace** with Next.js version |
| `.env` | **Rename** all `VITE_*` keys |

---

## Summary of Breaking Changes

| Change | Why |
|---|---|
| `react-router-dom` removed | Replaced by Next.js file-based routing |
| `import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*` | Vite env system replaced by Next.js |
| `loadEnv` from Vite removed from `tailwind.config.js` | Vite not present in Next.js build |
| `localStorage` reads guarded | Server-side rendering has no `window` |
| `QueryClient` not created at module level | Prevents shared state across SSR requests |
| `'use client'` directives added | Next.js default is server components |
| Google Fonts `<link>` removed from HTML | Replaced by `next/font/google` in layout |
| `src/pages/` renamed to `src/views/` | Avoids conflict with Next.js Pages Router detection |

---

*End of migration plan. Execute phases sequentially. Run `npm run build` after Phase 13 and resolve all errors before proceeding to Phase 14.*
