# VD-ordet Story site — Implementation Plan (Plan 2 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the editorial, ever-evolving **Story** website — the warm "Annual Essay" three-act narrative — wired entirely to the existing `data/letters.json`, so adding a letter makes the story grow on its own.

**Architecture:** A Next.js (App Router, TypeScript) static-export app under `site/`. A pure, fully-tested **derivation layer** turns the raw dataset into everything the UI needs (act groups, per-act stats, the computed tone peak, coined-term aggregation, arc geometry). The UI ports the markup/styling from `docs/design/Story.dc.html` and binds it to derived values. **Nothing is hardcoded** — no "33", no fixed acts, no fixed peak — so new letters and even a future Act 4 appear automatically.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS 3, `next/font` (Newsreader, Libre Franklin, IBM Plex Mono), Vitest for the derivation layer.

---

## Scope

**This plan (Plan 2):** the foundation (Next.js scaffold + data loading + derivation layer + design tokens) and the **Story** view. Produces a working, live editorial site reading the real dataset.

**Plan 3 (later):** the dark **Console** ("look inside") view — reuses this foundation, adds the Overview + sortable letter table on the same existing data (no new metrics).

**Out:** any dataset extension (questions, imperatives, per-sentence tone, vi/jag), the Explore ridgelines, public deploy.

## Design source of truth

The exact markup, CSS, fonts, colors, SVG arc, and scroll behaviour live in `docs/design/Story.dc.html` (and `Art Direction.dc.html` for tokens). UI tasks **port from those files** rather than re-inventing styling. Its `{{ }}` template fields map to props produced by the derivation layer (Phase 0). Replace its placeholder data (invented titles, the +13,8 spike) with derived real values — per the tone-calibration decision in `docs/design-system.md`, the peak callout binds to the *computed* peak.

## File structure

```
site/
├── package.json, next.config.mjs, tsconfig.json, tailwind.config.ts,
│   postcss.config.mjs, vitest.config.ts
├── app/
│   ├── layout.tsx          fonts + html shell
│   ├── globals.css         tailwind layers + editorial base
│   └── page.tsx            the Story page (server component: load → derive → render)
├── lib/
│   ├── types.ts            Letter, ActDef, derived types
│   ├── data.ts             load data/*.json (fs, build-time)
│   └── derive.ts           PURE: groupByAct, peakLetter, actStats, coinedTerms, arcGeometry
├── components/
│   ├── ToneArc.tsx         the three-act SVG arc hero (client; draw-in animation)
│   ├── ScrollSpine.tsx     fixed left spine (client; tracks scroll)
│   ├── LetterBeat.tsx      one letter's narrative beat
│   ├── ActStart.tsx        act heading + stats inside the beat flow
│   └── Stat.tsx            a single basic-stat readout
└── lib/__tests__/
    └── derive.test.ts      TDD for the derivation layer
```

---

## Phase 0 — Foundation

### Task 1: Scaffold the Next.js app

**Files:** create `site/package.json`, `site/next.config.mjs`, `site/tsconfig.json`, `site/postcss.config.mjs`, `site/vitest.config.ts`.

- [ ] **Step 1: `site/package.json`**

```json
{
  "name": "vd-ordet-site",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "14.2.15",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/node": "20.14.0",
    "@types/react": "18.3.3",
    "typescript": "5.5.4",
    "tailwindcss": "3.4.10",
    "postcss": "8.4.41",
    "autoprefixer": "10.4.20",
    "vitest": "2.0.5"
  }
}
```

- [ ] **Step 2: `site/next.config.mjs`** (static export)

```js
/** @type {import('next').NextConfig} */
const nextConfig = { output: 'export', images: { unoptimized: true } };
export default nextConfig;
```

- [ ] **Step 3: `site/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020", "lib": ["dom", "dom.iterable", "ES2020"],
    "module": "esnext", "moduleResolution": "bundler",
    "jsx": "preserve", "strict": true, "noEmit": true,
    "esModuleInterop": true, "resolveJsonModule": true,
    "skipLibCheck": true, "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: `site/postcss.config.mjs`**

```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

- [ ] **Step 5: `site/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'node', include: ['lib/**/*.test.ts'] } });
```

- [ ] **Step 6: Install**

```bash
cd site && npm install
```
Expected: installs without error; `node_modules/` created (already gitignored).

- [ ] **Step 7: Commit**

```bash
git add site/package.json site/next.config.mjs site/tsconfig.json site/postcss.config.mjs site/vitest.config.ts site/package-lock.json
git commit -m "chore: scaffold Next.js static-export site"
```

---

### Task 2: Design tokens (Tailwind + fonts + base CSS)

**Files:** create `site/tailwind.config.ts`, `site/app/globals.css`, `site/app/layout.tsx`.

- [ ] **Step 1: `site/tailwind.config.ts`** — palette from `docs/design/Art Direction.dc.html` ("The Annual Essay")

```ts
import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F3EA',
        ink: '#0E3A5E',     // IVA blue
        gold: '#C8A24A',    // antique gold (use sparingly)
        muted: '#5E6B76',
      },
      fontFamily: {
        serif: ['var(--font-newsreader)', 'Georgia', 'serif'],
        sans: ['var(--font-franklin)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 2: `site/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }
body { background: #F7F3EA; color: #1d2b36; }
```

- [ ] **Step 3: `site/app/layout.tsx`** (load fonts via next/font)

```tsx
import type { Metadata } from 'next';
import { Newsreader, Libre_Franklin, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const newsreader = Newsreader({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-newsreader' });
const franklin = Libre_Franklin({ subsets: ['latin'], variable: '--font-franklin' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });

export const metadata: Metadata = { title: 'VD-ordet 2025–2026', description: 'En berättelse i tre akter' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${newsreader.variable} ${franklin.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add site/tailwind.config.ts site/app/globals.css site/app/layout.tsx
git commit -m "feat: add editorial design tokens and font loading"
```

---

### Task 3: Types

**Files:** create `site/lib/types.ts`.

- [ ] **Step 1: Write the types** (mirror the dataset schema)

```ts
export interface ThemeWeight { theme: string; weight: number }
export interface Entities { people: string[]; countries: string[]; projects: string[] }
export interface KeyQuote { text: string; label: string }

export interface Letter {
  date: string; nr: number; title: string; series: boolean; act: number;
  word_count: number; avg_sentence_length: number; lix: number;
  loanword_rate: number; tone_index: number;
  assertive_count: number; hedge_count: number;
  themes: ThemeWeight[]; entities: Entities;
  signature_phrases: string[]; asks: string[];
  thesis: string; key_quote: KeyQuote; source_url: string; raw_text: string;
}

export interface ActDef { id: number; name: string; period: string; start: string; end: string; note: string }
export interface ActStats { count: number; avgWords: number; avgTone: number; avgLix: number }
export interface CoinedTerm { term: string; firstDate: string; count: number }
export interface ArcPoint { date: string; tone: number; x: number; y: number; isPeak: boolean }
export interface ArcGeometry { points: ArcPoint[]; path: string; area: string; baseY: number; dividers: number[]; peak: ArcPoint | null }
```

- [ ] **Step 2: Commit**

```bash
git add site/lib/types.ts
git commit -m "feat: add dataset and derived types"
```

---

### Task 4: Data loader

**Files:** create `site/lib/data.ts`.

- [ ] **Step 1: Write the loader** (reads the repo-root `data/` at build time)

```ts
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Letter, ActDef } from './types';

const DATA_DIR = join(process.cwd(), '..', 'data');

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, rel), 'utf-8')) as T;
}

export function loadLetters(): Letter[] { return readJson<Letter[]>('letters.json'); }
export function loadActs(): ActDef[] { return readJson<ActDef[]>('vocab/acts.json'); }
export function loadThemeLabels(): Record<string, string> {
  const themes = readJson<{ id: string; label: string }[]>('vocab/themes.json');
  return Object.fromEntries(themes.map((t) => [t.id, t.label]));
}
```

- [ ] **Step 2: Smoke-check it loads the real data**

```bash
cd site && node -e "const {execSync}=require('child_process'); require('tsx')" 2>/dev/null; \
node --input-type=module -e "import {readFileSync} from 'fs'; const d=JSON.parse(readFileSync('../data/letters.json','utf-8')); console.log('letters:', d.length)"
```
Expected: `letters: 33`. (If `process.cwd()` differs when building, this confirms the relative path from `site/` is correct.)

- [ ] **Step 3: Commit**

```bash
git add site/lib/data.ts
git commit -m "feat: load dataset from repo data/ at build time"
```

---

### Task 5: Derivation — group by act (the "live" core)

**Files:** create `site/lib/derive.ts`, `site/lib/__tests__/derive.test.ts`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { groupByAct } from '../derive';
import type { Letter, ActDef } from '../types';

const acts: ActDef[] = [
  { id: 1, name: 'Akt 1', period: '', start: '2025-01-01', end: '2025-03-31', note: '' },
  { id: 2, name: 'Akt 2', period: '', start: '2025-04-01', end: '2025-10-31', note: '' },
  { id: 3, name: 'Akt 3', period: '', start: '2025-11-01', end: '2026-12-31', note: '' },
];
function L(date: string, act: number): Letter {
  return { date, nr: 0, title: date, series: false, act, word_count: 100, avg_sentence_length: 10,
    lix: 40, loanword_rate: 0, tone_index: 1, assertive_count: 0, hedge_count: 0, themes: [],
    entities: { people: [], countries: [], projects: [] }, signature_phrases: [], asks: [],
    thesis: 't', key_quote: { text: '', label: '' }, source_url: '', raw_text: '' };
}

describe('groupByAct', () => {
  it('groups letters under their act, drops empty acts, sorts by date', () => {
    const groups = groupByAct([L('2025-02-01', 1), L('2025-01-01', 1), L('2025-05-01', 2)], acts);
    expect(groups.map((g) => g.act.id)).toEqual([1, 2]);
    expect(groups[0].letters.map((l) => l.date)).toEqual(['2025-01-01', '2025-02-01']);
  });

  it('supports a future act with no code change (no hardcoded 3)', () => {
    const acts4 = [...acts, { id: 4, name: 'Akt 4', period: '', start: '2027-01-01', end: '2027-12-31', note: '' }];
    const groups = groupByAct([L('2025-01-01', 1), L('2027-02-01', 4)], acts4);
    expect(groups.map((g) => g.act.id)).toEqual([1, 4]);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd site && npm test`
Expected: FAIL — `groupByAct` not exported.

- [ ] **Step 3: Implement**

```ts
import type { Letter, ActDef, ActStats, CoinedTerm, ArcGeometry, ArcPoint } from './types';

export function groupByAct(letters: Letter[], acts: ActDef[]): { act: ActDef; letters: Letter[] }[] {
  return [...acts]
    .sort((a, b) => a.id - b.id)
    .map((act) => ({
      act,
      letters: letters.filter((l) => l.act === act.id).sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .filter((g) => g.letters.length > 0);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd site && npm test`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add site/lib/derive.ts site/lib/__tests__/derive.test.ts
git commit -m "feat: derive act groups (data-driven, supports future acts)"
```

---

### Task 6: Derivation — peak letter + act stats

**Files:** modify `site/lib/derive.ts`, `site/lib/__tests__/derive.test.ts`.

- [ ] **Step 1: Append failing tests**

```ts
import { peakLetter, actStats } from '../derive';

describe('peakLetter', () => {
  it('returns the letter with the highest tone (not a hardcoded one)', () => {
    const ls = [L('2025-01-01', 1), { ...L('2025-07-01', 2), tone_index: 8.3 }, { ...L('2025-04-08', 2), tone_index: 3.0 }];
    expect(peakLetter(ls)!.date).toBe('2025-07-01');
  });
  it('returns null for no letters', () => { expect(peakLetter([])).toBeNull(); });
});

describe('actStats', () => {
  it('computes rounded count/avgWords/avgTone/avgLix', () => {
    const ls = [{ ...L('2025-01-01', 1), word_count: 300, tone_index: 2, lix: 40 },
                { ...L('2025-02-01', 1), word_count: 400, tone_index: 3, lix: 50 }];
    expect(actStats(ls)).toEqual({ count: 2, avgWords: 350, avgTone: 2.5, avgLix: 45 });
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd site && npm test`
Expected: FAIL — `peakLetter`/`actStats` not exported.

- [ ] **Step 3: Implement (append to `derive.ts`)**

```ts
export function peakLetter(letters: Letter[]): Letter | null {
  if (letters.length === 0) return null;
  return letters.reduce((m, l) => (l.tone_index > m.tone_index ? l : m), letters[0]);
}

export function actStats(letters: Letter[]): ActStats {
  const n = letters.length;
  if (n === 0) return { count: 0, avgWords: 0, avgTone: 0, avgLix: 0 };
  const r1 = (x: number) => Math.round(x * 10) / 10;
  return {
    count: n,
    avgWords: Math.round(letters.reduce((s, l) => s + l.word_count, 0) / n),
    avgTone: r1(letters.reduce((s, l) => s + l.tone_index, 0) / n),
    avgLix: r1(letters.reduce((s, l) => s + l.lix, 0) / n),
  };
}
```

- [ ] **Step 4: Run to verify it passes** — Run: `cd site && npm test` — Expected: all passed.

- [ ] **Step 5: Commit**

```bash
git add site/lib/derive.ts site/lib/__tests__/derive.test.ts
git commit -m "feat: derive computed tone peak and per-act stats"
```

---

### Task 7: Derivation — coined terms

**Files:** modify `site/lib/derive.ts`, `site/lib/__tests__/derive.test.ts`.

- [ ] **Step 1: Append failing test**

```ts
import { coinedTerms } from '../derive';

describe('coinedTerms', () => {
  it('aggregates signature phrases with earliest date and occurrence count', () => {
    const ls = [
      { ...L('2025-04-08', 2), signature_phrases: ['stresstest'] },
      { ...L('2025-06-03', 2), signature_phrases: ['dual use', 'stresstest'] },
    ];
    const terms = coinedTerms(ls);
    expect(terms[0]).toEqual({ term: 'stresstest', firstDate: '2025-04-08', count: 2 });
    expect(terms.find((t) => t.term === 'dual use')).toEqual({ term: 'dual use', firstDate: '2025-06-03', count: 1 });
  });
});
```

- [ ] **Step 2: Run to verify it fails** — Run: `cd site && npm test` — Expected: FAIL, `coinedTerms` not exported.

- [ ] **Step 3: Implement (append)**

```ts
export function coinedTerms(letters: Letter[]): CoinedTerm[] {
  const map = new Map<string, { firstDate: string; count: number }>();
  for (const l of [...letters].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const term of l.signature_phrases) {
      const e = map.get(term);
      if (e) e.count += 1;
      else map.set(term, { firstDate: l.date, count: 1 });
    }
  }
  return [...map.entries()]
    .map(([term, v]) => ({ term, firstDate: v.firstDate, count: v.count }))
    .sort((a, b) => b.count - a.count || a.firstDate.localeCompare(b.firstDate));
}
```

- [ ] **Step 4: Run to verify it passes** — Run: `cd site && npm test` — Expected: all passed.

- [ ] **Step 5: Commit**

```bash
git add site/lib/derive.ts site/lib/__tests__/derive.test.ts
git commit -m "feat: derive coined-term aggregation"
```

---

### Task 8: Derivation — arc geometry + smoothing

**Files:** modify `site/lib/derive.ts`, `site/lib/__tests__/derive.test.ts`.

- [ ] **Step 1: Append failing test**

```ts
import { arcGeometry } from '../derive';

describe('arcGeometry', () => {
  it('produces one point per letter and flags the computed peak', () => {
    const ls = [L('2025-01-01', 1), { ...L('2025-07-01', 2), tone_index: 8.3 }, L('2025-11-01', 3)];
    const g = arcGeometry(ls, acts, 1000, 300, 40);
    expect(g.points).toHaveLength(3);
    expect(g.peak!.date).toBe('2025-07-01');
    expect(g.points.find((p) => p.date === '2025-07-01')!.isPeak).toBe(true);
    // x increases left-to-right with chronological order
    expect(g.points[0].x).toBeLessThan(g.points[2].x);
    // adding a letter grows the arc (the "live" guarantee)
    const g2 = arcGeometry([...ls, L('2026-01-01', 3)], acts, 1000, 300, 40);
    expect(g2.points).toHaveLength(4);
  });
});
```

- [ ] **Step 2: Run to verify it fails** — Run: `cd site && npm test` — Expected: FAIL, `arcGeometry` not exported.

- [ ] **Step 3: Implement (append)** — Catmull-Rom smoothing ported from `docs/design/Story.dc.html`

```ts
function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0][0]},${pts[0][1]}` : '';
  let d = `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

export function arcGeometry(letters: Letter[], acts: ActDef[], W = 1000, H = 300, pad = 40): ArcGeometry {
  const sorted = [...letters].sort((a, b) => a.date.localeCompare(b.date));
  const n = sorted.length;
  const peak = peakLetter(sorted);
  const tMax = Math.max(1, ...sorted.map((l) => l.tone_index));
  const x = (i: number) => pad + (n <= 1 ? 0 : (i / (n - 1)) * (W - 2 * pad));
  const baseY = H - 10;
  const y = (t: number) => baseY - (Math.max(0, t) / tMax) * (H - 30);
  const points: ArcPoint[] = sorted.map((l, i) => ({
    date: l.date, tone: l.tone_index, x: +x(i).toFixed(1), y: +y(l.tone_index).toFixed(1),
    isPeak: peak !== null && l.date === peak.date,
  }));
  const path = smoothPath(points.map((p) => [p.x, p.y]));
  const area = points.length ? `${path} L ${points[n - 1].x},${baseY} L ${pad},${baseY} Z` : '';
  // act dividers at the x of the first letter of each act after the first
  const groups = groupByAct(sorted, acts);
  const dividers = groups.slice(1).map((g) => {
    const firstDate = g.letters[0].date;
    const idx = sorted.findIndex((l) => l.date === firstDate);
    return +x(idx).toFixed(1);
  });
  return { points, path, area, baseY, dividers, peak };
}
```

- [ ] **Step 4: Run to verify it passes** — Run: `cd site && npm test` — Expected: all passed.

- [ ] **Step 5: Commit**

```bash
git add site/lib/derive.ts site/lib/__tests__/derive.test.ts
git commit -m "feat: derive arc geometry with data-driven peak and dividers"
```

---

## Phase 1 — Story view

> UI tasks: port markup/CSS from `docs/design/Story.dc.html`, binding `{{ }}` fields to the derived values from Phase 0. Verify by running the site (Task 13). Acceptance for every UI task: **no literal data values in JSX** — every number/label comes from props.

### Task 9: ToneArc hero component

**Files:** create `site/components/ToneArc.tsx`.

- [ ] **Step 1: Build the component** — props are the derived `ArcGeometry` + act labels; SVG markup ported from the `<!-- HERO ARC -->` block of `docs/design/Story.dc.html`

```tsx
'use client';
import { useEffect, useRef } from 'react';
import type { ArcGeometry, ActDef } from '@/lib/types';

export default function ToneArc({ geo, acts }: { geo: ArcGeometry; acts: ActDef[] }) {
  const lineRef = useRef<SVGPathElement>(null);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const line = lineRef.current;
    if (!line || reduced) return;
    const len = line.getTotalLength();
    line.style.strokeDasharray = String(len);
    line.style.strokeDashoffset = String(len);
    line.getBoundingClientRect();
    requestAnimationFrame(() => {
      line.style.transition = 'stroke-dashoffset 2s cubic-bezier(.45,0,.15,1)';
      line.style.strokeDashoffset = '0';
    });
  }, [geo.path]);

  const peak = geo.peak;
  return (
    <svg viewBox="0 0 1000 340" className="w-full h-auto overflow-visible" role="img"
      aria-label="Tonindex över tid, tre akter">
      {/* baseline + act dividers + area + line + points + peak callout + act labels:
          port exact strokes/fills from docs/design/Story.dc.html. Bind:
          area => geo.area, line d => geo.path (ref={lineRef}),
          points => geo.points (cx=p.x, cy=p.y, fill gold if p.isPeak),
          dividers => geo.dividers, peak callout x => peak.x with peak.tone label,
          act labels => acts positioned at the midpoint x of each act's points. */}
    </svg>
  );
}
```

- [ ] **Step 2: Fill the SVG body** by porting the gridlines, dividers, `<path>` area/line, `<circle>` points, the peak annotation (label text = `+${peak.tone.toFixed(1).replace('.', ',')}` and `peak` letter's title), and act labels — all bound to props, no literals.

- [ ] **Step 3: Commit**

```bash
git add site/components/ToneArc.tsx
git commit -m "feat: data-driven three-act tone arc hero"
```

---

### Task 10: LetterBeat + ActStart components

**Files:** create `site/components/LetterBeat.tsx`, `site/components/ActStart.tsx`.

- [ ] **Step 1: `LetterBeat.tsx`** — one letter's narrative beat; markup/CSS ported from the `<!-- NARRATIVE BEATS -->` block

```tsx
import type { Letter } from '@/lib/types';

export default function LetterBeat({ letter, themeLabels }: { letter: Letter; themeLabels: Record<string, string> }) {
  const term = letter.signature_phrases[0];
  return (
    <article className="...port from Story.dc.html beat...">
      {/* date => letter.date; title => letter.title;
          thesis => letter.thesis (sans);
          quote => letter.key_quote.text (font-serif italic);
          "Myntat begrepp" chip shown only if term exists => term;
          themes => letter.themes.map(t => themeLabels[t.theme]);
          tone readout => letter.tone_index (mono). No literals. */}
    </article>
  );
}
```

- [ ] **Step 2: `ActStart.tsx`** — act heading shown before the first beat of each act

```tsx
import type { ActDef, ActStats } from '@/lib/types';

export default function ActStart({ act, stats }: { act: ActDef; stats: ActStats }) {
  return (
    <header className="...port act-label styling...">
      {/* act.name, act.period, act.note; stats.count brev, stats.avgWords ord,
          stats.avgTone ton, stats.avgLix LIX. No literals. */}
    </header>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add site/components/LetterBeat.tsx site/components/ActStart.tsx
git commit -m "feat: letter beat and act-start components"
```

---

### Task 11: Story page assembly

**Files:** create `site/app/page.tsx`.

- [ ] **Step 1: Assemble** (server component: load → derive → render)

```tsx
import { loadLetters, loadActs, loadThemeLabels } from '@/lib/data';
import { groupByAct, arcGeometry, actStats } from '@/lib/derive';
import ToneArc from '@/components/ToneArc';
import ActStart from '@/components/ActStart';
import LetterBeat from '@/components/LetterBeat';

export default function StoryPage() {
  const letters = loadLetters();
  const acts = loadActs();
  const themeLabels = loadThemeLabels();
  const geo = arcGeometry(letters, acts);
  const groups = groupByAct(letters, acts);

  return (
    <main className="...port masthead + hero wrapper from Story.dc.html...">
      {/* Masthead, HERO heading (port copy) */}
      <ToneArc geo={geo} acts={acts} />
      {groups.map((g) => (
        <section key={g.act.id}>
          <ActStart act={g.act} stats={actStats(g.letters)} />
          {g.letters.map((l) => <LetterBeat key={l.date} letter={l} themeLabels={themeLabels} />)}
        </section>
      ))}
      {/* Coda (port copy) */}
    </main>
  );
}
```

- [ ] **Step 2: Build to verify it compiles & exports**

Run: `cd site && npm run build`
Expected: build succeeds; `out/` produced with `index.html`.

- [ ] **Step 3: Commit**

```bash
git add site/app/page.tsx
git commit -m "feat: assemble the data-driven Story page"
```

---

### Task 12: Scroll spine (progressive enhancement)

**Files:** create `site/components/ScrollSpine.tsx`; modify `site/app/page.tsx` to mount it.

- [ ] **Step 1: Build** the fixed left spine (port `<!-- Fixed scroll spine -->`); it renders act ticks from `acts` and highlights the active act on scroll. Visible only ≥1120px (`hidden xl:block` per the design's breakpoint). Respects `prefers-reduced-motion`.

```tsx
'use client';
import { useEffect, useState } from 'react';
import type { ActDef } from '@/lib/types';

export default function ScrollSpine({ acts }: { acts: ActDef[] }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const onScroll = () => { /* set active act from section offsets; port from design */ };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <nav className="hidden xl:block fixed left-0 top-0 ...port spine...">{/* acts ticks */}</nav>;
}
```

- [ ] **Step 2: Build to verify** — Run: `cd site && npm run build` — Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add site/components/ScrollSpine.tsx site/app/page.tsx
git commit -m "feat: scroll spine enhancement (>=1120px, reduced-motion safe)"
```

---

### Task 13: Run, verify against design, and prove it's live

- [ ] **Step 1: Run the dev server and screenshot**

Run: `cd site && npm run dev` then open `http://localhost:3000`.
Verify against `docs/design/Story.dc.html` and `docs/design/screenshots/`:
- editorial look matches (fonts, warm paper, arc as hero);
- the arc shows **33 points**;
- the peak callout labels the **computed** peak — *Europas säkerhet* (2025-07-01), **not** Stresstest (per `docs/design-system.md`);
- each act section shows real stats (Act 1 ⌀323 ord, Act 2 ⌀621, Act 3 ⌀733).

- [ ] **Step 2: Prove "live"** — add one synthetic letter, recompile, rebuild, confirm growth, then revert

```bash
cp data/letters/2026-04-21.json /tmp/beat.json
python -c "import json; d=json.load(open('data/letters/2026-04-21.json')); d['date']='2026-05-05'; d['title']='TESTBREV'; json.dump(d, open('data/letters/2026-05-05.json','w'), ensure_ascii=False, indent=2)"
. .venv/bin/activate && python -c "from pipeline.compile import compile_dataset; compile_dataset('data/letters','data/letters.json','data/aggregates.json')"
cd site && npm run build && echo "rebuilt — confirm 34 points / new beat in out/index.html, then revert:"
```
Then revert: `rm data/letters/2026-05-05.json && . .venv/bin/activate && python -c "from pipeline.compile import compile_dataset; compile_dataset('data/letters','data/letters.json','data/aggregates.json')"`
Expected: with the extra file the arc/beats grow to 34 with **no code change**; after revert, back to 33.

- [ ] **Step 3: Commit any fixes from verification**

```bash
git add -A site/
git commit -m "fix: Story view adjustments from design + live verification"
```

---

### Task 14: Run docs

**Files:** create `site/README.md`.

- [ ] **Step 1: Write** how to run (`npm install`, `npm run dev`, `npm run build` → `out/`), that it reads `../data/letters.json`, and that adding a letter (via `docs/runbook-add-a-letter.md`) + `npm run build` refreshes the story. Note Console is Plan 3.

- [ ] **Step 2: Commit**

```bash
git add site/README.md
git commit -m "docs: how to run and rebuild the Story site"
```

---

## Self-review notes

- **Spec coverage:** editorial Story view (Tasks 9–12), three-act arc + narrative beats + basic stats (Tasks 8–11), data-as-backbone/live (Tasks 4–8, proven in Task 13 Step 2), editorial "Annual Essay" tokens (Task 2 per `docs/design-system.md`), Swedish UI (copy ported from design). Console = Plan 3 (out of scope here). Definitions/transparency (spec §7.1): the Story surfaces basic stats; the metric-definition "ⓘ"/"Så här mäter vi" block carries over to the Console plan and `data/vocab/definitions.json` is ready.
- **No hardcoding guarantee:** enforced by derive tests (Tasks 5–8: future-act, peak, growth) and Task 13 Step 2 (live check). Every UI task forbids literal data values.
- **Placeholder scan:** UI tasks intentionally reference `docs/design/Story.dc.html` for exact CSS rather than duplicating it (DRY); they include concrete prop bindings and an acceptance check, not vague "style it nicely."
- **Type consistency:** `Letter`, `ActDef`, `ArcGeometry`, `ActStats`, `CoinedTerm` defined in Task 3 and used unchanged in Tasks 5–11; `arcGeometry`/`groupByAct`/`actStats`/`peakLetter`/`coinedTerms` signatures stable across tasks.
