# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

There is no test runner configured in this project.

## Environment

Copy `.env.local` and set:
- `NEXT_PUBLIC_API_BASE_URL` — backend URL (default: `http://localhost:8005`)
- `NEXT_PUBLIC_API_PREFIX` — API path prefix (default: `/global_festival`)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth client ID
- `FESTIVAL` / `NEXT_PUBLIC_FESTIVAL` — theme selection: `arabic` or `global`

## Architecture

**Next.js App Router** with a hybrid rendering strategy: SSG for public content (shows, articles, festivals), client-side for auth and booking flows.

### Directory Layout

- `app/` — Next.js routes and root layout. Each route imports a view component from `src/views/`.
- `src/views/` — Page-level components (one per route). Route files are thin wrappers.
- `src/components/` — Shared UI: `common/`, `detail-display/`, `layout/`, `auth/`. Barrel-exported via `index.ts`.
- `src/api/hooks.ts` — 70+ React Query hooks covering all API endpoints. This is the single source for data fetching.
- `src/api/reactQueryClient.ts` — QueryClient singleton with automatic snake_case↔camelCase conversion for all API payloads.
- `src/contexts/` — `AuthContext` (Google OAuth + JWT refresh) and `ThemeContext` (light/dark).
- `src/config/festival.ts` — Per-festival config (colors, titles, API prefix) keyed by the `FESTIVAL` env var.
- `src/i18n/` — i18next setup for Arabic (default, RTL) and English with a custom Arabic numeral post-processor.
- `src/types/index.ts` — All domain types: `FestivalEdition`, `Show`, `Article`, `MyReservation`, etc.

### Providers (app/layout.tsx → src/components/layout/Providers.tsx)

Nested order: `GoogleOAuthProvider` → `QueryClientProvider` → `AuthProvider` → `ThemeProvider` → `MainLayout`.

### Multi-Festival Theming

`tailwind.config.js` reads the `FESTIVAL` env var and loads one of two complete color palettes (`arabic` or `global`). Theme-specific values live in `src/config/festival.ts`. Changing festival requires updating the env var and rebuilding.

### Auth Flow

`AuthContext` manages Google OAuth credential exchange, JWT access/refresh tokens, and localStorage persistence (`gf_accessToken`, `gf_refreshToken`, `gf_user`). The API client is injected with the access token on mount; refresh is automatic.

### Path Alias

`@/*` maps to the project root (not `src/`). Imports use `@/src/...`, `@/app/...`, etc.
