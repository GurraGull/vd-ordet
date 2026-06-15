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
