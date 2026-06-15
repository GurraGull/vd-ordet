# Design system — "The Annual Essay"

**Decided:** 2026-06-15 · **Source:** Claude Design project "IVA VDs Ord"
(direction chosen from three; designer's recommendation). This is the binding
visual reference for Plan 2 (the site).

## Concept

A warm, editorial "annual essay." Intellectual, calm, on-brand for IVA. Data is
a *quiet hero* — the three-act tone arc carries the page, but typography and
whitespace lead. Not a dashboard.

## Typography (all Google Fonts, web-available)

| Role | Font | Notes |
|---|---|---|
| Display + body | **Newsreader** | use its optical **italic** for pull-quotes |
| Labels / UI | **Libre Franklin** | nav, captions, chips, axis labels |
| Data figures | **IBM Plex Mono** | numbers, tone values, counts |

Exact type scale and base body size: port from `docs/design/Art Direction.dc.html`
(the styleguide board) when added to the repo.

## Color — light theme

| Token | Hex | Use |
|---|---|---|
| Paper (background) | `#F7F3EA` | warm base |
| IVA blue (primary ink/accent) | `#0E3A5E` | headlines, arc line, primary accent |
| Antique gold | `#C8A24A` | **used very sparingly** — markers/accents only |

Secondary text tones and borders: port exact values from the styleguide board.

## Dark theme — "Nocturne" (roadmap, not v1)

A complementary dark skin exists in the exploration (`Style Variants.dc.html`):
warm near-black gallery, high-contrast **Cormorant** serif with an amber italic.
Reserve as the future dark theme; v1 ships light only.

## Motion

Scroll-driven arc draw + the left "spine"; subtle transitions elsewhere. Must
respect `prefers-reduced-motion`.

## Screens

### Story view (`docs/design/Story.dc.html`)
The three-act tone arc as a **scroll-driven hero**: the curve draws in as you
scroll; a fixed left **spine** tracks your position; narrative **beats** per
letter surface its thesis, signaturcitat, and a "Myntat begrepp" chip (the
coined phrase); act dividers; a count-up stat; the `+13,8` *Stresstest för
Europa* callout.

### Explore view (`docs/design/Explore.dc.html`)
An **annotated analytical essay** with margin annotations: tone-over-time, five
theme **ridgelines**, the recurring-asks **dot-matrix cadence**, and LIX
readability. Restraint and annotation over density (per spec §7).

## Responsive

The left scroll-spine appears at **≥1120px** width; layouts otherwise reflow.

## Binding to real data

Every figure in the design files is a **representative placeholder**. Plan 2
binds them to `data/letters.json` + `data/aggregates.json` produced by Plan 1.

## Designer note to fold into Plan 2

Add a short summary atop each Akt III essay beat (a readability improvement the
Explore view surfaced).

## Reference implementations (to add to repo)

Download from the Claude Design project into `docs/design/`:
`Art Direction.dc.html`, `Story.dc.html`, `Explore.dc.html`. Plan 2 ports these
static HTML/CSS designs into Next.js components. Alternates on file but **not
chosen**: `Style Variants.dc.html` (Riso Broadside, Nocturne).
