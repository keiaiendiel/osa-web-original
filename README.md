# osa-web

Veřejná webová prezentace **Občanského sdružení Alternativa II, z.s.** (OSA).
Statický web postavený na Astro 6, ručně psané CSS, content collections,
nasazený na GitHub Pages. Cílová doména **osa2.cz**, dočasně běží na
[https://keiaiendiel.github.io/osa-web/](https://keiaiendiel.github.io/osa-web/).

---

## Rychlý start

```bash
# 1. Klonování + instalace
git clone https://github.com/keiaiendiel/osa-web.git
cd osa-web
pnpm install

# 2. Lokální dev server
pnpm dev
# → http://localhost:4321/osa-web/

# 3. Produkční build do dist/
pnpm build
pnpm preview            # serve dist/ na portu 4321

# 4. Linty
pnpm lint               # editorial + link lint
pnpm lint:editorial     # samostatně pravidla psaní
pnpm lint:weight        # per-page weight budget
```

> **pnpm.** Repo používá pnpm. Pokud nemáš nainstalované, `corepack enable` ho aktivuje skrze `packageManager` field v `package.json`. Alternativně `npm i -g pnpm`.

---

## Lokální preview přes Claude Preview MCP

V `.claude/launch.json` je nakonfigurovaný server `osa-web`. V Claude Code stačí:

```
preview_start name="osa-web"
```

Server poběží na `http://localhost:4321/osa-web/`. Změny v `src/` se hot-reloadují, content collections (`src/content/*.json`, MDX) se reloadují při uložení (Astro občas potřebuje restart, pokud mění schéma).

Pro běžný browser preview bez Claude Code:

```bash
pnpm dev
# → http://localhost:4321/osa-web/
```

---

## Deploy / push na git

Web automaticky redeployuje na GitHub Pages při každém pushi na `master`.

```bash
# Standardní push flow
git status
git add <konkrétní soubory>          # ne git add . — ať nezapomeneme něco
git commit -m "feat: krátký popis"
git push origin master

# CI pipeline → GitHub Pages
# .github/workflows/deploy-pages.yml staví dist/ a publikuje na gh-pages
# Trvá ~1–2 minuty od pushe k deployi.
```

Status nasazení a logy: **GitHub → Actions** záložka v repu.

### DNS přepnutí na osa2.cz

Až budeme přepínat doménu:

1. V `astro.config.mjs` změnit `site: 'https://osa2.cz'`, **odstranit** `base: '/osa-web/'`.
2. V `src/styles/tokens.css` find-replace `/osa-web/fonts/` → `/fonts/`.
3. V repo Settings → Pages přidat custom domain `osa2.cz`.
4. Ověřit redirecty v `public/_redirects` (kotví URL z původního alternativa2.info).
5. `withBase()` calls zůstávají funkční (po odstranění base se chovají jako no-op).

---

## Stack

| Vrstva       | Volba                                                 |
|--------------|-------------------------------------------------------|
| Framework    | [Astro 6](https://astro.build), output: `static`      |
| Jazyk        | TypeScript strict                                     |
| Content      | Astro Content Collections (MDX + JSON, Zod schemas)   |
| Styling      | Vanilla CSS (žádný Tailwind, žádný CSS-in-JS)         |
| Fonty        | Self-hosted Atyp Special WOFF2 v `public/fonts/`      |
| Client JS    | ~3 kB inline `<script is:inline>` islands             |
| Deploy       | GitHub Pages → osa2.cz (po DNS flip)                  |

---

## Projektová struktura

```
osa-web/
├── .github/workflows/
│   ├── deploy-pages.yml        Build + deploy na GH Pages
│   ├── sync-aktuality.yml      30min cron — Drive → MDX
│   └── ci.yml                  Lint + build na PR
├── public/
│   ├── fonts/                  Atyp Special WOFF2 (Medium, Bold, Italic)
│   ├── graphics/               Pattern SVG, OSA glyph
│   ├── images/
│   │   ├── hero-earth/         84 frames pro hero scrub (1280×720, ~1 MB)
│   │   ├── areal/              Mapa + 4 vizualizace SH Klecany
│   │   └── aktuality/          Hero + gallery obrázky pro aktuality
│   ├── logo/                   OSA wordmark + glyph SVG
│   ├── og/                     OG image fallback
│   └── _redirects              301-mapy pro alternativa2.info
├── scripts/
│   ├── lint-editorial.mjs      Voice-level pravidla psaní
│   ├── lint-links.mjs          HEAD-check externích URL
│   ├── lint-weight.mjs         Per-page eager budget (max 250 kB)
│   └── sync-drive-aktuality.mjs Drive → MDX exporter
├── src/
│   ├── content.config.ts       Zod schemas pro všechny collections
│   ├── content/
│   │   ├── sub_projects/*.mdx          17 projektů
│   │   ├── values/axioms.json          16 spolkových hodnot
│   │   ├── pillars/index.json          3 pilíře hospodaření
│   │   ├── goals/index.json            3 horizonty cílů (kr/st/dl)
│   │   ├── org/identity.json           ICO, DIČ, kontakt, adresa
│   │   ├── dokumenty/*.json            PDF metadata
│   │   └── aktuality/*.mdx             Aktuality články
│   ├── components/
│   │   ├── Header.astro                Sticky nav + Přihlásit button
│   │   ├── Footer.astro                Patička s navigací
│   │   ├── Hero.astro                  Sticky-pin scroll-scrub video hero
│   │   ├── Rozcestnik.astro            8 projektů na úvodu
│   │   ├── ValuesMatrix.astro          16 hodnot, 4×4 accordion
│   │   ├── ManifestoStrip.astro        3 pilíře (poslání + ekonomický model)
│   │   ├── ProjectCard.astro           Karta projektu (8 accent barev)
│   │   ├── ArticleCard.astro           Karta aktuality
│   │   ├── AktualityRecap.astro        3 nejnovější aktuality na úvodu
│   │   ├── Gallery.astro               4×2 fotogalerie + lightbox
│   │   ├── FilterBar.astro             Filtr (skrytý na /projekty/)
│   │   ├── OrgChart.astro              Org struktura (3 patra, monochrome)
│   │   ├── GoalsHorizons.astro         3 sloupce cílů
│   │   ├── InvestmentHero.astro        VPD investiční výzva
│   │   ├── SectionBlock.astro          Číslovaná sekce s expand
│   │   ├── DocumentList.astro          Seznam PDF dokumentů
│   │   ├── InlineCTA.astro             Underline + chevron CTA
│   │   ├── OsaGlyph.astro              SVG OSA trojúhelník
│   │   ├── SVGPattern.astro            Diagonální pattern (footer/dark)
│   │   ├── GraphicHeader.astro         Full-bleed strip (zatím nepoužito)
│   │   └── RevealOnScroll.astro        IntersectionObserver pro data-reveal
│   ├── layouts/
│   │   ├── Base.astro                  HTML head, SEO, JSON-LD, base classes
│   │   └── LongformPage.astro          Editorial layout pro historie/metodologie
│   ├── pages/
│   │   ├── index.astro                 Úvod
│   │   ├── o-spolku/{index,historie,metodologie,dokumenty}.astro
│   │   ├── projekty/
│   │   │   ├── index.astro             Mřížka projektů
│   │   │   ├── [slug].astro            Stub page pro projekty bez external_url
│   │   │   └── vpd.astro               Bespoke VPD detail
│   │   ├── aktuality/{index,[slug]}.astro
│   │   ├── zapojte-se/index.astro      6 cest spolupráce
│   │   ├── clenstvi/index.astro        Členství detail + přihláška
│   │   ├── portal/index.astro          Členský portál (login + dashboard prototyp)
│   │   ├── kontakty/index.astro        Kontakt
│   │   └── 404.astro
│   ├── styles/
│   │   ├── tokens.css                  CSS custom properties + @font-face
│   │   ├── kit.css                     Utility classes (.btn, .tag, .container-*)
│   │   └── motion.css                  Motion rules (transitions, easings)
│   └── utils/url.ts                    `withBase(path)` helper
├── astro.config.mjs                    Site URL, base, integrations
└── package.json                        pnpm + scripts
```

---

## Content collections — jak přidat

### Sub-projekt
Vytvoř `src/content/sub_projects/<slug>.mdx`:

```mdx
---
name: Můj nový projekt
description: 30-160 znaků, jeden odstavec o projektu.
accent: coral                # red | coral | mustard | olive | forest | teal | blue | plum
year_from: 2026
status: pripravovany         # realizovany | pripravovany | ve-spanku | draft
relationship: pilotni        # autonomni | pilotni | ve-spanku
topic: kultura               # urbanismus | kultura | sport | media | vzdelavani | tvorba | komunita | larp
external_url: https://mujprojekt.cz   # vynechat pokud projekt nemá vlastní URL
featured: false
order: 100
---

Volný markdown obsah, pokud projekt má dedikovanou stránku.
```

Schéma se ověřuje při buildu (Zod). Špatný `accent` nebo `topic` build okamžitě shodí.

### Aktualita
Vytvoř `src/content/aktuality/<slug>.mdx`:

```mdx
---
title: "Krátký výstižný titulek (10–120 znaků)"
lead: "Lead odstavec, 40–240 znaků. Pomáhá si představit, o čem článek je."
date: 2026-04-30
hero: "/images/aktuality/<slug>/hero.jpg"
hero_alt: "Popis hero obrázku, 3–180 znaků."
author: "OSA II, z.s."
tags: ["výletná", "klecany"]
gallery:
  - "/images/aktuality/<slug>/01.jpg"
  - "/images/aktuality/<slug>/02.jpg"
draft: false
---

## Markdown obsah

Texty v markdownu, sekce přes `##`. **Bold**, *italic*, [odkazy](https://example.com).
```

Hero obrázek dej do `public/images/aktuality/<slug>/hero.jpg`. Galerie do stejné složky pod očíslovanými soubory.

### Cíle a záměry (goals)
`src/content/goals/index.json` — 3 horizonty (krátko/středně/dlouhodobé). Položky podporují inline HTML (anchory na projekty):

```json
{
  "id": "short",
  "horizon": "short",
  "label": "Krátkodobé",
  "order": 1,
  "items": [
    "Dokončit aplikaci pro <a href=\"/projekty/kreditni-system/\">Kreditní systém OSA II</a>."
  ]
}
```

### Hodnoty / Pilíře / Org / Dokumenty
- `src/content/values/axioms.json` — 16 hodnot s `id`, `name`, `gloss`, `order`
- `src/content/pillars/index.json` — 3 pilíře hospodaření
- `src/content/org/identity.json` — IČO, DIČ, kontakty, adresy, předseda, místopředseda
- `src/content/dokumenty/*.json` — PDF dokumenty

---

## Hero — image-sequence scroll-scrub

Úvodní hero používá Apple-style scrubbing video animaci. 84 JPG framů (`public/images/hero-earth/frame-NNN.jpg`) namapovaných na scroll progress přes sticky pin pattern.

**Pin wrapper** (`.osa-hero-pin`) má `height: 200vh`. **Sticky inner** (`.osa-hero`) je `position: sticky; top: 0; height: 100vh`. Během prvních ~100vh scrollu se hero přilepí, video se scrubbuje, pak se pustí a zbytek stránky pokračuje.

**Mapping:**
- `scrollProgress = scrolled / (pin.height − inner.height)` clamped 0..1
- `videoProgress = min(1, scrollProgress / 0.9)` — video doběhne v 90 % scroll range
- `frame = round(videoProgress × 83)`
- `--scroll-progress` CSS var na overlay řídí postupné stmavnutí Earth do siluety

**Reduced-motion:** statický frame-001, žádný scrub.

**Rozšíření videa:**
1. Nové frames vyextrahovat: `ffmpeg -i video.mov -vf "select='not(mod(n,3))',scale=1280:720" -q:v 6 public/images/hero-earth/frame-%03d.jpg`
2. Aktualizovat `FRAME_COUNT` v `src/components/Hero.astro` (řádek `const FRAME_COUNT = 84;`).

---

## Portal — členský portál (prototyp)

`/portal/` je čistý frontendový prototyp bez backendu:

- Po zadání identifikátoru (např. `35S`) + libovolného hesla se zobrazí dashboard
- Mock data jsou hardcodovaná v `src/pages/portal/index.astro` (`const member = {...}`, `const aktivity = [...]`)
- Refresh = reset (žádná perzistence, žádný localStorage)
- Po loginu se v hlavičce mění text "Přihlásit" na členské ID (data attribute swap)

Pro reálnou implementaci je potřeba doplnit auth backend a perzistenci.

---

## Editorial pravidla

Vynucuje `pnpm lint:editorial`. Voice-level rules (typografická pravidla už se nevynucují — em-dash, en-dash, `!` v tělech jsou OK):

- **Žádný passive voice** (`je realizováno`, `je zajišťováno`, `snaha o`)
- **Žádný legalese** (`ve smyslu §`)
- **Žádný marketingový hype** (`úžasný`, `neuvěřitelný`, `revoluční`, `zásadní význam`)
- **Ellipsis** (`…`) povolen pro `Pomáháme tvořit…` motto a další smysluplná použití

Detail: `scripts/lint-editorial.mjs` + `CONTRIBUTING.md`.

---

## Performance budget

`pnpm lint:weight` kontroluje per-page eager váhu. Aktuální stav (~80 kB landing, většina ostatních pod 50 kB).

Limity v `scripts/lint-weight.mjs`:

| Metrika                | Budget |
|------------------------|-------:|
| Eager total per page   | 250 KB |
| Fonty (site total)     | 110 KB |

---

## Driveový sync aktualit

Drive složka **OSA Aktuality** sdílena se service accountem. 30min cron (`.github/workflows/sync-aktuality.yml`) spouští `scripts/sync-drive-aktuality.mjs`, který:

1. Stáhne všechny Google Docs z Drive složky
2. Konvertuje na MDX
3. Komprimuje obrázky (sharp, max 700 KB každý)
4. Validuje frontmatter proti Zod schématu (auto-draft pokud invalidní)
5. Commituje přímo na master

Detail: `docs/DRIVE_SYNC_ACTIVATION.md` (operační runbook), `docs/APPS_SCRIPT.md` (klientský how-to).

---

## Užitečné skripty

```bash
pnpm dev                  # dev server
pnpm build                # produkce do dist/
pnpm preview              # serve dist/

pnpm lint                 # editorial + link lint
pnpm lint:editorial       # voice-level pravidla
pnpm lint:weight          # eager budget
pnpm lint:links           # HEAD-check externích URL

pnpm doc:content          # Python script — generuje content přehled (volitelné)
```

---

## Open loops

Viz **`CLAUDE.md`** sekce "Known issues and open loops" pro aktuální stav nedotažených věcí (placeholder PDFs, DNS flip, VPD finanční čísla, …).

---

## Kontakt

- **Maintainer / Maker:** Antonín Kindl ([a.kindl@osa2.cz](mailto:a.kindl@osa2.cz))
- **Předseda spolku:** Marek Semerád ([marek.semerad@osa2.cz](mailto:marek.semerad@osa2.cz))
- **Spolek:** info@osa2.cz, IČ 270 26 345
