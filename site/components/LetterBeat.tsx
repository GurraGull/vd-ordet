import type { Letter } from '@/lib/types';

function toneStr(t: number): string {
  return (t >= 0 ? '+' : '') + t.toFixed(1).replace('.', ',');
}

function fmtDate(iso: string): string {
  const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const [y, m, d] = iso.split('-');
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

export default function LetterBeat({ letter, themeLabels }: { letter: Letter; themeLabels: Record<string, string> }) {
  const term = letter.signature_phrases[0];
  const heading = letter.key_quote.label || letter.title;
  return (
    <article className="border-t border-[#e3dac4] py-9 grid md:grid-cols-[150px_1fr] gap-x-8 gap-y-3">
      <div className="font-mono text-xs text-muted pt-1">
        <div>{fmtDate(letter.date)}</div>
        <div className="mt-1 text-ink/70">Nr {letter.nr}</div>
        <div className="mt-3 text-[#9a6a1e]">ton {toneStr(letter.tone_index)}</div>
      </div>
      <div>
        <h3 className="font-serif text-2xl text-ink leading-snug">{heading}</h3>
        <p className="font-sans text-[15px] leading-relaxed text-[#33414c] mt-3 max-w-[60ch]">{letter.thesis}</p>
        {letter.key_quote.text && (
          <blockquote className="font-serif italic text-xl text-ink/90 border-l-2 border-gold/60 pl-4 mt-5 max-w-[55ch]">
            “{letter.key_quote.text}”
          </blockquote>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          {term && (
            <span className="font-mono text-[10px] tracking-wider uppercase text-[#9a6a1e] bg-gold/10 border border-gold/30 rounded px-2 py-1">
              Myntat begrepp: <span className="font-serif italic text-sm normal-case">{term}</span>
            </span>
          )}
          {letter.themes.map((t) => (
            <span key={t.theme} className="font-sans text-[11px] text-muted border border-[#ddd3bc] rounded px-2 py-1">
              {themeLabels[t.theme] ?? t.theme}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
