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

## Current state

**Live:** https://keiaiendiel.github.io/osa-web/. Repo public at https://github.com/keiaiendiel/osa-web. Pushes to `master` auto-deploy via `.github/workflows/deploy-pages.yml` (~1–2 min). Site builds cleanly at 29 pages; editorial lint green; weight budget green on every page. Drive sync is live (see "Aktuality channel" below).

For per-version history (v1 → v9), read `git log` — `git log --oneline master` gives the editorial trail. Current shipped feature set is captured by the rest of this file (Repo layout, Design decisions, Aktuality channel, etc.). Production-blocking carry-overs are listed under **Known issues and open loops** below; don't duplicate them here.

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

Self-service editorial channel. Client-facing how-to: [docs/APPS_SCRIPT.md](./docs/APPS_SCRIPT.md). Original setup runbook archived at [docs/archive/DRIVE_SYNC_ACTIVATION.md](./docs/archive/DRIVE_SYNC_ACTIVATION.md).

- **Collection:** `aktuality`, MDX glob in `src/content/aktuality/`, Zod schema with title (10-120), lead (40-240), date, hero path, optional tags/author/hero_alt/draft, and optional `gallery: string[]` for articles with more than one image.
- **Pages:** `/aktuality/` grid (sorted date DESC) and `/aktuality/<slug>/` detail with hero, body, tags, "Zpět na aktuality", up to three related cards, and an inline `<Gallery title={null}>` when the article has extra images. Detail emits Article JSON-LD.
- **Detail hero:** VPD-style dark frame. `<Header variant="dark" />` fuses into a dark `<section>` with the hero image as a full-bleed darkened background (filter brightness 0.45 + gradient scrim). Crumbs + eyebrow + H1 + lead left-aligned.
- **ArticleCard.astro:** ProjectCard-style top/bottom contract. Mirrors the editorial hover vocabulary.
- **Drive sync pipeline (live):** [scripts/sync-drive-aktuality.mjs](./scripts/sync-drive-aktuality.mjs) pulls every Google Doc from the shared Drive folder, exports Markdown, strips base64 data-URL images (Docs export embeds them inline in the reference-style), iteratively compresses every inline image to ≤700 KB via sharp (Q80 → Q45, then shrink width 1400 → 900 px), walks EVERY image (first → hero, rest → `<slug>-2.jpg`, `-3.jpg`, ... stored on the `gallery` frontmatter array), validates title/lead/date against Zod schema (fixable issues auto-fix; unfixable mark `draft: true` so the article still lands and is hidden). Normalizes smart characters so the editorial linter stays green.
- **Workflow:** [.github/workflows/sync-aktuality.yml](./.github/workflows/sync-aktuality.yml) runs on `workflow_dispatch` plus 30 min cron. Commits **directly to master** (no PR gate) after build + editorial lint pass. The transient `pnpm add --save-dev googleapis sharp` edit is reverted with `git checkout HEAD -- package.json pnpm-lock.yaml` so it never reaches the commit. Apps Script trigger was considered and skipped; the cron is enough.

## Drive sync activation — DONE

Service account `osa-aktuality@osa-aktuality-sync.iam.gserviceaccount.com` in GCP project `osa-aktuality-sync`. Drive folder `OSA Aktuality` shared with the SA as Editor. Repo secrets `GOOGLE_SERVICE_ACCOUNT` + `DRIVE_FOLDER_ID` set. End-to-end verified: client writes Doc → cron (or `gh workflow run sync-aktuality.yml`) → MDX + hero + gallery land in master → Pages rebuilds. Setup runbook archived at [docs/archive/DRIVE_SYNC_ACTIVATION.md](./docs/archive/DRIVE_SYNC_ACTIVATION.md).

## SEO infrastructure

- **Sitemap:** `@astrojs/sitemap` writes `dist/sitemap-index.xml` + `dist/sitemap-0.xml`. 404 excluded via filter.
- **Per-page metadata:** `Base.astro` takes `title`, `description`, `ogImage`, `ogType` props. Derives canonical from `Astro.site` + `Astro.url.pathname`. Renders OG tags, Twitter Card, manifest link, sitemap hint.
- **Organization JSON-LD:** `Base.astro` fetches `getEntry('org', 'identity')` and emits a schema.org `NGO` payload on every page (name, IČO, DIČ, address with Bubeneč, foundingDate from ARES, members with jobTitle).
- **Static OG image:** `public/og/default.png` (32 KB, 1200x630) generated from `public/og/default.svg` via rsvg-convert. Each page can override with `ogImage`.
- **404 page:** [src/pages/404.astro](./src/pages/404.astro). Swiss editorial layout matching the rest of the site.
- **Redirects:** [public/_redirects](./public/_redirects) maps the seven alternativa2.info top-level pages (kdo-jsme, nase-spolkove-projekty, spoluprace, clenstvi-ve-spolku, spolkova-galerie, kontakty, index) with 301s plus trailing-slash variants.
- **Manifest:** [public/manifest.webmanifest](./public/manifest.webmanifest) for PWA add-to-homescreen on mobile.

## Fact-check

`src/content/org/identity.json` carries ARES-verified founding date (2006-03-14) and full Bubeneč address; Zod schema requires `founded: YYYY-MM-DD`. Original 60-claim verification checklist archived at [docs/archive/FACTCHECK.md](./docs/archive/FACTCHECK.md).

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

## Running the project

```bash
pnpm install         # once
pnpm dev             # http://localhost:4321/osa-web/
pnpm build           # writes to dist/
pnpm preview         # serves dist/
pnpm lint            # editorial + links (links non-blocking in CI)
pnpm lint:weight     # per-page budget check against dist/
```

The base path is `/osa-web/` while we're on github.io; URLs in dev and prod are
identical thanks to `withBase()` (see `src/utils/url.ts`). When DNS flips to
`osa2.cz`, drop `base: '/osa-web/'` from `astro.config.mjs` and find-replace
`/osa-web/fonts/` → `/fonts/` in `src/styles/tokens.css`.

### Dev server via Claude Preview MCP

`.claude/launch.json` ships a server entry named `osa-web`. From a Claude Code
session:

```
preview_start name="osa-web"
```

You'll get a `serverId`; subsequent `preview_eval`, `preview_screenshot`,
`preview_click` calls take that id. The same launch.json works with VS Code
+ Claude Preview extension if you prefer GUI usage.

See also `/Users/kindl/kindl-vault/.claude/launch.json` for the same entry
used from vault-rooted sessions.

### Push flow (manual)

```bash
git status
git diff --stat               # quick sanity: what changed?
git add <specific-files>      # avoid `git add .` — keeps stray docs/scripts out
git commit -m "feat(scope): brief one-line summary"
git push origin master
```

Push to `master` → GitHub Actions runs `.github/workflows/deploy-pages.yml`
→ static dist published on Pages within ~1–2 min. Watch the build at
**GitHub → Actions** if something feels off.

For larger commits (multiple subsystems), use a HEREDOC for the message body
and keep the title under 70 chars. Example pattern in repo log: see commits
`8f02de6` (v8.3) or `aabbd68` (v9 hero scrub). Co-authored-by trailer is
optional but appreciated.

### Aktuality content sync (auto)

A 30-min cron in `.github/workflows/sync-aktuality.yml` runs
`scripts/sync-drive-aktuality.mjs`. The pipeline pulls Google Docs from the
shared "OSA Aktuality" Drive folder, exports MDX, compresses inline images
(sharp, ≤700 KB), validates frontmatter against Zod, and commits straight
to master. Editorial lint runs in CI; invalid posts get `draft: true` so
they still land but stay hidden.

Manual run: GitHub → Actions → "Sync aktuality" → Run workflow. Or local:
`gh workflow run sync-aktuality.yml`.

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
