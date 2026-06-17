# VD-ordet Data Console — Implementation Plan (Plan 3 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build the dark "Signal Console" — the analytical, **forward-looking** data view the CEO will study most — on the existing dataset: an explorable letter table + a tested analytics layer (theme momentum, open asks, axis shift, white spaces, emerging signals).

**Architecture:** A new route `app/konsol/page.tsx` in the existing Next.js app, dark ("Signal Console") theme. A new pure, tested `lib/analytics.ts` derives every forward-looking read from `data/letters.json` — reproducible, no hardcoding, grows with the corpus. UI ports from `docs/design/Overview.dc.html` + `docs/design/Signal Console.dc.html`, dropping tiles that need un-computed measures (per-sentence tone, questions, imperatives, vi/jag).

**Tech Stack:** same as Plan 2 (Next.js, TS, Tailwind, Vitest). No new dependencies, no dataset changes.

---

## Principle for this audience

The CEO is a professor/researcher. Every number must be **reproducible and honest**: trajectories and signals are *derived from the data and labelled as such* — never presented as predictions. "Future prospects" = data-grounded *signals to watch*, not forecasts.

## Analytics layer — `site/lib/analytics.ts` (pure, TDD)

All consume `Letter[]` (+ `ActDef[]` / vocab) and are tested in `site/lib/__tests__/analytics.test.ts`.

1. `themeMomentum(letters, acts, themeLabels): ThemeMomentum[]`
   - Per theme: weight-share within each act (`actShares: number[]`), `total` weight, and `trend` (`'up'|'down'|'flat'` from first-present act share → last act share, threshold ±0.02).
   - `interface ThemeMomentum { theme: string; label: string; actShares: number[]; total: number; trend: 'up'|'down'|'flat' }`
   - Sorted by |last−first| descending (biggest movers first).

2. `asksTracker(letters, asks): AskStat[]`
   - Per ask id in `vocab/asks.json`: `count` (letters making it), `firstDate`, `lastDate`. Sorted by count desc.
   - `interface AskStat { id: string; label: string; count: number; firstDate: string; lastDate: string }`

3. `axisShift(letters, acts): { actId: number; usa: number; kina: number }[]`
   - Per act: number of letters whose `entities.countries` include `'USA'` / `'Kina'`. (The USA→China pivot.)
   - `topThinkers(letters, n=6): { name: string; count: number }[]` — people frequency across the corpus.

4. `themeCoverage(letters, themeLabels): ThemeCoverage[]`
   - Per theme: `total` weight + `letters` (count touching it). Sorted ascending → the **white spaces** are the head of the list. Themes with 0 coverage are included (mission gaps like climate/life-science show as lowest).
   - `interface ThemeCoverage { theme: string; label: string; total: number; letters: number }`

5. `emergingSignals(letters, acts): EmergingTerm[]`
   - Coined terms (`signature_phrases`) whose **first appearance is in the latest act** and whose total `count` is low (≤2) → candidates to recur ("watch list"). Newest first.
   - `interface EmergingTerm { term: string; firstDate: string; count: number; actId: number }`

## Screens / components (dark theme)

Route `app/konsol/page.tsx` (server: load → derive → render), full-bleed dark wrapper (`#0B0F14`). Components under `site/components/console/`:

- `ConsoleHeader` — masthead + "så tolkar du konsolen" definition strip (from `data/vocab/definitions.json`, spec §7.1).
- `MomentumPanel` — theme momentum (rising/falling, mini bars + trend arrows).
- `AsksPanel` — open-asks tracker (count, last raised).
- `AxisPanel` — USA↔Kina per act + top thinkers.
- `WhiteSpacePanel` — least-covered themes vs mission.
- `ProspectsPanel` — emerging signals "att hålla ögonen på".
- `LetterTable` — every letter, sortable (date, act, tone, LIX, words, coined term). Click → `LetterReadout`.
- `LetterReadout` — selected letter's metric tiles + thesis + quote + themes + asks.
- Cross-link with the Story (`/`).

Dark tokens (extend `tailwind.config.ts`): `night #0B0F14`, `panel #0E141B`, `line #1E2730`, `amber #E0A23C` (from the design files).

## Tasks

- [ ] **T1** Dark tokens in `tailwind.config.ts` + `app/konsol/layout` wrapper. Commit.
- [ ] **T2** `themeMomentum` — failing test → impl → green. Commit.
- [ ] **T3** `asksTracker` — TDD. Commit.
- [ ] **T4** `axisShift` + `topThinkers` — TDD. Commit.
- [ ] **T5** `themeCoverage` (white spaces) — TDD. Commit.
- [ ] **T6** `emergingSignals` — TDD. Commit.
- [ ] **T7** `ConsoleHeader` + definitions strip; `app/konsol/page.tsx` shell that builds. Commit.
- [ ] **T8** `MomentumPanel` + `WhiteSpacePanel` wired to derived data. Commit.
- [ ] **T9** `AsksPanel` + `AxisPanel` + `ProspectsPanel`. Commit.
- [ ] **T10** `LetterTable` + `LetterReadout` (client, sortable/selectable). Commit.
- [ ] **T11** Cross-links Story↔Console; run, screenshot, verify all values derived (no literals); prove-live (add letter → momentum/table grow). Commit.
- [ ] **T12** Update `site/README` + `docs/design-system.md` (console now built). Commit, then finish-branch → merge.

## Self-review

- **Spec/forward-looking coverage:** explorable foundation (T10) + theme momentum (T2/T8), open asks (T3/T9), axis shift (T4/T9), white spaces (T5/T8), future prospects (T6/T9). Definitions/transparency §7.1 (T7).
- **Existing-data only:** every function above uses fields already in `letters.json`; dropped console tiles (per-sentence tone, frågor, imperativ, vi/jag) are out.
- **Live/reproducible:** analytics are pure functions over the dataset; T11 proves growth on add.
