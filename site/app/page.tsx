import Link from 'next/link';
import { loadLetters, loadActs, loadThemeLabels } from '@/lib/data';
import { groupByAct, arcGeometry, actStats } from '@/lib/derive';
import ToneArc from '@/components/ToneArc';
import ActStart from '@/components/ActStart';
import LetterBeat from '@/components/LetterBeat';
import ScrollSpine from '@/components/ScrollSpine';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
function monthYear(iso: string): string {
  const [y, m] = iso.split('-');
  return `${MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

export default function StoryPage() {
  const letters = loadLetters();
  const acts = loadActs();
  const themeLabels = loadThemeLabels();
  const geo = arcGeometry(letters, acts);
  const groups = groupByAct(letters, acts);

  const actLabels = groups.map((g) => {
    const xs = g.letters
      .map((l) => geo.points.find((p) => p.date === l.date)?.x)
      .filter((x): x is number => x !== undefined);
    const cx = xs.reduce((s, x) => s + x, 0) / (xs.length || 1);
    return { name: `Akt ${g.act.id}`, cx };
  });

  const sorted = [...letters].sort((a, b) => a.date.localeCompare(b.date));
  const range = `${monthYear(sorted[0].date)} – ${monthYear(sorted[sorted.length - 1].date)}`;

  return (
    <main className="bg-paper min-h-screen">
      <ScrollSpine acts={acts} />
      {/* Masthead */}
      <div className="border-b border-[#e3dac4]">
        <div className="max-w-[1120px] mx-auto px-10 py-3 flex items-center justify-between">
          <span className="font-mono text-xs tracking-[0.16em] text-ink">IVA · VD-ORD</span>
          <span className="flex items-center gap-5">
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted">{letters.length} BREV · BERÄTTELSE</span>
            <Link href="/konsol" className="font-mono text-[10px] tracking-[0.16em] text-ink hover:text-gold no-underline">KONSOL →</Link>
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-[1120px] mx-auto px-10 pt-16 pb-6">
        <div className="font-mono text-[11px] tracking-[0.2em] text-[#9a6a1e] uppercase mb-6">
          En analys av Sylvia Schwaag Sergers VD-ord · {range}
        </div>
        <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] text-ink max-w-[16ch]">
          Rösten som <span className="text-gold">växte fram</span>
        </h1>
        <p className="font-serif text-xl md:text-2xl leading-relaxed text-[#46535d] max-w-[56ch] mt-6">
          {letters.length} VD-ord, lästa som en enda berättelse i tre akter. Vi mätte tonen, språket och de begrepp hon
          myntade — och lät datan visa hur en röst hittar, sätter och till sist kodifierar sin agenda.
        </p>
      </section>

      {/* Hero arc */}
      <section className="max-w-[1120px] mx-auto px-10 pb-6">
        <div className="border border-[#e3dac4] rounded-lg bg-[#fbf8f1] px-7 pt-6 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] tracking-[0.12em] text-muted">
              TONINDEX ÖVER TID <span className="text-[#b3a888]">— {letters.length} brev</span>
            </span>
            <span className="font-mono text-[10px] text-[#b3a888]">HÖGRE = MER AGENDASÄTTANDE</span>
          </div>
          <ToneArc geo={geo} actLabels={actLabels} />
        </div>
        <p className="font-sans text-[11px] text-muted mt-3">
          Tonindex är ett proxy-mått på hur drivande språket är (kraftord minus gardingsord per 1 000 ord). Toppen
          markerar det mest agendasättande brevet i serien — beräknat ur datan, inte förvalt.
        </p>
      </section>

      {/* Narrative beats by act */}
      <section className="max-w-[1120px] mx-auto px-10 pb-24">
        {groups.map((g) => (
          <div key={g.act.id} id={`act-${g.act.id}`}>
            <ActStart act={g.act} stats={actStats(g.letters)} />
            {g.letters.map((l) => (
              <LetterBeat key={l.date} letter={l} themeLabels={themeLabels} />
            ))}
          </div>
        ))}
      </section>

      {/* Coda */}
      <footer className="border-t border-[#e3dac4]">
        <div className="max-w-[1120px] mx-auto px-10 py-10 font-sans text-sm text-muted">
          Berättelsen slutar inte här. Varje nytt VD-ord läggs till datasetet och förlänger båden av sig självt.
        </div>
      </footer>
    </main>
  );
}
