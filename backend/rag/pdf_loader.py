
import pymupdf

MAX_PAGES = 300


def extract_pdf(data: bytes):

    pages = []

    with pymupdf.open(
        stream=data,
        filetype="pdf"
    ) as document:

        if document.needs_pass:
            raise ValueError(
                "Password-protected PDF is not supported."
            )

        if len(document) > MAX_PAGES:
            raise ValueError(
                "PDF exceeds the 300-page limit."
            )

        for index, page in enumerate(document):

            text = page.get_text(
                "text",
                sort=True
            ).strip()

            if text:
                pages.append({
                    "page": index + 1,
                    "text": text
                })

    if not pages:
        raise ValueError(
            "No readable text found. OCR may be required."
        )

    return pages
