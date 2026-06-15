import { describe, it, expect } from 'vitest';
import { groupByAct, peakLetter, actStats, coinedTerms, arcGeometry } from '../derive';
import type { Letter, ActDef } from '../types';

const acts: ActDef[] = [
  { id: 1, name: 'Akt 1', period: '', start: '2025-01-01', end: '2025-03-31', note: '' },
  { id: 2, name: 'Akt 2', period: '', start: '2025-04-01', end: '2025-10-31', note: '' },
  { id: 3, name: 'Akt 3', period: '', start: '2025-11-01', end: '2026-12-31', note: '' },
];

function L(date: string, act: number): Letter {
  return {
    date, nr: 0, title: date, series: false, act,
    word_count: 100, avg_sentence_length: 10, lix: 40, loanword_rate: 0, tone_index: 1,
    assertive_count: 0, hedge_count: 0, themes: [],
    entities: { people: [], countries: [], projects: [] },
    signature_phrases: [], asks: [], thesis: 't', key_quote: { text: '', label: '' },
    source_url: '', raw_text: '',
  };
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

describe('peakLetter', () => {
  it('returns the letter with the highest tone (not a hardcoded one)', () => {
    const ls = [L('2025-01-01', 1), { ...L('2025-07-01', 2), tone_index: 8.3 }, { ...L('2025-04-08', 2), tone_index: 3.0 }];
    expect(peakLetter(ls)!.date).toBe('2025-07-01');
  });
  it('returns null for no letters', () => { expect(peakLetter([])).toBeNull(); });
});

describe('actStats', () => {
  it('computes rounded count/avgWords/avgTone/avgLix', () => {
    const ls = [
      { ...L('2025-01-01', 1), word_count: 300, tone_index: 2, lix: 40 },
      { ...L('2025-02-01', 1), word_count: 400, tone_index: 3, lix: 50 },
    ];
    expect(actStats(ls)).toEqual({ count: 2, avgWords: 350, avgTone: 2.5, avgLix: 45 });
  });
});

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

describe('arcGeometry', () => {
  it('produces one point per letter, flags the computed peak, grows when letters are added', () => {
    const ls = [L('2025-01-01', 1), { ...L('2025-07-01', 2), tone_index: 8.3 }, L('2025-11-01', 3)];
    const g = arcGeometry(ls, acts, 1000, 300, 40);
    expect(g.points).toHaveLength(3);
    expect(g.peak!.date).toBe('2025-07-01');
    expect(g.points.find((p) => p.date === '2025-07-01')!.isPeak).toBe(true);
    expect(g.points[0].x).toBeLessThan(g.points[2].x);
    const g2 = arcGeometry([...ls, L('2026-01-01', 3)], acts, 1000, 300, 40);
    expect(g2.points).toHaveLength(4);
  });
});
