---
name: HITA Festivals
description: Raku-fired festival site and archive. The live edition glows ember; past editions cool to soot and crackled glaze.
colors:
  ember-300: "#ff8a66"
  ember-400: "#ff6a3d"
  ember-500: "#f04e1f"
  ember-600: "#cf3c12"
  ember-700: "#a92f0e"
  clay-50: "#f2f1ee"
  clay-100: "#e7e5e1"
  clay-200: "#d1cec8"
  clay-300: "#aeaaa3"
  clay-400: "#85817a"
  clay-500: "#625e58"
  clay-600: "#45423e"
  clay-700: "#2f2d2b"
  clay-800: "#1d1c1b"
  clay-900: "#131312"
  clay-950: "#0b0b0b"
  error: "#ef4444"
typography:
  display:
    fontFamily: "Lalezar, Readex Pro, sans-serif"
    fontSize: "clamp(3rem, 9vw, 6rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Lalezar, Readex Pro, sans-serif"
    fontSize: "3rem"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Readex Pro, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: "Readex Pro, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Readex Pro, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.14em"
rounded:
  tag: "2px"
  base: "3px"
spacing:
  gutter: "16px"
  card: "24px"
  card-compact: "20px"
  section: "96px"
components:
  button-ember:
    backgroundColor: "{colors.ember-500}"
    textColor: "{colors.clay-950}"
    rounded: "{rounded.base}"
    padding: "12px 24px"
    height: "44px"
  button-ember-hover:
    backgroundColor: "{colors.ember-400}"
  button-ember-active:
    backgroundColor: "{colors.ember-600}"
  button-glaze:
    backgroundColor: "{colors.clay-900}"
    textColor: "{colors.clay-50}"
    rounded: "{rounded.base}"
    padding: "12px 24px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.clay-100}"
    rounded: "{rounded.base}"
    padding: "12px 24px"
    height: "44px"
  card:
    backgroundColor: "{colors.clay-900}"
    textColor: "{colors.clay-100}"
    rounded: "{rounded.base}"
    padding: "{spacing.card}"
  badge-live:
    backgroundColor: "{colors.ember-500}"
    textColor: "{colors.clay-950}"
    rounded: "{rounded.tag}"
    padding: "4px 10px"
  badge-soot:
    backgroundColor: "transparent"
    textColor: "{colors.clay-300}"
    rounded: "{rounded.tag}"
    padding: "4px 10px"
  input:
    backgroundColor: "{colors.clay-950}"
    textColor: "{colors.clay-50}"
    rounded: "{rounded.base}"
    padding: "12px 16px"
---

# Design System: HITA Festivals

## Overview

**Creative North Star: "Each Edition Is Fired Once"**

The site is a raku kiln. A carbon ground with fine soot grain holds crackled-glaze panels and hairline kiln frames; the only heat in the room is ember, the festival's raku flash colour, and it is spent exclusively on what is live right now. The current edition's name is brushed huge in Lalezar and arrives ember-hot, then cools into crackled glaze; past editions sit in the archive already cooled, as soot numerals and glazed tiles. Body copy is austere Readex Pro so Arabic reads comfortably beneath the loud brushed display.

Dark (carbon) is the default ground, applied before first paint; light (ash) is the alternate. Arabic RTL is the primary reading direction and every rule is written RTL-first. One codebase builds three festivals: the layout, textures and rules never change, only the clay tint and the ember hue are swapped at build time via `FESTIVAL`.

The world refuses the red-curtain-and-gold theatre site: no velvet, no gilt, no spotlights.

**Key Characteristics:**
- Carbon/ash ground with a fixed soot-grain overlay (5% light, 9% dark).
- Crackled-glaze raster surfaces (`/textures/glaze-*.webp`, procedurally authored, provenance sidecars beside each).
- Hairline 1px kiln frames; 3px corners everywhere.
- Ember is scarce and semantic: live = ember, upcoming = glaze, past = soot.
- Brushed display type (SVG `#brush` displacement filter) over clean sans body.
- Dry-brush stroke swipes under headings: ember when live, cooled clay otherwise.

## Colors

Near-neutral clay scale plus one per-festival ember scale; nothing else carries hue except form errors.

### Primary
- **Raku Ember** (ember-500; Arab fire orange shown; Global builds copper-flash turquoise `#10a684`, Alt Spaces copper-red `#ef2d5e`): live actions (book, apply), today's show tag, the running-edition status dot, the live stage marker, confirmed state, the ember swipe under the live hero title. Also the global focus outline, text selection and input caret.
- **Banked Ember** (ember-400 / ember-600): hover and pressed states of ember buttons; ember text on dark (400) and light (600) grounds.
- **Cooling Ember** (ember-700): "opening soon" status dot; ember text in light-theme outline badges.

### Neutral
- **Carbon** (clay-950): dark ground; text on ember fills.
- **Kiln Soot** (clay-900): dark cards, glaze base colour in dark, menus.
- **Smoke** (clay-800 / clay-700): dark-theme hairlines and frames.
- **Ash Grey** (clay-500 / clay-400): labels, `dt` terms, past-state text, cooled swipes, archive numerals.
- **Pale Clay** (clay-300 / clay-200): light-theme hairlines and frames.
- **Ash Ground** (clay-50 / clay-100): light ground and light glaze base; primary text on dark.

Each festival has its own clay tint (Arab warm grey, Global green-grey, Alt Spaces blue-grey) at the same lightness steps.

### Semantic
- **Error** (Tailwind red-500/600, `#ef4444` / `#dc2626`): form field errors, required asterisk, delete hover. Never decorative.

### Named Rules
**The Live Heat Rule.** Ember fills (backgrounds, glowing dots, ember swipes, fire animation) are reserved for what is live now: the current edition's live action, today's show, a confirmed booking, the running stage. Everything else is clay, glaze or soot. If two unrelated things on one screen are ember-filled, one of them is not live.

**The Warm-On-Touch Rule.** Interactive hairlines may warm to ember on hover or focus (border, underline decoration, icon tint) as a response to the hand. That is heat borrowed for an instant, not a fill; at rest they are clay.

**The Three Kilns Rule.** Never hard-code a festival hex. Use the `ember-*` / `primary-*` scales (`secondary`, `accent` are ember aliases) so all three festivals rebuild correctly.

## Typography

**Display Font:** Lalezar 400 (next/font, `--font-display`), falls back to Readex Pro
**Body Font:** Readex Pro 300–700 (next/font, `--font-sans`), falls back to system-ui

**Character:** A heavy brushed Arabic-Latin display, roughened by the `#brush` SVG displacement filter, over a calm geometric sans that keeps long Arabic reading easy. Both cover Arabic and Latin.

### Hierarchy
- **Display** (Lalezar 400, `clamp(3rem,9vw,6rem)` home; `clamp(2.5rem,7vw,5rem)` edition; `clamp(2.5rem,6vw,4.5rem)` show; line-height 1.05): page titles only, always brushed, filled with crackle texture (`fired-text`). The live edition adds the ember fire-and-cool entrance and a resting ember residue glow.
- **Headline** (Lalezar 400, 2.25rem → 3rem at md, brushed): section titles, followed by a 7rem cooled swipe.
- **Numerals** (Lalezar 400, 1.875rem–3.75rem, tabular): edition numbers, show/article counts in the kiln-status frame.
- **Title** (Readex 600, 1.25rem, leading-snug): card and list item names.
- **Body** (Readex 400, 1rem; lead paragraphs 1.125rem relaxed, max ~36rem): prose, `text-wrap: pretty`; headings use `text-wrap: balance`.
- **Label** (Readex 500, 0.75rem, 0.14em tracked uppercase in Latin; in RTL untracked, no case transform, 0.8125rem): `dt` terms, kiln-frame field names, buttons and badges.

### Named Rules
**The RTL Label Rule.** Tracking and uppercase are Latin devices. Under `dir=rtl` every label, badge and button drops letter-spacing and text-transform and steps up in size. Never track Arabic.

**The Tabular Ledger Rule.** Dates, times, counts and edition numbers use tabular lining numerals (`.tabular`).

## Layout

Centred container with a 16px side gutter (`container mx-auto px-4`), main padding 40px vertical. Home sections stack 96px apart. The first viewport is a 12-column grid at lg: brushed title, ember swipe, lead and live actions across 7 columns; a fanned poster stack and the hairline kiln-status frame across 5. Below it the festival stage strip is a 5-column ruled `ol` (1 → 2 → 5 columns) divided by hairlines, not cards. The archive is a 1 → 2 → 3 grid with 16px gaps. Show and edition heroes use a 5/7 split (poster / text). Definition lists are ruled rows (`10rem` term column at sm). Header is sticky, translucent and blurred; nav collapses below lg. All directional spacing uses logical properties (`start`, `end`, `ms`, `border-s`).

## Elevation & Depth

Flat by default; depth comes from material, not lift. The ground is soot grain, panels are glaze rasters or one step lighter clay, and separation is a hairline. Shadows appear only as heat or as floating layers.

### Shadow Vocabulary
- **Kiln** (`0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 48px -24px rgba(0,0,0,0.7)`): hover on interactive cards; resting on posters in heroes.
- **Glow Dark** (`0 18px 40px -12px rgba(0,0,0,0.65)`): floating menus, login dropdown, snackbar.
- **Ember Glow** (`0 10px 30px -10px` in ember-500 at 70%): hover on ember buttons only.
- **Live Pip** (`0 0 10–12px` ember-500): the glowing status dot on running edition and live stage.

### Named Rules
**The Heat Not Height Rule.** Nothing scales or translates on hover. Interactive state is shown by colour, frame warmth and the glow under the surface.

## Shapes

Near-square: 3px radius on buttons, cards, inputs, frames, menus and posters; 2px on tags and badges; full circles only for status pips and avatars. Frames are 1px hairlines (clay-200/300 light, clay-700/800 dark); disabled or completed actions and empty upload zones use a dashed hairline. Two organic shapes break the grid: the dry-brush stroke (`brush-stroke.svg` mask) under headings and nav, and the brushed open ring of the kiln mark around the festival abbreviation.

## Components

### Buttons
Fired, firm, uppercase in Latin.
- **Shape:** 3px corners, min-height 44px (48px for hero actions), 12px × 24px padding, 0.875rem semibold label (RTL: 1rem, untracked).
- **Ember (primary / reservation):** ember-500 fill, carbon text; hover ember-400 plus ember glow; active ember-600. Only for the live action.
- **Glaze (secondary):** glaze texture, hairline frame that warms to ember on hover.
- **Ghost:** transparent with clay-400/500 hairline; hover warms border and text to ember.
- **Waiting:** solid clay (clay-700 light / clay-200 dark), for waitlist.
- **Complete / Disabled:** transparent, dashed clay hairline, muted text, not-allowed cursor.
- **Icon buttons:** 44px square, 3px, hairline frame, lucide icon 18px at stroke 1.5.

### Chips / Badges
- **Live (`red`):** ember fill, carbon text. **Gold:** ember hairline with ember text. **Green (glaze):** glaze with hairline. **Default (soot):** clay hairline and clay text. 2px corners, label type.

### Cards / Containers
- **Corner Style:** 3px.
- **Background:** clay-50 light / clay-900 dark, or `glaze` for tiles and empty-poster fallbacks.
- **Border:** 1px clay-200 / clay-800; hover warms to ember-500 at 70% and adds the kiln shadow.
- **Internal Padding:** 24px (cards), 20px (show card body).

### Inputs / Fields
- **Style:** 3px, 1px clay-300 / clay-700 hairline, clay-50 / clay-950 fill, 12px × 16px padding, ember caret.
- **Focus:** 2px ember ring (global focus-visible is a 1.5px ember outline offset 3px).
- **Error / Disabled:** red-500 border with red message below; disabled at 60% opacity. Radios use ember accent; uploads are a dashed 2px drop zone warming to ember.

### Navigation
Sticky header on translucent ground with a bottom hairline. Brushed kiln-mark ring plus Lalezar festival name. Desktop links are 0.95rem medium clay-600 / clay-300; active is full-strength text with a cooled brush swipe beneath; hover draws the swipe in from the inline-start. Mobile menu: stacked rows, active row on glaze with an ember inline-start bar. Tabs (show and edition) follow the same swipe-under-active pattern.

### Show Card (signature)
Poster at 3:4 in a 3px hairline frame with a state tag at the inline-start top corner. **Today:** ember frame and ember tag with a carbon pip. **Upcoming:** glaze-pale tag on the poster. **Past:** soot tag; poster in grayscale with raised contrast, warming to colour on hover. Below: Readex title, a ruled `dl` of director, venue and tabular date, and an underlined "details" link with an ember decoration.

### Kiln-Status Frame (signature)
The hairline `dl` beside the home hero: a status pip (ember glowing = running or applications open, ember-700 = soon, clay = past), label-type field names, and Lalezar tabular counts.

### Loading State
A kiln frame with the festival abbreviation as a label, the message, and a 2px clay track with an ember bar sliding through (reversed in RTL).

## Do's and Don'ts

### Do:
- **Do** reserve ember fills for what is live now: current edition's live action, today's show, a confirmed booking, the running stage.
- **Do** cool everything else to clay, glaze or soot; past posters go grayscale.
- **Do** use 3px corners (2px for tags) and 1px hairline frames.
- **Do** set page titles in brushed Lalezar with the crackle fill, followed by a brush swipe (ember only if live, `swipe-cool` otherwise).
- **Do** use lucide icons at strokeWidth 1.25–1.75.
- **Do** write RTL-first with logical properties, and leave Arabic labels untracked.
- **Do** use the `ember-*` / `primary-*` scales so all three festivals rebuild.
- **Do** honour reduced motion: fire, smoke and kiln animations collapse; the live title keeps its static ember residue.

### Don't:
- **Don't** use ember for decoration, section accents, or anything past or merely upcoming.
- **Don't** scale or lift on hover; show state with colour, frame warmth and glow.
- **Don't** put eyebrows or kickers above headings.
- **Don't** use emoji as icons or logos; the kiln mark replaced them.
- **Don't** reach for red curtains, gold, or spotlight imagery.
- **Don't** round corners past 3px or add drop shadows to resting cards.
- **Don't** letter-space or uppercase Arabic.
