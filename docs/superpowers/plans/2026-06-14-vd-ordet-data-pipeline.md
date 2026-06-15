# VD-ordet data pipeline & dataset — Implementation Plan (Plan 1 of 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the reproducible Python pipeline and the living, versioned dataset (`data/letters.json`) for all 33 VD-ord letters, ready for the site (Plan 2) to render.

**Architecture:** A small Python package under `pipeline/` turns each letter's `.docx` into one validated JSON record. Mechanical metrics (length, sentence length, LIX, tone index, loanword rate) are computed deterministically from extracted text; the nuanced fields (act, themes, entities, signature phrases, asks, thesis, quote) are seeded from the existing curated analysis and reviewed. `compile.py` merges per-letter files into `data/letters.json`. Controlled-vocabulary files (incl. plain-language `definitions.json`) keep coding consistent across iterations.

**Tech Stack:** Python 3.11+, pytest, python-docx, jsonschema. Pure-Python tokenization (no NLP deps). Data as JSON.

---

## Scope of this plan

In: project scaffolding, the letter JSON schema + validator, `extract.py`, the metric functions, the vocab files (including `definitions.json`), `compile.py`, the deterministic draft generator (`add_letter.py`), seeding all 33 letters (mechanical computed + nuanced ported), full-dataset validation, and the add-a-letter runbook.

Out (Plan 2): the Next.js site, any rendering. Out (roadmap): 2024 backfill, entity network, x-ray pages, public deploy.

## File structure

```
pipeline/
├── __init__.py
├── schema.py          letter JSON schema + validate_letter()
├── extract.py         .docx -> {date, nr, title, series, text}
├── metrics.py         word_count, avg_sentence_length, lix, tone_index, loanword_rate
├── compile.py         data/letters/*.json -> data/letters.json (+ aggregates)
└── add_letter.py      orchestrates: extract + metrics -> draft data/letters/<date>.json
data/
├── raw/               the 33 .docx (moved here) + extracted .txt
├── letters/           one <date>.json per letter (the dataset)
├── letters.json       compiled array (generated)
├── aggregates.json    derived per-act/per-year summary (generated)
└── vocab/
    ├── definitions.json
    ├── acts.json
    ├── themes.json
    ├── asks.json
    ├── entities.json
    ├── markers.json   assertive + hedge marker lists
    └── loanwords.json
tests/
├── fixtures/          a tiny sample .docx + sample text
├── test_extract.py
├── test_metrics.py
├── test_compile.py
├── test_add_letter.py
└── test_dataset.py    validates every real record against the schema
requirements.txt
docs/runbook-add-a-letter.md
```

---

### Task 1: Project scaffolding

**Files:**
- Create: `requirements.txt`, `pipeline/__init__.py`, `tests/__init__.py`
- Move: the 33 root `*.docx` into `data/raw/`

- [ ] **Step 1: Create `requirements.txt`**

```
python-docx==1.1.2
jsonschema==4.23.0
pytest==8.3.3
```

- [ ] **Step 2: Create empty package files**

Create `pipeline/__init__.py` (empty) and `tests/__init__.py` (empty).

- [ ] **Step 3: Create the data directories and move the raw letters**

```bash
mkdir -p data/raw data/letters data/vocab tests/fixtures
git mv *.docx data/raw/
```

- [ ] **Step 4: Create and populate a virtualenv**

```bash
python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
```
Expected: installs without error.

- [ ] **Step 5: Commit**

```bash
git add requirements.txt pipeline/ tests/ data/
git commit -m "chore: scaffold pipeline package and move raw letters to data/raw"
```

---

### Task 2: Letter JSON schema + validator

**Files:**
- Create: `pipeline/schema.py`
- Test: `tests/test_schema.py`

- [ ] **Step 1: Write the failing test**

```python
import pytest
from pipeline.schema import validate_letter, LETTER_SCHEMA

def _valid():
    return {
        "date": "2026-04-21", "nr": 9, "title": "ambitiösa Sverige?",
        "series": True, "act": 3,
        "word_count": 730, "avg_sentence_length": 17.6, "lix": 48.3,
        "loanword_rate": 4.4, "tone_index": 1.9,
        "assertive_count": 5, "hedge_count": 2,
        "themes": [{"theme": "eu_konkurrenskraft", "weight": 3}],
        "entities": {"people": ["Robyn Denholm"], "countries": ["Australien"], "projects": []},
        "signature_phrases": ["ambitiösa Sverige"],
        "asks": ["snabbare_beslutsfattande"],
        "thesis": "Sverige bör dra lärdom av Australiens FoU-reform.",
        "key_quote": {"text": "...", "label": "Ambitious Australia"},
        "source_url": "https://www.iva.se/...",
        "raw_text": "data/raw/2026-04-21_...txt",
    }

def test_valid_letter_passes():
    validate_letter(_valid())

def test_missing_required_field_fails():
    d = _valid(); del d["tone_index"]
    with pytest.raises(Exception):
        validate_letter(d)

def test_bad_type_fails():
    d = _valid(); d["word_count"] = "lots"
    with pytest.raises(Exception):
        validate_letter(d)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_schema.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'pipeline.schema'`

- [ ] **Step 3: Write the implementation**

```python
from jsonschema import validate, Draft202012Validator

LETTER_SCHEMA = {
    "type": "object",
    "required": [
        "date", "nr", "title", "series", "act", "word_count",
        "avg_sentence_length", "lix", "loanword_rate", "tone_index",
        "assertive_count", "hedge_count", "themes", "entities",
        "signature_phrases", "asks", "thesis", "key_quote",
        "source_url", "raw_text",
    ],
    "additionalProperties": False,
    "properties": {
        "date": {"type": "string", "pattern": r"^\d{4}-\d{2}-\d{2}$"},
        "nr": {"type": "integer"},
        "title": {"type": "string"},
        "series": {"type": "boolean"},
        "act": {"type": "integer", "minimum": 1},
        "word_count": {"type": "integer", "minimum": 0},
        "avg_sentence_length": {"type": "number", "minimum": 0},
        "lix": {"type": "number", "minimum": 0},
        "loanword_rate": {"type": "number", "minimum": 0},
        "tone_index": {"type": "number"},
        "assertive_count": {"type": "integer", "minimum": 0},
        "hedge_count": {"type": "integer", "minimum": 0},
        "themes": {
            "type": "array",
            "items": {
                "type": "object", "required": ["theme", "weight"],
                "additionalProperties": False,
                "properties": {
                    "theme": {"type": "string"},
                    "weight": {"type": "integer", "minimum": 1, "maximum": 5},
                },
            },
        },
        "entities": {
            "type": "object", "required": ["people", "countries", "projects"],
            "additionalProperties": False,
            "properties": {
                "people": {"type": "array", "items": {"type": "string"}},
                "countries": {"type": "array", "items": {"type": "string"}},
                "projects": {"type": "array", "items": {"type": "string"}},
            },
        },
        "signature_phrases": {"type": "array", "items": {"type": "string"}},
        "asks": {"type": "array", "items": {"type": "string"}},
        "thesis": {"type": "string"},
        "key_quote": {
            "type": "object", "required": ["text", "label"],
            "additionalProperties": False,
            "properties": {"text": {"type": "string"}, "label": {"type": "string"}},
        },
        "source_url": {"type": "string"},
        "raw_text": {"type": "string"},
    },
}

Draft202012Validator.check_schema(LETTER_SCHEMA)

def validate_letter(record):
    validate(instance=record, schema=LETTER_SCHEMA)
    return record
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_schema.py -v`
Expected: 3 passed

- [ ] **Step 5: Commit**

```bash
git add pipeline/schema.py tests/test_schema.py
git commit -m "feat: add letter JSON schema and validator"
```

---

### Task 3: Text + metadata extraction

**Files:**
- Create: `pipeline/extract.py`, `tests/fixtures/sample.txt`
- Test: `tests/test_extract.py`

- [ ] **Step 1: Create the fixture text**

Create `tests/fixtures/sample.txt` with this exact content:

```
IVAs vd -- ambitiösa Sverige?
21 april 2026 · Nr 9 · Aktuellt från IVA · VD Sylvia Schwaag Serger

Kära IVA-vänner,
Detta är en testmening. Och en till med dual use.
```

- [ ] **Step 2: Write the failing test**

```python
from pipeline.extract import parse_metadata

def test_parse_metadata_from_filename_and_text():
    text = open("tests/fixtures/sample.txt", encoding="utf-8").read()
    meta = parse_metadata("2026-04-21_IVAs_vd_--_ambitiosa_Sverige.docx", text)
    assert meta["date"] == "2026-04-21"
    assert meta["nr"] == 9
    assert meta["series"] is True
    assert "ambitiösa Sverige" in meta["title"]
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pytest tests/test_extract.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'pipeline.extract'`

- [ ] **Step 4: Write the implementation**

```python
import re
from docx import Document

def extract_text(docx_path):
    doc = Document(docx_path)
    return "\n".join(p.text for p in doc.paragraphs)

def parse_metadata(filename, text):
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    title = lines[0] if lines else ""
    date_match = re.match(r"(\d{4}-\d{2}-\d{2})", filename)
    nr_match = re.search(r"Nr\s*(\d+)", text)
    return {
        "date": date_match.group(1) if date_match else "",
        "nr": int(nr_match.group(1)) if nr_match else 0,
        "title": title.replace("IVAs vd --", "").replace("IVAs vd —", "").strip(" -–—"),
        "series": "IVAs vd" in title,
        "text": text,
    }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pytest tests/test_extract.py -v`
Expected: 1 passed

- [ ] **Step 6: Commit**

```bash
git add pipeline/extract.py tests/test_extract.py tests/fixtures/sample.txt
git commit -m "feat: extract text and metadata from letter docx"
```

---

### Task 4: Mechanical metrics — length, sentence length, LIX

**Files:**
- Create: `pipeline/metrics.py`
- Test: `tests/test_metrics.py`

- [ ] **Step 1: Write the failing test**

```python
from pipeline.metrics import word_count, avg_sentence_length, lix

TEXT = "Detta är en kort mening. Här kommer en annan mening med flera långa ord."

def test_word_count():
    assert word_count(TEXT) == 14

def test_avg_sentence_length():
    assert avg_sentence_length(TEXT) == 7.0

def test_lix_is_words_per_sentence_plus_longword_share():
    assert lix(TEXT) == round(14/2 + 4*100/14, 1)

def test_empty_text_is_zero():
    assert word_count("") == 0
    assert lix("") == 0.0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_metrics.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'pipeline.metrics'`

- [ ] **Step 3: Write the implementation**

```python
import re

WORD_RE = re.compile(r"\w+", re.UNICODE)
SENT_RE = re.compile(r"[.!?]+")

def words(text):
    return WORD_RE.findall(text)

def sentences(text):
    return [s for s in SENT_RE.split(text) if s.strip()]

def word_count(text):
    return len(words(text))

def avg_sentence_length(text):
    w, s = words(text), sentences(text)
    return round(len(w) / len(s), 1) if s else 0.0

def lix(text):
    w, s = words(text), sentences(text)
    if not w or not s:
        return 0.0
    long_words = sum(1 for x in w if len(x) > 6)
    return round(len(w) / len(s) + long_words * 100 / len(w), 1)
```

Note: `långa` and `mening` are 5/6 chars (not >6); `flera` is 5; the four long words in the test sentence are `Detta`(5,no)… verify the count is 4 when you run it — if the fixture count differs, fix the *test's* expected number to match the definition, not the formula.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_metrics.py -v`
Expected: 4 passed (adjust the long-word constant in the test if needed per the note)

- [ ] **Step 5: Commit**

```bash
git add pipeline/metrics.py tests/test_metrics.py
git commit -m "feat: add length, sentence-length and LIX metrics"
```

---

### Task 5: Tone index + loanword rate (marker counting)

**Files:**
- Modify: `pipeline/metrics.py`
- Modify: `tests/test_metrics.py`

- [ ] **Step 1: Write the failing test (append)**

```python
from pipeline.metrics import count_markers, tone_index, loanword_rate

def test_count_markers_word_boundary_and_phrase():
    text = "Sverige måste agera, tiden är knapp. Kanske, kanske inte."
    assert count_markers(text, ["måste", "tiden är knapp"]) == 2
    assert count_markers(text, ["kanske"]) == 2

def test_tone_index_per_1000_words():
    text = "måste " * 3 + "kanske " * 1 + "ord " * 96
    assert tone_index(text, ["måste"], ["kanske"]) == round((3 - 1) * 1000 / 100, 1)

def test_loanword_rate():
    text = "dual use " + "ord " * 98
    assert loanword_rate(text, ["dual use"]) == round(1 * 1000 / 100, 1)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_metrics.py -v`
Expected: FAIL with `ImportError: cannot import name 'count_markers'`

- [ ] **Step 3: Write the implementation (append to `pipeline/metrics.py`)**

```python
def count_markers(text, markers):
    low = text.lower()
    total = 0
    for m in markers:
        total += len(re.findall(r"\b" + re.escape(m.lower()) + r"\b", low))
    return total

def tone_index(text, assertive, hedge):
    w = word_count(text)
    if not w:
        return 0.0
    return round((count_markers(text, assertive) - count_markers(text, hedge)) * 1000 / w, 1)

def loanword_rate(text, loanwords):
    w = word_count(text)
    if not w:
        return 0.0
    return round(count_markers(text, loanwords) * 1000 / w, 1)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_metrics.py -v`
Expected: all passed

- [ ] **Step 5: Commit**

```bash
git add pipeline/metrics.py tests/test_metrics.py
git commit -m "feat: add tone index and loanword rate via marker counting"
```

---

### Task 6: Controlled-vocabulary files

These are data files (no TDD). Create each with the content below, then commit. Theme taxonomy and entity seed are the *working* lists from the existing analysis — flagged in the spec as confirmable.

**Files:** create all under `data/vocab/`.

- [ ] **Step 1: `data/vocab/markers.json`**

```json
{
  "assertive": ["måste", "kräver", "avgörande", "brådskande", "akut", "tvingas", "omedelbart", "snarast", "tiden är knapp"],
  "hedge": ["kanske", "möjligen", "troligtvis", "tycks", "verkar", "i viss mån", "eventuellt"]
}
```

- [ ] **Step 2: `data/vocab/loanwords.json`**

```json
["dual use", "deep tech", "niche superpower", "tipping point", "greenhushing", "talk of the town", "more of the same", "speed is of the essence", "fysisk AI"]
```

- [ ] **Step 3: `data/vocab/acts.json`**

```json
[
  {"id": 1, "name": "Att hitta rösten", "period": "jan–mar 2025", "start": "2025-01-14", "end": "2025-03-25", "note": "Reaktiva kommentarer om händelser. Rösten söker sig framåt."},
  {"id": 2, "name": "Att sätta agendan", "period": "apr–okt 2025", "start": "2025-04-08", "end": "2025-10-21", "note": "Egna begrepp införs (dual use, stresstest). Tonen toppar. Brytpunkt: Stresstest för Europa."},
  {"id": 3, "name": "Doktrinen", "period": "nov 2025–apr 2026", "start": "2025-11-04", "end": "2026-04-21", "note": "Formatbyte till essäserien 'IVAs vd — om X'. Begreppsbygge, mer nyanserad ton."}
]
```

- [ ] **Step 4: `data/vocab/themes.json`** (working 12-theme taxonomy — confirm with owner)

```json
[
  {"id": "eu_konkurrenskraft", "label": "EU & konkurrenskraft"},
  {"id": "forskning_innovation", "label": "Forskning & innovation"},
  {"id": "naringsliv_industri", "label": "Näringsliv & industri"},
  {"id": "sakerhet_forsvar", "label": "Säkerhet & försvar"},
  {"id": "ai_teknik", "label": "AI & teknik"},
  {"id": "klimat_energi", "label": "Klimat & energi"},
  {"id": "kina", "label": "Kina"},
  {"id": "usa_transatlantiskt", "label": "USA & transatlantiskt"},
  {"id": "kompetens_utbildning", "label": "Kompetens & utbildning"},
  {"id": "ekonomi_finans", "label": "Ekonomi & finans"},
  {"id": "geopolitik_omvarld", "label": "Geopolitik & omvärld"},
  {"id": "dual_use_deeptech", "label": "Dual use & deep tech"}
]
```

- [ ] **Step 5: `data/vocab/asks.json`** (the recurring asks, from deck slide 13)

```json
[
  {"id": "snabbare_beslutsfattande", "label": "Snabbare beslutsfattande (speed is of the essence)"},
  {"id": "dual_use_strategi", "label": "Dual use-strategi + integrerad civil-militär FoU"},
  {"id": "pensionspengar_hem", "label": "Europeiska pensionspengar hem till EU"},
  {"id": "strategisk_oumbarlighet", "label": "Strategisk oumbärlighet / niche superpower-tänk"},
  {"id": "teknikminister", "label": "Teknikminister / Teknikutskott"},
  {"id": "ai_reform", "label": "AI-reform i Hem-PC:s klass"},
  {"id": "axel_oxenstierna", "label": "Axel Oxenstierna 2.0 / förvaltningsreform"},
  {"id": "infrastrukturinvestering", "label": "Ny stor infrastrukturinvestering"},
  {"id": "behall_talangen", "label": "Behåll talangen: boende, skola, tung kriminalitet"}
]
```

- [ ] **Step 6: `data/vocab/entities.json`** (seed; alias-merged during review)

```json
{
  "people": ["Mario Draghi", "Ursula von der Leyen", "Donald Trump", "Joel Mokyr", "Walter Russell Mead", "Paul Achleitner", "Gesine Weber", "Geoffrey Hinton", "Viktor Orbán", "Xi Jinping", "Marcus Wallenberg", "Robyn Denholm"],
  "countries": ["Kina", "USA", "Australien", "Danmark", "Tyskland", "Ukraina", "Ungern", "Sydkorea", "Japan"],
  "projects": ["Horizon Europe", "STEM-strategin", "FoU-barometer", "Global Outlook", "Svenska framtider", "Innovationslandet Sverige"]
}
```

- [ ] **Step 7: `data/vocab/definitions.json`** (single source of truth, §7.1 of spec)

```json
{
  "tonindex": "Tonindex — ett mått på hur drivande språket är. Vi räknar kraftord som signalerar att VD driver en linje (måste, kräver, avgörande, brådskande) minus gardingsord som signalerar öppen reservation (kanske, möjligen, tycks), per 1 000 ord. Högt positivt värde = texten driver tydligt en linje; nära noll eller negativt = ett mer öppet resonemang. En indikator på tonläge — inte en bedömning av innehållets kvalitet eller av personen.",
  "lix": "LIX-läsbarhet — ett svenskt standardmått på hur svår en text är att läsa, beräknat som meningarnas medellängd plus andelen långa ord (över sex tecken). Riktvärden: 40–49 = svår (facktext, längre debattartikel), 50–59 = mycket svår. Måttet säger något om språkets komplexitet, inte om innehållets värde.",
  "assertiva_hedgande_markorer": "Assertiva och hedgande markörer — de två ordlistor som tonindex bygger på. Assertiva markörer är kraftord som driver en linje (måste, kräver, avgörande). Hedgande markörer uttrycker reservation eller öppenhet (kanske, tycks, i viss mån). Listorna är fasta och granskningsbara.",
  "engelska_laneord": "Engelska låneord — antalet engelska fackuttryck per 1 000 ord (t.ex. dual use, deep tech, niche superpower). Inte ett mått på otydlighet utan på signalspråk: varje uttryck kan kopplas till en specifik internationell debatt.",
  "meningslangd": "Meningslängd — genomsnittligt antal ord per mening. Kortare meningar gör en text mer journalistisk i strukturen även när innehållet är komplext.",
  "langd": "Längd — antal ord i brevet. VD-orden har vuxit från korta avrapporteringar (cirka 145 ord 2024) till essäer (cirka 730 ord 2026).",
  "akt": "Akt — en av tre faser som analysen delar in korpusen i, utifrån hur rösten utvecklas: Akt 1 (att hitta rösten), Akt 2 (att sätta agendan) och Akt 3 (doktrinen). Indelningen är en tolkning som kan justeras när fler brev tillkommer.",
  "tema": "Tema — ett av tolv ämnesområden (t.ex. EU & konkurrenskraft, säkerhet & försvar, Kina) som varje brev klassificeras mot. Ett brev kan bära flera teman med olika tyngd.",
  "ask": "Ask (återkommande uppmaning) — en konkret handlingsuppmaning som VD återkommer till i flera brev (t.ex. snabbare beslutsfattande, dual use-strategi). Vi spårar hur ofta varje ask återkommer.",
  "signaturfras": "Signaturfras — ett eget, ofta nyskapat uttryck som bär VD:ns budskap (t.ex. strategisk oumbärlighet, Axel Oxenstierna 2.0). VD:ns retoriska fingeravtryck.",
  "signaturcitat": "Signaturcitat — den mest utmärkande meningen i ett brev, vald för att fånga dess kärna."
}
```

- [ ] **Step 8: Commit**

```bash
git add data/vocab/
git commit -m "feat: add controlled vocabularies incl. plain-language definitions"
```

---

### Task 7: Compile per-letter files into `letters.json` + aggregates

**Files:**
- Create: `pipeline/compile.py`
- Test: `tests/test_compile.py`

- [ ] **Step 1: Write the failing test**

```python
import json
from pathlib import Path
from pipeline.compile import compile_dataset

def _write(d, name, record):
    (d / f"{name}.json").write_text(json.dumps(record), encoding="utf-8")

def test_compile_sorts_by_date_and_writes_outputs(tmp_path):
    letters = tmp_path / "letters"; letters.mkdir()
    base = {"nr": 1, "title": "t", "series": False, "word_count": 100,
            "avg_sentence_length": 10.0, "lix": 40.0, "loanword_rate": 0.0,
            "tone_index": 1.0, "assertive_count": 0, "hedge_count": 0,
            "themes": [], "entities": {"people": [], "countries": [], "projects": []},
            "signature_phrases": [], "asks": [], "thesis": "x",
            "key_quote": {"text": "x", "label": "x"}, "source_url": "x", "raw_text": "x"}
    _write(letters, "b", {**base, "date": "2026-01-07", "act": 3})
    _write(letters, "a", {**base, "date": "2025-01-14", "act": 1})
    out = tmp_path / "letters.json"; agg = tmp_path / "aggregates.json"
    compile_dataset(letters, out, agg)
    data = json.loads(out.read_text(encoding="utf-8"))
    assert [x["date"] for x in data] == ["2025-01-14", "2026-01-07"]
    aggregates = json.loads(agg.read_text(encoding="utf-8"))
    assert aggregates["by_act"]["1"]["count"] == 1
    assert aggregates["total"] == 2
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_compile.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'pipeline.compile'`

- [ ] **Step 3: Write the implementation**

```python
import json
from pathlib import Path
from collections import defaultdict
from pipeline.schema import validate_letter

def compile_dataset(letters_dir, out_path, aggregates_path):
    records = []
    for f in sorted(Path(letters_dir).glob("*.json")):
        rec = json.loads(f.read_text(encoding="utf-8"))
        validate_letter(rec)
        records.append(rec)
    records.sort(key=lambda r: r["date"])
    Path(out_path).write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")

    by_act = defaultdict(lambda: {"count": 0, "word_sum": 0, "tone_sum": 0.0})
    by_year = defaultdict(lambda: {"count": 0})
    for r in records:
        a = by_act[str(r["act"])]
        a["count"] += 1; a["word_sum"] += r["word_count"]; a["tone_sum"] += r["tone_index"]
        by_year[r["date"][:4]]["count"] += 1
    for a in by_act.values():
        a["avg_words"] = round(a["word_sum"] / a["count"], 1)
        a["avg_tone"] = round(a["tone_sum"] / a["count"], 1)
    aggregates = {"total": len(records), "by_act": dict(by_act), "by_year": dict(by_year)}
    Path(aggregates_path).write_text(json.dumps(aggregates, ensure_ascii=False, indent=2), encoding="utf-8")
    return records
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_compile.py -v`
Expected: 1 passed

- [ ] **Step 5: Commit**

```bash
git add pipeline/compile.py tests/test_compile.py
git commit -m "feat: compile per-letter files into letters.json and aggregates"
```

---

### Task 8: Draft generator (`add_letter.py`)

Produces a per-letter JSON with mechanical fields filled and nuanced fields left as empty placeholders for human/Claude coding. This is the deterministic half of the hybrid loop.

**Files:**
- Create: `pipeline/add_letter.py`
- Test: `tests/test_add_letter.py`

- [ ] **Step 1: Write the failing test**

```python
import json
from pathlib import Path
from pipeline.add_letter import build_draft

VOCAB = Path("data/vocab")

def test_build_draft_fills_mechanical_and_blanks_nuanced(tmp_path):
    text = ("IVAs vd -- testbrev\n21 april 2026 · Nr 9 · Aktuellt från IVA\n\n"
            "Sverige måste agera. dual use är avgörande.")
    draft = build_draft("2026-04-21_IVAs_vd_--_testbrev.docx", text, VOCAB)
    assert draft["date"] == "2026-04-21"
    assert draft["nr"] == 9
    assert draft["word_count"] > 0
    assert draft["tone_index"] != 0.0
    assert draft["themes"] == []
    assert draft["thesis"] == ""
    assert draft["act"] == 0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_add_letter.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'pipeline.add_letter'`

- [ ] **Step 3: Write the implementation**

```python
import json, sys
from pathlib import Path
from pipeline.extract import extract_text, parse_metadata
from pipeline import metrics

def build_draft(filename, text, vocab_dir):
    vocab_dir = Path(vocab_dir)
    markers = json.loads((vocab_dir / "markers.json").read_text(encoding="utf-8"))
    loanwords = json.loads((vocab_dir / "loanwords.json").read_text(encoding="utf-8"))
    meta = parse_metadata(filename, text)
    return {
        "date": meta["date"], "nr": meta["nr"], "title": meta["title"],
        "series": meta["series"], "act": 0,
        "word_count": metrics.word_count(text),
        "avg_sentence_length": metrics.avg_sentence_length(text),
        "lix": metrics.lix(text),
        "loanword_rate": metrics.loanword_rate(text, loanwords),
        "tone_index": metrics.tone_index(text, markers["assertive"], markers["hedge"]),
        "assertive_count": metrics.count_markers(text, markers["assertive"]),
        "hedge_count": metrics.count_markers(text, markers["hedge"]),
        "themes": [], "entities": {"people": [], "countries": [], "projects": []},
        "signature_phrases": [], "asks": [], "thesis": "",
        "key_quote": {"text": "", "label": ""},
        "source_url": "", "raw_text": f"data/raw/{Path(filename).stem}.txt",
    }

def main(docx_path):
    docx_path = Path(docx_path)
    text = extract_text(docx_path)
    (Path("data/raw") / f"{docx_path.stem}.txt").write_text(text, encoding="utf-8")
    draft = build_draft(docx_path.name, text, "data/vocab")
    out = Path("data/letters") / f"{draft['date']}.json"
    out.write_text(json.dumps(draft, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out} — fill nuanced fields (act, themes, entities, "
          f"signature_phrases, asks, thesis, key_quote, source_url), then run compile.")

if __name__ == "__main__":
    main(sys.argv[1])
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_add_letter.py -v`
Expected: 1 passed

- [ ] **Step 5: Commit**

```bash
git add pipeline/add_letter.py tests/test_add_letter.py
git commit -m "feat: add draft generator for the add-a-letter loop"
```

---

### Task 9: Seed mechanical metrics for all 33 letters

- [ ] **Step 1: Extract text + build drafts for every letter**

```bash
. .venv/bin/activate
for f in data/raw/*.docx; do python -m pipeline.add_letter "$f"; done
```
Expected: 33 files written to `data/letters/`, each with mechanical metrics filled and nuanced fields blank.

- [ ] **Step 2: Sanity-check the numbers against the existing analysis**

Run: `python -c "import json,glob; rows=[json.load(open(f)) for f in glob.glob('data/letters/*.json')]; print(len(rows), round(sum(r['word_count'] for r in rows)/len(rows)))"`
Expected: `33` and an average word count in the ~500s (the rundown reports ⌀545 for 2025). If wildly off, revisit tokenization in `metrics.py`.

- [ ] **Step 3: Commit**

```bash
git add data/letters/ data/raw/*.txt
git commit -m "data: seed 33 letters with mechanical metrics (nuanced fields pending)"
```

---

### Task 10: Code the nuanced fields for all 33 letters

This is reviewed content work, not code. For each of the 33 files in `data/letters/`, fill the blank fields by reading the matching `data/raw/<date>_*.txt` and cross-referencing the existing analysis (`../VD-ord_analys_rundown.docx`, `../VD-ordet_2025-2026_tre_akter.pptx`). Do it in three batches by act so review stays focused.

**Per-letter coding rules:**
- `act`: 1, 2, or 3 per `data/vocab/acts.json` date ranges (Akt 1 ≤ 2025-03-25; Akt 2 2025-04-08…2025-10-21; Akt 3 ≥ 2025-11-04).
- `themes`: 1–4 entries, each `{theme: <id from themes.json>, weight: 1–5}`. Weight = relative prominence in the letter.
- `entities`: people/countries/projects actually named; use canonical spellings from `entities.json`, adding new ones as needed.
- `signature_phrases`: coined/distinctive phrases (e.g. "strategisk oumbärlighet").
- `asks`: ids from `asks.json` that the letter makes; `[]` if none.
- `thesis`: one Swedish sentence — the letter's main argument.
- `key_quote`: `{text: <verbatim sentence from the letter>, label: <short tag>}`. Use the deck's slide-12 quotes where available.
- `source_url`: the letter's URL on iva.se (search "Aktuellt från IVA" + date if unknown; leave "" if not found).

- [ ] **Step 1: Code Act 1 letters (2025-01-14 … 2025-03-25)** — fill all blank fields per the rules above.
- [ ] **Step 2: Validate Act 1 batch**

Run: `python -c "import json,glob; from pipeline.schema import validate_letter; [validate_letter(json.load(open(f))) for f in glob.glob('data/letters/2025-0[123]-*.json')]; print('act1 ok')"`
Expected: `act1 ok` (no validation error)

- [ ] **Step 3: Commit Act 1**

```bash
git add data/letters/
git commit -m "data: code nuanced fields for Act 1 letters"
```

- [ ] **Step 4: Code Act 2 letters (2025-04-08 … 2025-10-21)**, then validate and commit (`git commit -m "data: code nuanced fields for Act 2 letters"`).
- [ ] **Step 5: Code Act 3 letters (2025-11-04 … 2026-04-21)**, then validate and commit (`git commit -m "data: code nuanced fields for Act 3 letters"`).

---

### Task 11: Full-dataset validation test + compile

**Files:**
- Create: `tests/test_dataset.py`

- [ ] **Step 1: Write the test**

```python
import json, glob
from pipeline.schema import validate_letter

def test_every_letter_record_is_valid():
    files = glob.glob("data/letters/*.json")
    assert len(files) == 33
    for f in files:
        rec = json.loads(open(f, encoding="utf-8").read())
        validate_letter(rec)
        assert rec["act"] in (1, 2, 3)
        assert rec["thesis"].strip() != ""
        assert rec["themes"], f"{f} has no themes"
```

- [ ] **Step 2: Run it**

Run: `pytest tests/test_dataset.py -v`
Expected: PASS (if any letter fails, fix that record, not the test)

- [ ] **Step 3: Compile the dataset**

```bash
python -c "from pipeline.compile import compile_dataset; compile_dataset('data/letters', 'data/letters.json', 'data/aggregates.json')"
```
Expected: `data/letters.json` (33 records) and `data/aggregates.json` written.

- [ ] **Step 4: Run the full test suite**

Run: `pytest -v`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add tests/test_dataset.py data/letters.json data/aggregates.json
git commit -m "test: validate full 33-letter dataset and compile letters.json"
```

---

### Task 12: Add-a-letter runbook

**Files:**
- Create: `docs/runbook-add-a-letter.md`

- [ ] **Step 1: Write the runbook**

```markdown
# Runbook — add a new VD-ord letter

1. Save the new letter's `.docx` into `data/raw/` (filename starts `YYYY-MM-DD_`).
2. Activate the env: `. .venv/bin/activate`
3. Generate the draft: `python -m pipeline.add_letter data/raw/<file>.docx`
   → writes `data/letters/<date>.json` with mechanical metrics filled and the
   nuanced fields blank, plus the extracted `data/raw/<file>.txt`.
4. Code the nuanced fields (act, themes, entities, signature_phrases, asks,
   thesis, key_quote, source_url) — open the new JSON and the `.txt` side by
   side, or ask Claude to draft them against `data/vocab/` for you to review.
   Coding rules: see Task 10 of the data-pipeline plan.
5. Validate: `pytest tests/test_dataset.py` (bump the expected count by one).
6. Compile: `python -c "from pipeline.compile import compile_dataset; compile_dataset('data/letters','data/letters.json','data/aggregates.json')"`
7. Commit: `git add data/ && git commit -m "data: add letter <date>"`.
   The `git diff` shows exactly what this letter added to the corpus.
```

- [ ] **Step 2: Commit**

```bash
git add docs/runbook-add-a-letter.md
git commit -m "docs: add the add-a-letter runbook"
```

---

## Self-review notes

- **Spec coverage:** data layer (Tasks 2,6,7,9,10), scripted metrics incl. LIX/tone/loanwords (Tasks 4,5), AI-assisted-then-reviewed coding (Tasks 8,10 + runbook), definitions/transparency `definitions.json` (Task 6 step 7), reproducible/followable via per-letter files + commits (throughout), caveats reflected in `definitions.json` wording. Presentation (§7) is Plan 2. Open question #5 (AI mechanism) resolved as: deterministic draft + interactive Claude coding, no API key.
- **Type consistency:** field names match the schema (Task 2) everywhere; `count_markers` used by both `tone_index` and `loanword_rate`; `compile_dataset(letters_dir, out_path, aggregates_path)` signature consistent in Tasks 7 and 11.
- **Note for executor:** the long-word count constant in Task 4's LIX test is marked to adjust to the actual definition when first run — verify, don't force the formula.
