# osa-web — CLAUDE.md

Operational handoff for the next agent (or human colleague) working on this repo. The [README.md](./README.md) is for end-users; this file captures decisions, gotchas, and open loops.

## What this is

Static site for **Občanské sdružení Alternativa II, z.s.** (OSA). Destination: `osa2.cz`, replacing the current `alternativa2.info`. Client is Kindl (the maker); the site is for the association's real stakeholders (předseda Marek Semerád, místopředseda Štěpán Říha, Členský sněm).

**Binding spec** lives in the vault at `/Users/kindl/kindl-vault/Projects/OSA_Website/OSA_Website_Plan.md` plus four research memos in the same folder. When in doubt about scope or copy, that plan wins.

## Stack snapshot

| | |
|---|---|
| Framework | Astro 6.1.8, static output |
| Language  | TypeScript strict |
| Content   | Astro Content Collections (MDX + JSON), Zod-validated |
| Styling   | Vanilla CSS with tokens in `src/styles/` |
| Fonts     | Self-hosted Atyp Special WOFF2 in `public/fonts/` |
| Client JS | Filter island (~900 B) + IntersectionObserver reveal observer (~400 B) + values accordion toggle + mobile hamburger + gallery lightbox (all inline `<script is:inline>`) |
| Deploy    | Live: GitHub Pages at https://keiaiendiel.github.io/osa-web/. Repo: github.com/keiaiendiel/osa-web (public). DNS → osa2.cz is post-launch. |

## Current state (2026-04-23, after v8.1 brand + editorial pass)

- 29 pages build cleanly, zero build errors. Fonts 100.8 KB site-wide, weight budget green on every page.
- Editorial lint green. Typographic bans (em/en-dash, `!` in prose) were dropped per client direction; voice-level rules (passive, hype, legalese) still stand.
- Live at **https://keiaiendiel.github.io/osa-web/**. Repo on GitHub is public. Pages deploy runs via `.github/workflows/deploy-pages.yml` on every push to master.
- `astro.config.mjs` currently points `site: 'https://keiaiendiel.github.io'` with `base: '/osa-web/'`. A helper `src/utils/url.ts` exposes `withBase(path)`; every internal link/asset passes through it so the base is trivially removable when DNS flips to osa2.cz (one-file diff). `tokens.css` hardcodes `/osa-web/fonts/` — same find-replace applies.
- Drive sync is **live**. Google Cloud project `osa-aktuality-sync` holds a service account; the Drive folder `OSA Aktuality` is shared with it as Editor; `GOOGLE_SERVICE_ACCOUNT` and `DRIVE_FOLDER_ID` secrets are set in the repo. A 30-minute cron runs `sync-aktuality.yml` which now commits straight to master (no PR gate). Apps Script step skipped.
- Aktuality channel has six articles: four v7 backfill, one v7.1 VPD investment call, and one v8 sync-from-Drive example (`fotky-ze-setkani-pred-vyletnou`). Multi-image gallery works: first inline image becomes the hero, the rest land as `<slug>-2.jpg`, `<slug>-3.jpg`... and render via `<Gallery title={null}>` at the bottom of the article.
- Mobile polish pass: hamburger drawer with z-index-safe header, ValuesMatrix single-open accordion (desktop hover preview restored), colour-by-default Gallery, lightbox overlay with prev/next/ESC, rozcestník capped at 6 cards + "Ostatní projekty" CTA, footer two-column, scroll-reveal threshold tuned for short viewports, InvestmentHero mobile reorder (header → chart → metrics → CTAs).
- VPD1 → VPD naming dropped across content, component strings, page IDs, and filenames. Aktualita slug is now `vpd-hledame-strategickeho-partnera`.
- Internal project pages (`/projekty/<slug>/`): accent colour no longer paints the H1. A 56×3 px coloured bar above the heading carries the project's colour; body text stays monochrome.
- Dev server via `pnpm dev` on port 4321 (`.claude/launch.json` entry `osa-web`).
- Header logo is a **wordmark** (`OSA-Wordmark-{Black,White}.svg`, source: Suitcase supplied `Glylp_OSA_Logo_*.svg`), glyph + "OSA" lettering at 4:1. Sized 18 px height / auto width on desktop, 16 px on mobile. `width="72" height="18"` HTML attrs pinned on the `<img>` so the browser reserves the correct box from first paint — without them the SVG's `width="100%"` fallback resolves to 300×75 and flashes big during navigation. Old square `OSA-Logo-{Black,White}.svg` files kept in `public/logo/` as backup; current Header imports the Wordmark files.
- `/projekty/vpd/` hero carries the **VPD logomark** instead of a text H1: 60°-bevelled bar over three stacked Atyp Special Bold words (`Veřejně / Prospěšný / Developer`). Semantic H1 preserved via `.sr-only`. 2-col hero grid (mark left, subhead + lede right); bar top aligns with the cap-line of the right-column subhead (padding-top compensates the line-box inset). Fully scoped to `vpd.astro`, trivially reversible.
- Hero dark-pattern treatment is now consistent across Úvod / O spolku / Projekty: one `::before` layer driven by `--{page}-pattern` CSS custom property pointing at `graphics/osa-bg-pattern.svg` (landing, Projekty, both at 0.15 opacity) or `osa-bg-pattern-2.svg` (O spolku, 0.20 opacity). Old `<SVGPattern>` wrapper still used on VPD + aktuality detail; gradually replacing with the bespoke `::before` approach for per-page opacity control.
- O spolku page rebuilt: narrative + compact VPD-style stats dl (20 let / 20+ projektů / 8 oblastí / 0 Kč dotací), three bespoke chapter blocks (01 Vize / 02 Poslání / 03 Smysl) using the VPD chapter-head vocabulary (big numeric mark left, eyebrow + heading + body right), ValuesMatrix **before** OrgChart (client ordering), Gallery "Z činností spolku." at the bottom.
- InvestmentHero schematic grid had a horizontal-overflow bug: cells with `aspect-ratio: 1/1` inside a flex-constrained 4:3 aside forced a min-width per column that exceeded the container. Fixed via explicit `grid-template-rows: repeat(4, minmax(0, 1fr))` + `grid-template-columns: repeat(7, minmax(0, 1fr))` and `min-width: 0; min-height: 0;` on grid and cells.

## Repo layout

```
osa-web/
├── .github/workflows/ci.yml      # GH Actions: lint + build + weight budget
├── public/
│   ├── favicon.{svg,ico} + apple-touch-icon.png   # generated from OSA-Logo-Black.svg
│   ├── fonts/*.woff2             # Atyp Special Medium, Bold, Italic (subsetted)
│   ├── graphics/graphic-asset-header_{1..6}.svg   # full-bleed motif strips
│   ├── images/*.jpg              # 10 gallery placeholders, downsampled
│   ├── logo/{OSA-Logo-Black,White,White-Full,osa-glyph}.svg       # square glyph variants (backup)
│   ├── logo/OSA-Wordmark-{Black,White}.svg                         # v8.1 header wordmark (4:1)
│   ├── robots.txt
│   └── _redirects                # placeholder; real alternativa2.info map is TBD
├── scripts/
│   ├── lint-editorial.mjs        # ban em/en dashes, !, passives, AI hype, …
│   ├── lint-links.mjs            # HEAD-check external_url, 4xx = fail
│   └── lint-weight.mjs           # per-page eager budget check on dist/
├── src/
│   ├── content.config.ts         # Zod schemas for all collections
│   ├── content/
│   │   ├── sub_projects/*.mdx    # 17 projects
│   │   ├── values/axioms.json    # 16 spolková hodnoty
│   │   ├── pillars/index.json    # 3 pilíře hospodaření
│   │   ├── org/identity.json     # legal identifiers, contacts, addresses
│   │   └── dokumenty/*.json      # PDFs and archive entries
│   ├── components/               # all .astro, one .astro filter island with <script is:inline>
│   ├── layouts/
│   │   ├── Base.astro            # html/head/body, loads tokens + kit + motion, mounts RevealOnScroll
│   │   └── LongformPage.astro    # wrapper for historie/metodologie pages
│   ├── pages/
│   │   ├── index.astro
│   │   ├── o-spolku/{index,historie,metodologie,dokumenty}.astro
│   │   ├── projekty/
│   │   │   ├── index.astro       # grid + filter bar
│   │   │   ├── [slug].astro      # stub pages for projects without external_url
│   │   │   └── vpd.astro         # FULL bespoke page for Veřejně prospěšný developer
│   │   ├── zapojte-se/index.astro
│   │   └── kontakty/index.astro
│   └── styles/
│       ├── tokens.css            # @font-face + CSS custom properties
│       ├── kit.css               # utility classes (.btn, .tag, .container-wide, .section, ...)
│       └── motion.css            # motion rules: hover fade, button invert, card accent, focus
├── astro.config.mjs              # site URL, trailingSlash: always, output: static
├── README.md                     # user-facing: stack, scripts, content model, deploy
├── CONTRIBUTING.md               # editorial rules, why they exist, how to add a project
└── CLAUDE.md                     # this file
```

## Design decisions worth knowing

**Monochrome parent brand.** Eight accent colors exist (`--c-red`, `--c-coral`, `--c-mustard`, `--c-olive`, `--c-forest`, `--c-teal`, `--c-blue`, `--c-plum`) but are reserved for sub-project surfaces. The parent brand is K0–K100 grayscale only. The Zod enum on `accent` enforces this — invalid values fail the build.

**Atyp Special is the single font family.** Medium (500) for body, Bold (600) for headings. Italic subset included. No Space Grotesk anymore. Licensed source files live at `/Users/kindl/Work/_2026/02 OSA/00 Branding/00 Font/AtypText-Special-*.otf`. Subsetted via `pyftsubset` with Latin-Extended + Czech diacritics.

**The `-OSA-` ligature does NOT work via text.** Investigated thoroughly: Atyp Special's GSUB tables contain no `-OSA-` ligature rule in any feature (`dlig`/`liga`/`ccmp`/`salt`/`ss01..ss12`). The OSA trapezoid glyph exists in the font but only as a raw glyph, not reachable from `-OSA-` text. If Suitcase Type Foundry ships a newer Atyp with a proper `clig`/`dlig` rule, the `.brand-mark` class in `src/styles/kit.css` is ready to consume it. Until then, the hero uses the explicit `<OsaGlyph />` SVG component, and the header/footer use the full `OSA-Logo-*.svg` lockups.

**Motion vocabulary.** Signature ease is `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out, portfolio reference). Key durations: 120 ms hover fade, 280–360 ms card transitions, 380 ms filter, 620 ms scroll reveal. All motion respects `prefers-reduced-motion`.

**ProjectCard layout contract (v6).** `justify-content: space-between` pins `.project-card__top` (eyebrow + rule + name + description) to the top and `.project-card__bottom` (accent rule + meta row) to the bottom. The gap between them is the single variable element: short descriptions leave more air, long ones compress it.

Hover vocabulary is Swiss restraint, NOT the earlier black-panel wipe. On hover: description flips from `--k-50` to `--fg` (muted grey becomes full black), bottom hairline rule grows `1px → 2px` and swaps to the project's `--accent`, arrow nudges right. No clip-path, no invert. If anyone brings back the wipe, they owe the client a justification.

Eyebrow shows only the topic tag (`Urbanismus`, `Kultura`, etc.), not the redundant `Projekt · <topic>` form. Meta row shows `<OsaGlyph />` + status label + arrow (`→` internal, `↗` external); the literal word "OSA" is NOT in the meta row.

The anchor carries `class="osa-nolink"`. This opts out of the global `a:not(.btn):not(.osa-nolink):hover { opacity: .6 }` rule in [motion.css](src/styles/motion.css). Without this class the whole card fades on hover and the description-color flip is invisible. **Don't remove it.**

**FilterBar is the only true client island.** One `<script is:inline>` inside a `DOMContentLoaded` listener. The inline approach failed during initial development because the script ran before the form element was parsed; wrapping in `DOMContentLoaded` fixed it. Don't refactor back.

**Scroll reveal via `[data-reveal]`.** `RevealOnScroll` component mounts one `IntersectionObserver` globally in `Base.astro`. Mark sections you want to animate with `data-reveal` (and optionally `data-reveal-delay="1|2|3"` for stagger).

**Graphic headers were simplified.** Earlier iteration tried thin tile-repeated bands (20–40 px) which felt weak; reverted to full-bleed strips (64 px) / bands (108 px) via the original SVGs. Only two on the homepage (around Values section). Light and dark variants auto-invert via `filter: invert(1)` on dark surfaces.

**Gallery is 4×2 uniform, monochrome at rest.** Earlier mixed-aspect dense-pack left empty slots at certain widths; current grid is strictly 4×2, every cell 4:3 aspect, always packed. No frame (v6): the outer border was removed, grid gap is 2px. Images sit at `filter: grayscale(1)` by default and flip to full color + `scale(1.04)` on hover. This is the ONE place color appears on the monochrome landing page.

**Dark hero pattern (v6).** Three pages share one silhouette: landing, `/o-spolku/`, `/projekty/vpd/`. The pattern is: `<Header variant="dark" />` continuing seamlessly into a dark hero section (`<section class="… osa-dark">`), optionally wrapped in `<SVGPattern variant="dark" opacity={0.1x}>` for texture. The header's hairline rule is hidden when `variant="dark"` so the two surfaces fuse into one black banner from the top edge. Other pages (projekty list, zapojte-se, kontakty, dokumenty) keep the default light header. If a new page needs the dark-hero treatment, mirror the structure from [src/pages/o-spolku/index.astro](src/pages/o-spolku/index.astro).

**ValuesMatrix has two modes.** `<ValuesMatrix />` (default, light) for landing. `<ValuesMatrix dark={true} />` for `/o-spolku/` — flips to dark scope, keeps interactive hover reveal (`+` affordance rotates to `×`, gloss slides open via `grid-template-rows` transition). There was briefly an `expanded={true}` mode showing all gloss statically; the client rejected it in favor of the interactive reveal on both pages.

**ManifestoStrip layout (v6).** Head-on-top, 3-column grid below. Was a 2-column `sticky head + list` earlier, but the sticky head appeared to jump during staggered per-item reveals. Current structure uses one `data-reveal` on the list container (no per-item stagger) and no sticky positioning. Section has `border-bottom` only; the outer `border-top` was removed because it rendered as a dark line right below the dark graphic strip above. Don't re-add it.

**Header variant prop.** `<Header variant="light" | "dark" />`. Default is `light`. `dark` applies `osa-dark` scope (white text on black) and hides the bottom hairline rule so the header merges into a dark hero. Used on the three dark-hero pages; keep others on the default.

**FilterBar spacing (v6).** `.osa-filter { gap: space-5 }`, `.osa-filter__group { gap: space-4 }`, `.osa-filter__row { gap: space-3 }`, outer padding `space-6 0`. These were tighter before and the client called out the cramped rhythm. Don't shrink them without a reason.

**Investment call (Záměr VPD) lives in two places after v8.** Landing AND `/projekty/vpd/` both render the same `<InvestmentHero />` component — the VPD page variant passes `hideVpdLink={true}` so the "O VPD" secondary CTA collapses there (no self-links). The canonical long-form narrative lives in `src/content/aktuality/vpd-hledame-strategickeho-partnera.mdx` (PDF-verified figures). Figures on the banner use older vault-research numbers (IRR 78 %, ROI 141 %) wrapped in mustard `.draft` spans; the aktualita body uses PDF-verified numbers (IRR 59 %, ROI 151 %). To activate for a public launch: reconcile the two sources with Marek Semerád, strip `.draft` wrappers on the banner, replace the aktualita hero (currently the courtyard photo the client sent) with a final rendering of Horní kasárna when VPD Klecany s.r.o. provides one.

**Values accordion.** Single-open behaviour, both desktop and mobile. Click a cell → it opens, closes any previously open cell. Click again → closes. No `:hover` or `:focus` toggle (those caused sticky "inverted white" state after tap). One exception: desktop with `hover: hover` + `pointer: fine` gets the original CSS hover preview back (peek while mousing, never pinned). Mobile (`<=560px`) layout is a plain `[num | name]` row; the `+` affordance was removed entirely — the colour invert on `.is-open` carries the state clearly enough.

**Gallery lightbox.** Click on any image in a `<Gallery>` opens a full-viewport black overlay with the photo, a `N / total` caption, prev/next chevrons, and a close X. Keyboard: ESC closes, ←/→ navigate. Tap on the backdrop also closes. Implementation is self-contained inside `Gallery.astro` (`<div class="osa-lightbox" hidden>` + inline `<script is:inline>`). Critical CSS guard: `.osa-lightbox[hidden] { display: none }` must stay — without it, `display: grid` overrides the `hidden` attribute and the overlay silently eats every click on the page.

**Mobile hamburger drawer.** `<Header>` emits a 32×32 burger button visible only below 720 px. Click toggles a full-viewport dark drawer with six large nav links. While open, `<html>` gets `osa-nav-lock` which (a) locks background scroll and (b) pins the header to the top of the drawer so the logo and the X close button stay visible. `.osa-header__brand` and `.osa-header__burger` carry an explicit `z-index: 2` so they float above the drawer — the drawer is a sibling DOM child of `<header>`, and without the z-index it would paint over them.

## Content collections schema

Defined in `src/content.config.ts`:

- `subProjects` — glob `src/content/sub_projects/*.mdx`. Fields: `name`, `description` (30–160 chars), `accent` (8-color enum, fails build on bad value), `status` (realizovany/pripravovany/ve-spanku/draft), `relationship`, `topic` (8-enum: urbanismus/kultura/sport/media/vzdelavani/tvorba/komunita/larp), `external_url` (optional — if absent, card routes to `/projekty/<slug>/`), `featured`, `order`.
- `values` — file `src/content/values/axioms.json`. Each item needs `id`, `name`, `gloss`, `order` (1–16).
- `pillars` — file `src/content/pillars/index.json`. Each item needs `id`, `n` (zero-padded 2-digit string), `title`, `body`.
- `org` — file `src/content/org/identity.json`. Single keyed entry `identity`.
- `dokumenty` — glob `src/content/dokumenty/*.json`.

**Schema gotchas.** The `file()` loader requires either an array of items with `id` fields, or a top-level object keyed by id. The single `org.identity.json` uses the keyed form — don't flatten it back. Numbers (pillars `n`) must be strings to survive the `regex(/^\d{2}$/)` check.

## Aktuality channel (live as of v8)

Self-service editorial channel. Full Kindl-facing runbook: [docs/DRIVE_SYNC_ACTIVATION.md](./docs/DRIVE_SYNC_ACTIVATION.md). Client-facing how-to: [docs/APPS_SCRIPT.md](./docs/APPS_SCRIPT.md).

- **Collection:** `aktuality`, MDX glob in `src/content/aktuality/`, Zod schema with title (10-120), lead (40-240), date, hero path, optional tags/author/hero_alt/draft, and optional `gallery: string[]` for articles with more than one image.
- **Pages:** `/aktuality/` grid (sorted date DESC) and `/aktuality/<slug>/` detail with hero, body, tags, "Zpět na aktuality", up to three related cards, and an inline `<Gallery title={null}>` when the article has extra images. Detail emits Article JSON-LD.
- **Detail hero:** VPD-style dark frame. `<Header variant="dark" />` fuses into a dark `<section>` with the hero image as a full-bleed darkened background (filter brightness 0.45 + gradient scrim). Crumbs + eyebrow + H1 + lead left-aligned.
- **ArticleCard.astro:** ProjectCard-style top/bottom contract. Mirrors the editorial hover vocabulary.
- **Drive sync pipeline (live):** [scripts/sync-drive-aktuality.mjs](./scripts/sync-drive-aktuality.mjs) pulls every Google Doc from the shared Drive folder, exports Markdown, strips base64 data-URL images (Docs export embeds them inline in the reference-style), iteratively compresses every inline image to ≤700 KB via sharp (Q80 → Q45, then shrink width 1400 → 900 px), walks EVERY image (first → hero, rest → `<slug>-2.jpg`, `-3.jpg`, ... stored on the `gallery` frontmatter array), validates title/lead/date against Zod schema (fixable issues auto-fix; unfixable mark `draft: true` so the article still lands and is hidden). Normalizes smart characters so the editorial linter stays green.
- **Workflow:** [.github/workflows/sync-aktuality.yml](./.github/workflows/sync-aktuality.yml) runs on `workflow_dispatch` plus 30 min cron. Commits **directly to master** (no PR gate) after build + editorial lint pass. The transient `pnpm add --save-dev googleapis sharp` edit is reverted with `git checkout HEAD -- package.json pnpm-lock.yaml` so it never reaches the commit. Apps Script trigger was considered and skipped; the cron is enough.

## Drive sync activation — DONE

Service account `osa-aktuality@osa-aktuality-sync.iam.gserviceaccount.com` in GCP project `osa-aktuality-sync`. Drive folder `OSA Aktuality` (in Kindl's My Drive, Workspace Individual plan has no Shared Drives) shared with the SA as Editor. Repo secrets `GOOGLE_SERVICE_ACCOUNT` + `DRIVE_FOLDER_ID` set. GitHub repo setting "Allow GitHub Actions to create and approve pull requests" enabled (set once via `gh api -X PUT .../actions/permissions/workflow -f default_workflow_permissions=write`, now less relevant since PR step was dropped but leave as-is).

End-to-end verified: client writes Doc → cron (or manual `gh workflow run sync-aktuality.yml`) picks it up → MDX + hero + gallery images land in master → Pages rebuilds → article is live at `https://keiaiendiel.github.io/osa-web/aktuality/<slug>/`.

## SEO infrastructure (v7)

- **Sitemap:** `@astrojs/sitemap` writes `dist/sitemap-index.xml` + `dist/sitemap-0.xml`. 404 excluded via filter.
- **Per-page metadata:** `Base.astro` takes `title`, `description`, `ogImage`, `ogType` props. Derives canonical from `Astro.site` + `Astro.url.pathname`. Renders OG tags, Twitter Card, manifest link, sitemap hint.
- **Organization JSON-LD:** `Base.astro` fetches `getEntry('org', 'identity')` and emits a schema.org `NGO` payload on every page (name, IČO, DIČ, address with Bubeneč, foundingDate from ARES, members with jobTitle).
- **Static OG image:** `public/og/default.png` (32 KB, 1200x630) generated from `public/og/default.svg` via rsvg-convert. Each page can override with `ogImage`.
- **404 page:** [src/pages/404.astro](./src/pages/404.astro). Swiss editorial layout matching the rest of the site.
- **Redirects:** [public/_redirects](./public/_redirects) maps the seven alternativa2.info top-level pages (kdo-jsme, nase-spolkove-projekty, spoluprace, clenstvi-ve-spolku, spolkova-galerie, kontakty, index) with 301s plus trailing-slash variants.
- **Manifest:** [public/manifest.webmanifest](./public/manifest.webmanifest) for PWA add-to-homescreen on mobile.

## Fact-check (v7 scaffold)

[docs/FACTCHECK.md](./docs/FACTCHECK.md) is the 60-claim checklist organized into eight categories with F1/F2/F3 verification phases (F1 = agent can verify against ARES/katastr/HEAD-check, F2 = needs client knowledge, F3 = needs sněm or statutes). `src/content/org/identity.json` was updated with ARES-verified founding date (2006-03-14) and the missing "Bubeneč" address fragment. Zod schema on `org` now requires `founded: YYYY-MM-DD`.

## Known issues and open loops

- **VPD financial figures split between two sources.** Banner figures on landing + `/projekty/vpd/` use older vault-research numbers (IRR 78 %, ROI 141 %) wrapped in mustard `.draft`. The aktualita body uses PDF-verified numbers (IRR 59 %, ROI 151 %, 285 mil. Kč, 331 units 1+kk). Before going public, reconcile with Marek Semerád and strip `.draft` wrappers.
- **Aktualita hero (courtyard photo) is a placeholder sent as a chat upload.** Goes into `public/images/aktuality/vpd-klecany.jpg`. Final image should be a real rendering of the Horní kasárna revitalization when VPD Klecany s.r.o. provides one. Old `vpd-klecany.svg` schematic was dropped.
- **`/projekty/vpd/` has orphan CSS.** The `#zamer-vpd1`-era `.osa-vpd__call`, `.osa-vpd__metrics`, `.osa-vpd__schematic` classes are still in the component's scoped `<style>` block but no DOM uses them any more (the InvestmentHero embed superseded that block). Cheap to clean later; not hurting the build.
- **AktualitaSpotlight.astro is orphaned since v7.2.** Safe to delete when we're sure the magazine-split spotlight approach won't return for a non-VPD feature slot.
- **Dokumenty PDFs are stubs.** `src/content/dokumenty/*.json` references files at `/dokumenty/*.pdf` that don't exist in `public/dokumenty/`. DocumentList renders but links 404.
- **PF 2026 hero is a compressed placeholder JPG.** 202 KB after sips compression; visual artifacts. Swap for the final astronaut when ready.
- **Gas Town + DIY dílny dropped their `external_url`** after link lint caught dead placeholder domains. Re-add when the real URLs come back.
- **Junktown URL is 410 Gone.** Link linter flags it; pre-existing issue. Informational only (link lint is non-blocking in CI).
- **Longform stubs** at `/o-spolku/historie/` and `/o-spolku/metodologie/` still carry placeholder `<aside>` notes. Board fills these post-launch.
- **No analytics.** Post-launch decision (Plausible/GoatCounter).
- **DNS → osa2.cz not cut over.** While the site serves from `keiaiendiel.github.io/osa-web/`, `astro.config.mjs` has `base: '/osa-web/'` + `tokens.css` hardcodes `/osa-web/fonts/`. When DNS flips: change `site` to `https://osa2.cz`, remove `base`, and find-replace `/osa-web/` → `/` in `tokens.css`. `withBase()` calls become no-ops and can be inlined later.
- **Atyp Special `-OSA-` ligature.** Font file lacks the rule; explicit `<OsaGlyph />` SVG remains the workaround.

## Client-driven revisions (v1 → v8.1)

Each `v#` commit captures a round of feedback from the client. Reading them in order tells the story:

- **v1** (`feat(uvod)` + subsequent feat commits + `build(phase4)` + `docs(phase5)`) — original build per plan.
- **v2** — first feedback pass: new brand assets, Hero reworked, monochrome hover on cards, topic replaces relationship, 4x4 values with hover gloss, drop serif, reduced graphic headers, Gallery introduced.
- **v3** — Atyp Special everywhere (dropped Space Grotesk); smoother filter with clip-path; full-wordmark footer logo; `&nbsp;` on number+unit pairs; draft underline removed; cards shifted to gray default (a mistake, reverted in v4).
- **v4** — revert card hover to clean black-invert wipe via clip-path; add scroll-reveal observer; favicon generation; gallery bigger, frameless; footer logo 50% smaller; **full VPD project subpage** built from vault research (hero, stats, philosophy, three pillars, Výletná case study, Záměr VPD1, related projects).
- **v5** — ProjectCard top/bottom layout contract; Gallery 4x2 uniform; graphic headers reverted to full-bleed; VPD subpage gets full Záměr VPD1 investment block; VPD MDX confirmed without `external_url` so the card routes internally.
- **v6** (2026-04-20, uncommitted as of this writing) — unified dark-hero pattern across landing / O Spolku / VPD; Header `variant` prop; Hero motto "Pomáháme tvořit" folded from italic line into strapline body; O Spolku gets a full dark hero redesign with crumbs + h1 + sub-head + lede; ValuesMatrix `dark={true}` on /o-spolku/; ProjectCard hover rewritten to Swiss restraint (no more black wipe), description flips `--k-50 → --fg`, meta row loses the literal "OSA" word, eyebrow loses the redundant "Projekt ·" prefix, anchor gets `osa-nolink` to bypass global link fade; Gallery monochrome-at-rest, color-on-hover, frame removed; InvestmentHero DRAFT notice removed (mustard draft wrappers on figures kept), CTA now links internally to `/projekty/vpd/`; VPD page uses shared `.osa-vpd__wrap` container, "Jak / Tři stavební kameny" header moved into the pillars section for tighter relationship; ManifestoStrip restructured (head on top, 3-col grid below) to fix heading-jump perception, outer `border-top` removed; reveal choreography added to projekty/index, zapojte-se, kontakty, o-spolku/dokumenty, LongformPage, projekty/[slug]; FilterBar spacing bumped (space-5 between groups, space-4 legend→row, space-3 between buttons).
- **v7** (2026-04-21) — launch-prep pass: aktuality channel (collection + index + detail + ArticleCard + 4 placeholder articles), SEO infrastructure (sitemap, per-page OG, Organization + Article JSON-LD, manifest, 404, real 301 redirects), Drive sync pipeline scaffold (script + Action + Apps Script docs), fact-check scaffold (FACTCHECK.md + ARES-verified identity.json with founded date + Bubeneč).
- **v7.1** (2026-04-21, same-day follow-up on client feedback) — three asks addressed in one pass:
  (a) Investment call converted to an aktualita. `src/components/InvestmentHero.astro` unmounted from the landing; replaced by `src/components/AktualitaSpotlight.astro` (magazine-split card pointing to the latest non-draft aktualita, "Další aktuality" CTA below). New article `src/content/aktuality/vpd1-hledame-strategickeho-partnera.mdx` carries the content from the two PDFs with PDF-verified figures.
  (b) Shared dark-hero contract. Landing Hero's bespoke padding shorthand and 1280 px max-width override were removed; Hero now matches O spolku, VPD, Projekty and aktuality detail on the same 96/96 padding + 24 px gutter + container-wide 1440 px contract. Projekty got a full dark hero frame with the FilterBar moved inside.
  (c) Aktuality detail hero rebuilt VPD-style. `<Header variant="dark" />` + dark `<section>` with the article's hero as a darkened full-bleed background, left-aligned crumbs + eyebrow + H1 + lead, narrow container (1200 px). The separate `.osa-article__hero-section` figure block was removed since the photo is now in the hero background.
  PF 2026 placeholder JPG was sips-compressed 462 → 202 KB to keep the page under the eager-weight budget. Client also confirmed Drive sync should be activated for real.
- **v7.2** (2026-04-21, same-day client follow-up) — client preferred the original `<InvestmentHero />` banner over the magazine-split spotlight, so landing was reverted. `src/components/InvestmentHero.astro` restored with reveal stagger + 11 `data-count-to` figures. Both CTAs work: "Celý článek" → aktualita, "O VPD" → /projekty/vpd/. AktualitaSpotlight.astro left orphaned.
- **v8** (2026-04-21, long session wrap-up) — shipping pass. Four strands:
  (a) **Published live.** Public repo `keiaiendiel/osa-web`, GitHub Pages deploy workflow (`.github/workflows/deploy-pages.yml`), `base: '/osa-web/'` + `withBase(path)` helper in `src/utils/url.ts` applied across internal links, asset srcs, JSON-LD, and CSS `@font-face` URLs. Deploy at https://keiaiendiel.github.io/osa-web/. `withastro/action@v3`-style `actions/upload-pages-artifact` + `actions/deploy-pages`. `pnpm/action-setup` pulls pnpm version from `packageManager`; no explicit `version:` on any setup step.
  (b) **Drive sync activated.** Service account, secrets, folder sharing, end-to-end verified. Sync script hardened: strips base64 data-URL images from Doc markdown exports (both `![][ref]` + `[ref]: <data:...>` autolink forms + `![](data:...)` inline form), iteratively compresses every image to ≤700 KB (Q80 → Q45, width 1400 → 900 px fallback), walks all inline images into hero + gallery array, validates frontmatter against Zod and auto-drafts unfixable docs, reverts transient `package.json` + `pnpm-lock.yaml` edits from the `pnpm add` step. PR step dropped — commits straight to master with a bot identity. Apps Script step skipped.
  (c) **Mobile polish pass.** Hamburger drawer with z-index-safe header (logo + X visible). ValuesMatrix rewritten as single-open accordion; desktop `hover: hover` + `pointer: fine` guard restores the original `:hover` peek. Gallery colour-by-default; lightbox overlay (ESC + arrow-key navigation; `hidden` attribute MUST win over `display: grid` or the invisible overlay eats every click). Rozcestník capped at 6 cards on phones + "Ostatní projekty" CTA. ValuesMatrix, InvestmentHero, footer, scroll-reveal threshold all tuned for short viewports. InvestmentHero uses CSS grid-template-areas so mobile order is header → chart → metrics → CTAs. "O VPD" shortened from "O Veřejně prospěšném developerovi".
  (d) **Content polish.** VPD1 → VPD (filenames, slug, strings, eyebrows, email subjects, hero alt). Accent colour dropped from internal project page H1s; replaced with a 56×3 px coloured bar above the heading. `/projekty/vpd/` now embeds `<InvestmentHero hideVpdLink={true} />` instead of the bespoke `#zamer-vpd1` block. Gallery gained an optional `title` prop so the in-article gallery only shows the small "Galerie" eyebrow (no H2). Editorial linter relaxed per client call — em/en-dash and `!` bans lifted; voice-level rules (passive, hype, legalese) kept. Value 16 renamed to one-line "ekologický způsob". Aktualita hero placeholder (VPD Klecany courtyard photo) awaiting final render of Horní kasárna.
- **v8.1** (2026-04-23, brand + editorial pass) — six strands, all small-to-medium:
  (a) **Dark-hero pattern unification.** `::before` layer driven by `--{page}-pattern` CSS custom property replaces `<SVGPattern>` on landing, Projekty, and O spolku. Landing + Projekty: filled triangles `osa-bg-pattern.svg` at 0.15 opacity. O spolku: outlined `osa-bg-pattern-2.svg` at 0.20 opacity.
  (b) **O spolku rebuild.** Added "Více o spolku" InlineCTA under the landing Hero's big H1. Replaced the tall stats block with a compact VPD-style dl (Založeno 2006 / 20+ projektů / 8 oblastí / 0 Kč dotací). Three bespoke chapter blocks (01 Vize / 02 Poslání / 03 Smysl) in the VPD chapter-head vocabulary (big numeric mark left + eyebrow above heading right) instead of SectionBlock. Reordered sections so ValuesMatrix precedes OrgChart. Appended `<Gallery title="Z činností spolku." />` at bottom. Dropped the Havel quote per client call.
  (c) **VPD logomark in hero.** `/projekty/vpd/` hero replaces the text H1 with a brand logomark: 60°-bevelled bar (`clip-path: polygon(0.26em 0, 100% 0, 100% 100%, 0 100%)` on a 0.45em-tall bar) over three stacked Atyp Special Bold words (`Veřejně / Prospěšný / Developer`). Semantic `<h1>` preserved via `.sr-only` for a11y/SEO. 2-col hero grid: mark left, subhead ("Metodika obnovy brownfieldů bez dotací.") + lede right. Bar top aligns with the cap-line of the right-column subhead (padding-top compensates the ≈0.15em line-box inset; measured drift ≈0.4 px). Font size `clamp(1.75rem, 3.4vw + 0.5rem, 2.875rem)` — one step smaller than the original H1. Reversible in a single block.
  (d) **Header wordmark.** Replaced the square glyph (`OSA-Logo-{Black,White}.svg`) with the Suitcase-supplied `Glylp_OSA_Logo_{Black,White}.svg` wordmark (glyph + "OSA" lettering, 2048×512 viewBox). Stored as `public/logo/OSA-Wordmark-{Black,White}.svg`. Sized 18 px height / auto width on desktop, 16 px on mobile (~80 % of the prior glyph per client). Pinned `width="72" height="18"` HTML attrs on the `<img>` so the browser reserves the box from first paint — without them the SVG's `width="100%"` fallback resolves to 300×75 and the logo flashed big during navigation.
  (e) **InvestmentHero grid overflow fix.** Schematic grid cells with `aspect-ratio: 1/1` inside a flex-constrained 4:3 aside forced a per-column min-width that exceeded the container, pushing the landing page horizontally and introducing a scrollbar. Fixed by defining explicit `grid-template-rows: repeat(4, minmax(0, 1fr))` + `grid-template-columns: repeat(7, minmax(0, 1fr))`, dropping cell aspect-ratio, and adding `min-width: 0; min-height: 0;` on grid and cells. A brief experiment to swap the grid for a real site-plan JPG (`vpd-mapa-lp.jpg`) was reverted — client preferred the abstract schematic.

## Running the project

```bash
pnpm install         # once
pnpm dev             # http://localhost:4321
pnpm build           # writes to dist/
pnpm preview         # serves dist/
pnpm lint            # editorial + links (links non-blocking in CI)
pnpm lint:weight     # per-page budget check against dist/
```

Dev server uses Claude Preview when available — `.claude/launch.json` config in the repo root works with VS Code + Claude Preview MCP. See also the vault's `/Users/kindl/kindl-vault/.claude/launch.json` for the `osa-web` entry used from sessions running in the vault.

## Editorial rulebook

Enforced by `scripts/lint-editorial.mjs`. Violations fail the build. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full table.

**Active rules as of v8** (typographic rules were lifted per client direction — authors own that call):

- No passive voice (`je realizováno`, `je zajišťováno`, `snaha o`).
- No legalese (`ve smyslu §`).
- No marketing hype (`úžasný`, `neuvěřitelný`, `revoluční`, `zásadní význam`, `klíčový moment`).
- Ellipsis `…` reserved for the `Pomáháme tvořit…` motto and one Kreditní systém paragraph.

Em-dash (`—`), en-dash (`–`), and `!` in body are **allowed** now. The sync script still auto-sanitizes smart characters from Google Docs (autocorrect noise), but handcrafted MDX can use them freely.

## Contact points

- Client organization: Občanské sdružení Alternativa II, z.s. (OSA II, OSA2).
- Předseda: Marek Semerád.
- Místopředseda: Štěpán Říha.
- Legal identifiers + bank accounts: `src/content/org/identity.json`.

## Deploy checklist (what's still left before the client-facing launch)

1. **Reconcile VPD figures with Marek.** Banner on landing + VPD page uses vault numbers (IRR 78 %, ROI 141 %) in mustard `.draft` wrappers. Aktualita body uses PDF numbers (IRR 59 %, ROI 151 %). Pick one truth, update both, strip the draft wrappers.
2. **Replace the aktualita hero placeholder.** `public/images/aktuality/vpd-klecany.jpg` is the courtyard photo the client sent as a chat upload. Swap for the final rendering of Horní kasárna when VPD Klecany s.r.o. provides one.
3. **Populate `public/dokumenty/*.pdf`** so the DocumentList links resolve (currently 404).
4. **DNS flip to osa2.cz.** In `astro.config.mjs` change `site: 'https://osa2.cz'`, remove `base`. In `src/styles/tokens.css` find-replace `/osa-web/fonts/` → `/fonts/`. Set up the custom domain in repo Settings → Pages (or migrate to Cloudflare Pages if preferred). Update `public/_redirects` if Screaming Frog surfaces additional hot URLs.
5. **Analytics decision** (post-launch). Plausible or GoatCounter if anything.

The repo is live; Drive sync is live; the site builds and deploys on every push to master. Nothing on the technical side blocks launch.
