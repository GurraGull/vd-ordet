import json
import sys
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
