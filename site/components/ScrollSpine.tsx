'use client';
import { useEffect, useState } from 'react';
import type { ActDef } from '@/lib/types';

export default function ScrollSpine({ acts }: { acts: ActDef[] }) {
  const [active, setActive] = useState(acts[0]?.id ?? 0);

  useEffect(() => {
    const onScroll = () => {
      const mid = window.scrollY + window.innerHeight / 2;
      let current = acts[0]?.id ?? 0;
      for (const a of acts) {
        const el = document.getElementById(`act-${a.id}`);
        if (el && el.offsetTop <= mid) current = a.id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [acts]);

  return (
    <nav aria-label="Akter" className="hidden xl:flex fixed left-8 top-1/2 -translate-y-1/2 z-40 flex-col gap-6">
      {acts.map((a) => {
        const on = a.id === active;
        return (
          <a key={a.id} href={`#act-${a.id}`}
            className="group flex items-center gap-3 no-underline"
            aria-current={on ? 'true' : undefined}>
            <span className={`h-px transition-all ${on ? 'w-8 bg-ink' : 'w-4 bg-[#c9bea4]'}`} />
            <span className={`font-mono text-[10px] tracking-[0.16em] transition-colors ${on ? 'text-ink' : 'text-[#b3a888] group-hover:text-muted'}`}>
              AKT {a.id}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
