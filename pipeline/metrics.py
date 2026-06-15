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
