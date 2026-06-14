# VD-ordet 2025–2026 — living analysis & visualization

**Design document / spec**
Date: 2026-06-14 · Owner: Gustaf Wahlström (IVA) · Status: approved for planning

---

## 1. Background & goal

IVA's CEO, Sylvia Schwaag Serger, publishes a biweekly "VD-ord" (CEO letter) in
*Aktuellt från IVA*. We have 33 letters from 14 Jan 2025 to 21 Apr 2026 (the
corpus also includes 7 shorter 2024 introduction letters that may be backfilled
later). A thorough one-off analysis already exists:

- `VD-ord_analys_rundown.docx` — a five-layer analysis (language/readability,
  tone, themes, reference network, language register).
- `VD-ordet_2025-2026_tre_akter.pptx` — a 19-slide narrative built on a
  **three-act** reading of how the voice evolves.

**The shift this project makes:** from a static, point-in-time report to a
**living, version-controlled, visually-rendered analysis** that grows by one
letter every two weeks and renders the *story* the letters tell.

The three acts (from the existing analysis, allowed to evolve as the arc grows):

| Act | Name | Period | Letters | ⌀ words | Tone index |
|---|---|---|---|---|---|
| 1 | Att hitta rösten | jan–mar 2025 | 6 | 303 | +2.8 |
| 2 | Att sätta agendan | apr–okt 2025 | 14 | 602 | +4.7 (peak) |
| 3 | Doktrinen | nov 2025–apr 2026 | 13 | 715 | +1.2 |

The breakpoint into Act 2 is *Stresstest för Europa* (8 Apr 2025), the corpus's
tone peak at +13.8.

## 2. Audience & purpose

Built **internal-first**, public as a final optional step:

- **Board / strategy intelligence** — how the CEO's messaging and priorities
  shift over time; signals for strategy discussion.
- **A mirror for the CEO** — let Sylvia see her own voice and evolution.
- **The narrative arc** — tell the three-act story compellingly.
- **Public view** — a later, gated "if it's worthy" step. Architecture must keep
  this path clean without rework.

## 3. Principles

1. **Separate data from presentation.** The dataset and pipeline never depend on
   how anything is drawn; the site is only a *reader* of the data. This is what
   makes a public view (or a redesign) free later.
2. **Reproducible & followable.** Mechanical metrics are computed from text and
   reproducible. One letter = one versioned file, so `git diff` shows exactly
   what each new letter added.
3. **Editorial throughout.** Serif, generous whitespace, restraint, pull-quotes,
   the data arc as a quiet hero — not a BI dashboard, even in the explore view.
4. **Honor the existing analysis.** Seed the 33 letters from the curated
   rundown/deck; don't redo that human work.
5. **Swedish-language** product.
6. **Proxy metrics stay labeled as proxies** (see §9).

## 4. Architecture

Three clean layers in one repo:

```
vd-ordet/                     (this folder; local git, push to GitHub later)
├── data/
│   ├── letters/              one JSON per letter — the living dataset
│   ├── letters.json          compiled — what the site reads
│   ├── raw/                  original .docx + extracted .txt
│   └── vocab/                controlled lists: acts, themes, asks, entities
├── pipeline/                 Python: parse + metrics + coding helpers
│   ├── extract.py            .docx → text + metadata
│   ├── metrics.py            scripted mechanical metrics
│   ├── code_letter.py        AI-assisted coding helper (draft for review)
│   ├── add_letter.py         orchestrates the add-a-letter loop
│   └── compile.py            data/letters/*.json → data/letters.json
├── site/                     Next.js (App Router, TypeScript, Tailwind)
├── docs/                     this spec, the add-a-letter runbook, design notes
└── README.md
```

## 5. Data model

One record per letter (`data/letters/2026-04-21.json`). Provenance column shows
how each field is produced: **scripted** (reproducible), **AI** (AI-assisted,
human-reviewed), or **meta** (from the document).

| Field | Type | Provenance |
|---|---|---|
| `date` | ISO date | meta |
| `nr` | int | meta (Aktuellt från IVA number) |
| `title` | string | meta |
| `series` | bool | meta (true if "IVAs vd — om X") |
| `act` | int | assigned — **may be re-assigned as the arc emerges** |
| `word_count` | int | scripted |
| `avg_sentence_length` | float | scripted |
| `lix` | float | scripted |
| `loanword_rate` | float | scripted (English loanwords / 1000 words) |
| `tone_index` | float | scripted (assertive − hedge markers / 1000 words) |
| `assertive_count`, `hedge_count` | int | scripted |
| `themes` | list of `{theme, weight}` | AI |
| `entities` | `{people[], countries[], projects[]}` | AI |
| `signature_phrases` | string[] | AI |
| `asks` | string[] (keys into the ask registry) | AI |
| `thesis` | string (one line) | AI |
| `key_quote` | `{text, label}` | AI |
| `source_url` | string | meta |
| `raw_text` | string (path into data/raw) | meta |

**Controlled vocabularies** (`data/vocab/`) keep coding consistent across
iterations — letter #40 is coded against the same lists as letter #1:

- `acts.json` — act definitions (id, name, period, boundary notes).
- `themes.json` — the 12-theme taxonomy.
- `asks.json` — the recurring "asks" registry (slide 13 of the deck).
- `entities.json` — canonical people / countries / projects (alias-merged).
- `definitions.json` — plain-language, Swedish definitions of every metric and
  term (tonindex, LIX, ask, …); the single source of truth surfaced in the
  product (see §7.1).

`compile.py` produces `data/letters.json` (the array the site reads) plus small
derived aggregates (per-act, per-year, per-theme) for convenience.

## 6. Ingestion — the "add a letter" loop

When letter N+1 arrives:

1. Drop the `.docx` into `data/raw/`.
2. Run `pipeline/add_letter.py path/to/letter.docx`. It:
   a. extracts text + metadata (`extract.py`),
   b. computes **scripted** metrics (`metrics.py`),
   c. produces a **draft coding** for the AI fields (`code_letter.py`) —
      themes, entities, signature phrases, asks, thesis, key_quote — against the
      controlled vocabularies, written to `data/letters/<date>.json`.
3. **Human review:** you open the new JSON, correct the AI fields, adjust `act`
   if the arc has shifted.
4. Commit. `compile.py` rebuilds `letters.json`; the site rebuilds from it.

**Scripted metric definitions** (reproducible):
- `word_count`, `avg_sentence_length` — tokenized on whitespace / sentence
  punctuation.
- `lix` = (words / sentences) + (long words >6 chars × 100 / words).
- `tone_index` = (assertive markers − hedge markers) / 1000 words. Marker lists
  ported from the rundown (assertive: *måste, kräver, avgörande, brådskande,
  akut…*; hedge: *kanske, möjligen, troligtvis, tycks, verkar…*) and stored in
  `data/vocab/` so they are auditable and extendable.
- `loanword_rate` — English loanwords / 1000 words, from a maintained list.

**Seeding:** the 33 existing letters import their **curated** coding (acts,
asks, quotes, signature phrases, themes) from the rundown/deck; mechanical
metrics are (re)computed fresh from the extracted text so the whole corpus is
internally consistent.

## 7. Presentation layer

**Stack:** Next.js (App Router, TypeScript) + Tailwind CSS, built as a **static
export** (no live backend needed). Deploys to Vercel (a private link for the
board) or GitHub Pages later — same code. Reads `data/letters.json`.

**Aesthetic:** editorial throughout (serif display, generous whitespace,
pull-quotes, the arc as a quiet hero). The detailed visual design system —
typography, palette, component styling, motion — is intentionally **left open
here** and will be finalized from a dedicated design exploration (see
`docs/design-brief.md`). The architecture is independent of these choices.

**Two views:**

- **Story view** — the three-act tone arc as the hero; scroll/step through
  narrative "beats," each surfacing a letter's thesis, signature quote, and
  coined phrase. Serves narrative + CEO mirror + board overview.
- **Explore view** — presented as an *annotated analytical essay*, not a
  filter-heavy dashboard: tone over time, theme over time, the recurring-asks
  tracker, and readability. Restraint and annotation over density.

### 7.1 Definitions & transparency

Every coined or technical term must be **explained in plain language wherever it
appears** — no undefined jargon reaches the reader. Definitions live once in
`data/vocab/definitions.json` (single source of truth) and surface two ways:

1. **Inline** — an unobtrusive "ⓘ" / info affordance next to each metric label
   (e.g. *Tonindex ⓘ*) revealing its definition on hover/tap.
2. **A short "Så här mäter vi" (how we measure) section** — a method/glossary
   block collecting all definitions, reachable from both views.

Terms to define: tonindex, LIX-läsbarhet, assertiva/hedgande markörer, engelska
låneord, akt, tema, ask (återkommande uppmaning), signaturfras, signaturcitat.

Canonical example (the voice/level every definition must match — plain, Swedish,
board-friendly, honest that it is a proxy):

> **Tonindex** — ett mått på hur *drivande* språket är. Vi räknar kraftord som
> signalerar att VD driver en linje (*måste, kräver, avgörande, brådskande*)
> minus gardingsord som signalerar öppen reservation (*kanske, möjligen,
> tycks*), per 1 000 ord. Högt positivt värde = texten driver tydligt en linje;
> nära noll eller negativt = ett mer öppet resonemang. En indikator på tonläge —
> inte en bedömning av innehållets kvalitet eller av personen.

## 8. Scope

**v1 (in scope):**
- Local git repo; existing 33 letters organized into `data/`.
- The dataset for all 33 letters (`data/letters/*.json` + `letters.json`).
- The scripted + AI pipeline with a working, documented "add a letter" runbook.
- The Next.js site with: the **three-act arc** (story) + **tone timeline** +
  **theme view** + **recurring-asks tracker** (explore), in editorial style.
- Plain-language definitions for every metric, surfaced inline + in a "Så här
  mäter vi" section, from `data/vocab/definitions.json` (§7.1).

**Roadmap (explicitly not v1):**
- Reference/entity network graph.
- Per-letter "x-ray" detail pages.
- Scrollytelling animation.
- Public GitHub Pages / Vercel deploy.
- Backfilling the 2024 introduction letters.

## 9. Methodology caveats

Carried over from the existing analysis and to be surfaced in the product:
- **Tone index is a proxy** — frequency of forceful vs. hedging words, not a
  deep rhetorical reading; read alongside human judgment.
- **Entity extraction is heuristic** — AI draft + human review; canonicalized
  via the entity registry.
- **2024 is non-representative** (7 short intro letters); main analysis is
  2025–2026.
- The product describes **published language, not the person.**

## 10. Open questions (to refine, non-blocking)

1. Detailed visual design system — from the design exploration round.
2. Final theme taxonomy — confirm the 12 categories; consider splitting out
   *life science* / *industripolitik* as flagged in the rundown.
3. Deploy & access model for the board (private Vercel link vs. password vs.
   presented on screen) — decided at deploy time.
4. Whether to backfill the 2024 letters into the dataset.
5. How `code_letter.py` obtains the AI coding — a script calling the Anthropic
   API (needs an API key) vs. an interactive Claude session with a prompt
   template you paste back. Affects setup; decided in the implementation plan.
