
import time

from ddgs import DDGS
from urllib.parse import urlparse


MAX_RETRIES = 3


def search_internet(query, max_results=4):

    query = query.strip()[:500]

    if not query:
        return []

    for attempt in range(MAX_RETRIES):

        results = []
        seen = set()

        try:

            print(
                f"Web search attempt {attempt + 1}/{MAX_RETRIES}"
            )

            with DDGS(timeout=10) as search:

                response = search.text(
                    query,
                    region="wt-wt",
                    safesearch="on",
                    max_results=max_results,
                    backend="auto"
                )

                for item in response:

                    url = item.get("href", "")
                    parsed = urlparse(url)

                    if parsed.scheme not in ("http", "https"):
                        continue

                    if not parsed.hostname:
                        continue

                    if parsed.username or parsed.password:
                        continue

                    if url in seen:
                        continue

                    seen.add(url)

                    results.append({
                        "title": item.get("title", "")[:200],
                        "url": url,
                        "snippet": item.get("body", "")[:500]
                    })

            if results:

                print(
                    f"Search successful: {len(results)} results"
                )

                return results

        except Exception as error:

            print(
                f"Search attempt failed: {error}"
            )

        if attempt < MAX_RETRIES - 1:
            time.sleep(2 ** attempt)

    print("All web search attempts failed.")

    return []


def build_web_context(results):

    sections = []

    for index, result in enumerate(results, start=1):

        sections.append(
            f"Source [{index}]\n"
            f"Title: {result['title']}\n"
            f"Information: {result['snippet']}\n"
            f"URL: {result['url']}"
        )

    return "\n\n".join(sections)
