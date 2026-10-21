# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**ArabTides** (repo name `hermes-dashboard`, package `arab-tides`): an Arabic-first, RTL, fully static Astro 7 + Tailwind 4 site showing computed tides, sun/moon times, solunar/fishing ratings, Hijri dates and prayer times for ~36 Arab ports. `SPRINT.md` is the original product spec (design direction, required features, Arabic language rules) — consult it for intent.

## Commands

- `npm run dev` — dev server. Per `AGENTS.md`, start it in background mode: `astro dev --background` (manage with `astro dev stop|status|logs`).
- `npm run build` — static build to `dist/`.
- `npm run preview` — serve the built site.
- Node >= 22.22.0 (Astro refuses older; if the local Node is older, run e.g. `npx -y -p node@22 node node_modules/astro/bin/astro.mjs build`). There is no test suite, linter, or typecheck script; `npm run build` is the verification step (it executes every page's frontmatter, so calculation errors surface there).

## Architecture

- **All computation happens at build time** in page frontmatter, using pure TS modules in `src/lib/`:
  - `tides.ts` — harmonic tide prediction `h(t) = Σ f·A·cos(ωt + V + u − g)` over EOT20 constituents, with hard-coded constituent speeds and V0 equilibrium arguments for a 2026-01-01 epoch; also extreme finding, tide-type classification, spring/neap, and timezone-offset helpers.
  - `astronomy.ts` — moon phase, solunar periods, and sun/moon rise/set/transit found by scanning altitude over the port's local calendar day (so results don't depend on the build's time of day).
  - `prayer.ts` — prayer times and Gregorian→Hijri conversion.
- Because pages are static, "today" is the build date. Anything that must reflect the viewer's current date (e.g. the monthly fishing conclusion on port pages) is done in `<script is:inline>` client-side code that reads `data-*` attributes rendered into the HTML. Prefer that pattern over trying to make build-time data "live".
- **Data**: `src/data/places/places_index.json` (list of ports: id, names, country, lat/lon) drives `getStaticPaths` for `ports/[id].astro`, `country/[code].astro`, sitemap and robots. Each port's `src/data/places/<id>.json` holds timezone and tidal constituents (amp in cm, phase in degrees), loaded via dynamic `import()`. `data/places/` at the repo root is a duplicate of the original source data; the site imports only from `src/data/`.
- `src/data/places/ARABIC_CONTENT.txt` is the authoritative Arabic terminology/UI-wording guide — read it before writing any user-facing Arabic text. Use Modern Standard Arabic (no dialect), RTL, 24-hour times, and CSS logical properties (`margin-inline`, `inset-inline`, …).
- Country code → Arabic name map and coordinate formatting live in `src/lib/countries.ts`. Flags are `public/flags/<code>.svg` (flag-icons, MIT) rendered by `src/components/Flag.astro`.
- **Fish guide** (`/fish`, `/fish/<id>`, `/fish/credits`, plus a strip on each port page): species, local Arabic names and seas in `src/lib/fish.ts`. Photos are Wikimedia Commons files fetched by `node tools/fish-photos/fetch.mjs` into `public/fish/<id>.webp`, with author/license in `src/data/fish-photos.json` — add a species to both `fish.ts` and the script's `FILES` (find a photo and the Wikidata Arabic name with `node tools/fish-photos/wikidata.mjs "<sci name>"`; the fetch script skips species already downloaded), and never use photos without an open license and credit. Port fish lists put species recorded within 50 km on iNaturalist first (📍); refresh those counts with `node tools/fish-photos/inat-counts.mjs` → `src/data/port-species.json`.
- `src/layouts/BaseLayout.astro` holds the shell: site header/footer (`src/components/`), canonical + OG tags, global CSS (shared classes like `.card`, `.section-title`, `.page-head`, `.breadcrumb` are in `src/styles/global.css`), Vercel Analytics, and Google Analytics (only rendered when `PUBLIC_GA_ID` is set). Leaflet maps load from unpkg via inline scripts on the homepage and port pages.
- Inline JSON for client scripts is embedded with `<script type="application/json" set:html={...}>` (an earlier `define:vars` approach for large data was replaced for reliability).

## Deployment / base paths

`astro.config.mjs` picks `site`/`base` from the environment: `SITE_URL` override → Vercel (`VERCEL` env, site `https://www.arabtides.com`, base `/`) → otherwise GitHub Pages with base `/hermes-dashboard`. Production is www.arabtides.com (apex redirects to www); Vercel deploys from pushes to `main`. Set `VERCEL=1` when building/previewing locally to get the production base path. Always build internal links from `import.meta.env.BASE_URL` (pages use a `BASE` constant that normalizes the trailing slash) — never hard-code `/`.

The committed `docs/` directory is a built copy of the site for GitHub Pages (built without `VERCEL`/`SITE_URL`, so with the `/hermes-dashboard` base); `dist/` is gitignored and used by Vercel.

## Conventions

Each change is a numbered "build": increment `build` in `src/build.json` (shown as a footer badge on the homepage) and use commit messages of the form `#NNN: <summary>`. Commits have historically included a refreshed `docs/` build alongside source changes.

## Shop, brand and products

- `src/lib/shop.ts` holds the Stripe Payment Link (`STRIPE_LINK`) and the Google Sheet sign-up web app URL (`SHEET_WEBAPP`); env vars `PUBLIC_STRIPE_GUIDE_URL` / `PUBLIC_SIGNUP_URL` override them. Empty Stripe link → Buy buttons show "قريباً"; empty sign-up URL → the form still gives the free PDF but stores nothing.
- `/guide` is the product page, `/guide/thanks` the noindex post-payment page (Stripe "after payment" redirect). Funnel components: `GuidePromo.astro` (banner/card/strip) and `SignupForm.astro`. `tools/signup-sheet/` has the Apps Script for the Sheet.
- `products/` (the paid PDF and its sources) is gitignored on purpose: the repo is public. Only the free cheat sheet (`public/downloads/`) and preview images (`public/guide/`) are published.
- `brand/` holds the brand kit, Instagram posts and Reels (`render.sh`, `voiceover.mjs`, `render-video.mjs`).
- In RTL pages, never hide or position elements with large physical `left` offsets — they widen the document; use logical properties or clipping.
