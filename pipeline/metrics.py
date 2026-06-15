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
