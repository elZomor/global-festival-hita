# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Primary: festival audience and HITA students.** People following the current festival edition who want to see what is on, read about a show, book a free seat, and (students) apply to take part with their own show. Mostly on phones, Arabic-first.
- **Secondary: researchers, critics and theatre followers** using the site as an archive of past editions, shows, critical articles, symposia and student creativity.

## Product Purpose
A combined live-festival site and documentary archive for the student theatre festivals of the Higher Institute of Theatrical Arts (HITA, Academy of Arts, Egypt). It lets visitors browse festival editions and their shows, read criticism and symposia attached to them, reserve seats for shows, track their tickets, and apply to participate in an upcoming edition. Success: visitors find the current edition and act (book / apply) quickly, and past editions stay readable as a reference.

## Positioning
The only place where each HITA festival edition is kept whole — its shows, cast and crew, critical articles, symposia, student creativity and publications — alongside the live tools (reservations, applications) for the current edition.

## Operating Context
- One codebase builds three separate festival sites, chosen at build time by `NEXT_PUBLIC_FESTIVAL` / `FESTIVAL` (`src/config/festival.ts`, `tailwind.config.js`):
  - `arabic` — المهرجان العربي / Arab Festival (ARF), ar-festival.hita.play-cast.com
  - `global` — Global Theatre Festival (GTF), gl-festival.hita.play-cast.com
  - `alt_spaces` — Alternative Spaces festival (ASV)
- Each site has its own palette; layout, components and features are shared.
- Content (editions, shows, posters, articles, publications) comes from the tickets-be Django API; images are served from the media CDN.
- Sign-in is Google only; reservations and "my tickets" need sign-in, applications do not.

## Capabilities and Constraints
- Routes: home, about, festival editions list and detail (info, shows, articles, symposia, creativity, publications tabs), show detail (info, articles, comments, reservation with seat map), articles, symposia, creativity, my tickets, apply, coming soon.
- Arabic is the default locale (RTL); English is supported. Dark and light themes.
- Applications: Arabic-only text fields, enabled per festival (`applicationsEnabled`), open/closed and "already applied" states from the API.
- Next.js App Router (15.5) deployed to Cloudflare Workers via OpenNext; Tailwind 3; next-intl; React Query.
- No logos, photos or illustrations exist in the repo (`public/` has only starter SVGs); the current "logo" is an emoji per festival.

## Brand Commitments
- Festival names, Arabic and English titles, taglines and about texts in `src/config/festival.ts` are fixed copy.
- Each festival keeps a distinct palette.
- Arabic-first: Arabic typography and RTL layout must be first-class, not a mirrored afterthought.

## Evidence on Hand
- Real content via API: edition data, show posters, cast/crew, articles, symposia, creativity submissions, publications, comments.
- No testimonials, audience numbers, press quotes or partner logos exist — none may be invented.

## Product Principles
1. The current edition and its actions (book, apply) come first; the archive is always one step away.
2. Arabic reading comfort is the baseline for every surface.
3. Each edition's record is presented whole and faithfully — the shows and the writing about them are the content.
4. One system, three festivals: identity changes by palette and name, never by broken layout.

## Accessibility & Inclusion
- Mobile-first audience; touch targets and readable Arabic sizes on small screens.
- Must work in both RTL and LTR, light and dark, with sufficient contrast in all three palettes.
