
import socket
import ipaddress
import httpx
import trafilatura

from urllib.parse import urlparse
from bs4 import BeautifulSoup


MAX_PAGE_SIZE = 2 * 1024 * 1024
MAX_TEXT_LENGTH = 12000


def validate_url(url):

    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https"):
        raise ValueError("Invalid URL protocol.")

    if not parsed.hostname:
        raise ValueError("Invalid hostname.")

    if parsed.username or parsed.password:
        raise ValueError("URL credentials are not allowed.")

    if parsed.port not in (None, 80, 443):
        raise ValueError("Unsupported port.")

    addresses = socket.getaddrinfo(
        parsed.hostname,
        parsed.port or 443,
        type=socket.SOCK_STREAM
    )

    for address in addresses:

        ip = ipaddress.ip_address(address[4][0])

        if not ip.is_global:
            raise ValueError(
                "Private network URLs are blocked."
            )

    return url


def read_website(url):

    try:

        url = validate_url(url)

        headers = {
            "User-Agent": "CampusGPT/1.0",
            "Accept": "text/html"
        }

        with httpx.Client(
            timeout=15,
            follow_redirects=False,
            trust_env=False
        ) as client:

            with client.stream(
                "GET",
                url,
                headers=headers
            ) as response:

                response.raise_for_status()

                content_type = response.headers.get(
                    "content-type", ""
                ).lower()

                if "text/html" not in content_type:
                    raise ValueError(
                        "Only HTML webpages are supported."
                    )

                content = bytearray()

                for chunk in response.iter_bytes():

                    content.extend(chunk)

                    if len(content) > MAX_PAGE_SIZE:
                        raise ValueError(
                            "Webpage exceeds size limit."
                        )

                html = content.decode(
                    response.encoding or "utf-8",
                    errors="replace"
                )

        soup = BeautifulSoup(html, "html.parser")

        title = (
            soup.title.get_text(strip=True)
            if soup.title
            else "Untitled webpage"
        )

        text = trafilatura.extract(
            html,
            include_comments=False,
            include_tables=True
        )

        if not text:

            for tag in soup([
                "script",
                "style",
                "nav",
                "footer",
                "header"
            ]):
                tag.decompose()

            text = soup.get_text(
                separator="\n",
                strip=True
            )

        if not text:
            raise ValueError(
                "No readable content found."
            )

        return {
            "status": "success",
            "title": title,
            "url": url,
            "content": text[:MAX_TEXT_LENGTH],
            "characters": len(text),
            "truncated": len(text) > MAX_TEXT_LENGTH
        }

    except Exception as error:

        return {
            "status": "error",
            "url": url,
            "message": str(error)
        }


def build_website_context(result):

    if result["status"] != "success":
        return ""

    return (
        f"Website: {result['title']}\n"
        f"URL: {result['url']}\n\n"
        f"Website Content:\n"
        f"{result['content']}"
    )
