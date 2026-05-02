# Drive sync: runbook pro aktivaci (Kindl)

Tvoje technická cesta k zapnutí pipeline pro synchronizaci aktualit z Google Dokumentů do webu. Klientský flow (psaní článku v Docs) popisuje [APPS_SCRIPT.md](./APPS_SCRIPT.md) a je určen pro Marka. Tenhle dokument je pro tebe a popisuje všechno, co musí proběhnout **před tím**, než se Marek vůbec dozví, že nějaký Apps Script existuje.

Čas celkem: 60-90 minut, pokud to jde hladce.

## Čtyři rozhodnutí, která ovlivní nastavení

Nemusíš je rozhodnout teď. První fáze (service account) je stejná v obou variantách. Ale do Fáze 2 je potřebuješ mít jasné.

| Rozhodnutí | Varianta A (doporučeno) | Varianta B |
|---|---|---|
| **1. Google Workspace vs osobní Gmail** | Workspace + Shared Drive: sharing se service accountem přežije změnu vlastníka složky | Personal Gmail + My Drive: funguje, ale ACL je křehčí |
| **2. Frekvence publikování/měsíc** | ≤ 5 článků: stávající 30min cron stačí | ≥ 20: cron na 5min, nebo onChange trigger |
| **3. PR review policy** | První 3 měsíce ruční review (Kindl pak Marek) | Auto-merge po zeleném CI (rizikovější) |
| **4. Hero image policy** | Strict: každý článek musí mít obrázek, jinak sync failne | Fallback: generická OSA monochrome placeholder |

Tvůj email `antonin@kindl.work` vypadá na Workspace doménu, takže Varianta A je defaultní volba. Zbytek runbooku předpokládá Workspace; kde se to liší, je to vyznačeno.

## Fáze 1 — Service account (ty, ~15 min)

Předpokládaný stav na začátku této fáze: projekt `osa-aktuality-sync` v Google Cloud existuje, Drive API a Docs API jsou povolené (oboje z **APIs & Services → Library**, pak vyhledat a **Enable**; pokud je hotovo, vidíš je v **APIs & Services → Enabled APIs & services**).

### 1.1 Vytvoření service accountu

1. Levé menu → **IAM & Admin** → **Service Accounts** (nebo vlevo přímo šesté od spodu v tvém screenshotu).
2. Horní tlačítko **+ Create Service Account**.
3. Vyplň:
   - **Service account name:** `osa-aktuality`
   - **Service account ID:** auto-vyplní se na `osa-aktuality` (nech)
   - **Description:** `Tech account for Drive/Docs API - aktuality sync from Drive folder to GitHub repo`
4. **Create and Continue**.
5. Krok "Grant this service account access to project" — **přeskoč** bez přidávání role. Klikni **Continue**. SA nepotřebuje žádnou projektovou IAM roli; Drive přístup se řeší per-folder přes sharing.
6. Krok "Grant users access to this service account" — taky přeskoč. Klikni **Done**.

Ověření: v seznamu service accountů vidíš `osa-aktuality@osa-aktuality-sync.iam.gserviceaccount.com`. Tenhle e-mail si někam zkopíruj, budeš ho potřebovat ve Fázi 2.

### 1.2 Stažení JSON klíče

1. V seznamu klikni na e-mail nově vytvořeného SA.
2. Záložka **Keys**.
3. **Add Key** → **Create new key** → typ **JSON** → **Create**.
4. Prohlížeč stáhne soubor `osa-aktuality-sync-<hash>.json`. Ten je citlivý — zachází se s ním jako s privátním klíčem.

Uložení: doporučuju lokálně do `~/.local/share/osa-aktuality/service-account.json` (mimo git repo). Nikdy necommituj do repa; `.gitignore` sice `.env` filtruje, ale JSON klíč je čitelný jinak pojmenovaný a omylem se do PRka dostat může.

### 1.3 Ověření JSON klíče

```bash
jq -r .client_email ~/Downloads/osa-aktuality-sync-*.json
```

Má vrátit `osa-aktuality@osa-aktuality-sync.iam.gserviceaccount.com`. Pokud ano, klíč je validní JSON a obsahuje správný účet.

## Fáze 2 — Sdílená Drive složka (ty, ~5 min)

### 2.1 Vytvoření složky

**Workspace + Shared Drive (doporučeno):**

1. drive.google.com → levé menu **Shared drives** → **+ New shared drive**.
2. Název: `OSA Aktuality`.
3. Dovnitř: **+ New** → **Folder** → jeden podaresář, nebo rovnou uklid nahoru. Součástí Shared Drive je automaticky celá organizace; sharing service accountu se dává per-drive, ne per-folder.

**Personal Gmail + My Drive (pokud nemáš Workspace):**

1. drive.google.com → **+ New** → **Folder** → `OSA Aktuality`.

### 2.2 Share se service accountem

1. Klik pravým tlačítkem na složku → **Share**.
2. Do pole "Add people and groups" vlož e-mail service accountu (z Fáze 1.1): `osa-aktuality@osa-aktuality-sync.iam.gserviceaccount.com`
3. Role: **Editor** (Viewer nestačí, pipeline potřebuje i psát history metadata; Commenter/Content manager taky nefunguje).
4. **Odškrtni** "Notify people" — service account nemá inbox, jen by to zbytečně selhalo.
5. **Send** (i když "Send" je zavádějící label; bez notifikace se reálně nic neposílá).

### 2.3 Získání Drive Folder ID

Otevři složku v prohlížeči. URL má tvar:

```
https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ
                                        └───────── tohle je Folder ID ─┘
```

Zkopíruj si ten řetězec. V Shared Drive je URL trochu jiné (`/drive/u/0/folders/...`), ale ID je stále mezi `/folders/` a případným dalším `/` nebo query stringem.

## Fáze 3 — GitHub secrets (ty, ~2 min)

Repo už existuje na `https://github.com/keiaiendiel/osa-web` z předchozí session. Teď do něj přidáme secrets:

```bash
# V rootu repa:
cd "/Users/kindl/Work/_2026/02 OSA/11 WWW/osa-web"

# GOOGLE_SERVICE_ACCOUNT: obsah celého JSON klíče
gh secret set GOOGLE_SERVICE_ACCOUNT < ~/Downloads/osa-aktuality-sync-*.json

# DRIVE_FOLDER_ID: ID z Fáze 2.3 (vloží se interaktivně)
gh secret set DRIVE_FOLDER_ID
# (paste ID, Enter)
```

Ověření: `gh secret list` musí zobrazit oba secrets (obsah nejde vylovit, je to jen existence check).

## Fáze 4 — Smoke test pipeline (ty, ~5 min)

Cíl: ověřit, že GitHub Action dokáže přečíst Drive složku, stáhnout Docs, vygenerovat MDX a otevřít PR. Bez toho, aby jsi už měl Apps Script v klientově účtu.

### 4.1 Testovací Google Doc

Ve sdílené složce `OSA Aktuality`:

1. **+ New** → **Google Docs**.
2. Nadpis dokumentu (ne obsah, samotný title bar vlevo nahoře): `Test sync smoke` (nadpis bude později titulek článku).
3. Menu **File** → **Document details** (v novém Docs UI někdy **File** → **Properties**) → záložka **Description**. Do pole "Description" vlož:

    ```
    lead: Toto je testovací lead pro smoke test synchronizace. Jakmile se PR objeví a mergne se, smaz ho. Délka leadu musí být mezi 40 a 240 znaky.
    date: 2026-04-21
    draft: false
    ```

4. V těle dokumentu napiš dva odstavce běžného textu (bez em-dashů, bez vykřičníků, bez superlativů — editorial linter by jinak spadl).
5. Vlož obrázek: menu **Insert** → **Image** → **Upload from computer** → jakýkoliv small JPG/PNG. Pipeline stáhne první inline obrázek jako hero.
6. Docs ukládá automaticky.

### 4.2 Manuální spuštění workflow

```bash
gh workflow run sync-aktuality.yml --repo keiaiendiel/osa-web
# Počkej ~5-10 sekund, pak:
gh run watch --repo keiaiendiel/osa-web
```

Co má v logu projít:
1. `pnpm install` + `pnpm add googleapis sharp` (sync-only deps)
2. `node scripts/sync-drive-aktuality.mjs` — stáhne Doc, exportuje Markdown, stáhne obrázek, resizne, napíše MDX
3. Diff detected → `pnpm build` → `pnpm lint:editorial`
4. Peter-Evans Action otevře PR s title `Aktuality: synced from Drive`, branch `aktuality/sync`

Pokud jakákoli z těchto kroků selže, logy jsou ve `gh run view --log-failed`. Typická selhání a co s nimi:

- **"Could not find service account credentials"** — špatně uložený `GOOGLE_SERVICE_ACCOUNT` secret. Vyzkoušej `gh secret delete GOOGLE_SERVICE_ACCOUNT && gh secret set GOOGLE_SERVICE_ACCOUNT < path/to/json`.
- **"403 The user does not have sufficient permissions"** — service account nedostal Editor role na Drive folder. Zpět do Fáze 2.2.
- **"404 File not found"** — `DRIVE_FOLDER_ID` je špatně; zkontroluj URL znovu.
- **Editorial lint fail** — v Docs máš em-dash nebo vykřičník v textu. Oprav v Docs a spusť znovu.

### 4.3 Úklid po smoke testu

Když PR dorazí a vypadá rozumně:

1. **Merge** PR (aby se ověřilo, že i build při merge projde).
2. Na živém webu https://keiaiendiel.github.io/osa-web/aktuality/test-sync-smoke/ ho zkontroluj (Pages se rebuildne za ~1-2 min).
3. **Smaž** MDX: lokálně `rm src/content/aktuality/test-sync-smoke.mdx` + `public/images/aktuality/test-sync-smoke.*` → commit → push.
4. **Smaž** testovací Google Doc v Drive (jinak při příštím syncu zase vyskočí PR).

## Fáze 5 — Apps Script (skip)

Apps Script by přidal tlačítko "Publikovat teď" v Drive, které signál pošle okamžitě. Protože cron běží každých 30 min a to je pro OSA více než dost, tahle fáze se neinstaluje. Pokud by v budoucnu bylo potřeba publikovat rychleji než za půl hodiny, postup najdeš v `APPS_SCRIPT.md` §3.

## Fáze 6 — End-to-end s reálným obsahem (~10 min)

1. Napiš (ideálně Marek, ale můžeš i ty pro test) krátký skutečný článek do sdílené Drive složky podle [TEMPLATE_ARTICLE.md](./TEMPLATE_ARTICLE.md) nebo šablony [templates/sablona-clanku.docx](./templates/sablona-clanku.docx).
2. Buď počkej 30 min na cron, nebo v repu spusť `gh workflow run sync-aktuality.yml --repo keiaiendiel/osa-web` pro okamžitý běh.
3. PR přijde na GitHub. Merge → Pages rebuildnou → článek je na `https://keiaiendiel.github.io/osa-web/aktuality/<slug>/`.
4. Otevři live URL. Zkontroluj hero, lead, body, metadata, případně galerii pod článkem, pokud Doc obsahoval víc obrázků.

## Fáze 7 — Chaos test (volitelné, ~5 min)

- **Žádný obrázek v Docs** → pipeline napíše MDX s placeholder path; článek bude mít rozbitý hero. Oprav doplněním obrázku v Docs nebo ručně uprav frontmatter v PR.
- **Idempotence** → trigger dvakrát po sobě bez změny obsahu → druhý běh končí `No content changes; nothing to commit.` bez otevření PR.
- **`draft: true`** v Docs properties → MDX se synchne, stránka se na webu neukáže (filtr v `src/pages/aktuality/index.astro` ji vynechá).
- **Validace frontmatter** (title pod 10 znaků, lead pod 40 znaků): sync ho automaticky přepne na `draft: true` a zaloguje konkrétní důvody. Oprav v Docs a znovu sync.
- **Víc obrázků v jednom Docs** → první obrázek se stane hero, ostatní se uloží jako `<slug>-2.jpg`, `<slug>-3.jpg`, ... a v článku se vykreslí galerie na spodu (stejný layout jako galerie na landing page).

## Jak to celé vypnout

- GitHub repo Settings → **Actions** → **Workflows** → `sync-aktuality.yml` → **⋯ menu** → **Disable workflow**. MDX soubory v repu zůstanou. Revert: Enable.

## Co monitorovat po spuštění

- První týden: občas mrkni na `gh run list --workflow=sync-aktuality.yml --repo keiaiendiel/osa-web`. Cron běží každých 30 min; failed runs vidíš v Actions UI.
- GitHub Actions free tier pro public repo je unlimited minut. Nic tě tady neomezí.
