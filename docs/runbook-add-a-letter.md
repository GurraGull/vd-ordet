# Runbook — add a new VD-ord letter

When a new letter is published, fold it into the living dataset like this.

1. Save the new letter's `.docx` into `data/raw/` (filename must start
   `YYYY-MM-DD_`).
2. Activate the env: `. .venv/bin/activate`
3. Generate the draft: `python -m pipeline.add_letter data/raw/<file>.docx`
   → writes `data/letters/<date>.json` with the mechanical metrics filled
   (length, sentence length, LIX, tone index, loanword rate) and the nuanced
   fields blank, plus the extracted `data/raw/<file>.txt`.
4. Code the nuanced fields (`act`, `themes`, `entities`, `signature_phrases`,
   `asks`, `thesis`, `key_quote`, `source_url`) — open the new JSON and the
   `.txt` side by side, or ask Claude to draft them against `data/vocab/` for
   you to review. Coding rules:
   - `act`: 1/2/3 per `data/vocab/acts.json` date ranges (re-assign or open a
     new act if the arc has shifted).
   - `themes`: 1–4 entries `{theme: <id from themes.json>, weight: 1–5}`.
   - `entities`: people/countries/projects named in the letter; canonical
     spellings from `entities.json`.
   - `asks`: ids from `asks.json` the letter makes; `[]` if none.
   - `thesis`: one Swedish sentence — the letter's main argument.
   - `key_quote`: `{text: <verbatim sentence>, label: <short tag>}`.
   - `source_url`: the letter's URL on iva.se, or `""` if not found.
5. Validate: `python -m pytest tests/test_dataset.py` — bump the expected count
   (`== 33`) by one for each new letter.
6. Compile: `python -c "from pipeline.compile import compile_dataset; compile_dataset('data/letters','data/letters.json','data/aggregates.json')"`
7. Commit: `git add data/ && git commit -m "data: add letter <date>"`.
   The `git diff` shows exactly what this letter added to the corpus — one new
   beat on the arc.

## Tone calibration note

The tone index uses the fixed marker lists in `data/vocab/markers.json` and is
deliberately reproducible (see `docs/design-system.md`, §"Tone calibration
decision"). Don't tune the markers to hit a target value; if you extend the
lists, re-compile and treat whatever results as the new canonical numbers.
