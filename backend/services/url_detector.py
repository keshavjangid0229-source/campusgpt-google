
import re
from urllib.parse import urlparse


URL_PATTERN = re.compile(
    r'https?://[^\s<>"\']+',
    re.IGNORECASE
)


def extract_urls(message):

    urls = URL_PATTERN.findall(message)

    valid_urls = []

    for url in urls:

        url = url.rstrip(".,;!?)")

        try:

            parsed = urlparse(url)

            if (
                parsed.scheme in ("http", "https")
                and parsed.hostname
                and not parsed.username
                and not parsed.password
                and url not in valid_urls
            ):
                valid_urls.append(url)

        except ValueError:
            continue

    return valid_urls[:3]


def remove_urls(message):

    return URL_PATTERN.sub("", message).strip()


def detect_website_request(message):

    urls = extract_urls(message)

    if not urls:
        return None

    question = remove_urls(message)

    if not question:
        question = (
            "Summarize this webpage and explain "
            "its important information."
        )

    return {
        "url": urls[0],
        "question": question,
        "mode": "website"
    }
