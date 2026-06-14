# VD-ordet 2025–2026 — living analysis & visualization

A living, version-controlled analysis of IVA CEO Sylvia Schwaag Serger's
biweekly "VD-ord" letters, rendered as an editorial web app that tells the
three-act story of how her voice evolves — and grows by one letter every two
weeks.

- **Spec:** [`docs/superpowers/specs/2026-06-14-vd-ordet-analys-design.md`](docs/superpowers/specs/2026-06-14-vd-ordet-analys-design.md)
- **Design brief:** [`docs/design-brief.md`](docs/design-brief.md)

## Layers

- `data/` — the living dataset (one JSON per letter) + controlled vocab.
- `pipeline/` — Python: parse letters, compute metrics, AI-assisted coding.
- `site/` — Next.js editorial app that reads the dataset.

Status: spec approved; implementation plan next.
