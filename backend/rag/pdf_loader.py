import os
import time
from pathlib import Path

import pymupdf


MAX_PAGES = 300
OCR_SECONDS = 60
DEFAULT_TESSDATA = Path(__file__).resolve().parents[2] / "ai_models" / "tessdata"


def extract_pdf(data: bytes, report=None):
    pages = []
    ocr_pages = []
    skipped_pages = []
    tessdata = Path(os.getenv("TESSDATA_PREFIX") or DEFAULT_TESSDATA)
    languages = "+".join(
        language for language in ("eng", "hin")
        if (tessdata / f"{language}.traineddata").is_file()
    )
    deadline = time.monotonic() + OCR_SECONDS

    with pymupdf.open(stream=data, filetype="pdf") as document:
        if document.needs_pass:
            raise ValueError("Password-protected PDF is not supported.")
        if len(document) > MAX_PAGES:
            raise ValueError("PDF exceeds the 300-page limit.")

        for number, page in enumerate(document, 1):
            text = page.get_text("text", sort=True).strip()
            scan = len(text) < 40 and bool(page.get_image_info())
            if scan and languages and time.monotonic() < deadline:
                # Cap the raster dimensions for oversized PDF pages.
                dpi = min(200, int(72 * 2400 / max(page.rect.width, page.rect.height)))
                if dpi >= 72:
                    try:
                        layer = page.get_textpage_ocr(
                            language=languages, dpi=dpi, full=True, tessdata=str(tessdata),
                        )
                        recognized = page.get_text("text", textpage=layer, sort=True).strip()
                        if len(recognized) > len(text):
                            text = recognized
                            ocr_pages.append(number)
                    except (RuntimeError, ValueError):
                        pass
            if text:
                pages.append({"page": number, "text": text})
            if not text or (scan and number not in ocr_pages):
                skipped_pages.append(number)
        total_pages = len(document)

    if not pages:
        if skipped_pages and not languages:
            raise ValueError("This PDF has no selectable text. Enable OCR on the server or upload a text-based PDF.")
        raise ValueError("No readable text was found. Try a clearer scan or a text-based PDF.")
    if report is not None:
        report.update(total_pages=total_pages, ocr_pages=ocr_pages, unreadable_pages=skipped_pages)
    return pages
