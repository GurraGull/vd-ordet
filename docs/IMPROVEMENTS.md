# Improvements log

Twice-daily automated improvements to the VD-ordet app (scheduled task
`vd-ordet-daily-improver`, ~08:00 & ~14:00). One small, tested, reversible step
per run — newest at the bottom. Every entry is a commit on `main` you can review
or revert; publishing the live site stays manual (`site/deploy.sh`).

2026-06-21 — Baseline: site deployed to GitHub Pages (Story `/` + console
`/konsol/`), public repo, twice-daily improver scheduled. Next: check the
console's responsive layout on a narrow viewport, or add a subtle "uppdaterad
<datum>" stamp to the masthead.
