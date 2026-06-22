import Link from 'next/link';
import { loadLetters, loadActs, loadThemeLabels, loadAsks, loadDefinitions } from '@/lib/data';
import { themeMomentum, asksTracker, axisShift, topThinkers, themeCoverage, emergingSignals, conceptLifecycle, decisionPrompts } from '@/lib/analytics';
import type { DecisionPrompt } from '@/lib/analytics';
import LetterExplorer from '@/components/console/LetterExplorer';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const monthYear = (iso: string) => `${MONTHS[parseInt(iso.split('-')[1], 10) - 1]} ${iso.split('-')[0]}`;
const firstSentence = (s: string) => s.split('. ')[0].replace(/\.$/, '') + '.';
const TREND: Record<string, { mark: string; word: string; cls: string }> = {
  up: { mark: '▲', word: 'stiger', cls: 'text-amber' },
  down: { mark: '▼', word: 'avtar', cls: 'text-steel/60' },
  flat: { mark: '—', word: 'stabil', cls: 'text-steel/40' },
};

function promptText(p: DecisionPrompt): string {
  switch (p.kind) {
    case 'escalate':
      return `Du har drivit "${p.label}" i ${p.count} brev, senast ${monthYear(p.lastDate)} — utan synligt svar. Dags att eskalera?`;
    case 'revive':
      return `"${p.term}" myntades ${monthYear(p.firstDate)} och har inte återkommit — bygg vidare på det?`;
    case 'whitespace':
      return `"${p.label}" är minst belyst i serien (vikt ${p.total}) — medvetet val, eller en lucka inför årsrapporten?`;
    case 'momentum':
      return p.direction === 'up'
        ? `"${p.label}" stiger snabbast i de senaste breven — dubbla ner?`
        : `"${p.label}" avtar i de senaste breven — avsiktligt?`;
  }
}
function promptBasis(p: DecisionPrompt): string {
  return { escalate: `öppna asks · ×${(p as any).count}`, revive: 'vilande begrepp', whitespace: 'vita fläckar', momentum: 'temamomentum' }[p.kind];
}

function SectionLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="font-mono text-[11px] tracking-[0.16em] text-steel/70 uppercase mb-4">
      {children}{hint && <span className="text-steel/40 normal-case tracking-normal"> — {hint}</span>}
    </div>
  );
}

export default function KonsolPage() {
  const letters = loadLetters();
  const acts = loadActs();
  const themeLabels = loadThemeLabels();
  const asksReg = loadAsks();
  const defs = loadDefinitions();

  const momentumFull = themeMomentum(letters, acts, themeLabels);
  const momentum = momentumFull.slice(0, 8);
  const rising = new Set(momentumFull.filter((m) => m.trend === 'up').map((m) => m.theme));
  const axis = axisShift(letters, acts);
  const thinkers = topThinkers(letters, 6);
  const askStats = asksTracker(letters, asksReg);
  // white spaces = genuinely under-covered themes, excluding ones that are rising
  const whiteSpaces = themeCoverage(letters, themeLabels).filter((w) => !rising.has(w.theme)).slice(0, 4);
  const emerging = emergingSignals(letters, acts).slice(0, 8);
  const lifecycle = conceptLifecycle(letters, acts);
  const prompts = decisionPrompts(askStats, whiteSpaces, lifecycle, momentumFull);
  const etablerade = lifecycle.filter((c) => c.status === 'etablerad');
  const vilande = lifecycle.filter((c) => c.status === 'vilande' && c.count === 1).slice(0, 6);
  const oneOffs = lifecycle.filter((c) => c.count === 1).length;
  const axisMax = Math.max(1, ...axis.flatMap((a) => [a.usa, a.kina]));
  const defStrip = ['tonindex', 'lix', 'tema', 'ask'].map((k) => ({ k, text: firstSentence(defs[k] ?? '') }));

  return (
    <main className="min-h-screen text-steel" style={{ background: '#0B0F14' }}>
      {/* header */}
      <div className="sticky top-0 z-40 border-b border-line" style={{ background: '#0D131A' }}>
        <div className="max-w-[1180px] mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-amber">◆</span>
            <span className="font-mono text-xs tracking-[0.12em] text-[#EAF0F5]">IVA · VD-ORD</span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-steel/60 border border-line rounded px-2 py-0.5">KONSOL</span>
          </div>
          <Link href="/" className="font-mono text-[10px] tracking-[0.12em] text-steel/70 hover:text-amber no-underline">← BERÄTTELSE</Link>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-8 pt-12 pb-24">
        {/* hero */}
        <div className="font-mono text-[11px] tracking-[0.2em] text-amber uppercase mb-4">Signalkonsolen — det analytiska verktyget</div>
        <h1 className="text-4xl md:text-5xl text-[#F2F6FA] max-w-[18ch]" style={{ fontFamily: 'var(--font-newsreader)' }}>Vad datan säger — och vart den pekar</h1>
        <p className="text-[15px] leading-relaxed text-steel max-w-[62ch] mt-4" style={{ fontFamily: 'var(--font-franklin)' }}>
          {letters.length} VD-ord, mätta och jämförda. Allt nedan är härlett ur datan och uppdateras med varje nytt brev — trender och signaler, inte förutsägelser.
        </p>

        {/* definitions strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px mt-10 bg-line border border-line rounded overflow-hidden">
          {defStrip.map((d) => (
            <div key={d.k} className="p-4" style={{ background: '#0C1219' }}>
              <div className="font-mono text-[11px] tracking-[0.1em] text-amber uppercase mb-2">{d.k}</div>
              <p className="text-[12px] leading-relaxed text-steel/80" style={{ fontFamily: 'var(--font-franklin)' }}>{d.text}</p>
            </div>
          ))}
        </div>

        {/* decision prompts — att överväga */}
        {prompts.length > 0 && (
          <section className="mt-12 border rounded p-6" style={{ borderColor: '#3a3320', background: 'linear-gradient(135deg,#14110a,#0C1117)' }}>
            <SectionLabel hint="datadrivna frågor till dig som vd">Att överväga</SectionLabel>
            <div className="grid md:grid-cols-2 gap-x-10 gap-y-4">
              {prompts.map((p, i) => (
                <div key={i} className="flex gap-3 items-start border-t border-line/60 pt-3">
                  <span className="text-amber leading-7">→</span>
                  <div>
                    <p className="text-[15.5px] leading-relaxed text-[#EAF0F5]" style={{ fontFamily: 'var(--font-newsreader)' }}>{promptText(p)}</p>
                    <div className="font-mono text-[10px] tracking-wide text-steel/50 mt-1 uppercase">{promptBasis(p)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* forward-looking grid */}
        <div className="grid lg:grid-cols-2 gap-5 mt-14">
          {/* theme momentum */}
          <section className="border border-line rounded bg-panel p-6">
            <SectionLabel hint="vikt-andel per akt">Temamomentum</SectionLabel>
            <div className="flex flex-col gap-3">
              {momentum.map((m) => {
                const mx = Math.max(0.001, ...m.actShares);
                const t = TREND[m.trend];
                return (
                  <div key={m.theme} className="grid grid-cols-[1fr_72px_64px] items-center gap-3">
                    <span className="text-[13px] text-[#EAF0F5]" style={{ fontFamily: 'var(--font-franklin)' }}>{m.label}</span>
                    <span className="flex items-end gap-1 h-7">
                      {m.actShares.map((s, i) => (
                        <span key={i} className="w-3 rounded-sm" style={{ height: `${Math.max(3, (s / mx) * 28)}px`, background: i === m.actShares.length - 1 ? '#E0A23C' : '#2A3540' }} />
                      ))}
                    </span>
                    <span className={`font-mono text-[11px] ${t.cls}`}>{t.mark} {t.word}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* axis shift + thinkers */}
          <section className="border border-line rounded bg-panel p-6">
            <SectionLabel hint="brev som nämner landet, per akt">USA ↔ Kina</SectionLabel>
            <div className="flex flex-col gap-3">
              {axis.map((a) => (
                <div key={a.actId} className="grid grid-cols-[40px_1fr] items-center gap-3">
                  <span className="font-mono text-[11px] text-steel/60">Akt {a.actId}</span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 rounded-sm" style={{ width: `${(a.usa / axisMax) * 90}px`, background: '#5E6B76' }} />
                    <span className="font-mono text-[10px] text-steel/60 w-6">{a.usa}</span>
                    <span className="h-2 rounded-sm" style={{ width: `${(a.kina / axisMax) * 90}px`, background: '#E0A23C' }} />
                    <span className="font-mono text-[10px] text-amber w-6">{a.kina}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="font-mono text-[10px] text-steel/50 mt-2">grå = USA · guld = Kina</div>
            <div className="border-t border-line mt-5 pt-4">
              <div className="font-mono text-[10px] tracking-[0.12em] text-steel/60 uppercase mb-3">Återkommande tänkare</div>
              <div className="flex flex-wrap gap-2">
                {thinkers.map((t) => (
                  <span key={t.name} className="text-[12px] text-[#cdd6dd] border border-line rounded px-2 py-1" style={{ fontFamily: 'var(--font-newsreader)' }}>
                    {t.name} <span className="font-mono text-[10px] text-amber">×{t.count}</span>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* open asks */}
          <section className="border border-line rounded bg-panel p-6">
            <SectionLabel hint="upprepade uppmaningar, ännu obesvarade">Öppna asks</SectionLabel>
            <div className="flex flex-col gap-2.5">
              {askStats.map((a) => (
                <div key={a.id} className="grid grid-cols-[1fr_auto] items-baseline gap-3 border-b border-line/50 pb-2.5">
                  <span className="text-[13px] text-[#EAF0F5]" style={{ fontFamily: 'var(--font-franklin)' }}>{a.label}</span>
                  <span className="font-mono text-[10px] text-steel/60 whitespace-nowrap">
                    <span className="text-amber">×{a.count}</span> · senast {monthYear(a.lastDate)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* white spaces + future prospects */}
          <div className="flex flex-col gap-5">
            <section className="border border-line rounded bg-panel p-6">
              <SectionLabel hint="lägst sammanlagd vikt i serien — kandidater för mer fokus">Vita fläckar</SectionLabel>
              <div className="flex flex-col gap-2.5">
                {whiteSpaces.map((w) => (
                  <div key={w.theme} className="grid grid-cols-[1fr_auto] items-baseline gap-3">
                    <span className="text-[13px] text-[#EAF0F5]" style={{ fontFamily: 'var(--font-franklin)' }}>{w.label}</span>
                    <span className="font-mono text-[10px] text-steel/60">{w.letters} brev · vikt {w.total}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="border rounded p-6" style={{ borderColor: '#3a3320', background: 'linear-gradient(135deg,#14110a,#0C1117)' }}>
              <SectionLabel hint="nya begrepp att bevaka">Framtidsutsikter</SectionLabel>
              {emerging.length === 0 ? (
                <p className="text-[13px] text-steel/70" style={{ fontFamily: 'var(--font-franklin)' }}>Inga nya lågfrekventa begrepp i den senaste akten ännu.</p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {emerging.map((e) => (
                    <div key={e.term} className="border border-amber/30 rounded px-3 py-2" style={{ background: '#10171F' }}>
                      <div className="text-[15px] italic text-[#F2F6FA]" style={{ fontFamily: 'var(--font-newsreader)' }}>{e.term}</div>
                      <div className="font-mono text-[10px] text-steel/60 mt-1">först {monthYear(e.firstDate)} · ×{e.count}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* concept lifecycle */}
          <section className="border border-line rounded bg-panel p-6">
            <SectionLabel hint="myntade begrepp — vad stannade, vad somnade">Begreppens livscykel</SectionLabel>
            <p className="text-[14px] leading-relaxed text-steel mb-5" style={{ fontFamily: 'var(--font-franklin)' }}>
              <span className="text-[#EAF0F5]">{oneOffs} av {lifecycle.length}</span> myntade begrepp användes bara en gång — en generativ röst som sällan upprepar sig själv.
            </p>
            <div className="font-mono text-[10px] tracking-[0.12em] text-steel/60 uppercase mb-2">Återkommande &amp; vid liv</div>
            <div className="flex flex-wrap gap-2 mb-5">
              {etablerade.length ? etablerade.map((c) => (
                <span key={c.term} className="text-[13px] italic text-[#F2F6FA] border border-amber/40 rounded px-2.5 py-1" style={{ fontFamily: 'var(--font-newsreader)' }}>{c.term} <span className="font-mono text-[10px] not-italic text-amber">×{c.count}</span></span>
              )) : <span className="text-[12px] text-steel/50">—</span>}
            </div>
            <div className="font-mono text-[10px] tracking-[0.12em] text-steel/60 uppercase mb-2">Myntade en gång — att återanvända?</div>
            <div className="flex flex-col gap-1.5">
              {vilande.map((c) => (
                <div key={c.term} className="grid grid-cols-[1fr_auto] items-baseline gap-3">
                  <span className="text-[13px] italic text-[#cdd6dd]" style={{ fontFamily: 'var(--font-newsreader)' }}>{c.term}</span>
                  <span className="font-mono text-[10px] text-steel/50">myntat {monthYear(c.firstDate)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* explorer */}
        <div className="mt-16">
          <SectionLabel hint="klicka ett brev för att borra ner">Alla brev</SectionLabel>
          <LetterExplorer letters={letters} themeLabels={themeLabels} />
        </div>
      </div>
    </main>
  );
}
