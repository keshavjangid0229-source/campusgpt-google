
import re
import time
from threading import Lock
from concurrent.futures import ThreadPoolExecutor

from services.web_search import search_internet
from services.web_reader import read_website
from services.ai_router import contains_private_data


MAX_WEBSITES = 2
MAX_SOURCE_LENGTH = 1200
MAX_CONTEXT_LENGTH = 3000

CACHE_DURATION = 300
MAX_CACHE_ITEMS = 32

search_cache = {}
cache_lock = Lock()


def tokenize(text):

    return set(
        re.findall(r"\w+", text.lower())
    )


def rank_paragraphs(question, content):

    question_words = tokenize(question)

    paragraphs = re.split(
        r"\n+|(?<=[.!?])\s+",
        content
    )

    ranked = []

    for paragraph in paragraphs:

        paragraph = paragraph.strip()

        if len(paragraph) < 40:
            continue

        score = len(
            question_words.intersection(
                tokenize(paragraph)
            )
        )

        ranked.append((score, paragraph))

    ranked.sort(
        key=lambda item: item[0],
        reverse=True
    )

    selected = [
        paragraph
        for score, paragraph in ranked[:5]
        if score > 0
    ]

    return "\n".join(selected)[:MAX_SOURCE_LENGTH]


def analyze_website(result, question):

    print("Analyzing:", result["title"])

    webpage = read_website(result["url"])

    content = ""
    source_type = "snippet"
    title = result["title"]

    if webpage["status"] == "success":

        content = rank_paragraphs(
            question,
            webpage["content"]
        )

        if content:

            source_type = "webpage"
            title = webpage["title"]

    if not content:

        content = result["snippet"]

    title = " ".join(title.split())[:150]

    return {
        "title": title,
        "url": result["url"],
        "type": source_type,
        "content": content[:MAX_SOURCE_LENGTH]
    }


def deep_search(question):

    question = question.strip()

    if not question or contains_private_data(question):

        return {
            "found": False,
            "context": "",
            "sources": []
        }

    start_time = time.monotonic()

    cache_key = " ".join(
        question.lower().split()
    )

    with cache_lock:

        cached = search_cache.get(cache_key)

        if cached:

            if time.monotonic() - cached["time"] < CACHE_DURATION:

                print("Deep Search cache hit!")

                return cached["result"]

            search_cache.pop(cache_key, None)

    print("Starting Optimized Deep Search...")

    results = search_internet(
        question,
        max_results=MAX_WEBSITES
    )

    sources = []
    context_sections = []

    # Process websites simultaneously

    with ThreadPoolExecutor(max_workers=2) as executor:

        analyzed = list(
            executor.map(
                lambda result: analyze_website(
                    result,
                    question
                ),
                results[:MAX_WEBSITES]
            )
        )

    for item in analyzed:

        if not item["content"].strip():
            continue

        source_id = len(sources) + 1

        section = (
            f"Source [{source_id}]\n"
            f"Title: {item['title']}\n"
            f"Evidence type: {item['type']}\n"
            f"Content:\n{item['content']}"
        )

        candidate = "\n\n".join(
            context_sections + [section]
        )

        if len(candidate) > MAX_CONTEXT_LENGTH:
            continue

        sources.append({
            "id": source_id,
            "title": item["title"],
            "url": item["url"],
            "type": item["type"]
        })

        context_sections.append(section)

    output = {
        "found": bool(sources),
        "context": "\n\n".join(context_sections),
        "sources": sources
    }

    if sources:

        with cache_lock:

            if len(search_cache) >= MAX_CACHE_ITEMS:

                oldest = min(
                    search_cache,
                    key=lambda key: search_cache[key]["time"]
                )

                search_cache.pop(oldest, None)

            search_cache[cache_key] = {
                "time": time.monotonic(),
                "result": output
            }

    elapsed = round(
        time.monotonic() - start_time,
        2
    )

    print(f"Deep Search completed in {elapsed} seconds")

    return output
