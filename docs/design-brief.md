# Design brief — VD-ordet editorial web app

Self-contained brief for a dedicated design exploration (Claude Design, a
designer, or any design tool). The app's architecture does not depend on these
choices — this round finalizes the visual design system only.

---

I'm designing an editorial web application and want art direction, a design
system, and layout concepts. Here's the brief.

**The product.** A web app that analyzes and visualizes ~18 months of biweekly
"VD-ord" (CEO letters) from Sylvia Schwaag Serger, CEO of IVA —
Kungliga Ingenjörsvetenskapsakademien (the Royal Swedish Academy of Engineering
Sciences, founded 1919). It tells the story of how her written voice evolved
across three "acts," backed by a dataset that grows with each new letter.

**The audience.** IVA's board and senior leadership, the CEO herself, and —
possibly later — IVA members and the public. Sophisticated, senior, time-poor.

**The feeling I want.** Editorial. Think a premium long-read in The Economist or
NYT, or a beautifully typeset annual essay — serif display type, generous
whitespace, restraint, confident pull-quotes, data presented as a quiet hero
rather than a busy dashboard. Intellectual gravitas, calm authority. NOT a
BI/analytics dashboard look.

**The narrative spine (three acts).**
- Akt 1 — "Att hitta rösten" (Jan–Mar 2025): reactive commentary, short
  letters, finding the voice.
- Akt 2 — "Att sätta agendan" (Apr–Oct 2025): coining her own concepts
  (dual use, stresstest, greenhushing); tone peaks.
- Akt 3 — "Doktrinen" (Nov 2025–Apr 2026): the "IVAs vd — om X" essay series;
  doctrine-building; more nuanced tone.
A "tone index" line rises through Act 1, spikes sharply at one letter
("Stresstest för Europa", +13.8), stays elevated through Act 2, then settles in
Act 3. This arc is the visual centerpiece.

**Two screens to design.**
1. Story view — the three-act tone arc as a hero visualization; scroll through
   narrative "beats," each surfacing a letter's thesis, a signature quote, and
   its coined phrase.
2. Explore view — still editorial in feel: a tone-over-time chart, a
   theme-over-time view, a "recurring asks" tracker, and readability — presented
   as an annotated analytical essay, not a filter-heavy dashboard.

**Constraints.** Swedish-language UI. Built in Next.js + Tailwind CSS, so designs
must be web-implementable and responsive. WCAG AA accessible. Light theme
required; an optional dark theme welcome.

**What I'd love from you.**
1. 2–3 distinct art-direction directions (described or sketched).
2. A typography system — a display serif + body pairing (web-available font
   suggestions) and a type scale.
3. A color palette (light, plus optional dark) — advise whether to lean into
   IVA's institutional blue/gold or go more neutral/editorial.
4. Layout concepts for (a) the three-act arc hero and (b) one explore chart.
5. Component styling: pull-quotes, letter "beat" cards, navigation, headers.
6. Optional: subtle motion/scroll ideas suited to an editorial piece.

Please show your thinking and give concrete, implementable recommendations I can
hand to a developer.
