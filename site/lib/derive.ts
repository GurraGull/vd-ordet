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
    date: l.date,
    tone: l.tone_index,
    x: +x(i).toFixed(1),
    y: +y(l.tone_index).toFixed(1),
    isPeak: peak !== null && l.date === peak.date,
  }));
  const path = smoothPath(points.map((p) => [p.x, p.y] as [number, number]));
  const area = points.length ? `${path} L ${points[n - 1].x},${baseY} L ${pad},${baseY} Z` : '';
  const groups = groupByAct(sorted, acts);
  const dividers = groups.slice(1).map((g) => {
    const firstDate = g.letters[0].date;
    const idx = sorted.findIndex((l) => l.date === firstDate);
    return +x(idx).toFixed(1);
  });
  return { points, path, area, baseY, dividers, peak };
}
