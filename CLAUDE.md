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
| Client JS | One filter island (~900 B) + IntersectionObserver reveal observer (~400 B) |
| Deploy    | Not yet connected. Target: Cloudflare Pages |

## Current state (2026-04-20, after v5)

- 21 pages build cleanly, zero build errors
- All linters green: editorial, weight, links (timeouts tolerated)
- Homepage eager payload: 58 KB (target 400 KB). Zero JS in most pages.
- Font total: 100.8 KB (target 160 KB).
- No GitHub remote yet, no Cloudflare Pages yet. Local-only.
- Dev server via `pnpm dev`, launch config in `.claude/launch.json` for Claude Preview.

## Repo layout

```
osa-web/
├── .github/workflows/ci.yml      # GH Actions: lint + build + weight budget
├── public/
│   ├── favicon.{svg,ico} + apple-touch-icon.png   # generated from OSA-Logo-Black.svg
│   ├── fonts/*.woff2             # Atyp Special Medium, Bold, Italic (subsetted)
│   ├── graphics/graphic-asset-header_{1..6}.svg   # full-bleed motif strips
│   ├── images/*.jpg              # 10 gallery placeholders, downsampled
│   ├── logo/{OSA-Logo-Black,White,White-Full,osa-glyph}.svg
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

**ProjectCard layout contract.** `justify-content: space-between` pins `.project-card__top` (tag + name) to the top and `.project-card__bottom` (description + link) to the bottom. The gap between them is the single variable element — short descriptions leave more air, long ones compress it. Hover wipes a black panel up from the bottom via `clip-path` (no layout shift); title + tags + link go white, description goes K30.

**FilterBar is the only true client island.** One `<script is:inline>` inside a `DOMContentLoaded` listener. The inline approach failed during initial development because the script ran before the form element was parsed; wrapping in `DOMContentLoaded` fixed it. Don't refactor back.

**Scroll reveal via `[data-reveal]`.** `RevealOnScroll` component mounts one `IntersectionObserver` globally in `Base.astro`. Mark sections you want to animate with `data-reveal` (and optionally `data-reveal-delay="1|2|3"` for stagger).

**Graphic headers were simplified.** Earlier iteration tried thin tile-repeated bands (20–40 px) which felt weak; reverted to full-bleed strips (64 px) / bands (108 px) via the original SVGs. Only two on the homepage (around Values section). Light and dark variants auto-invert via `filter: invert(1)` on dark surfaces.

**Gallery is 4×2 uniform.** Earlier mixed-aspect dense-pack left empty slots at certain widths, which the client called out. Current grid is strictly 4×2, every cell 4:3 aspect, always packed.

**Investment Hero (Záměr VPD1) is in DRAFT mode.** Every financial figure is wrapped in `.osa-draft` with a mustard highlight. CTAs are `aria-disabled`. The same block appears on the homepage (`<InvestmentHero />`) and inside the VPD subpage (`#zamer-vpd1`). To activate: confirm figures with Marek Semerád, remove `.osa-draft` wrappers, drop `aria-disabled`, upload the real PDF to `public/dokumenty/Zamer_VPD1_zakladni_souhrn.pdf`.

## Content collections schema

Defined in `src/content.config.ts`:

- `subProjects` — glob `src/content/sub_projects/*.mdx`. Fields: `name`, `description` (30–160 chars), `accent` (8-color enum, fails build on bad value), `status` (realizovany/pripravovany/ve-spanku/draft), `relationship`, `topic` (8-enum: urbanismus/kultura/sport/media/vzdelavani/tvorba/komunita/larp), `external_url` (optional — if absent, card routes to `/projekty/<slug>/`), `featured`, `order`.
- `values` — file `src/content/values/axioms.json`. Each item needs `id`, `name`, `gloss`, `order` (1–16).
- `pillars` — file `src/content/pillars/index.json`. Each item needs `id`, `n` (zero-padded 2-digit string), `title`, `body`.
- `org` — file `src/content/org/identity.json`. Single keyed entry `identity`.
- `dokumenty` — glob `src/content/dokumenty/*.json`.

**Schema gotchas.** The `file()` loader requires either an array of items with `id` fields, or a top-level object keyed by id. The single `org.identity.json` uses the keyed form — don't flatten it back. Numbers (pillars `n`) must be strings to survive the `regex(/^\d{2}$/)` check.

## Known issues and open loops

- **VPD1 financial figures unconfirmed.** Every `83 327 m²`, `141 %`, `285 mil. Kč` is mustard-highlighted draft. Needs Marek Semerád sign-off before any public URL goes live with that block.
- **`public/_redirects` is a placeholder.** The real `alternativa2.info/*` → `osa2.cz/*` redirect map is Plan open question 2, still unwritten.
- **Dokumenty PDFs are stubs.** `src/content/dokumenty/*.json` references files at `/dokumenty/stanovy-osa-ii.pdf` etc., but `public/dokumenty/` isn't populated. The DocumentList will render but links 404.
- **Gas Town and DIY dílny dropped their `external_url`** because the placeholder URLs I seeded (`gastown.cz`, `diydilny.cz`) were dead during link lint. If the real domains come back, re-add `external_url:` to the MDX.
- **Junktown URL is slow** — link linter warns timeout. Not a hard fail.
- **Longform stubs.** `/o-spolku/historie/` and `/o-spolku/metodologie/` have placeholder content with an `<aside>` explaining the page is a stub. The board fills these post-launch.
- **No GitHub remote.** Local repo only. To publish: `gh repo create`, push, connect Cloudflare Pages.
- **No analytics.** v1 ships with zero tracking. Privacy-friendly counter (Plausible/GoatCounter) is a post-launch decision.
- **Atyp Special ligature question**, see the font note above. Client asked about this and the answer is "font doesn't contain the rule."

## Client-driven revisions (v1 → v5)

Each `v#` commit captures a round of feedback from the client. Reading them in order tells the story:

- **v1** (`feat(uvod)` + subsequent feat commits + `build(phase4)` + `docs(phase5)`) — original build per plan.
- **v2** — first feedback pass: new brand assets, Hero reworked, monochrome hover on cards, topic replaces relationship, 4x4 values with hover gloss, drop serif, reduced graphic headers, Gallery introduced.
- **v3** — Atyp Special everywhere (dropped Space Grotesk); smoother filter with clip-path; full-wordmark footer logo; `&nbsp;` on number+unit pairs; draft underline removed; cards shifted to gray default (a mistake, reverted in v4).
- **v4** — revert card hover to clean black-invert wipe via clip-path; add scroll-reveal observer; favicon generation; gallery bigger, frameless; footer logo 50% smaller; **full VPD project subpage** built from vault research (hero, stats, philosophy, three pillars, Výletná case study, Záměr VPD1, related projects).
- **v5** — ProjectCard top/bottom layout contract; Gallery 4x2 uniform; graphic headers reverted to full-bleed; VPD subpage gets full Záměr VPD1 investment block; VPD MDX confirmed without `external_url` so the card routes internally.

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

## Editorial rulebook (hard)

Enforced by `scripts/lint-editorial.mjs`. Violations fail the build. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full table.

No em/en dashes. No `!` in body copy. No passive voice (`je realizováno`, `snaha o`). No legalese (`ve smyslu §`). No marketing hype (`úžasný`, `neuvěřitelný`). Ellipsis `…` reserved for the `Pomáháme tvořit…` motto. Czech and Slovak diacritics must be correct.

## Contact points

- Client organization: Občanské sdružení Alternativa II, z.s. (OSA II, OSA2).
- Předseda: Marek Semerád.
- Místopředseda: Štěpán Říha.
- Legal identifiers + bank accounts: `src/content/org/identity.json`.

## Deploy checklist when ready

1. `gh repo create` for the repo, set branch protection on `main`.
2. Cloudflare Pages: connect Git, build command `pnpm build`, output `dist`, Node 22, no env vars.
3. DNS: `osa2.cz` apex + `www` → Cloudflare Pages `.pages.dev` alias.
4. Activate Investment Hero (see DRAFT notes above) if the VPD1 campaign is going live.
5. Populate `public/dokumenty/*.pdf` for the document list to work.
6. Write the `alternativa2.info/*` → `osa2.cz/*` redirect map in `public/_redirects`.
7. Publish.
