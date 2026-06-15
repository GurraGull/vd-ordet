from pipeline.metrics import word_count, avg_sentence_length, lix

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
