# Improvements log

Twice-daily automated improvements to the VD-ordet app (scheduled task
`vd-ordet-daily-improver`, ~08:00 & ~14:00). One small, tested, reversible step
per run — newest at the bottom. Every entry is a commit on `main` you can review
or revert; publishing the live site stays manual (`site/deploy.sh`).

2026-06-21 — Baseline: site deployed to GitHub Pages (Story `/` + console
`/konsol/`), public repo, twice-daily improver scheduled. Next: check the
console's responsive layout on a narrow viewport, or add a subtle "uppdaterad
<datum>" stamp to the masthead.

2026-06-21 — Added an executive summary to the top of the Story: a synthesis
lead + one analytical card per act (text in `data/vocab/acts.json` summaries +
`data/vocab/overview.json`, live per-act stats). Next: trim the now-slightly-
redundant per-act `note` in the section dividers, or make the synthesis partly
data-driven from the analytics layer.

2026-06-21 — Ingested 4 new VD-ord (Nr 10–13, maj–jun 2026: Kina, Sydkorea,
un-order, offentlig upphandling) → 37 letters. Declared **Akt 4 "Den
pragmatiska vändningen"** (the 4 letters re-tagged; longest essays, net-negative
tone −0,4). Added a new recurring ask `strategisk_industripolitik`; the arc,
4-card summary, scroll-spine and console all extended automatically. Next:
backfill `source_url`s for the new letters; consider a per-act tone-band on the
arc.

2026-06-22 — Console: added an **"Att överväga"** lead band (4 data-grounded
decision prompts: escalate top open ask, revive a dormant coinage, address a
white space, double down on a rising theme) and a **"Begreppens livscykel"**
panel (which coinages recurred vs went one-off; surfaces the "42 of 44 used
once" insight). New tested analytics `conceptLifecycle` + `decisionPrompts`.
Next: a notability signal so "revive" surfaces striking dormant concepts
(Polycen) over recent one-offs; reconcile signature-phrase vs ask recurrence.

2026-06-22 — (1) Per-act **commentary**: each act card in the executive summary
now carries an analytical "kommentar" (italic, gold rule) beside the descriptive
summary; cards moved to a roomier 2×2. (2) **Notability** for coined concepts
(`conceptScore`: title +2 / key-quote +1 / thesis +1) now ranks the lifecycle —
"att återanvända" and the revive prompt surface defining dormant concepts
(Polycen, Teknikminister, Svenska framtider) over passing mentions. 16 tests.
