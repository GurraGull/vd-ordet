'use client';
import { useMemo, useState } from 'react';
import type { Letter } from '@/lib/types';

const ROMAN: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
type SortKey = 'date' | 'tone_index' | 'lix' | 'word_count';

function num(t: number): string { return (t >= 0 ? '+' : '') + t.toFixed(1).replace('.', ','); }
function heading(l: Letter): string { return l.key_quote.label || l.title.split(',')[0]; }

export default function LetterExplorer({ letters, themeLabels }: { letters: Letter[]; themeLabels: Record<string, string> }) {
  const peak = letters.reduce((m, l) => (l.tone_index > m.tone_index ? l : m), letters[0]);
  const [sel, setSel] = useState(peak.date);
  const [key, setKey] = useState<SortKey>('date');
  const [dir, setDir] = useState<1 | -1>(1);

  const rows = useMemo(() => {
    const r = [...letters];
    r.sort((a, b) => {
      const av = key === 'date' ? a.date : (a[key] as number);
      const bv = key === 'date' ? b.date : (b[key] as number);
      return av < bv ? -dir : av > bv ? dir : 0;
    });
    return r;
  }, [letters, key, dir]);

  const selected = letters.find((l) => l.date === sel) ?? peak;
  const sortBtn = (k: SortKey, label: string) => (
    <button onClick={() => { if (key === k) setDir((d) => (d === 1 ? -1 : 1)); else { setKey(k); setDir(1); } }}
      className={`text-left font-mono text-[10px] tracking-[0.12em] uppercase ${key === k ? 'text-amber' : 'text-steel/60 hover:text-steel'}`}>
      {label}{key === k ? (dir === 1 ? ' ↑' : ' ↓') : ''}
    </button>
  );

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-5">
      <div className="border border-line rounded overflow-hidden">
        <div className="grid grid-cols-[88px_28px_1fr_56px_44px_56px] gap-2 px-3 py-2.5 bg-panel border-b border-line">
          {sortBtn('date', 'datum')}<span className="font-mono text-[10px] text-steel/60 uppercase">akt</span>
          <span className="font-mono text-[10px] text-steel/60 uppercase tracking-[0.12em]">brev</span>
          {sortBtn('tone_index', 'ton')}{sortBtn('lix', 'lix')}{sortBtn('word_count', 'ord')}
        </div>
        <div className="max-h-[520px] overflow-y-auto">
          {rows.map((l) => {
            const on = l.date === sel;
            return (
              <button key={l.date} onClick={() => setSel(l.date)}
                className={`w-full grid grid-cols-[88px_28px_1fr_56px_44px_56px] gap-2 px-3 py-2.5 items-center text-left border-b border-line/50 ${on ? 'bg-amber/10' : 'hover:bg-white/[0.03]'}`}>
                <span className="font-mono text-[11px] text-steel/80">{l.date}</span>
                <span className="font-mono text-[11px] text-steel/50">{ROMAN[l.act] ?? l.act}</span>
                <span className="text-[12.5px] text-[#EAF0F5] truncate" style={{ fontFamily: 'var(--font-franklin)' }}>{heading(l)}</span>
                <span className="font-mono text-[11px] tabular-nums" style={{ color: l.tone_index >= 4 ? '#E0A23C' : '#9FACB6' }}>{num(l.tone_index)}</span>
                <span className="font-mono text-[11px] text-steel/70 tabular-nums">{String(l.lix).replace('.', ',')}</span>
                <span className="font-mono text-[11px] text-steel/70 tabular-nums">{l.word_count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="border border-line rounded bg-panel p-5 self-start">
        <div className="font-mono text-[10px] tracking-[0.14em] text-amber uppercase">Akt {ROMAN[selected.act] ?? selected.act} · {selected.date}</div>
        <h3 className="text-2xl text-[#F2F6FA] mt-1.5" style={{ fontFamily: 'var(--font-newsreader)' }}>{heading(selected)}</h3>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[{ l: 'tonindex', v: num(selected.tone_index) }, { l: 'lix', v: String(selected.lix).replace('.', ',') }, { l: 'ord', v: String(selected.word_count) }].map((t) => (
            <div key={t.l} className="bg-night/60 rounded px-2.5 py-2">
              <div className="font-mono text-[19px] text-[#EAF0F5] tabular-nums">{t.v}</div>
              <div className="font-mono text-[9px] tracking-[0.1em] text-steel/60 uppercase mt-0.5">{t.l}</div>
            </div>
          ))}
        </div>
        <p className="text-[13px] leading-relaxed text-steel mt-4" style={{ fontFamily: 'var(--font-franklin)' }}>{selected.thesis}</p>
        {selected.key_quote.text && (
          <blockquote className="text-[15px] italic text-[#cdd6dd] border-l-2 border-amber/50 pl-3 mt-4" style={{ fontFamily: 'var(--font-newsreader)' }}>
            “{selected.key_quote.text}”
          </blockquote>
        )}
        {selected.signature_phrases[0] && (
          <div className="mt-4 font-mono text-[10px] tracking-wide text-amber/90 uppercase">
            myntat: <span className="italic normal-case text-[13px]" style={{ fontFamily: 'var(--font-newsreader)' }}>{selected.signature_phrases[0]}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {selected.themes.map((t) => (
            <span key={t.theme} className="font-mono text-[10px] text-steel/70 border border-line rounded px-2 py-0.5">{themeLabels[t.theme] ?? t.theme}</span>
          ))}
        </div>
      </aside>
    </div>
  );
}
