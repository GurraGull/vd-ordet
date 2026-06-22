# VD-ordet — en läsguide för IVAs vd

*Ett underlag från Gustaf Wahlström. Det här dokumentet förklarar vad vi har byggt av dina VD-ord, vart det kan utvecklas, och hur du själv — helt utan min inblandning — kan använda din egen AI mot materialet, eftersom allt ligger öppet på GitHub.*

Live att titta på:
- **Berättelsen:** https://gurragull.github.io/vd-ordet/
- **Konsolen:** https://gurragull.github.io/vd-ordet/konsol/
- **Allt material (öppet):** https://github.com/GurraGull/vd-ordet

---

## 1. Vad vi har byggt

Vi har tagit dina **37 VD-ord** (jan 2025 – jun 2026) och gjort tre saker av dem:

**a) Ett levande dataset.** Varje brev är nu en strukturerad post: datum, längd, läsbarhet (LIX), tonindex, teman, omnämnda personer/länder, myntade begrepp, återkommande uppmaningar ("asks"), huvudtes och ett signaturcitat. Det är *en enda källa* som allt annat bygger på, och den är reproducerbar — siffrorna går att räkna fram igen, de är inte tyckande.

**b) Berättelsen** (`/`) — den varma, redaktionella vyn. Den läser dina brev som *en sammanhängande berättelse i fyra akter*: en tonbåge över tid, en kort **analytisk kommentar till varje akt**, och en "beat" per brev med tes, citat och myntat begrepp. Svarar på frågan: *vad säger breven?*

**c) Konsolen** (`/konsol`) — det analytiska verktyget, byggt för dig som vill se datan och vad den pekar mot. Den innehåller:
- **Att överväga** — fyra datadrivna frågor till dig (t.ex. "du har drivit *snabbare beslutsfattande* i 7 brev utan svar — eskalera?").
- **Temamomentum** — vilka ämnen som stiger respektive avtar.
- **USA ↔ Kina** — hur tyngdpunkten förskjutits, plus dina mest citerade tänkare.
- **Öppna asks, vita fläckar, framtidsutsikter** (begrepp att bevaka) och **begreppens livscykel** (vilka idéer som stannat kvar och vilka som somnat).
- En **sökbar brevtabell** där du kan borra ner i varje enskilt brev.

**Tre principer värda att känna till:**
- **Ärligt och reproducerbart.** Tonindex är ett *proxy-mått* (kraftord minus gardingsord), tydligt definierat i klartext i verktyget. Toppen i bågen är *uträknad* ur datan, inte handplockad.
- **Levande.** När ett nytt brev läggs till växer allt av sig självt — bågen, sammanfattningen, konsolen. Den fjärde akten ("Den pragmatiska vändningen") dök faktiskt upp ur datan när de senaste fyra breven lades in; ingen kodändring behövdes.
- **Öppet.** Hela projektet — breven, datan, koden, analyserna — ligger publikt på GitHub.

---

## 2. Utvecklingspotential

Det här kan vi bygga vidare på när du vill:

- **Källänkar** — en klickbar länk till originalbrevet på iva.se från varje post, så att allt går att verifiera direkt.
- **"Din röst i siffror"** — en spegel-panel som visar *din egen* utveckling: ton från drivande till frågande, längd, myntningstakt, läsbarhet.
- **Djupare språkmått** — meningsvis tonprofil, andel frågor och uppmaningar, "vi" kontra "jag". (Vi har medvetet hållit datasetet enkelt hittills; det här är nästa nivå om du vill ha mer språklig skärpa.)
- **Bättre begreppsmodell** — i dag räknas myntade begrepp på exakt ordalydelse; vi kan koppla ihop begrepp som återkommer som *teman* och *asks* även när formuleringen varierar.
- **Skarpare temataxonomi** — t.ex. *life science* och *energi* som egna teman (i dag syns life science som en vit fläck just för att det saknas som kategori).
- **Jämförelse utåt** — att ställa din agenda mot t.ex. EU:s policydebatt (kräver externa data).
- **Publik version / årsboksuppslag** — en putsad utåtriktad vy om analysen bedöms värd att delas bredare.

---

## 3. Vad du själv kan göra — med din egen AI mot vårt GitHub

Det här är poängen med att allt ligger öppet och i klartext (JSON, Markdown, kod): **du kan interrogera och vidareutveckla materialet helt på egen hand, med vilken AI du vill.** Du behöver inte gå via mig.

**Repot:** https://github.com/GurraGull/vd-ordet
Det viktigaste för dig:
- `data/letters.json` — *hela datasetet i en fil* (alla 37 brev med alla mått). Detta är guldet.
- `data/raw/` — själva brevtexterna.
- `docs/` — analysunderlag, design och den här guiden.

### Det enkla sättet (ingen installation)
Öppna en AI (t.ex. Claude eller ChatGPT), klistra in innehållet i `data/letters.json` — eller bara länka repot om din AI kan läsa webben — och fråga vad du vill. Några exempel:
- *"Här är hela datasetet över mina VD-ord. Hur har mitt fokus på Kina utvecklats över tid, och vad säger det om vad jag bör skriva om härnäst?"*
- *"Vilka av mina återkommande uppmaningar har jag aldrig fått svar på? Rangordna dem."*
- *"Vilka begrepp har jag myntat men aldrig återkommit till — och vilka är värda att återuppliva?"*
- *"Skriv ett utkast till ett tal byggt på mina fem skarpaste citat."*
- *"Var är jag som svagast underbyggd, och var upprepar jag mig?"*

Eftersom datan är strukturerad och ärlig kan AI:n resonera precist — den gissar inte, den läser dina egna siffror och formuleringar.

### Det kraftfulla sättet (en AI-agent som kan koda)
Ge en agent som **Claude Code** (eller Cursor) repo-länken och be den t.ex.:
- *"Klona https://github.com/GurraGull/vd-ordet, kör igång sajten (`cd site && npm run dev`) och visa mig den."*
- *"Lägg till mitt nästa VD-ord enligt `docs/runbook-add-a-letter.md` och visa hur bågen förändras."*
- *"Bygg en ny vy som jämför akternas ton och teman sida vid sida."*

Allt är dokumenterat i repot: `README.md` förklarar hur man kör, `docs/runbook-add-a-letter.md` hur man lägger till brev, och `docs/superpowers/` innehåller de fullständiga specarna och planerna. En AI kan läsa dem och fortsätta bygga där vi slutade.

**Kort sagt:** datan är produkten, den är din, och den är gjord för att läsas och byggas vidare på — av dig och vilken AI du föredrar.
