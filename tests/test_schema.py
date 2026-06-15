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
