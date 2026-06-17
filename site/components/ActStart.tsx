import type { ActDef, ActStats } from '@/lib/types';

export default function ActStart({ act, stats }: { act: ActDef; stats: ActStats }) {
  const tone = (stats.avgTone >= 0 ? '+' : '') + String(stats.avgTone).replace('.', ',');
  const items = [
    { v: String(stats.count), l: 'brev' },
    { v: String(stats.avgWords), l: '⌀ ord' },
    { v: tone, l: '⌀ ton' },
    { v: String(stats.avgLix).replace('.', ','), l: '⌀ LIX' },
  ];
  return (
    <header className="mt-20 mb-2 border-t-2 border-ink pt-6">
      <div className="font-mono text-xs tracking-[0.18em] text-[#9a6a1e] uppercase">Akt {act.id}</div>
      <h2 className="font-serif text-4xl text-ink mt-2">{act.name}</h2>
      <div className="font-mono text-xs text-muted mt-1">{act.period}</div>
      <p className="font-sans text-[15px] leading-relaxed text-[#33414c] mt-4 max-w-[60ch]">{act.note}</p>
      <div className="flex gap-8 mt-5">
        {items.map((s) => (
          <div key={s.l}>
            <div className="font-mono text-2xl text-ink">{s.v}</div>
            <div className="font-sans text-[11px] tracking-wide text-muted mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </header>
  );
}
