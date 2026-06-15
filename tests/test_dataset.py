import json
import glob
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
