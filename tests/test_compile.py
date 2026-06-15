import json
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
