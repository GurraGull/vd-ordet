from jsonschema import validate, Draft202012Validator

LETTER_SCHEMA = {
    "type": "object",
    "required": [
        "date", "nr", "title", "series", "act", "word_count",
        "avg_sentence_length", "lix", "loanword_rate", "tone_index",
        "assertive_count", "hedge_count", "themes", "entities",
        "signature_phrases", "asks", "thesis", "key_quote",
        "source_url", "raw_text",
    ],
    "additionalProperties": False,
    "properties": {
        "date": {"type": "string", "pattern": r"^\d{4}-\d{2}-\d{2}$"},
        "nr": {"type": "integer"},
        "title": {"type": "string"},
        "series": {"type": "boolean"},
        "act": {"type": "integer", "minimum": 1},
        "word_count": {"type": "integer", "minimum": 0},
        "avg_sentence_length": {"type": "number", "minimum": 0},
        "lix": {"type": "number", "minimum": 0},
        "loanword_rate": {"type": "number", "minimum": 0},
        "tone_index": {"type": "number"},
        "assertive_count": {"type": "integer", "minimum": 0},
        "hedge_count": {"type": "integer", "minimum": 0},
        "themes": {
            "type": "array",
            "items": {
                "type": "object", "required": ["theme", "weight"],
                "additionalProperties": False,
                "properties": {
                    "theme": {"type": "string"},
                    "weight": {"type": "integer", "minimum": 1, "maximum": 5},
                },
            },
        },
        "entities": {
            "type": "object", "required": ["people", "countries", "projects"],
            "additionalProperties": False,
            "properties": {
                "people": {"type": "array", "items": {"type": "string"}},
                "countries": {"type": "array", "items": {"type": "string"}},
                "projects": {"type": "array", "items": {"type": "string"}},
            },
        },
        "signature_phrases": {"type": "array", "items": {"type": "string"}},
        "asks": {"type": "array", "items": {"type": "string"}},
        "thesis": {"type": "string"},
        "key_quote": {
            "type": "object", "required": ["text", "label"],
            "additionalProperties": False,
            "properties": {"text": {"type": "string"}, "label": {"type": "string"}},
        },
        "source_url": {"type": "string"},
        "raw_text": {"type": "string"},
    },
}

Draft202012Validator.check_schema(LETTER_SCHEMA)


def validate_letter(record):
    validate(instance=record, schema=LETTER_SCHEMA)
    return record
