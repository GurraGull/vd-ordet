import { describe, it, expect } from 'vitest';
import { themeMomentum, asksTracker, axisShift, topThinkers, themeCoverage, emergingSignals, conceptLifecycle, decisionPrompts } from '../analytics';
import type { Letter, ActDef } from '../types';

const acts: ActDef[] = [
  { id: 1, name: 'Akt 1', period: '', start: '2025-01-01', end: '2025-03-31', note: '' },
  { id: 2, name: 'Akt 2', period: '', start: '2025-04-01', end: '2025-10-31', note: '' },
  { id: 3, name: 'Akt 3', period: '', start: '2025-11-01', end: '2026-12-31', note: '' },
];
const themeLabels = {
  eu_konkurrenskraft: 'EU', dual_use_deeptech: 'Dual use', sakerhet_forsvar: 'Säkerhet',
  kina: 'Kina', klimat_energi: 'Klimat',
};
const asks = [{ id: 'dual_use_strategi', label: 'Dual use' }, { id: 'strategisk_oumbarlighet', label: 'Strategisk' }];

function L(date: string, act: number, over: Partial<Letter>): Letter {
  return {
    date, nr: 0, title: date, series: false, act, word_count: 100, avg_sentence_length: 10,
    lix: 40, loanword_rate: 0, tone_index: 1, assertive_count: 0, hedge_count: 0, themes: [],
    entities: { people: [], countries: [], projects: [] }, signature_phrases: [], asks: [],
    thesis: 't', key_quote: { text: '', label: '' }, source_url: '', raw_text: '', ...over,
  };
}

const data: Letter[] = [
  L('2025-02-01', 1, { themes: [{ theme: 'eu_konkurrenskraft', weight: 3 }], entities: { people: ['Donald Trump'], countries: ['USA'], projects: [] } }),
  L('2025-06-01', 2, { themes: [{ theme: 'dual_use_deeptech', weight: 3 }, { theme: 'sakerhet_forsvar', weight: 2 }], asks: ['dual_use_strategi'], signature_phrases: ['dual use'], entities: { people: ['Mario Draghi'], countries: [], projects: [] } }),
  L('2025-07-01', 2, { themes: [{ theme: 'sakerhet_forsvar', weight: 3 }], asks: ['dual_use_strategi'], entities: { people: ['Mario Draghi'], countries: ['USA'], projects: [] } }),
  L('2026-02-01', 3, { themes: [{ theme: 'kina', weight: 3 }, { theme: 'eu_konkurrenskraft', weight: 1 }], signature_phrases: ['polycen'], entities: { people: ['Mario Draghi'], countries: ['Kina'], projects: [] } }),
  L('2026-04-01', 3, { themes: [{ theme: 'kina', weight: 3 }], asks: ['strategisk_oumbarlighet'], signature_phrases: ['niche superpower'], entities: { people: ['Walter Russell Mead'], countries: ['Kina', 'USA'], projects: [] } }),
];

describe('themeMomentum', () => {
  it('flags China as rising (absent early, present in the last act)', () => {
    const m = themeMomentum(data, acts, themeLabels);
    expect(m.find((x) => x.theme === 'kina')!.trend).toBe('up');
  });
});

describe('asksTracker', () => {
  it('counts recurrences with first/last dates, sorted by count', () => {
    const a = asksTracker(data, asks);
    expect(a[0]).toMatchObject({ id: 'dual_use_strategi', count: 2, firstDate: '2025-06-01', lastDate: '2025-07-01' });
  });
});

describe('axisShift', () => {
  it('shows the USA→China pivot across acts', () => {
    const ax = axisShift(data, acts);
    expect(ax).toEqual([
      { actId: 1, usa: 1, kina: 0 },
      { actId: 2, usa: 1, kina: 0 },
      { actId: 3, usa: 1, kina: 2 },
    ]);
  });
  it('ranks recurring thinkers', () => {
    expect(topThinkers(data, 6)[0]).toEqual({ name: 'Mario Draghi', count: 3 });
  });
});

describe('themeCoverage', () => {
  it('puts a zero-coverage mission theme (klimat) at the head as a white space', () => {
    const c = themeCoverage(data, themeLabels);
    expect(c[0].theme).toBe('klimat_energi');
    expect(c[0].total).toBe(0);
  });
});

const acts4 = [
  ...acts,
  { id: 4, name: 'Akt 4', period: '', start: '2026-05-01', end: '2026-12-31', note: '' },
];

describe('conceptLifecycle', () => {
  const data4: Letter[] = [
    L('2025-06-01', 2, { signature_phrases: ['alpha'] }),
    L('2026-02-01', 3, { signature_phrases: ['beta'] }),
    L('2026-06-01', 4, { signature_phrases: ['beta'] }),
    L('2026-05-10', 4, { signature_phrases: ['gamma'] }),
    L('2026-01-01', 3, { signature_phrases: ['delta'] }),
    L('2026-03-01', 3, { signature_phrases: ['delta'] }),
  ];
  it('classifies established / dormant / new concepts', () => {
    const lc = conceptLifecycle(data4, acts4);
    const by = Object.fromEntries(lc.map((c) => [c.term, c.status]));
    expect(by).toEqual({ beta: 'etablerad', delta: 'vilande', alpha: 'vilande', gamma: 'ny' });
    expect(lc.find((c) => c.term === 'beta')!.count).toBe(2);
  });
  it('scores notability higher for a title-defining concept than a passing mention', () => {
    const ls: Letter[] = [
      L('2026-01-07', 3, { signature_phrases: ['polycen'], title: 'om en ny era: polycen' }),
      L('2026-04-07', 3, { signature_phrases: ['made in china'], title: 'hur läser EU Kina' }),
    ];
    const lc = conceptLifecycle(ls, acts4);
    expect(lc.find((c) => c.term === 'polycen')!.notability).toBeGreaterThan(lc.find((c) => c.term === 'made in china')!.notability);
    expect(lc[0].term).toBe('polycen');
  });
});

describe('decisionPrompts', () => {
  it('builds escalate / revive / whitespace / momentum prompts from the analytics', () => {
    const askStats = asksTracker(data, asks);
    const lc = conceptLifecycle([L('2025-06-01', 2, { signature_phrases: ['gammalt'] })], acts4);
    const cov = themeCoverage(data, themeLabels);
    const mom = themeMomentum(data, acts, themeLabels);
    const prompts = decisionPrompts(askStats, cov, lc, mom);
    const kinds = prompts.map((p) => p.kind);
    expect(kinds).toContain('revive');
    expect(kinds).toContain('whitespace');
    const revive = prompts.find((p) => p.kind === 'revive');
    expect(revive && 'term' in revive && revive.term).toBe('gammalt');
  });
});

describe('emergingSignals', () => {
  it('returns last-act, low-count coined terms newest-first; excludes older terms', () => {
    const e = emergingSignals(data, acts);
    expect(e.map((t) => t.term)).toEqual(['niche superpower', 'polycen']);
  });
});
