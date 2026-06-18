# VD-ordet — Story site

The editorial, ever-evolving **Story** view of IVA's VD-ord letters: a three-act
tone arc and a narrative beat per letter, told from the data.

## Run

```bash
cd site
npm install          # first time
npm run dev          # http://localhost:3000
npm run build        # static export → site/out/
npm test             # derivation-layer tests (vitest)
```

## How it stays "live"

The site **reads `../data/letters.json`** (produced by the Python pipeline) and
derives everything it shows in `lib/derive.ts` — act groups, the tone peak,
per-act stats, coined terms, the arc geometry. **Nothing is hardcoded** (no
fixed count, acts, or peak), so:

1. Add a letter with `docs/runbook-add-a-letter.md` (updates `data/letters.json`).
2. `npm run build` (or `npm run dev`).
3. The arc grows a beat, stats recompute, and a new act would appear on its own.

The "live" guarantees are covered by tests in `lib/__tests__/derive.test.ts`
(future-act support, data-driven peak, growth on add).

## Structure

- `app/page.tsx` — loads data, derives, renders the Story.
- `lib/data.ts` — reads the dataset at build time. `lib/derive.ts` — pure logic.
- `app/konsol/page.tsx` — the dark **data console** ("look inside"): theme
  momentum, USA↔Kina axis, open-asks tracker, white spaces, an emerging-signals
  watch list, and a sortable letter explorer. Analytics in `lib/analytics.ts`
  (tested), all derived from the same dataset.
- `components/` — `ToneArc`, `LetterBeat`, `ActStart`, `ScrollSpine`,
  `console/LetterExplorer`.
- Design tokens in `tailwind.config.ts` (warm "The Annual Essay" + the dark
  console palette; see `../docs/design-system.md`).

Two views, one dataset: **`/`** tells the story, **`/konsol`** lets you look
inside the data. Both stay live the same way (add a letter → rebuild).
