'use client';
import { useEffect, useRef } from 'react';
import type { ArcGeometry } from '@/lib/types';

function toneStr(t: number): string {
  return (t >= 0 ? '+' : '') + t.toFixed(1).replace('.', ',');
}

export default function ToneArc({ geo, actLabels }: { geo: ArcGeometry; actLabels: { name: string; cx: number }[] }) {
  const lineRef = useRef<SVGPathElement>(null);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const line = lineRef.current;
    if (!line || reduced) return;
    const len = line.getTotalLength();
    line.style.strokeDasharray = String(len);
    line.style.strokeDashoffset = String(len);
    line.getBoundingClientRect();
    requestAnimationFrame(() => {
      line.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(.45,0,.15,1)';
      line.style.strokeDashoffset = '0';
    });
  }, [geo.path]);

  const peak = geo.peak;
  const peakPt = peak ? geo.points.find((p) => p.isPeak) : null;

  return (
    <svg viewBox="0 0 1000 350" className="w-full h-auto overflow-visible" role="img"
      aria-label="Tonindex över tid, en linje genom tre akter">
      {/* baseline */}
      <line x1="40" y1={geo.baseY} x2="960" y2={geo.baseY} stroke="#d8cfba" strokeWidth="1" />
      {/* act dividers */}
      {geo.dividers.map((x, i) => (
        <line key={i} x1={x} y1="16" x2={x} y2={geo.baseY} stroke="#cdbf9f" strokeWidth="1" strokeDasharray="1 6" />
      ))}
      {/* area + line */}
      <path d={geo.area} fill="#0E3A5E" fillOpacity="0.06" />
      <path ref={lineRef} d={geo.path} fill="none" stroke="#0E3A5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* points */}
      {geo.points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.isPeak ? 5.5 : 2.6}
          fill={p.isPeak ? '#C8A24A' : '#0E3A5E'} stroke="#F7F3EA" strokeWidth="1.4" />
      ))}
      {/* peak callout */}
      {peakPt && peak && (
        <g>
          <line x1={peakPt.x} y1={peakPt.y} x2={peakPt.x} y2={geo.baseY} stroke="#C8A24A" strokeDasharray="2 4" opacity="0.7" />
          <text x={peakPt.x} y={peakPt.y - 22} textAnchor="middle"
            style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: '20px', fill: '#9a6a1e' }}>
            {toneStr(peak.tone_index)}
          </text>
          <text x={peakPt.x} y={peakPt.y - 6} textAnchor="middle"
            style={{ fontFamily: 'var(--font-newsreader)', fontStyle: 'italic', fontSize: '14px', fill: '#5E6B76' }}>
            {peak.key_quote.label}
          </text>
        </g>
      )}
      {/* act labels */}
      {actLabels.map((a, i) => (
        <text key={i} x={a.cx} y={geo.baseY + 26} textAnchor="middle"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', fill: '#0E3A5E' }}>
          {a.name}
        </text>
      ))}
    </svg>
  );
}
