# OSA web — Copywriting (verze 2, návrh úprav)

Kompletní soupis viditelného českého textu na webu osa2.cz, organizovaný podle stránek a komponent. Zdroj: `src/pages/`, `src/components/`, `src/content/`.

> **Konvence této verze**
>
> - ==**Takto vyznačený text**== je nový nebo přepsaný oproti `COPY.md`.
> - ~~Takto vyznačený text~~ navrhuji odstranit nebo přesunout (vysvětlení v poznámce vedle).
> - **Pozn:** krátké komentáře k editoriálnímu rozhodnutí jsou vloženy v boxech níže.
> - U Hero H1 jsou všechny 3 varianty vedle sebe — finální výběr na klientovi.

---

## Společné prvky / chrome

### Hlavní navigace (Header)

- **Úvod**
- **O spolku**
- **Projekty**
- **Aktuality**
- **Zapojte se**
- **Kontakt**
- **Přihlásit** (tlačítko v pravo, vede do členského portálu)

Aria-label loga: „Občanské sdružení Alternativa II — domů"
Aria-label hlavní navigace: „Hlavní navigace"
Aria-label loginu: „Přihlásit do členského portálu"
Aria-label burger tlačítka: „Otevřít menu" / „Zavřít menu"

### Mobilní drawer

Identické položky jako desktopová nav, plus:

- **Přihlásit do portálu →**

### Patička (Footer)

Logo + motto: **„Pomáháme tvořit…"**

Sloupec **Navigace**:
- Úvod
- O spolku
- Projekty
- Aktuality
- Zapojte se
- Členství
- Kontakt

Sloupec **Kontakt**:
- info@osa2.cz
- +420 777 786 476
- Terronská 894/56
- 160 00 Praha 6

Sloupec **Právní údaje**:
- IČ 270 26 345
- DIČ CZ 270 26 345
- Spis. zn. L 16540

Spodní řádek: **© {rok} Občanské sdružení Alternativa II, z.s.**

### Project card (sdílená karta projektu)

Eyebrow: téma (Urbanismus / Kultura / Sport / Média / Vzdělávání / Tvorba / Komunita / LARP)
Meta vpravo dole — jeden ze stavů: **Ve spánku** · **Pilotní** · **Interní** · nebo doména externího webu.
Hint k pauznutému stavu (atribut `data-paused`) — jen vizuálně tlumený.

### Article card (sdílená karta aktuality)

Eyebrow: datum + první tag.
Bottom meta: jméno autora (default **OSA II**) + šipka.
Lead se ořezává na ~140 znaků s explicitním „..." na konci.

### Lightbox (galerie)

Aria-label dialogu: „Prohlížeč fotografií"
Aria-label tlačítek: „Zavřít" · „Předchozí fotografie" · „Další fotografie"
Caption format: `N / total · alt text`

---

## 1. Landing — Úvod (`/`)

`<title>`: Občanské sdružení Alternativa II, z.s.
`<meta description>`: Spolek pro plnohodnotnou seberealizaci jedince i společnosti. Platforma pro autonomní kulturní, sportovní a společenské projekty bez státních dotací.

### Hero

> **Pozn (Hero, finální směr):** Stávající eyebrow „Pomáháme tvořit…" se povyšuje na H1 a typograficky se nasadí co největší. 35slovná charter věta se z hera odstraňuje a zůstává v plném znění na `/o-spolku/` sekci 01. Hierarchie: glyf → eyebrow (krátký kontext) → velký H1 → podnadpis → CTA.

==**Eyebrow s glyfem (nový, krátký kontext):** Občanské sdružení Alternativa II · od 2006==

> *Alternativy pro eyebrow, k výběru:*
> - ==„Občanské sdružení Alternativa II · od 2006"== (kontext + temporální kotva, doporučeno)
> - ==„OSA II · od 2006"== (úspornější, pokud chceme úplné minimum)
> - ==„Pomáháme tvořit…"== (zachovat původní, ale pak se opakuje s H1 — nedoporučeno)

~~H1 (původní, 35 slov): „Chceme vytvořit moderní, prosperující a hodnotově orientovanou společnost, jejímž smyslem a účelem bude efektivní podpora všech jedinců v jejich plnohodnotné a všestranné seberealizaci."~~

==**H1 (nový, displejová velikost):**==
> ==**„Pomáháme tvořit."**==

==**Podnadpis pod H1** (rozvinutí, jedna věta):==
> ==„Spolek pro plnohodnotnou seberealizaci jedince i společnosti."==

> *Alternativy pro podnadpis, k výběru:*
> - ==„Spolek pro plnohodnotnou seberealizaci jedince i společnosti."== (z meta description, doporučeno)
> - ==„Spolek pro plnohodnotnou seberealizaci jedince i společnosti. Od roku 2006, bez státních dotací."== (rozšířená verze, pokud má eyebrow zůstat krátký)
> - ==„Platforma pro autonomní kulturní, sportovní a komunitní projekty. Bez státních dotací."== (akčnější, popisuje, co spolek dělá)

> **Pozn (typografie):** „Pomáháme tvořit." je 16 znaků. Stávající `font-size` v `Hero.astro` má clamp až do `3.25rem` a `max-width: 32ch` — tady to může být klidně **dvojnásobek** (např. `clamp(2.5rem, 8vw + 1rem, 7rem)`), text může jít na celou šířku containeru a zalomit přirozeně po slově. Tečka na konci je definitivní gesto.

> **Pozn (animace):** Word-stagger reveal v `Hero.astro` poběží i tady — jen 2 slova místo 35, exit fáze je rychlejší, ale to je v pořádku.

CTA primární: **Více o spolku**
CTA sekundární: **Aktuality**

### Rozcestník projektů

Eyebrow: **Rozcestník**
H2: „Autonomní projekty pod hlavičkou spolku"

Skupina **Realizované**: 4 karty projektů (Kreativní Prostory, Výletná, Paint-Ball, Volnočasová centra).
Skupina **Připravované**: 4 karty projektů (Městský inkubátor, Projektový inkubátor, UNIVERZ, Akční a příměstské tábory).

CTA: **Další projekty**

### ValuesMatrix (tmavý mód na landingu)

Eyebrow: **§ 16 hodnot**
H2: „Hodnoty spolku jsou axiomy, nikoli aspirace."

> **Pozn (ValuesMatrix):** Doporučená varianta B — na landingu zobrazit jen 6 vybraných hodnot, plnou mřížku 16 nechat na `/o-spolku/`. Snižuje to délku landingu a posiluje sekci About.

==**Varianta B (doporučená):** Mřížka **6 vybraných hodnot** v tmavém módu — autonomie · dobrovolnost · soběstačnost · konsensus · otevřenost · akceschopnost.==

==CTA: **Všech 16 hodnot →** (vede na `/o-spolku/#hodnoty`)==

~~**Varianta A (současná):** Mřížka 16 hodnot — viz sekci „Hodnoty (axiomy)" níže.~~

### ManifestoStrip (Poslání a hospodářský model)

Eyebrow: **Poslání a ekonomický model**
H1: „Naplňujeme vizi bez státních dotací."

> **Pozn (ManifestoStrip):** H1 zůstává — je dobrý. Lede 1 (50+ slov charter pasáže) zkrácen na jednu větu, plné znění přesunuto za rozbalovací.

~~Lede 1 (současný): „Posláním spolku je naplňování spolkové vize prostřednictvím podpory seberealizace, aktivního bytí, vědy, kultury, sportu, tělovýchovy, vzdělávání, volnočasového vyžití, humanitárních aktivit, občanské angažovanosti, sociálně a ekologicky šetrného podnikání, jakož i všech ostatních činností směřujících k všestrannému rozvoji jedince i společnosti."~~

==**Lede 1 (nový):** „Spolek od roku 2006 podporuje seberealizaci, kulturu, sport, vzdělávání a občanskou angažovanost. Bez veřejných peněz."==

==**Rozbalovací: „Plné znění poslání podle stanov"** — pod ledem, obsahuje původní 50slovnou pasáž.==

Lede 2: „Hospodaření spolku stojí na třech pilířích, které mu umožňují zajistit kompletní financování projektů bez nutnosti čerpat veřejné finanční zdroje."

3 pilíře — viz sekci „Pilíře hospodaření" níže.

### Galerie

Eyebrow: **Galerie**
H2: „Z provozu spolkových prostorů."

> **Pozn (Galerie):** Duplikuje galerii na `/o-spolku/`. Doporučená varianta — zachovat na landingu, ale zmenšit. Plnou galerii nechat na About.

==**Doporučená varianta:** ~~8 fotografií ze života spolku (4×2 mřížka, lightbox).~~ → **4 fotografie (2×2 mřížka, lightbox).**==

==**Alternativa:** úplně odstranit a nahradit jiným vizuálním blokem (např. mapa areálů spolku) — k diskusi.==

### InvestmentHero (Záměr VPD1)

Eyebrow: **Aktuálně · Záměr VPD1**

H1: „Hledáme strategického partnera pro revitalizaci 83 327 m² na prahu metropole."

Lede: „Od opuštěných kasáren k živé městské čtvrti. Záměr plně v souladu s platným územním plánem."

Caption schématu: „Schematický pohled na areál · 12 km od centra Prahy"

Metriky:
- **Lokalita**: Horní kasárna Klecany, 12 km od centra Prahy
- **Potenciál**: 10+ mld. Kč hrubý zisk, 88 946 m² ČPP nových bytů, cca 1 572 bytů
- **Práva**: Smluvně do roku 2039 (právo odkupu, užívání, stavby); kupní cena na úrovni 82 % znalecké hodnoty
- **Krok 1 · Startovací hub**: 331 jednotek 1+kk, investice cca 285 mil. Kč, ROI 141 %, IRR 78 %

CTA primární: **Celý článek**
CTA sekundární: **O VPD**

### Hub strip (4 vizualizace)

> **Pozn (Hub strip):** Strip „doplňuje investiční výzvu vizuálně" (komentář v `index.astro`). Ale na `/zamer-vpd/` (Kapitola 03) už je věnovaný photo-strip. Na landingu redundantní.

==**Doporučená varianta:** ~~Bezpopisná pásová mřížka 4 obrázků~~ → **2 obrázky** (vybrat 2 nejsilnější vizualizace).==

==**Alternativa:** Celý strip přesunout na `/zamer-vpd/` a z landingu odstranit. InvestmentHero (1 chart-grid + metriky) jako jediný vizuál tématu na landingu stačí.==

Alt texty (zůstávají u zachovaných 2 obrázků):
- „Vizualizace startovacího hubu Klecany — pohled na centrální plochu mezi budovami."
- „Vizualizace klecanského hubu — interiér společných prostor."
- ~~„Vizualizace klecanského areálu — pohled z ulice na vstupní část objektu."~~
- ~~„Vizualizace klecanského areálu — letní pobytová terasa a komunitní zóna."~~

### AktualityRecap

Eyebrow: **Aktuálně**
H2: „Co se u nás děje."
Lede: „Krátké zprávy, oznámení a tematické texty od lidí, kteří spolek tvoří."

3 nejnovější aktuality (ArticleCard).
CTA: **Všechny aktuality**

---

## 2. O spolku (`/o-spolku/`)

`<title>`: O spolku - Občanské sdružení Alternativa II, z.s.

### Hero (tmavý)

Drobečková navigace: **Úvod · O spolku**

H1: „Spolek, který slouží seberealizaci."

Lede: „Občanské sdružení Alternativa II, z.s. bylo založeno v roce 2006 dvanácti zakládajícími členy z řad studentů středních a vysokých škol. Vznikla nezávislá, nezisková a projektově orientovaná organizace se široce definovaným posláním, konsensuálním rozhodováním kolektivních orgánů a autonomním rozhodováním spolkových projektů."

Citát:
> „Naděje není to přesvědčení, že něco dobře dopadne, ale jistota, že něco má smysl — bez ohledu na to, jak to dopadne."
>
> — V. H.

### Vize · poslání · smysl

Eyebrow: **Vize, poslání, smysl**
H2: „Proč spolek existuje."

> **Pozn (Sekce 01-03):** Sekce 03 už používá vzor „krátká citace + rozbalovací Více". Aplikujeme stejný vzor na 01 a 02 pro konzistenci.

#### 01 — Vize spolku

Eyebrow: **Čeho chceme dosáhnout**
==**H3 (nový, paraphrase):** „Společnost, která podporuje seberealizaci."==

~~„Chceme vytvořit moderní, prosperující a hodnotově orientovanou společnost, jejímž smyslem a účelem bude efektivní podpora všech jedinců v jejich plnohodnotné a všestranné seberealizaci."~~

==**Sub-citát (nový, krátký výtah):** „Chceme moderní společnost, která podporuje všechny své členy v jejich plnohodnotné seberealizaci."==

==**Rozbalovací „Plné znění vize podle stanov"**: obsahuje původní 35slovnou větu.==

#### 02 — Poslání spolku

Eyebrow: **Jak toho chceme dosáhnout**
==**H3 (nový, paraphrase):** „Podpora skrz autonomní projekty."==

~~„Posláním spolku je naplňování spolkové vize prostřednictvím podpory seberealizace, aktivního bytí, vědy, kultury, sportu, tělovýchovy, vzdělávání, volnočasového vyžití, humanitárních aktivit, občanské angažovanosti, sociálně a ekologicky šetrného podnikání, jakož i všech ostatních činností směřujících k všestrannému rozvoji jedince i společnosti."~~

==**Sub-citát (nový):** „Spolek naplňuje vizi podporou seberealizace, kultury, sportu, vzdělávání, občanské angažovanosti a šetrného podnikání."==

==**Rozbalovací „Plné znění poslání podle stanov"**: obsahuje původní 50slovnou pasáž.==

#### 03 — Smysl naší činnosti

Eyebrow: **Proč toho chceme dosáhnout**
H3: „Smysl naší činnosti"

„Pokud upadají zájmy, aktivity a hodnoty jednotlivých členů společnosti, upadá i celá společnost. A naopak: pokud se rozvíjí jednotlivec, rozvíjí se i celek. Osobní štěstí a obecné blaho jsou neoddělitelné."

Rozbalovací **Více**:

„Jsme toho názoru, že pokud upadají zájmy, aktivity a hodnoty jednotlivých členů společnosti, upadá, degeneruje a trpí tím nejen příslušný jedinec, ale i celá společnost. A naopak, že pokud se zájmy, hodnoty a aktivity jednotlivých členů společnosti rozvíjí, rozvíjí se v důsledku toho i společnost jako celek."

„A protože současně máme za to, že i osobní štěstí a obecné blaho je analogickým způsobem provázané, jakož i za to, že štěstí jedince vyplývá především z míry jeho úspěšné seberealizace, jejímž nutným předpokladem je saturace základních životních potřeb, aktivní způsob života, jakož i úspěšný a všestranný rozvoj příslušného jedince v oblasti jeho zájmů, rozhodli jsme se, že smyslem existence a činnosti našeho spolku bude vytváření takového zázemí, prostředí, podmínek, projektů, principů a organizačních struktur, které nám umožní efektivním způsobem podporovat maximální množství jedinců v jejich plnohodnotné a všestranné seberealizaci."

„Domníváme se, že právě tímto způsobem budeme nejefektivněji přispívat jak k maximalizaci štěstí podporovaných jedinců, tak i k maximalizaci blahobytu celé společnosti."

### Hodnoty spolku

ValuesMatrix v tmavém módu — viz sekci „Hodnoty (axiomy)" níže. ==(Plná mřížka 16 hodnot zůstává tady, na landingu jen 6.)==

### Historie spolku

Eyebrow: **Historie spolku**
H2: „Spolek od roku 2006."

> **Pozn (Historie):** Současné 3 odstavce částečně duplikují obsah na `/o-spolku/historie/`. Zkráceno na 2 odstavce + CTA.

Tělo:

„Zakládající schůze sdružení se konala v podzemním krytu civilní obrany na pražském Břevnově. Sdružení založilo dvanáct osob, převážně z řad studentů středních a vysokých škol. Spolek navazoval cíli, filozofií i personálně na dřívější o.s. Alternativa, k jehož názvu připojil římskou číslovku II."

==„V roce 2014 se sdružení transformovalo do právnické formy zapsaného spolku. Z původního ideového rámce se stala platforma pro desítky autonomních projektů — Výletná, Veřejně prospěšný developer, Kreativní prostory CZ a další."==

~~„Účelem nového subjektu bylo poskytnout všem zakládajícím členům společný právní rámec pro realizaci projektu MKJ (Mobilní Kulturní Jednotky) a vytvořit záštitu, pod kterou by bylo možné v budoucnu svobodně realizovat rozmanité ideje a záměry členů formou autonomních projektů. V roce 2014 se sdružení transformovalo do právnické formy zapsaného spolku a ke svému názvu připojilo zkratku „z.s."."~~ *(přesunuto na `/o-spolku/historie/`, kde už je delší verze)*

~~„Jak se tento původní záměr podařilo rozvinout, můžete posoudit v sekci projektů, na fotografiích z činnosti spolku či v plné chronologii historie."~~ *(odstraněno, CTA „Celá historie spolku" tu už je)*

Spolek v číslech:
- **Založeno**: 2006 — 14. března, registrace u MV ČR
- **Autonomních projektů**: 20+ — včetně klubů a decentralizovaných složek
- **Oblastí činnosti**: 8 — urbanismus, kultura, sport, média, vzdělávání, tvorba, komunita, LARP
- **Ze státních dotací**: 0 Kč — nezávislost na veřejných zdrojích je podmínka autonomie

CTA: **Celá historie spolku** · **Staňte se členem**

### Galerie

Eyebrow: **Galerie**
H2: „Z činností spolku."

(Stejná galerie jako na landingu — ==tady plná verze 4×2, na landingu redukovaná na 2×2==.)

### Organizační struktura

Eyebrow: **Organizační struktura**
H2: „Tři patra, decentralizovaná výkonná část."

Text:

„Spolek se skládá z nejvyššího orgánu, kterým je **Členský sněm**, ze statutárního orgánu, kterým je **Představenstvo**, z **Orgánu pro nábor a příspěvky** a z řady decentralizovaných výkonných složek v podobě autonomních projektů a klubů."

„Klíčový princip: projekty vznikají i zanikají volně z iniciativy členů a jejich rozhodování je nezávislé, pokud respektuje účel projektu, poslání a hodnoty spolku."

Schéma struktury:
- **01 Členský sněm** — Nejvyšší orgán
- **02 Statutární a podpůrné orgány** — Představenstvo, Orgán pro nábor
- **03 Autonomní projekty a kluby** — Decentralizovaná výkonná úroveň

### Hospodaření

Eyebrow: **Hospodaření**
H2: „Tři pilíře bez státních dotací."

Sub-lede: „Hospodaření spolku je založeno na třech základních pilířích, které mu umožňují zajistit kompletní financování projektů bez nutnosti čerpat veřejné finanční zdroje."

#### 01 — Dobrovolnická práce členů

„Široce využívaná dobrovolnická práce minimalizuje mzdové náklady a potřebu finančního kapitálu na rozjezd projektů. Spolku přivádí pro věc zapálené spolupracovníky."

#### 02 — Metoda DIY

„Pracovní metoda „Do it yourself" minimalizuje provozní a investiční náklady. Zajišťuje vysokou flexibilitu, akceschopnost a soběstačnost projektů."

#### 03 — Vlastní hospodářská činnost

„Členské příspěvky a vedlejší podnikatelská činnost na živnostenské bázi. Spolek odmítá státní dotace; zachovává si tím svobodu rozhodování."

#### Aside box — Kreditní systém OSA II

Eyebrow: **Připravujeme**
H3: „Kreditní systém OSA II"

„Spolkový nástroj pro evidenci a nenárokové odměňování dobrovolnické práce. Zajišťuje spravedlivé přerozdělování výnosů z hospodářské činnosti mezi členy, kteří se na nich prací podíleli. Systém je v přípravě."

CTA: **Metodologie DIY a Kreditní systém**

### Cíle a záměry (GoalsHorizons)

Eyebrow: **Cíle a záměry**
H1: „Kam směřujeme."
Lede: „Cíle vznikají na centrální úrovni i v rámci jednotlivých autonomních projektů. Krátkodobé úspěchy postupně vedou k dlouhodobým koncepčním záměrům."

3 sloupce — viz sekci „Cíle a záměry (kolekce goals)" níže.

### Spolkové dokumenty

Eyebrow: **Spolkové dokumenty**
H2: „Stanovy, výroční zprávy, šablony smluv."

(Seznam ze sekce „Dokumenty" níže.)

---

## 3. O spolku — Historie (`/o-spolku/historie/`)

==**Pozn:** Beze změny — detail historie patří sem, je to autoritativní zdroj.==

`<title>`: Historie spolku - Občanské sdružení Alternativa II
Eyebrow: **O spolku**
H1: „Historie spolku"

(Beze změny — celá stránka identická s `COPY.md`.)

---

## 4. O spolku — Metodologie (`/o-spolku/metodologie/`)

==**Pozn:** Beze změny — kostra k dopsání, není v scope tohoto návrhu.==

(Beze změny — viz `COPY.md`.)

---

## 5. O spolku — Dokumenty (`/o-spolku/dokumenty/`)

==**Pozn:** Beze změny.==

(Beze změny — viz `COPY.md`.)

---

## 6. Projekty — výpis (`/projekty/`)

==**Pozn:** Beze změny — kartová mřížka funguje.==

(Beze změny — viz `COPY.md`.)

---

## 7. Projekt — stub stránka (`/projekty/[slug]/`)

==**Pozn:** Beze změny.==

(Beze změny — viz `COPY.md`.)

---

## 8. Veřejně prospěšný developer (`/projekty/vpd/`)

`<title>`: Veřejně prospěšný developer (VPD) - autonomní projekt OSA
`<meta description>`: Spin-off OSA II. Veřejně prospěšný rozvoj softwaru a hardwaru — lidských zdrojů, programů, staveb a technologií.

### Hero (tmavý)

(Beze změny.)

### Stat grid

(Beze změny.)

### Co VPD dělá

Eyebrow: **Co VPD dělá**
H2: „Veřejně prospěšný rozvoj softwaru a hardwaru."

> **Pozn (SW/HW):** Texty zkráceny o ~30 %, headlines ponechány.

#### SW — Software

~~„Primárně rozvoj **lidských zdrojů** a jimi generovaných **programů**. Lidské know-how, vzdělávání, mentoring, akcelerační programy, projektový management, právní a organizační záštita."~~

==„Rozvoj **lidských zdrojů** a programů, které generují. Vzdělávání, mentoring, akcelerace, projektový management a právní záštita."==

#### HW — Hardware

~~„Rozvoj všeho, co má materiální povahu — toho, **kde a na čem software funguje**, či s čím tento software pracuje. Stavby, počítače, stroje a těla."~~

==„Rozvoj toho, **kde a na čem software funguje**. Stavby, počítače, stroje, těla."==

### Proč

Eyebrow: **Proč**
H2: „Kritika spekulativního developmentu."

> **Pozn (Proč):** Dva odstavce, druhý oslavnější. Zkráceno na jeden hlavní odstavec + rozbalovací s druhým.

„Standardní komerční development maximalizuje finanční výnos z území na úkor jeho sociální struktury, genia loci a dostupnosti pro veřejnost. Výsledkem jsou odcizená sídliště, privatizovaná náměstí a historické areály, které se po rekonstrukci uzavírají úzké ekonomické elitě."

==**Rozbalovací „Co VPD nabízí jako alternativu":**==

==„VPD je odpověď. Nabízí metodiku obnovy, ve které ekonomická návratnost není jediným měřítkem úspěchu. Zhodnocený prostor zůstává přístupný veřejnosti, má smysluplnou náplň a buduje lokální komunitu. Nepotřebuje k tomu státní dotace, pouze konsensuální vlastníky, dobrovolníky a trpělivost."==

### Jak — tři stavební kameny

(Beze změny — 3 pilíře jsou v pořádku.)

### Areál Klecany

(Beze změny.)

### InvestmentHero (s `hideVpdLink`)

(Beze změny.)

### Související projekty

(Beze změny.)

---

## 9. Záměr VPD1 — investiční landing (`/zamer-vpd/`)

==**Pozn:** Beze změny — toto je investiční landing, detail je tu funkce, ne chyba. Hero H1 „Horní kasárna Klecany." je vzorový krátký headline.==

(Beze změny — celá stránka identická s `COPY.md`.)

---

## 10. Aktuality — výpis (`/aktuality/`)

==**Pozn:** Beze změny.==

(Beze změny — viz `COPY.md`.)

---

## 11. Aktuality — detail (`/aktuality/[slug]/`)

==**Pozn:** Beze změny.==

(Beze změny — viz `COPY.md`.)

---

## 12. Zapojte se (`/zapojte-se/`)

==**Pozn:** Beze změny v této verzi. Stránka už používá vzor „krátký úvod + rozbalovací" napříč všemi 6 sekcemi a slouží jako referenční vzor pro zbytek webu. Možné drobné zkrácení prvních odstavců — k posouzení v dalším kole.==

(Beze změny — viz `COPY.md`.)

---

## 13. Členství (`/clenstvi/`)

`<title>`: Členství - Občanské sdružení Alternativa II, z.s.
`<meta description>`: Druhy členství, vznik a zánik, statusy, práva a povinnosti členů spolku. Online přihláška.

### Hero (tmavý)

(Beze změny.)

### Druhy členství

Eyebrow: **Druhy členství**
H2: „Řadové členství a členství v nejvyšším orgánu."

> **Pozn (Druhy členství):** Současné dva dlouhé odstavce nahrazeny krátkou srovnávací tabulkou. Detail za rozbalovacím.

==**Krátký úvod (nový):** „Členství se dělí na **řadové** a v **nejvyšším orgánu** (Členský sněm). Oba druhy mohou být registrované nebo neregistrované. Práva a výhody jsou téměř totožné — liší se hlasovací právo a způsob vzniku."==

==**Tabulka (nová):**==

| ==Druh== | ==Hlasování v Členském sněmu== | ==Vznik== |
|---|---|---|
| ==Řadové členství== | ==Bez hlasovacího práva== | ==Rozhodnutí Orgánu pro nábor== |
| ==Členství v nejvyšším orgánu== | ==S hlasovacím právem== | ==Volba Členským sněmem== |

==**Rozbalovací „Detailní popis druhů":**==

~~„Členství ve spolku se dělí na **členství řadové** a na **členství v nejvyšším orgánu** spolku (Členský sněm). Oba druhy se dělí na členství registrované a neregistrované. Práva a výhody jsou téměř totožné — liší se způsobem vzniku, zániku a hlasovacím právem v rámci nejvyššího orgánu."~~ *(přesunuto za rozbalovací)*

„Za **registrovaného člena** je považován kdokoliv, kdo spolku předepsaným způsobem poskytne své platné kontaktní údaje (např. registračním formulářem). Za **neregistrovaného člena** je považován každý, kdo se nezaregistroval, ale doloží své členství platným potvrzením o úhradě příspěvku, držením členské karty apod."

### Vznik a zánik členství

(Beze změny.)

### Členské statusy

(Beze změny — 4 krátké tile už pattern splňují.)

### Práva a povinnosti

Eyebrow: **Práva a povinnosti**
H2: „Co členství znamená v praxi."

> **Pozn (Práva):** Plochých 11 položek bez seskupení je málo skenovatelné. Návrh: seskupit do 3 kategorií. Pořadí položek zachováno, jen přibylo pojmenování skupin.

==**Práva členů spolku** (11 položek ve 3 kategoriích):==

==**Hlasování a vedení**==
- hlasovat či využívat poradního hlasu v kolektivních orgánech spolku
- žádat o zřízení vlastního autonomního projektu v rámci spolku
- usilovat o všechny volené a jmenované funkce v rámci spolku

==**Využívání zázemí a služeb**==
- získávat členské statusy a čerpat členské výhody i služby v souladu se stanovami
- využívat bezplatné právní, projektové a organizační konzultace ze strany spolku
- využívat bezplatné právní, projektové, organizační a kapitálové ochrany ze strany spolku
- využívat veřejné i neveřejné prostory spolku pro osobní seberealizaci, volný čas, rozvoj a vlastní projekty
- získávat od spolku i externích partnerů cenově zvýhodněné komerční služby, pronájmy či výpůjčky
- získávat od spolku a interních projektů dary, granty, dotace a příspěvky na osobní rozvoj a vlastní projekty

==**Informace**==
- dostávat od vedení spolku informace o jeho vývoji a směřování
- dostávat od vedení projektů informace o vývoji projektů, do kterých jsou zapojeni

#### Povinnosti členů spolku (2)

(Beze změny — 2 položky netřeba seskupovat.)

- respektovat a dodržovat stanovy spolku
- dodržovat všechny interní předpisy spolku od momentu, kdy s nimi byli seznámeni

### Přihláška

(Beze změny.)

---

## 14. Členský portál (`/portal/`)

==**Pozn:** Beze změny — interní pro stávající členy, mimo scope.==

(Beze změny — viz `COPY.md`.)

---

## 15. Kontakt (`/kontakty/`)

==**Pozn:** Beze změny.==

(Beze změny — viz `COPY.md`.)

---

## 16. 404 (`/404`)

==**Pozn:** Beze změny.==

(Beze změny — viz `COPY.md`.)

---

## Hodnoty (axiomy) — kolekce `values/axioms.json`

==**Pozn:** Plná mřížka 16 hodnot — beze změny v obsahu, jen na landingu se zobrazuje redukovaná verze (6 hodnot, viz výše).==

(Plný seznam 16 hodnot — beze změny, viz `COPY.md`.)

---

## Pilíře hospodaření — kolekce `pillars/index.json`

==**Pozn:** Beze změny.==

(Beze změny — viz `COPY.md`.)

---

## Cíle a záměry — kolekce `goals/index.json`

==**Pozn:** Beze změny.==

(Beze změny — viz `COPY.md`.)

---

## Sub-projekty — kolekce `sub_projects/*.mdx`

==**Pozn:** Beze změny — popisky projektů jsou už dnes konkrétní a krátké.==

(Beze změny — viz `COPY.md`.)

---

## Dokumenty — kolekce `dokumenty/*.json`

==**Pozn:** Beze změny.==

(Beze změny — viz `COPY.md`.)

---

## Aktuality (články) — kolekce `aktuality/*.mdx`

==**Pozn:** Beze změny — autorské články, ne web copy.==

(Beze změny — viz `COPY.md`.)

---

## Souhrn změn k odsouhlasení

| # | Místo | Co se mění | Rozhodnutí |
|---|---|---|---|
| 1 | Landing Hero | H1 = „Pomáháme tvořit." (displejově velké), eyebrow + podnadpis nově | **Schvaluješ směr? Vyber eyebrow + podnadpis** |
| 2 | Landing ValuesMatrix | 16 → 6 hodnot + CTA | **A (16) / B (6) — doporučeno B** |
| 3 | Landing Galerie | 4×2 → 2×2 fotografií | **Zachovat zmenšené / odstranit** |
| 4 | Landing Hub strip | 4 → 2 obrázky, nebo přesun na `/zamer-vpd/` | **Zmenšit / přesunout** |
| 5 | Landing ManifestoStrip | Lede 1 paraphrase + rozbalovací plné znění | **Schvaluješ?** |
| 6 | About sekce 01 | Krátký headline + sub-citát + rozbalovací plné znění | **Schvaluješ?** |
| 7 | About sekce 02 | Krátký headline + sub-citát + rozbalovací plné znění | **Schvaluješ?** |
| 8 | About Historie | 3 odstavce → 2 + CTA | **Schvaluješ?** |
| 9 | VPD „Co VPD dělá" | Body o ~30 % kratší | **Schvaluješ?** |
| 10 | VPD „Proč" | 2 odstavce → 1 + rozbalovací | **Schvaluješ?** |
| 11 | Členství „Druhy" | Tabulka místo dvou odstavců | **Schvaluješ?** |
| 12 | Členství „Práva" | 11 položek seskupeno do 3 kategorií | **Schvaluješ?** |

**Co se nemění:** `/zamer-vpd/`, `/zapojte-se/`, `/aktuality/`, `/portal/`, `/kontakty/`, `/projekty/`, footer, header, 404, sub-projekty, dokumenty, axioms, pilíře, cíle.
