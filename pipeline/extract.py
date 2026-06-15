import re
from docx import Document


def extract_text(docx_path):
    doc = Document(docx_path)
    return "\n".join(p.text for p in doc.paragraphs)


def parse_metadata(filename, text):
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    title = lines[0] if lines else ""
    date_match = re.match(r"(\d{4}-\d{2}-\d{2})", filename)
    nr_match = re.search(r"Nr\s*(\d+)", text)
    return {
        "date": date_match.group(1) if date_match else "",
        "nr": int(nr_match.group(1)) if nr_match else 0,
        "title": title.replace("IVAs vd --", "").replace("IVAs vd —", "").strip(" -–—"),
        "series": "IVAs vd" in title,
        "text": text,
    }
