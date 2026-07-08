# Runnit — Claude Code Instructions

**Read this before writing or editing any UI in this repo.** The Good Record brand spec below is the single source of truth for how Runnit looks, feels, and talks. Every new screen, component, and copy string must follow it.

---

## Git Workflow (Critical)

**ALWAYS commit before pulling.** Never run `git pull` or `git rebase` when there are uncommitted changes — they are silently destroyed during merge/rebase conflicts.

Safe sync sequence:
```
git add <files>
git commit -m "..."
git pull
git push origin master
```

`pull.rebase=true` is set locally — keeps a clean linear history. If changes exist, commit first, no exceptions.

**Branch & PR rule:** Every change gets its own new branch and PR — never push to an existing PR branch.

---

## Stack

- Vue 3 + Vite, Composition API (`<script setup>`)
- Pinia stores, Vue Router 4 (lazy-loaded routes in `src/router/index.js`)
- Spring Boot backend at `localhost:8080/api`, JWT auth via localStorage
- Bootstrap 5 + Bootstrap Icons, Mapbox GL, Chart.js

## Project Layout

- `src/views/`       — all routable pages (lazy-loaded)
- `src/components/`  — shared UI components (TopNav, Footer, LiveTracker, RouteViewer, ConnectDevices, legal pages)
- `src/stores/`      — Pinia stores
- `src/composables/` — useUnits.js (ALWAYS use for distance/pace/elevation — never hardcode km/mi)

## Unit System

Default is **imperial** (mi, ft, min/mi). Always use `useUnits()` composable — never hardcode km/m labels.

## Vue rules

- **NEVER touch `<script setup>` sections** — only `<template>` and `<style scoped>`.
- Always use `storeToRefs` for reactive destructuring from Pinia stores.

---

## Brand & Design System — Good Record

### 0. The one-line brief

Runnit is a **warm, gritty endurance-crew** brand — for runners, cyclists, triathletes, swimmers, and trail athletes. It looks like a hand-printed race bib crossed with an editorial sports poster: hard-edged, high-contrast, confident, a little funny. Not another cold blue fitness SaaS.

### 1. Audience & voice

- **Audience: all endurance athletes, not just runners.** Keep the running energy and the RUNNIT wordplay ("Run it" = "go do it"), but the product serves every endurance sport.
- Use **"athletes"** not "runners" in body copy ("Made by athletes, for athletes", "Join thousands of athletes").
- Prefer sport-neutral nouns: **"session / workout / training"** over "run", **"distance"** over "miles" (stat readouts may show MI/KM).
- **Tone: bold ~8/10 — imperative, warm, a little cocky.** Examples: "Run it. Log it. Brag a little." · "Find your people. Or start your own." · "Chase crowns. Defend your block." · "No miles yet. Your board's empty — for now." · "You went off route."
- Never corporate filler, never the old flat register.

### 2. Color tokens

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#FBF6EC` | default page background (warm cream) |
| `--card` | `#FFFFFF` | cards, inputs |
| `--ink` | `#16130F` | text, all 2px borders, dark sections |
| `--cobalt` | `#2A55F5` | THE accent — CTAs, links, eyebrows, active states, route lines |
| `--cobalt-hover` | `#1E42D6` | hover on cobalt fills |
| `--yellow` | `#FFC53D` | PRs, achievements, warning/paused states ONLY |
| `--muted` | `#5A5348` | body/secondary text on paper |
| `--muted-2` | `#8A8A8A` | captions, meta |
| `--hairline` | `#E7DFCE` | thin dividers inside cards |
| `--danger` | `#C0392B` | destructive actions only |
| on-ink muted | `rgba(251,246,236,0.6)` | body text on ink |

**Rules:** Cobalt is the only accent color. Yellow is reserved for achievement/warning moments, never decoration. Replace any legacy `#0052FF` / `#003ECC` / `#4d6bff` blue with `--cobalt`. **No gradients.**

Nav height: `--nav-h: 66px` · Tab height: `--tab-h: 64px`

### 3. Typography

Load from Google Fonts: **Big Shoulders Display** (500–900), **Hanken Grotesk** (400–800), **Spline Sans Mono** (400–700).

- **Big Shoulders Display** — headlines, big stat numbers, section titles. UPPERCASE, `line-height: 0.8–0.9`, weight 800–900.
- **Hanken Grotesk** — body, UI labels, buttons, descriptions. Weight 400–800.
- **Spline Sans Mono** — eyebrows, labels, stat units, tickers, timestamps, meta. UPPERCASE, `letter-spacing: 0.1–0.2em`, always `font-variant-numeric: tabular-nums` on numbers.
- **Logo lockup:** `RUNNIT.` in Big Shoulders **900 italic**, ink, with the **period in cobalt**. Never restyle it.

### 4. Signature motifs

1. **2px solid ink borders** on nearly everything — cards, nav, inputs, sections, grid cells, tiles.
2. **Offset hard shadows** — `box-shadow: Npx Npx 0 #16130F` (or `0 … #2A55F5` on featured cards). **Never blurred/soft.**
3. **Marquee ticker** — ink bar, 3px cobalt top border, scrolling Spline-Mono uppercase. Duplicate content, `transform: translateX(-50%)` keyframe (`@keyframes rkMarq`).
4. **Pill CTAs** — `border-radius: 999px`, 2px ink border, cobalt fill / white text, hard ink shadow. The primary action on any screen.
5. **Tilted sticker badges** — Spline-Mono uppercase chips on yellow/cobalt, 2px ink border, `transform: rotate(-2deg…+6deg)`. E.g. `New PR`, `Posted ✓`, `Early Access`.
6. **Stat readouts** — Big-Shoulders numeral + tiny mono uppercase label, tabular-nums, in bordered blocks.
7. **Avatar monograms** — `border-radius: 999px`, ink/cobalt/yellow fills, 2-letter initials, weight 800, 2px border.
8. **0 border-radius** on everything except pills and avatars. The system is hard-cornered.

### 5. Layout & spacing

- Cream page, ink or white cards. Alternate ink (dark) and cream (light) sections — don't run everything on one bg.
- Desktop content padding ~28–48px; mobile 18–22px side padding.
- Prefer flex/grid with `gap` over margins; hairline (`#E7DFCE`) or 2px-ink dividers between rows/cells.
- Section eyebrows: cobalt Spline-Mono uppercase. **Do NOT use numbered eyebrows (`001 / 002`).**

### 6. Mobile rules (≤640px)

- Nav bar 56px: logo left, cobalt "Join"/"Track" pill + hamburger right. Desktop links go behind the hamburger.
- Slide-in drawer: ink panel, 3px cobalt left border, cobalt active-item bar, Track Activity as cobalt pill.
- Single-column stacks; grids collapse (feature/stat → 2-col, plans/cards → 1-col).
- **All touch targets ≥ 44px.** Tickers thin to ~10px.

### 7. Icons & imagery

- Icons: simple line SVGs, ~2px stroke. No filled icon fonts, no emoji as UI (ban the old 🗺️⏱️⛰️🏅 stat emojis — use Big-Shoulders numerals + mono labels).
- Photos: real athlete imagery, full-bleed in bordered frames, often with dark bottom gradient + stat stamps.

### 8. Footer (every marketing page)

Cobalt "Lace Up." CTA cap → ticker seam → ink columns (brand + Product/Company/Legal, cobalt mono eyebrows, 2px hairline verticals, bordered social tiles) → legal bar ("© 2026 Runnit, Inc." / "Made by athletes, for athletes ✦").

### 9. Hard don'ts

- ❌ No gradients, no soft/blurred shadows, no rounded corners (except pills + avatars)
- ❌ No accent color other than cobalt (+ yellow for achievements only)
- ❌ No emoji in UI chrome or stats
- ❌ No `001 / 002` numbered eyebrows
- ❌ No "runners"-only copy, no corporate filler
- ❌ Don't restyle the `RUNNIT.` logo or the cobalt period
- ❌ Don't leave charts empty — fill with real or sample data in-brand
- ❌ Don't define links without a cobalt hover

### 10. Definition of done for any UI change

Cream/ink surfaces · cobalt as the only accent · Big Shoulders headlines + numerals, Hanken body, Spline Mono labels · 2px ink borders + hard shadows · pill primary CTA · tabular-nums stats · athlete-inclusive, bold copy · responsive to mobile rules above.
