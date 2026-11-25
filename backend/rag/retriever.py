from collections import Counter
from heapq import nsmallest
from math import log, sqrt
import re

from rag.embeddings import document_terms
from rag.vector_store import get_collection

ROMAN_UNITS = {roman: number for number, roman in enumerate(
    ("i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"), 1
)}
UNIT_LABEL = re.compile(
    r"\b(?:unit|module|chapter)\s*[-:#]?\s*(\d+|[ivx]+)\b", re.IGNORECASE
)
QUESTION_WORDS = set(
    "a an the of in is are what which how many me tell explain show "
    "ka ki ke ko kya mein me hai hain batao bata samjhao topics syllabus".split()
)


def unit_numbers(text):
    labels = UNIT_LABEL.findall(text.casefold())
    return {int(label) if label.isdecimal() else ROMAN_UNITS.get(label) for label in labels} - {None}


def search_documents(question, top_k=5, document_id=None):
    options = {"where": {"document_id": document_id}} if document_id else {}
    results = get_collection().get(include=["documents", "metadatas"], **options)
    query = set(document_terms(question)) - QUESTION_WORDS
    requested_units = unit_numbers(question)
    frequencies = []
    units_by_chunk = []
    document_frequency = Counter()
    for text in results["documents"]:
        terms = Counter(document_terms(text))
        matching = query.intersection(terms)
        document_frequency.update(matching)
        frequencies.append((len(terms), {term: terms[term] for term in matching}))
        units_by_chunk.append(unit_numbers(text) if requested_units else set())

    def rank(index):
        size, matching = frequencies[index]
        score = sum(
            (1 + log(count)) * (1 + log((len(frequencies) + 1) / (document_frequency[term] + 1)))
            for term, count in matching.items()
        ) / sqrt(max(1, size))
        if requested_units.intersection(units_by_chunk[index]):
            score += 3
        return 1 / (1 + score), results["metadatas"][index]["page"]

    output = []
    for index in nsmallest(top_k, range(len(frequencies)), key=rank):
        metadata = results["metadatas"][index]
        output.append({
            "text": results["documents"][index],
            "filename": metadata["filename"],
            "page": metadata["page"],
            "document_id": metadata["document_id"],
            "distance": round(rank(index)[0], 4),
        })
    return output
