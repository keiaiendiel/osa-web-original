# OSA Web — Fact-check checklist

Před spuštěním na `osa2.cz` potřebujeme ověřit všechna tvrzení, která se na webu objevují. Tento dokument je **pracovní checklist** — rozděluje ~60 jednotlivých claimů podle kategorií, navrhuje zdroj pro každé ověření a má zaškrtávací pole pro postupné odškrtávání.

**Jak používat:**
- Každý claim má `[ ]` pole. Jakmile je ověřen nebo opraven, zaškrtni `[x]` a připiš datum + zdroj/verdikt.
- Commit po každé ověřené skupině se zprávou `fact-check: <skupina> — <verdikt>`.
- Fáze: **F1** = technicky ověřitelné agentem (ARES, katastr, HEAD check, transparentní účty). **F2** = potřebuje klienta nebo interní dokumenty. **F3** = potřebuje sněm nebo stanovy.

---

## Kategorie 1: Identifikátor spolku (F1 + F2)

Zdrojové soubory: `src/content/org/identity.json`, `src/components/Footer.astro`, `src/pages/kontakty/index.astro`

| # | Claim | Stav | Zdroj ověření | Poznámka |
|---|---|---|---|---|
| 1 | Název: Občanské sdružení Alternativa II, z.s. | [x] F1 OK | ARES | shoda 100 % |
| 2 | IČO: 270 26 345 (= 27026345) | [x] F1 OK | ARES | shoda |
| 3 | DIČ: CZ 270 26 345 | [x] F1 OK | ARES | shoda |
| 4 | Sídlo: Terronská 894/56, 160 00 Praha 6 | [ ] F1 FIX | ARES | **ARES uvádí + "Bubeneč"** — doplnit do identity.json |
| 5 | Spisová značka: L 16540, Městský soud v Praze | [x] F1 OK | ARES | shoda |
| 6 | Datum vzniku: 14. 3. 2006 | [ ] F1 ADD | ARES | **Chybí v identity.json** — přidat `founded` pole |
| 7 | Datová schránka: xen5zi3 | [x] F1 OK | ISDS / starý web | shoda (ARES detail nevrací) |
| 8 | Transparentní účet: 205 152 278 / 0300 | [ ] F1 | transparentni-ucty.cz, ČNB | ověřit, že účet je vedený a transparentní |
| 9 | Účet ostatní: 227 601 142 / 0300 | [ ] F1 | bankovní výpis / klient | ověřit, že je OSA II vlastníkem |
| 10 | Kancelář: Zúžená 2400/1a, 169 00 Praha 6 - Břevnov | [ ] F2 | klient | potvrdit PSČ a platnost |
| 11 | Předseda: Marek Semerád | [ ] F1 | justice.cz spis L 16540 | verbatim z Veřejného rejstříku, + datum nástupu |
| 12 | Místopředseda: Štěpán Říha | [ ] F1 | justice.cz spis L 16540 | tamtéž |
| 13 | Email: info@osa2.cz | [ ] F2 | klient | funkční schránka? MX záznam přesměrovaný? |
| 14 | Tel: +420 777 786 476 | [ ] F2 | klient | platnost ověřit |
| 15 | Marek email: marek.semerad@osa2.cz | [ ] F2 | klient | tamtéž |
| 16 | Marek tel: +420 602 849 342 | [ ] F2 | klient | tamtéž |
| 17 | Štěpán email: stepan.riha@osa2.cz | [ ] F2 | klient | tamtéž |
| 18 | Štěpán tel: +420 725 307 798 | [ ] F2 | klient | tamtéž |

---

## Kategorie 2: VPD1 investiční čísla (F2 — KRITICKÁ BLOKUJE LAUNCH)

Zdrojové soubory: `src/components/InvestmentHero.astro`, `src/pages/projekty/vpd.astro`

Všechna čísla jsou teď v `.osa-draft` mustard-highlighted blocích. Před live pushem buď potvrdit a odstranit draft styling, nebo celý `<InvestmentHero />` skrýt.

| # | Claim | Stav | Zdroj ověření | Poznámka |
|---|---|---|---|---|
| 19 | Plocha areálu: 83 327 m² | [ ] F2 | znalecký posudek / katastr | Marek Semerád sign-off |
| 20 | Vzdálenost od Prahy: 12 km | [ ] F2 | mapy / GPS | Marek |
| 21 | Nové byty (ČPP): 88 946 m² | [ ] F2 | projektová dokumentace | Marek |
| 22 | Počet jednotek: ~1 572 | [ ] F2 | projektová dokumentace | Marek |
| 23 | Investice hub: ~285 mil. Kč | [ ] F2 | finanční model | Marek |
| 24 | ROI hub: 141 % | [ ] F2 | finanční model | Marek |
| 25 | IRR hub: 78 % | [ ] F2 | finanční model | Marek |
| 26 | 1+kk jednotek v hub: 331 | [ ] F2 | projektová dokumentace | Marek |
| 27 | Kupní cena: 82 % znalecké hodnoty | [ ] F2 | znalecký posudek | Marek |
| 28 | Práva do roku: 2039 | [ ] F2 | kupní smlouva | Marek |

**Po potvrzení:** odstranit `.osa-draft` wrappery a `aria-disabled` z CTA. PDF dokument v `public/dokumenty/Zamer_VPD1_zakladni_souhrn.pdf`.

---

## Kategorie 3: Historické údaje (F1 + F2)

Zdrojové soubory: `src/pages/o-spolku/historie.astro`, `src/pages/o-spolku/index.astro`, `src/pages/projekty/vpd.astro`

| # | Claim | Stav | Zdroj ověření | Poznámka |
|---|---|---|---|---|
| 29 | Datum založení: 14. března 2006 | [x] F1 OK | ARES | shoda |
| 30 | Zakládajících studentů: dvanáct | [ ] F2 | zakládací protokol | interní doklad |
| 31 | Zakládající schůze: kryt v Cerhenicích | [ ] F2 | interní paměť | Marek / Štěpán potvrdí |
| 32 | Počet projektů: "téměř dvacet" | [ ] F2 | interní | aktuálně 17 MDX v repu, starý web měl 21 — v toleranci |
| 33 | Výletná převzata: únor 2014 | [ ] F2 | smlouvy ÚZSVM | archiv |
| 34 | ÚZSVM odmítl prodloužit: 2019 | [ ] F2 | archiv ÚZSVM | press |
| 35 | MinFin schůzka: květen 2022 | [ ] F2 | výroční zpráva | interní |

---

## Kategorie 4: Architektonické údaje (F1 + F2)

Zdrojové soubory: `src/content/sub_projects/vyletna.mdx`, `src/pages/projekty/vpd.astro`

| # | Claim | Stav | Zdroj ověření | Poznámka |
|---|---|---|---|---|
| 36 | Výletná architekt: Bohumír Kozák | [ ] F1 | Památkový katalog NPÚ, archiv | ověřit |
| 37 | Výletná rok výstavby: 1926 | [ ] F1 | Památkový katalog NPÚ | ověřit |
| 38 | Výletná umístění: Letenské sady ev. č. 32 | [ ] F1 | katastr nemovitostí | ověřit ev. č. |
| 39 | VPD zkušenosti: "Šestnáct let" | [ ] F2 | chronologie od 2006 | kalkulace OK |

---

## Kategorie 5: Projektový katalog (F1 — URL check + F2 — cross-check)

Zdrojové soubory: `src/content/sub_projects/*.mdx` (17 souborů)

### 5a — URL health check

| # | Projekt | URL | Stav | HEAD-check |
|---|---|---|---|---|
| 40 | Kreativní Prostory CZ | kreativniprostory.cz | [x] F1 OK | 200 |
| 41 | Metro Farm | metrofarm.cz | [x] F1 OK | 200 |
| 42 | Výletná | podporujvyletnou.cz | [x] F1 OK | 301 → vyletna.info |
| 43 | VPD | vepde.com | [x] F1 OK | 302 → vyletna.info/projektovani-rozvoje |
| 44 | Junktown | junktown.postapofestival.cz | [ ] F1 FAIL | **403 Forbidden** — rozhodnout: restore / drop / accept known warning |

### 5b — Cross-check proti alternativa2.info

Starý web má 21 projektů (13 realizovaných + 8 připravovaných). Nový web má 17. Čtyři projekty ze starého webu, které v novém nejsou nebo mají jiný název:

| # | Projekt ze starého webu | Stav v novém | Akce |
|---|---|---|---|
| 45 | Akční a příměstské tábory CZ | [ ] F2 chybí | přidat MDX nebo vědomě vynechat |
| 46 | Prasátkový den | [ ] F2 chybí | přidat MDX nebo vědomě vynechat |
| 47 | Nízkoprahová centra CZ | [ ] F2 chybí | přidat MDX nebo vědomě vynechat |
| 48 | AlterEgo | [ ] F2 chybí | přidat MDX nebo vědomě vynechat |
| 49 | VPD (Veřejně prospěšný developer) | [ ] F2 NEW | na starém webu jako pojmenovaný projekt není — Marek potvrdí, že je to záměr |

### 5c — Popis + rok pro každý projekt

Pro všech 17 MDX souborů projít `name`, `description` (prvních 30-160 znaků), `year_from`, `status`. Není zde detail — vyžaduje klientovo přečtení. Zaškrtnout jedním `[x]` skupinově po prošetření.

| # | Akce | Stav |
|---|---|---|
| 50 | Projít 17 MDX a ověřit jména, popisy, roky, statusy | [ ] F2 |

---

## Kategorie 6: Hodnoty a pilíře (F3 — spolek)

Zdrojové soubory: `src/content/values/axioms.json` (16 položek), `src/content/pillars/index.json` (3 položky)

| # | Claim | Stav | Zdroj ověření |
|---|---|---|---|
| 51 | 16 hodnot (jména + glossy) jsou v souladu se stanovami | [ ] F3 | stanovy + záznamy sněmu |
| 52 | 3 pilíře: dobrovolnická práce, DIY, hospodářská činnost | [ ] F3 | stanovy + účetnictví |
| 53 | Tvrzení "Státní dotace odmítáme" | [ ] F3 | účetnictví 2006-2025 | |

---

## Kategorie 7: Adresy areálů (F1 + F2)

Zdrojový soubor: `src/pages/kontakty/index.astro`

| # | Areál | Adresa | Stav | Zdroj |
|---|---|---|---|---|
| 54 | Výletná | Letenské sady ev. č. 32, 170 00 Praha 7 | [ ] F1 | katastr + Google Maps |
| 55 | Sportovní areál Hájek | Hájecká, 253 01 Hostivice | [ ] F1 | katastr |
| 56 | Bratronice | 273 63 Bratronice, Středočeský kraj | [ ] F1 | katastr |
| 57 | Klecany | Dolní kasárna, 250 67 Klecany | [ ] F1 | katastr |
| 58 | Volnočasové centrum | Železničářů 204/6, 170 00 Praha 7 | [ ] F1 | katastr |

**Navíc:** starý web uvádí **šest** lokalit; nový identity.json jen sídlo + kancelář. Rozhodnout: rozšířit identity.json o pole `locations[]`, nebo vědomě osekat na dvě.

---

## Kategorie 8: Dokumenty (F2)

Zdrojový soubor: `src/content/dokumenty/*.json`

| # | Dokument | Cesta v webu | Stav | Akce |
|---|---|---|---|---|
| 59 | Stanovy | /dokumenty/stanovy-osa-ii.pdf | [ ] F2 | soubor dodá klient, nahrát do public/dokumenty/ |
| 60 | Výroční zprávy archiv | /dokumenty/vyrocni-zpravy-archiv.zip | [ ] F2 | tamtéž |
| 61 | Smlouva o přistoupení (šablona) | /dokumenty/smlouva-o-pristoupeni.pdf | [ ] F2 | tamtéž |

**Do té doby:** všechny tři odkazy 404. Alternativně skrýt `/o-spolku/dokumenty/` z navigace, dokud nebudou.

---

## Souhrn stavu

| Kategorie | Počet | F1 OK | F1 fix | F2 | F3 |
|---|---|---|---|---|---|
| 1. Identifikátor | 18 | 5 | 2 | 11 | 0 |
| 2. VPD1 čísla | 10 | 0 | 0 | 10 | 0 |
| 3. Historické | 7 | 1 | 0 | 6 | 0 |
| 4. Architektonické | 4 | 0 | 0 | 4 | 0 |
| 5. Projekty | 10 | 4 | 1 | 5 | 0 |
| 6. Hodnoty + pilíře | 3 | 0 | 0 | 0 | 3 |
| 7. Adresy | 5 | 0 | 0 | 5 | 0 |
| 8. Dokumenty | 3 | 0 | 0 | 3 | 0 |
| **Celkem** | **60** | **10** | **3** | **44** | **3** |

**Blokuje launch:** kategorie 2 (VPD1), kategorie 8 (dokumenty PDF musí buď být, nebo sekce skryta).

**Neblokuje launch, ale mělo by být hotovo:** kategorie 1 (identity sídlo + founded), kategorie 5a (Junktown rozhodnutí), 5b (4 chybějící projekty).

**Může počkat na post-launch:** kategorie 3, 4, 5c, 6, 7 — pokud se ukáže chyba, opravíme commit.
