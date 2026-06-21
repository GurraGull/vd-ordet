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
