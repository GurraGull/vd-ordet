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
        a["count"] += 1
        a["word_sum"] += r["word_count"]
        a["tone_sum"] += r["tone_index"]
        by_year[r["date"][:4]]["count"] += 1
    for a in by_act.values():
        a["avg_words"] = round(a["word_sum"] / a["count"], 1)
        a["avg_tone"] = round(a["tone_sum"] / a["count"], 1)
    aggregates = {"total": len(records), "by_act": dict(by_act), "by_year": dict(by_year)}
    Path(aggregates_path).write_text(json.dumps(aggregates, ensure_ascii=False, indent=2), encoding="utf-8")
    return records
