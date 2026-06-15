from pipeline.extract import parse_metadata


def test_parse_metadata_from_filename_and_text():
    text = open("tests/fixtures/sample.txt", encoding="utf-8").read()
    meta = parse_metadata("2026-04-21_IVAs_vd_--_ambitiosa_Sverige.docx", text)
    assert meta["date"] == "2026-04-21"
    assert meta["nr"] == 9
    assert meta["series"] is True
    assert "ambitiösa Sverige" in meta["title"]
