import type { ActDef, ActStats } from '@/lib/types';

function toneStr(t: number): string {
  return (t >= 0 ? '+' : '') + String(t).replace('.', ',');
}

export default function ExecutiveSummary({ lead, acts }: { lead: string; acts: { act: ActDef; stats: ActStats }[] }) {
  return (
    <section className="max-w-[1120px] mx-auto px-10 pt-10 pb-8 border-t border-[#e3dac4]">
      <div className="font-mono text-[11px] tracking-[0.16em] text-[#9a6a1e] uppercase mb-4">Sammanfattning</div>
      <p className="font-serif text-2xl md:text-[26px] leading-relaxed text-ink max-w-[70ch] mb-12">{lead}</p>
      <div className="grid md:grid-cols-3 gap-x-8 gap-y-10">
        {acts.map(({ act, stats }) => (
          <div key={act.id} className="border-t-2 border-ink pt-4">
            <div className="font-mono text-[11px] tracking-[0.14em] text-[#9a6a1e] uppercase">Akt {act.id}</div>
            <h3 className="font-serif text-2xl text-ink mt-1 leading-tight">{act.name}</h3>
            <div className="font-mono text-xs text-muted mt-1">{act.period}</div>
            <p className="font-sans text-[14px] leading-relaxed text-[#33414c] mt-3">{act.summary ?? act.note}</p>
            <div className="font-mono text-[11px] text-muted mt-4 tabular-nums">
              {stats.count} brev · ⌀{stats.avgWords} ord · ton {toneStr(stats.avgTone)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
