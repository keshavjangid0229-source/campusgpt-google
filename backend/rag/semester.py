import re

from rag.document_ai import get_document_chunks


NUMBERS = {
    **dict(zip(("first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"), range(1, 9))),
    **dict(zip(("i", "ii", "iii", "iv", "v", "vi", "vii", "viii"), range(1, 9))),
    **dict(zip(("one", "two", "three", "four", "five", "six", "seven", "eight"), range(1, 9))),
}
NUMBER = r"(?:[1-8](?:st|nd|rd|th)?|" + "|".join(NUMBERS) + r")"
SEMESTER_SEPARATOR = r"[-.:\u2013\u2014]"
SEMESTER = (
    rf"(?:\b(?:semester|sem)\s*{SEMESTER_SEPARATOR}?\s*({NUMBER})\b"
    rf"|\b({NUMBER})(?:\s*{SEMESTER_SEPARATOR}\s*|\s+)(?:semester|sem)\b)"
)
QUERY = re.compile(SEMESTER, re.IGNORECASE)
HEADING = re.compile(rf"^\s*{SEMESTER}\s*$", re.IGNORECASE)
ROW = re.compile(
    r"^\s*(?:[A-Z]{2,6}\s+)?([A-Z]{2,8}\s?\d{2,4}[A-Z]?)\s+"
    r"(.+?)\s{2,}(\d+|[-–])\s+(\d+|[-–])\s+(\d+)\s*$"
)
OVERVIEW_WORDS = re.compile(r"\b(?:syllabus|subjects|courses|papers|curriculum)\b", re.IGNORECASE)
FILLER = set(
    "full complete entire whole the list show give tell me please all of for in on "
    "mera mujhe ka ke ki ko kya hai hain bata batao bta btao de do dikhao details "
    "syllabus subjects courses papers curriculum credit credits and with total".split()
)


def semester_number(match):
    label = (match[1] or match[2]).casefold()
    numeric = re.match(r"\d+", label)
    return int(numeric[0]) if numeric else NUMBERS[label]


def semester_overview_request(question):
    match = QUERY.search(question)
    if not match or not OVERVIEW_WORDS.search(question):
        return None
    rest = question[:match.start()] + question[match.end():]
    if set(re.findall(r"\w+", rest.casefold())) <= FILLER:
        return semester_number(match)
    return None


def semester_overview(document_id, number):
    chunks = get_document_chunks(document_id)
    rows = {}
    table_pages = set()
    detailed_heading = None
    detailed_end = None
    active_table = None
    active_page = None
    page_lines = []

    def read_page(page, lines):
        nonlocal active_table, detailed_heading, detailed_end
        is_detailed_heading = any(line.strip().casefold() == "detailed" for line in lines) and any(
            line.strip().casefold() == "syllabus" for line in lines
        )
        for line in lines:
            heading = HEADING.fullmatch(line)
            if heading:
                section = semester_number(heading)
                if is_detailed_heading:
                    active_table = None
                    if section == number and detailed_heading is None:
                        detailed_heading = page
                    elif detailed_heading is not None and detailed_end is None and section != number:
                        detailed_end = page - 1
                else:
                    active_table = section
                continue
            record = ROW.fullmatch(line) if active_table == number else None
            if record:
                code, title, lectures, practicals, credits = record.groups()
                rows[code] = (title.strip(), lectures, practicals, int(credits))
                table_pages.add(page)

    for chunk in chunks:
        page = chunk["page"]
        if active_page is not None and active_page != page:
            read_page(active_page, page_lines)
            page_lines = []
        active_page = page
        page_lines.extend(chunk["text"].splitlines())
    if active_page is not None:
        read_page(active_page, page_lines)
    if not rows:
        return None

    page_label = ", ".join(map(str, sorted(table_pages)))
    result = [f"## Semester {number} syllabus", ""]
    for label, practical in (("Theory subjects", False), ("Practicals and labs", True)):
        entries = [
            f"- **{code}** — {title} ({credits} credits)"
            for code, (title, _, practicals, credits) in rows.items()
            if (practicals.isdigit() and int(practicals) > 0) == practical
        ]
        if entries:
            result.extend([f"### {label}", *entries, ""])
    result.append(f"**Total listed credits:** {sum(row[3] for row in rows.values())}")
    result.append(f"\n**Source:** PDF page {page_label}.")
    if detailed_heading is not None and detailed_end is not None:
        result.append(f"\n**Detailed unit-wise syllabus:** PDF pages {detailed_heading}–{detailed_end}.")
    return {
        "reply": "\n".join(result),
        "sources": [{"page": page, "filename": chunks[0]["filename"]} for page in sorted(table_pages)],
    }
