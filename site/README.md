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
- `components/` — `ToneArc` (arc hero), `LetterBeat`, `ActStart`, `ScrollSpine`.
- Design tokens in `tailwind.config.ts` ("The Annual Essay"; see `../docs/design-system.md`).

The dark "look inside" **console** is a later phase (Plan 3), on this same data.
