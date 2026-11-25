
import re


WEB_KEYWORDS = [
    "latest",
    "today",
    "current",
    "recent",
    "news",
    "weather",
    "price",
    "release date",
    "launch date",
    "cutoff",
    "live score",
    "aaj",
    "abhi",
    "latest update",
    "internet pe",
    "google pe",
    "search kar"
]


def contains_private_data(message):

    patterns = [
        r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}",
        r"\b\d{10,16}\b",
        r"\b(password|otp|api[_ ]?key|secret)\b"
    ]

    return any(
        re.search(pattern, message, re.IGNORECASE)
        for pattern in patterns
    )


def detect_mode(message, document_id=None):

    text = message.lower().strip()

    if document_id:
        return "rag"

    if contains_private_data(message):
        return "local"

    if text.startswith("/local"):
        return "local"

    if text.startswith("/deep"):
        return "deep_search"

    if text.startswith("/search"):
        return "web"

    if any(
        re.search(
            r"\b" + re.escape(keyword) + r"\b",
            text
        )
        for keyword in WEB_KEYWORDS
    ):
        return "web"

    return "local"


def clean_message(message):

    return re.sub(
        r"^/(search|local|deep)\b\s*",
        "",
        message.strip(),
        flags=re.IGNORECASE
    )
