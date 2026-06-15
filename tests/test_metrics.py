from pipeline.metrics import (
    word_count, avg_sentence_length, lix, count_markers, tone_index, loanword_rate,
)

TEXT = "Konkurrenskraften är avgörande. Innovationssystemet behöver reformeras snabbt."


def test_word_count():
    assert word_count(TEXT) == 7


def test_avg_sentence_length():
    assert avg_sentence_length(TEXT) == 3.5


def test_lix_is_words_per_sentence_plus_longword_share():
    assert lix(TEXT) == round(7 / 2 + 5 * 100 / 7, 1)


def test_empty_text_is_zero():
    assert word_count("") == 0
    assert lix("") == 0.0


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
