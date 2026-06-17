import type { Letter, ActDef } from './types';

export interface ThemeMomentum { theme: string; label: string; actShares: number[]; total: number; trend: 'up' | 'down' | 'flat' }
export interface AskStat { id: string; label: string; count: number; firstDate: string; lastDate: string }
export interface AxisPoint { actId: number; usa: number; kina: number }
export interface ThemeCoverage { theme: string; label: string; total: number; letters: number }
export interface EmergingTerm { term: string; firstDate: string; count: number; actId: number }

function actIds(acts: ActDef[]): number[] {
  return [...acts].sort((a, b) => a.id - b.id).map((a) => a.id);
}

export function themeMomentum(letters: Letter[], acts: ActDef[], themeLabels: Record<string, string>): ThemeMomentum[] {
  const ids = actIds(acts);
  const actTotal: Record<number, number> = Object.fromEntries(ids.map((i) => [i, 0]));
  for (const l of letters) for (const t of l.themes) if (actTotal[l.act] !== undefined) actTotal[l.act] += t.weight;

  const themeActWeight = new Map<string, Record<number, number>>();
  for (const l of letters) {
    for (const t of l.themes) {
      if (!themeActWeight.has(t.theme)) themeActWeight.set(t.theme, Object.fromEntries(ids.map((i) => [i, 0])));
      const rec = themeActWeight.get(t.theme)!;
      if (rec[l.act] !== undefined) rec[l.act] += t.weight;
    }
  }

  const out: ThemeMomentum[] = [];
  for (const [theme, rec] of themeActWeight) {
    const actShares = ids.map((id) => (actTotal[id] ? +(rec[id] / actTotal[id]).toFixed(3) : 0));
    const total = ids.reduce((s, id) => s + rec[id], 0);
    const diff = actShares[actShares.length - 1] - actShares[0];
    const trend: 'up' | 'down' | 'flat' = diff > 0.02 ? 'up' : diff < -0.02 ? 'down' : 'flat';
    out.push({ theme, label: themeLabels[theme] ?? theme, actShares, total, trend });
  }
  out.sort((a, b) => Math.abs(b.actShares[b.actShares.length - 1] - b.actShares[0]) - Math.abs(a.actShares[a.actShares.length - 1] - a.actShares[0]));
  return out;
}

export function asksTracker(letters: Letter[], asks: { id: string; label: string }[]): AskStat[] {
  const stats: AskStat[] = asks.map((a) => ({ id: a.id, label: a.label, count: 0, firstDate: '', lastDate: '' }));
  const byId = new Map(stats.map((s) => [s.id, s]));
  for (const l of [...letters].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const ask of l.asks) {
      const s = byId.get(ask);
      if (s) { s.count += 1; if (!s.firstDate) s.firstDate = l.date; s.lastDate = l.date; }
    }
  }
  return stats.filter((s) => s.count > 0).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function axisShift(letters: Letter[], acts: ActDef[]): AxisPoint[] {
  return actIds(acts).map((id) => {
    const inAct = letters.filter((l) => l.act === id);
    return {
      actId: id,
      usa: inAct.filter((l) => l.entities.countries.includes('USA')).length,
      kina: inAct.filter((l) => l.entities.countries.includes('Kina')).length,
    };
  });
}

export function topThinkers(letters: Letter[], n = 6): { name: string; count: number }[] {
  const m = new Map<string, number>();
  for (const l of letters) for (const p of l.entities.people) m.set(p, (m.get(p) ?? 0) + 1);
  return [...m.entries()].map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, n);
}

export function themeCoverage(letters: Letter[], themeLabels: Record<string, string>): ThemeCoverage[] {
  const total = new Map<string, number>();
  const touching = new Map<string, Set<string>>();
  for (const id of Object.keys(themeLabels)) { total.set(id, 0); touching.set(id, new Set()); }
  for (const l of letters) for (const t of l.themes) {
    if (!total.has(t.theme)) { total.set(t.theme, 0); touching.set(t.theme, new Set()); }
    total.set(t.theme, total.get(t.theme)! + t.weight);
    touching.get(t.theme)!.add(l.date);
  }
  return [...total.keys()].map((theme) => ({ theme, label: themeLabels[theme] ?? theme, total: total.get(theme)!, letters: touching.get(theme)!.size }))
    .sort((a, b) => a.total - b.total || a.letters - b.letters);
}

export function emergingSignals(letters: Letter[], acts: ActDef[]): EmergingTerm[] {
  const ids = actIds(acts);
  const lastAct = ids[ids.length - 1];
  const map = new Map<string, { firstDate: string; count: number; actId: number }>();
  for (const l of [...letters].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const term of l.signature_phrases) {
      const e = map.get(term);
      if (e) e.count += 1;
      else map.set(term, { firstDate: l.date, count: 1, actId: l.act });
    }
  }
  return [...map.entries()]
    .map(([term, v]) => ({ term, firstDate: v.firstDate, count: v.count, actId: v.actId }))
    .filter((t) => t.actId === lastAct && t.count <= 2)
    .sort((a, b) => b.firstDate.localeCompare(a.firstDate));
}
